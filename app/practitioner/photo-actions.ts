"use server";

import { lookup } from "node:dns/promises";

import { put, del, head } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import {
  isVercelBlobPhotoUrl,
  PROFILE_PHOTO_MAX_BYTES,
  profilePhotoUploadPathname,
  validateUploadedProfilePhoto,
} from "@/app/_lib/profile-photo";
import { db } from "@/lib/db";
import { getPractitioner } from "@/lib/auth";
import { guardPublicUrl, fetchGuarded } from "@/lib/ssrf";

// Same SSRF posture as the importer: a remote image URL is user-influenced, so only ever
// fetch PUBLIC http(s) hosts (never localhost / private / metadata IPs). Shared guard: lib/ssrf.
const dnsResolve = async (host: string): Promise<string> => (await lookup(host)).address;

type SaveResult = { ok: true; photoUrl: string } | { ok: false; error: string };

async function persistPhoto(practitionerId: string, oldUrl: string | null, url: string): Promise<void> {
  await db.practitioner.update({ where: { id: practitionerId }, data: { photoUrl: url } });
  // Best-effort cleanup of the previous Blob (ignore failures — never block the save).
  if (oldUrl && oldUrl !== url && isVercelBlobPhotoUrl(oldUrl)) {
    try {
      await del(oldUrl);
    } catch {
      /* orphaned blob is harmless */
    }
  }
  try {
    revalidatePath("/practitioner");
  } catch {
    // The photo is already durable; a cache refresh failure should not undo or misreport it.
  }
}

/** Persist a completed direct-to-Blob device upload after re-reading its trusted metadata. */
export async function finalizeProfilePhoto(blobUrl: string): Promise<SaveResult> {
  const result = await getPractitioner();
  if (!result) return { ok: false, error: "You're not signed in." };
  if (!result.practitioner) return { ok: false, error: "We couldn't find your practitioner profile." };

  if (typeof blobUrl !== "string" || !isVercelBlobPhotoUrl(blobUrl)) {
    return { ok: false, error: "Couldn't verify that upload — please try again." };
  }

  try {
    const metadata = await head(blobUrl);
    const validation = validateUploadedProfilePhoto(blobUrl, metadata, result.practitioner.id);
    if (!validation.ok) return validation;

    try {
      await persistPhoto(result.practitioner.id, result.practitioner.photoUrl, metadata.url);
    } catch {
      // A database/network error can be ambiguous: the update may have committed before
      // the connection failed. Keep the verified Blob so a committed photoUrl never points
      // at a file we deleted; an orphan is safer and can be cleaned up later.
      return { ok: false, error: "Couldn't save that photo just now — please try again." };
    }
    return { ok: true, photoUrl: metadata.url };
  } catch {
    return { ok: false, error: "Couldn't verify that upload — please try again." };
  }
}

/** Pull a photo we found during import (e.g. a Psychology Today headshot) into our own Blob. */
export async function adoptImportedPhoto(rawUrl: string): Promise<SaveResult> {
  const result = await getPractitioner();
  if (!result) return { ok: false, error: "You're not signed in." };
  if (!result.practitioner) return { ok: false, error: "We couldn't find your practitioner profile." };

  const guard = await guardPublicUrl(rawUrl, dnsResolve);
  if (!guard.ok) {
    const error =
      guard.reason === "invalid_url"
        ? "That image link doesn't look valid."
        : guard.reason === "unresolvable"
          ? "Couldn't find that image."
          : "That image link isn't reachable."; // bad_protocol | internal_host | private_ip
    return { ok: false, error };
  }
  const { url } = guard;

  try {
    // Redirects are followed manually with the guard re-run on every hop (see lib/ssrf).
    const fetched = await fetchGuarded(url, dnsResolve, { signal: AbortSignal.timeout(8000) });
    if (!fetched.ok) return { ok: false, error: "Couldn't fetch that image — upload one instead." };
    const res = fetched.response;
    if (!res.ok) return { ok: false, error: "Couldn't fetch that image — upload one instead." };
    const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const pathname = profilePhotoUploadPathname(result.practitioner.id, ct);
    if (!pathname) return { ok: false, error: "That link isn't a supported image — upload one instead." };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > PROFILE_PHOTO_MAX_BYTES) {
      return { ok: false, error: "That image is too large — upload a smaller one." };
    }
    const blob = await put(pathname, buf, {
      access: "public",
      contentType: ct,
      addRandomSuffix: true,
    });
    await persistPhoto(result.practitioner.id, result.practitioner.photoUrl, blob.url);
    return { ok: true, photoUrl: blob.url };
  } catch {
    return { ok: false, error: "Couldn't bring that photo over — upload one instead." };
  }
}

/** Remove the current photo. */
export async function removeProfilePhoto(): Promise<{ ok: boolean }> {
  const result = await getPractitioner();
  if (!result?.practitioner) return { ok: false };
  const old = result.practitioner.photoUrl;
  try {
    await db.practitioner.update({ where: { id: result.practitioner.id }, data: { photoUrl: null } });
    if (old && isVercelBlobPhotoUrl(old)) {
      try {
        await del(old);
      } catch {
        /* ignore */
      }
    }
    try {
      revalidatePath("/practitioner");
    } catch {
      // The removal is already durable; the page will read the new value on the next request.
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

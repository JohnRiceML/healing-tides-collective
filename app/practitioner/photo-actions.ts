"use server";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrCreatePractitioner } from "@/lib/auth";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

// Same SSRF posture as the importer: a remote image URL is user-influenced, so only
// ever fetch PUBLIC http(s) hosts (never localhost / private / metadata IPs).
function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("0.") ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^(fc|fd|fe80)/i.test(ip)
  );
}

type SaveResult = { ok: true; photoUrl: string } | { ok: false; error: string };

async function persistPhoto(practitionerId: string, oldUrl: string | null, url: string): Promise<void> {
  await db.practitioner.update({ where: { id: practitionerId }, data: { photoUrl: url } });
  // Best-effort cleanup of the previous Blob (ignore failures — never block the save).
  if (oldUrl && oldUrl !== url && oldUrl.includes(".blob.vercel-storage.com")) {
    try {
      await del(oldUrl);
    } catch {
      /* orphaned blob is harmless */
    }
  }
  revalidatePath("/practitioner");
}

/** Upload a photo the practitioner picked from their device. */
export async function uploadProfilePhoto(formData: FormData): Promise<SaveResult> {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false, error: "You're not signed in." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Pick an image file to upload." };
  }
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, error: "Use a JP, PNG, WebP, or GIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "That image is over 6 MB — try a smaller one." };

  try {
    const blob = await put(`practitioners/${result.practitioner.id}/avatar.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    await persistPhoto(result.practitioner.id, result.practitioner.photoUrl, blob.url);
    return { ok: true, photoUrl: blob.url };
  } catch {
    return { ok: false, error: "Couldn't upload that just now — please try again." };
  }
}

/** Pull a photo we found during import (e.g. a Psychology Today headshot) into our own Blob. */
export async function adoptImportedPhoto(rawUrl: string): Promise<SaveResult> {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false, error: "You're not signed in." };

  let url: URL;
  try {
    url = new URL((rawUrl ?? "").trim());
  } catch {
    return { ok: false, error: "That image link doesn't look valid." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "That image link isn't reachable." };
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, error: "That image link isn't reachable." };
  }
  try {
    const addr = isIP(host) ? host : (await lookup(host)).address;
    if (isPrivateIp(addr)) return { ok: false, error: "That image link isn't reachable." };
  } catch {
    return { ok: false, error: "Couldn't find that image." };
  }

  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { ok: false, error: "Couldn't fetch that image — upload one instead." };
    const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const ext = ALLOWED[ct];
    if (!ext) return { ok: false, error: "That link isn't a supported image — upload one instead." };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
      return { ok: false, error: "That image is too large — upload a smaller one." };
    }
    const blob = await put(`practitioners/${result.practitioner.id}/avatar.${ext}`, buf, {
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
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false };
  const old = result.practitioner.photoUrl;
  try {
    await db.practitioner.update({ where: { id: result.practitioner.id }, data: { photoUrl: null } });
    if (old && old.includes(".blob.vercel-storage.com")) {
      try {
        await del(old);
      } catch {
        /* ignore */
      }
    }
    revalidatePath("/practitioner");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

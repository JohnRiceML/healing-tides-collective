"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentDbUser, getOrCreatePractitioner } from "@/lib/auth";
import { getInviteByToken, inviteIsClaimable, buildClaimUpdate, readPrefill, IMPORT_URL_KEY } from "@/lib/invites";
import { completenessOf } from "@/lib/completeness";
import { safeWebsite } from "@/lib/url";
import type { Prisma } from "@/lib/generated/prisma/client";

// Short-lived, httpOnly cookie that carries the claim token across Clerk sign-up:
// /claim → (set cookie) → /join → (sign up) → /practitioner → "Finish claiming".
const CLAIM_COOKIE = "ht_claim";
const CLAIM_MAX_AGE = 60 * 60; // 60 min — room for a slow sign-up / email verification

type ClaimResult =
  | { ok: true }
  | { ok: false; reason: "claimed" | "email_mismatch" | "no_user" | "update_failed" };

/**
 * Step 1 — from the /claim/[token] page. If already signed in, claim now; otherwise
 * stash the token and route through sign-up, finishing on the dashboard.
 */
export async function startClaim(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!inviteIsClaimable(await getInviteByToken(token))) redirect(`/claim/${token}`);

  if (await getCurrentDbUser()) {
    const res = await applyClaim(token);
    redirect(res.ok ? "/practitioner/edit" : `/claim/${token}?e=${res.reason}`);
  }

  (await cookies()).set(CLAIM_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CLAIM_MAX_AGE,
  });
  redirect("/join");
}

/** Step 2 — from the dashboard after sign-up: read the stashed token and finish. */
export async function completeClaim() {
  const jar = await cookies();
  const token = jar.get(CLAIM_COOKIE)?.value ?? "";
  jar.delete(CLAIM_COOKIE);
  if (!token) redirect("/practitioner");

  const res = await applyClaim(token);
  redirect(res.ok ? "/practitioner/edit" : `/claim/${token}?e=${res.reason}`);
}

/**
 * Atomically claim the invite for the signed-in user, then fill-if-empty prefill their
 * practitioner. Guards:
 *  - the invite is addressed to a specific (Clerk-verified) email — only that person
 *    may claim it, so a forwarded link can't be hijacked;
 *  - the claim is a single atomic `updateMany … WHERE claimedAt IS NULL`, so two
 *    concurrent requests can't both win (the loser sees count === 0).
 * The user is only promoted to practitioner AFTER those checks pass.
 */
async function applyClaim(token: string): Promise<ClaimResult> {
  const invite = await getInviteByToken(token);
  if (!inviteIsClaimable(invite) || !invite) return { ok: false, reason: "claimed" };

  const user = await getCurrentDbUser();
  if (!user) return { ok: false, reason: "no_user" };

  const userEmail = user.email?.trim().toLowerCase();
  const inviteEmail = invite.email.trim().toLowerCase();
  if (userEmail && inviteEmail && userEmail !== inviteEmail) {
    return { ok: false, reason: "email_mismatch" };
  }

  // Atomic: only the request that flips claimedAt from NULL → now wins the race.
  const claimed = await db.invite.updateMany({
    where: { token, claimedAt: null },
    data: { claimedAt: new Date(), claimedByUserId: user.id },
  });
  if (claimed.count === 0) return { ok: false, reason: "claimed" };

  // We own the claim now → create/promote the practitioner and prefill the gaps.
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: true }; // claimed; profile build can be retried via the editor
  const p = result.practitioner;

  const fill = buildClaimUpdate(p, invite);
  const prefill = readPrefill(invite.prefill);
  const data: Prisma.PractitionerUpdateInput = {};
  if (fill.displayName) data.displayName = fill.displayName;
  if (fill.region) data.region = fill.region;
  if (fill.bio) data.bio = fill.bio;
  if (fill.website) {
    const safe = safeWebsite(fill.website);
    if (safe) data.website = safe;
  }
  if (fill.specialties) data.specialties = fill.specialties;

  // fieldValues: DIRECT spreads over the existing blob, preserving every key (the
  // practitioner's rich answers AND the reserved `__` siblings). NOT mergeFieldValues —
  // that REBUILDS the non-reserved set from `incoming`, which would wipe an existing
  // practitioner's fieldValues on claim. `title` is fill-if-empty: buildClaimUpdate only
  // sets fill.title when the existing title is blank, so a typed title is never touched.
  let nextFieldValues: Record<string, unknown> | null = null;
  if (fill.title) {
    nextFieldValues = { ...((p.fieldValues ?? {}) as Record<string, unknown>), title: fill.title };
  }
  if (prefill.importUrl) {
    const base = nextFieldValues ?? ((p.fieldValues ?? {}) as Record<string, unknown>);
    nextFieldValues = { ...base, [IMPORT_URL_KEY]: prefill.importUrl };
  }
  if (nextFieldValues) data.fieldValues = nextFieldValues as Prisma.InputJsonValue;

  if (Object.keys(data).length > 0) {
    data.completeness = completenessOf({
      displayName: data.displayName ?? p.displayName,
      bio: data.bio ?? p.bio,
      values: p.values,
      modality: p.modality,
      region: data.region ?? p.region,
      gender: p.gender,
      specialties: data.specialties ?? p.specialties,
      insuranceAccepted: p.insuranceAccepted,
      website: data.website ?? p.website,
    });
    try {
      await db.practitioner.update({ where: { id: p.id }, data });
    } catch {
      // The invite was already burned above; if the prefill write fails, un-burn it
      // (best-effort) so the practitioner can simply try the claim again — otherwise
      // the prefill is lost forever. The burn stays atomic; this only reopens it.
      await db.invite
        .updateMany({ where: { token }, data: { claimedAt: null, claimedByUserId: null } })
        .catch(() => {});
      return { ok: false, reason: "update_failed" };
    }
  }
  return { ok: true };
}

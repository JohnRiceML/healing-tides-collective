"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentDbUser, getOrCreatePractitioner } from "@/lib/auth";
import { getInviteByToken, inviteIsClaimable, buildClaimUpdate } from "@/lib/invites";
import { mergeFieldValues } from "@/app/_lib/verification";
import { completenessOf } from "@/lib/completeness";
import { safeWebsite } from "@/lib/url";
import type { Prisma } from "@/lib/generated/prisma/client";

// Short-lived, httpOnly cookie that carries the claim token across Clerk sign-up:
// /claim → (set cookie) → /join → (sign up) → /practitioner → "Finish claiming".
const CLAIM_COOKIE = "ht_claim";
const CLAIM_MAX_AGE = 60 * 30; // 30 min

/**
 * Step 1 — from the /claim/[token] page. If already signed in, claim now; otherwise
 * stash the token and route through sign-up, finishing on the dashboard.
 */
export async function startClaim(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!inviteIsClaimable(await getInviteByToken(token))) redirect(`/claim/${token}`);

  if (await getCurrentDbUser()) {
    await applyClaim(token);
    redirect("/practitioner/edit");
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
  if (token) await applyClaim(token);
  redirect("/practitioner/edit");
}

/**
 * Create/promote the practitioner, prefill the empty fields from the invite (never
 * overwriting what they've typed), and mark the invite claimed. Idempotent-ish: a
 * second run is a no-op once the invite is claimed.
 */
async function applyClaim(token: string) {
  const invite = await getInviteByToken(token);
  if (!inviteIsClaimable(invite) || !invite) return;

  const result = await getOrCreatePractitioner();
  if (!result) return;
  const p = result.practitioner;

  const fill = buildClaimUpdate(p, invite);

  const data: Prisma.PractitionerUpdateInput = {};
  if (fill.displayName) data.displayName = fill.displayName;
  if (fill.region) data.region = fill.region;
  if (fill.website) {
    const safe = safeWebsite(fill.website);
    if (safe) data.website = safe;
  }
  if (fill.specialties) data.specialties = fill.specialties;
  if (fill.title) {
    data.fieldValues = mergeFieldValues(p.fieldValues, { title: fill.title }) as Prisma.InputJsonValue;
  }

  // Recompute completeness against the merged values so the prefill is reflected.
  data.completeness = completenessOf({
    displayName: data.displayName ?? p.displayName,
    bio: p.bio,
    values: p.values,
    modality: p.modality,
    region: data.region ?? p.region,
    gender: p.gender,
    specialties: data.specialties ?? p.specialties,
    insuranceAccepted: p.insuranceAccepted,
    website: data.website ?? p.website,
  });

  await db.practitioner.update({ where: { id: p.id }, data });
  await db.invite.update({
    where: { token },
    data: { claimedAt: new Date(), claimedByUserId: result.user.id },
  });
}

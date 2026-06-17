// Read layer + helpers for practitioner claim invites. An Invite is a pre-seeded
// "your profile is ready — claim it" record (from Nora's waitlist). It holds prefill
// data until someone signs up and claims it; we never pre-create Practitioner rows.
//
// The claim-COMPLETION flow (link the invite to a freshly signed-up practitioner) is
// increment 2 — this module is the model + read layer + token minting.

import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";

/** Prefill carried from Nora's CSV → shown on the claim page → applied on claim. */
export type InvitePrefill = {
  region?: string;
  title?: string;
  website?: string;
  specialties?: string[];
};

/** Opaque, unguessable token for the /claim/[token] URL (24 url-safe chars). */
export function newInviteToken(): string {
  return randomBytes(18).toString("base64url");
}

/** A practitioner-safe view of an invite's prefill (never trusts the JSON blob shape). */
export function readPrefill(prefill: unknown): InvitePrefill {
  const p = (prefill ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  return {
    region: str(p.region),
    title: str(p.title),
    website: str(p.website),
    specialties: Array.isArray(p.specialties)
      ? p.specialties.filter((s): s is string => typeof s === "string" && s.trim() !== "")
      : undefined,
  };
}

export async function getInviteByToken(token: string) {
  if (!token) return null;
  return db.invite.findUnique({ where: { token } });
}

/** An invite can still be claimed iff it exists and hasn't been claimed yet. */
export function inviteIsClaimable(invite: { claimedAt: Date | null } | null): boolean {
  return Boolean(invite && !invite.claimedAt);
}

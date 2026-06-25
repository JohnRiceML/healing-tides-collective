// Read layer + helpers for practitioner claim invites. An Invite is a pre-seeded
// "your profile is ready — claim it" record (from Nora's waitlist). It holds prefill
// data until someone signs up and claims it; we never pre-create Practitioner rows.
//
// The claim-COMPLETION flow (link the invite to a freshly signed-up practitioner) is
// increment 2 — this module is the model + read layer + token minting.

import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";

/** Prefill carried from Nora's waitlist → shown on the claim page → applied on claim.
 *  `importUrl` is the practitioner's existing profile link (e.g. Psychology Today) — NOT a
 *  profile field: it's carried to them so THEY can one-tap import their own profile after
 *  claiming (we never fetch it on their behalf pre-claim). */
export type InvitePrefill = {
  region?: string;
  title?: string;
  website?: string;
  specialties?: string[];
  bio?: string;
  importUrl?: string;
};

/** Opaque, unguessable token for the /claim/[token] URL (24 url-safe chars). */
export function newInviteToken(): string {
  return randomBytes(18).toString("base64url");
}

// IMPORT_URL_KEY + readImportUrl live in the client-safe app/_lib/import-url (this module
// imports the server-only db, so the editor can't import from here). Re-exported so server
// callers + tests can keep importing them from "@/lib/invites".
export { IMPORT_URL_KEY, readImportUrl } from "@/app/_lib/import-url";

/** A practitioner-safe view of an invite's prefill (never trusts the JSON blob shape). */
export function readPrefill(prefill: unknown): InvitePrefill {
  const p = (prefill ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  // Only keep http(s) URLs — a stored importUrl must be safe to render + hand to the importer.
  const httpUrl = (v: unknown) => {
    const s = str(v);
    if (!s) return undefined;
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:" ? s : undefined;
    } catch {
      return undefined;
    }
  };
  return {
    region: str(p.region),
    title: str(p.title),
    website: str(p.website),
    specialties: Array.isArray(p.specialties)
      ? p.specialties.filter((s): s is string => typeof s === "string" && s.trim() !== "")
      : undefined,
    bio: str(p.bio),
    importUrl: httpUrl(p.importUrl),
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

/** What an invite's prefill should set on a (possibly part-filled) practitioner. */
export type ClaimUpdate = {
  displayName?: string;
  region?: string;
  website?: string;
  specialties?: string[];
  title?: string; // lives in fieldValues
  bio?: string;
};

/**
 * Fill-if-empty: decide which fields a claim should populate, NEVER overwriting
 * anything the practitioner has already entered. Pure — the caller applies it (URL
 * sanitizing, fieldValues merge, completeness) so this stays trivially testable.
 */
export function buildClaimUpdate(
  p: {
    displayName?: string | null;
    region?: string | null;
    website?: string | null;
    specialties?: string[];
    bio?: string | null;
    fieldValues?: unknown;
  },
  invite: { displayName?: string | null; prefill?: unknown },
): ClaimUpdate {
  const prefill = readPrefill(invite.prefill);
  const out: ClaimUpdate = {};
  const empty = (v?: string | null) => !v || !v.trim();

  if (empty(p.displayName) && invite.displayName?.trim()) out.displayName = invite.displayName.trim();
  if (empty(p.region) && prefill.region) out.region = prefill.region;
  if (empty(p.website) && prefill.website) out.website = prefill.website;
  if ((p.specialties?.length ?? 0) === 0 && prefill.specialties?.length) out.specialties = prefill.specialties;
  if (empty(p.bio) && prefill.bio) out.bio = prefill.bio;

  const existingTitle = (p.fieldValues as Record<string, unknown> | null | undefined)?.title;
  if (empty(typeof existingTitle === "string" ? existingTitle : "") && prefill.title) out.title = prefill.title;

  return out;
}

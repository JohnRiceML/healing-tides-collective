// Trust & Safety — the admin "hold" (hide) mechanism.
//
// Migration-free, mirroring the verification-badge pattern: state lives under reserved
// `__`-prefixed keys inside the practitioner's `fieldValues` JSON, which the practitioner's
// own save can NEVER touch (see mergeFieldValues in verification.ts). A hold HIDES a profile
// from the public without deleting anything — it sets visibility=HIDDEN and records why +
// the prior visibility, so Release restores exactly where they were.
//
// Public effect: visibility=HIDDEN is already excluded by the public read layer
// (lib/practitioners.ts only ever shows PUBLISHED). The __hold record is the authoritative
// "is this an admin hold?" marker + carries the message/note/audit.
//
// This is the seed of the platform's moderation pillar. When it needs to become filterable
// or fully audited, promote it to dedicated columns + an AdminAction table (a migration).

import type { ProfileVisibility } from "@/lib/generated/prisma/client";

export const HOLD_KEY = "__hold"; // the current active hold (object) or absent
export const HOLD_HISTORY_KEY = "__holdHistory"; // append-only audit trail (array)

const RESTORABLE: ProfileVisibility[] = ["PUBLISHED", "DRAFT", "NEEDS_REVIEW"];

export type HoldRecord = {
  prev: ProfileVisibility; // visibility to restore on release
  message: string; // practitioner-facing reason (shown in their editor)
  internalNote: string; // admin/legal-only note (never shown to the practitioner)
  by: string; // admin email, or "system (Clerk webhook)"
  at: string; // ISO timestamp
};

export type HoldHistoryEntry = {
  action: "hold" | "release";
  by: string;
  at: string;
  reason?: string;
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A safe restore target — never HIDDEN (that would leave them stuck hidden). */
export function coercePrev(v: unknown): ProfileVisibility {
  return RESTORABLE.includes(v as ProfileVisibility) ? (v as ProfileVisibility) : "DRAFT";
}

/** Read the active hold (or null) from a fieldValues blob. */
export function readHold(fieldValues: unknown): HoldRecord | null {
  const raw = (fieldValues as Record<string, unknown> | null | undefined)?.[HOLD_KEY];
  if (!isObj(raw)) return null;
  return {
    prev: coercePrev(raw.prev),
    message: typeof raw.message === "string" ? raw.message : "",
    internalNote: typeof raw.internalNote === "string" ? raw.internalNote : "",
    by: typeof raw.by === "string" ? raw.by : "",
    at: typeof raw.at === "string" ? raw.at : "",
  };
}

/** True when a practitioner is currently on an admin hold. */
export function isOnHold(p: { visibility?: ProfileVisibility; fieldValues?: unknown }): boolean {
  return Boolean(readHold(p.fieldValues)) || p.visibility === "HIDDEN";
}

/** The practitioner-facing hold message (or a calm default). */
export function holdMessage(fieldValues: unknown): string {
  const m = readHold(fieldValues)?.message.trim();
  return m && m.length > 0
    ? m
    : "Your profile is on hold while the Healing Tides team takes a look. Reach out and we’ll help.";
}

/** Read the append-only history array. */
export function readHistory(fieldValues: unknown): HoldHistoryEntry[] {
  const raw = (fieldValues as Record<string, unknown> | null | undefined)?.[HOLD_HISTORY_KEY];
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObj).map((e) => ({
    action: e.action === "release" ? "release" : "hold",
    by: typeof e.by === "string" ? e.by : "",
    at: typeof e.at === "string" ? e.at : "",
    ...(typeof e.reason === "string" ? { reason: e.reason } : {}),
  }));
}

/**
 * Next fieldValues for a HOLD: set __hold (prev/message/note/by/at) + append history.
 * Pure — preserves all other keys (incl. __verified). Timestamp is passed in so this
 * stays pure + unit-testable. Capped history keeps the JSON bounded.
 */
export function applyHold(
  existing: unknown,
  args: { prev: ProfileVisibility; message: string; internalNote: string; by: string; at: string },
): Record<string, unknown> {
  const ex = isObj(existing) ? existing : {};
  const hold: HoldRecord = {
    prev: coercePrev(args.prev),
    message: args.message.trim(),
    internalNote: args.internalNote.trim(),
    by: args.by,
    at: args.at,
  };
  const entry: HoldHistoryEntry = {
    action: "hold",
    by: args.by,
    at: args.at,
    ...(hold.message ? { reason: hold.message } : {}),
  };
  const history: HoldHistoryEntry[] = [...readHistory(ex), entry].slice(-50);
  return { ...ex, [HOLD_KEY]: hold, [HOLD_HISTORY_KEY]: history };
}

/**
 * Next fieldValues for a RELEASE: remove __hold, append history. Returns the fieldValues
 * AND the visibility to restore (the prev recorded at hold time).
 */
export function applyRelease(
  existing: unknown,
  args: { by: string; at: string },
): { fieldValues: Record<string, unknown>; restore: ProfileVisibility } {
  const ex: Record<string, unknown> = isObj(existing) ? { ...existing } : {};
  const restore = coercePrev(readHold(ex)?.prev);
  delete ex[HOLD_KEY];
  const entry: HoldHistoryEntry = { action: "release", by: args.by, at: args.at };
  ex[HOLD_HISTORY_KEY] = [...readHistory(ex), entry].slice(-50);
  return { fieldValues: ex, restore };
}

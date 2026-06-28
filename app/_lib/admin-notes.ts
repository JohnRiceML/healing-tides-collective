// Private admin notes on a practitioner account — pure + client-safe (NO db). Stored migration-free
// in the reserved `__adminNotes` fieldValues key (append-only array). Never shown to the practitioner;
// only the admin surfaces read these. Same reserved-key discipline as __verified / __hold / __aiTriage.

export const ADMIN_NOTES_KEY = "__adminNotes";

export type AdminNote = { text: string; at: string; by: string | null };

/** Defensive read of the notes array — newest first, never trusts the blob shape. */
export function readAdminNotes(fieldValues: unknown): AdminNote[] {
  const raw = (fieldValues as Record<string, unknown> | null)?.[ADMIN_NOTES_KEY];
  if (!Array.isArray(raw)) return [];
  const notes: AdminNote[] = [];
  for (const n of raw) {
    if (!n || typeof n !== "object") continue;
    const o = n as Record<string, unknown>;
    if (typeof o.text === "string" && o.text.trim() && typeof o.at === "string") {
      notes.push({ text: o.text, at: o.at, by: typeof o.by === "string" ? o.by : null });
    }
  }
  // Newest first for display.
  return notes.sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** Append a note to the existing array (oldest→newest in storage); pure so it's testable. */
export function appendNote(existing: unknown, note: AdminNote): AdminNote[] {
  const prior = Array.isArray((existing as Record<string, unknown> | null)?.[ADMIN_NOTES_KEY])
    ? ((existing as Record<string, unknown>)[ADMIN_NOTES_KEY] as unknown[])
    : [];
  const clean = prior.filter(
    (n): n is AdminNote => !!n && typeof n === "object" && typeof (n as AdminNote).text === "string",
  );
  return [...clean, note].slice(-200); // cap so the JSON blob can't grow unbounded
}

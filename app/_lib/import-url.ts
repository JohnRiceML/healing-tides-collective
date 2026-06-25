// Pure, client-safe helper for the carried "import this profile" link. Lives here (not in
// lib/invites, which imports the server-only Prisma client) so the practitioner EDITOR — a
// client component — can read it without dragging the DB into the browser bundle.

/** Reserved `fieldValues` key carrying the practitioner's own profile link (e.g. Psychology
 *  Today) from their invite, so the editor can offer a one-tap self-import after they claim.
 *  `__`-prefixed → `mergeFieldValues` can't let a practitioner save forge it. */
export const IMPORT_URL_KEY = "__importUrl";

/** Read the carried import link off a practitioner's fieldValues (null if none/invalid). */
export function readImportUrl(fieldValues: unknown): string | null {
  const v = (fieldValues as Record<string, unknown> | null | undefined)?.[IMPORT_URL_KEY];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

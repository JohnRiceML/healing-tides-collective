// Pure bulk-invite parsing — NO db import, so it's safe to import from client components
// (the admin BulkInviteCreator needs MAX_BULK_INVITES). lib/invites re-exports these for the
// server actions + tests, mirroring the app/_lib/import-url split (lib/invites pulls in @/lib/db,
// which must never reach the browser bundle).

/** One practitioner to invite, parsed from a pasted line. */
export type ParsedBulkInvite = { email: string; displayName?: string; importUrl?: string };
export type BulkParseResult = {
  valid: ParsedBulkInvite[];
  invalid: { line: number; raw: string; reason: string }[];
  duplicates: number; // dropped as repeats WITHIN the paste
};

const BULK_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Cap a single paste so an accidental huge dump can't fan out into thousands of emails. */
export const MAX_BULK_INVITES = 100;

/**
 * Parse a pasted block (one practitioner per line) into invite rows. Deliberately forgiving about
 * column order + separator (comma OR tab): on each line it finds the email, an http(s) URL (the
 * Psychology-Today/import link), and treats the leftover text as the name. Blank lines are skipped;
 * lines with no valid email are reported; repeats within the paste are de-duped by email (lowercased).
 */
export function parseBulkInvites(text: string): BulkParseResult {
  const valid: ParsedBulkInvite[] = [];
  const invalid: { line: number; raw: string; reason: string }[] = [];
  const seen = new Set<string>();
  let duplicates = 0;

  const lines = (text ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue; // skip blanks
    if (valid.length >= MAX_BULK_INVITES) {
      invalid.push({ line: i + 1, raw, reason: `Over the ${MAX_BULK_INVITES}-row limit — not added.` });
      continue;
    }

    const parts = raw.split(/[,\t]/).map((s) => s.trim()).filter(Boolean);
    const email = parts.find((p) => BULK_EMAIL_RE.test(p))?.toLowerCase();
    if (!email) {
      invalid.push({ line: i + 1, raw, reason: "No valid email on this line." });
      continue;
    }
    if (seen.has(email)) {
      duplicates++;
      continue;
    }
    seen.add(email);

    const importUrl = parts.find((p) => /^https?:\/\//i.test(p));
    const displayName = parts.find(
      (p) => p.toLowerCase() !== email && p !== importUrl && !BULK_EMAIL_RE.test(p) && !/^https?:\/\//i.test(p),
    );
    valid.push({ email, ...(displayName ? { displayName } : {}), ...(importUrl ? { importUrl } : {}) });
  }

  return { valid, invalid, duplicates };
}

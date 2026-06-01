/**
 * URL-safe slug from a display name. Lowercases, strips accents + non-alphanumerics,
 * collapses runs to single hyphens, trims edge hyphens, caps at 60 chars, and falls
 * back to "practitioner" when nothing usable remains. Pure (no I/O) — uniqueness is
 * handled separately against the DB.
 */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "practitioner";
}

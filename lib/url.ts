/**
 * Normalize a user-supplied website into a safe, link-able value, or null.
 *  - keeps an existing http(s):// URL as-is
 *  - assumes https:// for a bare domain ("example.com" → "https://example.com")
 *  - DROPS any other scheme (javascript:/data:/mailto:/…) so it can never be
 *    stored or rendered as a link — the public profile's defense against a
 *    stored-XSS `href`.
 * Pure; safe to call anywhere.
 */
export function safeWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return null; // some non-http scheme → drop
  return `https://${t}`;
}

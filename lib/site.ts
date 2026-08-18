// Single source of truth for the site's canonical, indexable origin.
//
// `www` is canonical: the apex `healingtides.co` 308-redirects to
// `www.healingtides.co`. Every canonical URL, OG/Twitter url, JSON-LD `url`, and
// sitemap entry MUST use this constant so SEO signal isn't split across the
// redirecting apex host.
export const SITE_URL = "https://www.healingtides.co";

// The one address the site shows anyone — footer, 404, claim page, profile editor, practitioner
// dashboard, the "connect with a practitioner" link, and the JSON-LD organization record.
//
// It was hardcoded in ~20 places across 10 files, and had already drifted: the landing page used
// nora@healingtidestherapy.com (her private practice) while every other surface used the brand
// domain, so the front page pointed somewhere different from the rest of the site. Both domains
// accept mail, so nothing bounced and nothing surfaced the split.
//
// NEXT_PUBLIC_ so client components can read it too. Env-overridable because which address to use
// is a business decision that shouldn't need a code change — set NEXT_PUBLIC_CONTACT_EMAIL in
// Vercel to move every surface at once.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "nora@healingtides.co";

/** `mailto:` href for CONTACT_EMAIL. Append `?subject=…` where a prefilled subject helps. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

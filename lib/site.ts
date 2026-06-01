// Single source of truth for the site's canonical, indexable origin.
//
// `www` is canonical: the apex `healingtides.co` 307-redirects to
// `www.healingtides.co`. Every canonical URL, OG/Twitter url, JSON-LD `url`, and
// sitemap entry MUST use this constant so SEO signal isn't split across the
// redirecting apex host.
export const SITE_URL = "https://www.healingtides.co";

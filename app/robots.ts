import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Search directives for the whole site. Public surfaces stay crawlable; account/admin/utility
// routes are noise for crawlers (they're auth-gated or transactional, never landing pages).
// The sitemap already lists every indexable URL (static + published practitioners + journal).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard",
          // robots.txt paths are PREFIX matches, so a bare "/practitioner" also blocks
          // "/practitioners" — the entire public directory. These two rules block the private
          // dashboard and its sub-routes ONLY. Do not collapse them back into one.
          "/practitioner$",
          "/practitioner/",
          "/welcome",
          // Public account doors are crawlable but carry page-level noindex. Google must be
          // allowed to fetch them in order to see that directive.
          "/claim/",
          "/studio",
          // NEVER add /journal paths here. Six retired posts now return 404 so Google will drop
          // them — but only if it can still CRAWL them. Disallowing a URL stops the crawl, so the
          // 404 is never seen and the page lingers in the index (as a "Indexed, though blocked by
          // robots.txt" entry) far longer than doing nothing. Blocking a page you want de-indexed
          // achieves the opposite. Let them 404 in peace.
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

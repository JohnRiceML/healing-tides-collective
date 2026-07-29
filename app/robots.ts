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
          "/save-account",
          "/sign-in",
          "/join",
          "/claim/",
          "/studio",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

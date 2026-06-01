import type { MetadataRoute } from "next";

import { getPublishedSlugs } from "@/lib/practitioners";
import { SITE_URL } from "@/lib/site";

// Per-request so a newly published practitioner appears without a redeploy
// (and so `next build` never depends on the DB being reachable at build time).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/journal`, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${SITE_URL}/practitioners`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const profileRoutes: MetadataRoute.Sitemap = slugs.map(
    ({ slug, updatedAt }) => ({
      url: `${SITE_URL}/practitioners/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...profileRoutes];
}

import type { MetadataRoute } from "next";

import { getPublishedSlugs } from "@/lib/practitioners";
import { SITE_URL } from "@/lib/site";
import { client } from "@/sanity/lib/client";
import { POST_SITEMAP_QUERY } from "@/sanity/lib/queries";

// Per-request so a newly published practitioner or journal post appears without a
// redeploy (and so `next build` never depends on the DB/CMS being reachable at build).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();

  // A CMS hiccup must never break the whole sitemap (it also serves practitioners).
  const posts: Array<{ slug: string | null; lastModified: string | null }> =
    await client.fetch(POST_SITEMAP_QUERY).catch(() => []);

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

  const journalRoutes: MetadataRoute.Sitemap = posts
    .filter((p): p is { slug: string; lastModified: string | null } => Boolean(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: p.lastModified ? new Date(p.lastModified) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...profileRoutes, ...journalRoutes];
}

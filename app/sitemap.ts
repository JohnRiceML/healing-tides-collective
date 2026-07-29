import type { MetadataRoute } from "next";

import { allCarePages, carePagePath, isIndexable } from "@/lib/care-pages";
import { getPublishedPractitioners, getPublishedSlugs } from "@/lib/practitioners";
import { mnCitiesFromText } from "@/lib/mn-cities";
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

  // Care pages: ONLY the ones with real local supply behind them (the doorway-page guard —
  // same rule the page's robots meta uses). One read of the published set, matched in memory,
  // rather than a query per specialty×city.
  const published = await getPublishedPractitioners().catch(() => []);
  // COUNT per specialty×city with the same set semantics the page query uses (a region may
  // match several cities), so the sitemap and the page's robots meta can never disagree.
  const supply = new Map<string, number>();
  for (const p of published) {
    for (const city of mnCitiesFromText(p.region)) {
      for (const specialty of p.specialties) {
        const key = `${specialty}/${city.slug}`;
        supply.set(key, (supply.get(key) ?? 0) + 1);
      }
    }
  }
  const careRoutes: MetadataRoute.Sitemap = allCarePages()
    .filter(({ specialty, city }) => isIndexable(supply.get(`${specialty.id}/${city.slug}`) ?? 0))
    .map((page) => ({
      url: `${SITE_URL}${carePagePath(page)}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const journalRoutes: MetadataRoute.Sitemap = posts
    .filter((p): p is { slug: string; lastModified: string | null } => Boolean(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: p.lastModified ? new Date(p.lastModified) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...profileRoutes, ...careRoutes, ...journalRoutes];
}

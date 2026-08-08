// The programmatic "care in a place" layer: /care/[specialty]/[city].
// Pure + client-safe (no db) so the inventory, copy, and — most importantly — the
// INDEXABILITY RULE are unit-testable.
//
// Why the indexability rule is load-bearing: a city×specialty template that differs only by
// place name is a doorway page, and Google demotes those. A page here earns indexing ONLY when
// it carries real local supply (at least three distinct published practitioners who match).
// Everything else still RENDERS — a seeker who lands there gets the guided agent and nearby
// options, which is honest and useful — but it's noindex'd and kept out of the sitemap until
// the network fills in. That's the cold-start truth: we never fake counts to look bigger.

import { CATEGORIES, type Category } from "@/app/_lib/taxonomy";
import { MN_CITIES, mnCitiesFromText, mnCityBySlug, type MnCity } from "@/lib/mn-cities";

export type CarePage = { specialty: Category; city: MnCity };

/** Resolve a URL pair to a real page, or null (→ 404). Never guesses. */
export function resolveCarePage(specialtySlug: string, citySlug: string): CarePage | null {
  const specialty = CATEGORIES.find((c) => c.id === specialtySlug.toLowerCase().trim()) ?? null;
  const city = mnCityBySlug(citySlug);
  return specialty && city ? { specialty, city } : null;
}

/** Every specialty × city combination — the full route inventory. */
export function allCarePages(): CarePage[] {
  return CATEGORIES.flatMap((specialty) => MN_CITIES.map((city) => ({ specialty, city })));
}

/** The public fields needed to count real local supply for a care page. */
export type CareSupplyProfile = {
  region: string | null;
  specialties: string[];
};

/**
 * Count published local practitioners for every specialty × city route.
 *
 * The sitemap, each page's robots directive, and the internal-link mesh must use this exact
 * matcher. If they drift, Google can discover a noindex route from an indexable page or see a
 * sitemap URL whose own metadata disagrees.
 */
export function carePageSupply(profiles: Iterable<CareSupplyProfile>): Map<string, number> {
  const supply = new Map<string, number>();
  for (const profile of profiles) {
    for (const city of mnCitiesFromText(profile.region)) {
      for (const specialty of new Set(profile.specialties)) {
        const key = `${specialty}/${city.slug}`;
        supply.set(key, (supply.get(key) ?? 0) + 1);
      }
    }
  }
  return supply;
}

/**
 * The minimum local supply a page needs before it may be indexed.
 *
 * Raised from 1 → 3 after an SEO audit (2026-07-28): at a bar of 1, every indexable page
 * surfaced the SAME single practitioner, which is precisely the doorway pattern Google
 * demotes — near-identical city×service pages funnelling to one destination. Three distinct
 * practitioners is the point where the page is genuinely *about the local supply* rather than
 * a template wrapper around one profile.
 *
 * NEXT GATE (not yet built): even at 3, each page should carry city-specific human prose
 * (local wait times, which MN networks are accepted, telehealth vs in-person here) before it's
 * truly unique. Until that exists, 3 is the floor that keeps thin pages out of the index.
 */
export const MIN_INDEXABLE_MATCHES = 3;

/**
 * A page may be indexed only with real local supply behind it. `matchCount` is the number of
 * PUBLISHED practitioners matching this specialty in (or serving) this city. Everything below
 * the bar still RENDERS (honestly, with the get-matched CTA) — it's just noindex + out of the
 * sitemap until the network fills in.
 */
export function isIndexable(matchCount: number): boolean {
  return matchCount >= MIN_INDEXABLE_MATCHES;
}

/** The <title>/H1 pair — natural language, never keyword soup. */
export function carePageTitle({ specialty, city }: CarePage): string {
  return `${specialty.label} support in ${city.name}, Minnesota`;
}

export function carePageDescription({ specialty, city }: CarePage, matchCount: number): string {
  const focus = specialty.subcategories
    .slice(0, 3)
    .map((s) => s.label.toLowerCase())
    .join(", ");
  return matchCount > 0
    ? `Practitioners in and around ${city.name} who work with ${focus}. Read how each person practices, then reach out directly — or let a real person help you find the right fit.`
    : `Looking for ${specialty.label.toLowerCase()} support near ${city.name}? Our Minnesota network is growing. Tell us what you need and a real person will help you find the right practitioner.`;
}

/**
 * The topic phrases this page is genuinely about — pulled from Nora's taxonomy, so the copy is
 * real editorial substance rather than keyword padding. Flattened across subcategories, capped.
 */
export function carePageTopics(specialty: Category, limit = 12): string[] {
  const out: string[] = [];
  // Round-robin across subcategories so one big subcategory can't crowd the others out.
  const lists = specialty.subcategories.map((s) => s.topics);
  for (let i = 0; out.length < limit; i++) {
    let added = false;
    for (const list of lists) {
      if (i < list.length && out.length < limit) {
        out.push(list[i]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

/** Sibling cities in the same area — the internal-linking mesh (never links to itself). */
export function nearbyCities(city: MnCity, limit = 6): MnCity[] {
  return MN_CITIES.filter((c) => c.area === city.area && c.slug !== city.slug).slice(0, limit);
}

/** Other specialties in the same city — the second axis of the mesh. */
export function siblingSpecialties(specialty: Category, limit = 6): Category[] {
  return CATEGORIES.filter((c) => c.id !== specialty.id).slice(0, limit);
}

/**
 * Related care pages that are eligible for indexing, filtered before the display limit.
 * This prevents the mesh from publishing crawl paths to guarded pages and avoids hiding an
 * eligible candidate merely because six ineligible registry entries came first.
 */
export function indexableCarePageMesh(
  page: CarePage,
  supply: ReadonlyMap<string, number>,
  limit = 6,
): { nearby: MnCity[]; siblings: Category[] } {
  const nearby = MN_CITIES.filter(
    (city) =>
      city.area === page.city.area &&
      city.slug !== page.city.slug &&
      isIndexable(supply.get(`${page.specialty.id}/${city.slug}`) ?? 0),
  ).slice(0, limit);
  const siblings = CATEGORIES.filter(
    (specialty) =>
      specialty.id !== page.specialty.id &&
      isIndexable(supply.get(`${specialty.id}/${page.city.slug}`) ?? 0),
  ).slice(0, limit);
  return { nearby, siblings };
}

export function carePagePath({ specialty, city }: CarePage): string {
  return `/care/${specialty.id}/${city.slug}`;
}

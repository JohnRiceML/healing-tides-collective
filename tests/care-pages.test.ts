import { describe, it, expect, vi } from "vitest";

// lib/practitioners pulls in @/lib/db; we only exercise the pure where-builder here.
vi.mock("@/lib/db", () => ({ db: {} }));

import {
  allCarePages,
  carePageSupply,
  carePageDescription,
  carePagePath,
  carePageTitle,
  carePageTopics,
  indexableCarePageMesh,
  isIndexable,
  MIN_INDEXABLE_MATCHES,
  nearbyCities,
  resolveCarePage,
  siblingSpecialties,
} from "@/lib/care-pages";
import { buildPractitionerWhere } from "@/lib/practitioners";
import { CATEGORIES } from "@/app/_lib/taxonomy";
import { MN_CITIES } from "@/lib/mn-cities";

describe("resolveCarePage", () => {
  it("resolves a real specialty × city pair", () => {
    const page = resolveCarePage("trauma_recovery", "duluth");
    expect(page?.specialty.label).toBe("Trauma & Recovery");
    expect(page?.city.name).toBe("Duluth");
  });

  it("returns null for an unknown specialty or city (→ 404, never a guess)", () => {
    expect(resolveCarePage("not_a_specialty", "duluth")).toBeNull();
    expect(resolveCarePage("trauma_recovery", "fargo")).toBeNull();
  });
});

describe("the page inventory", () => {
  it("is every specialty × city, with unique paths", () => {
    const pages = allCarePages();
    expect(pages).toHaveLength(CATEGORIES.length * MN_CITIES.length);
    const paths = pages.map(carePagePath);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain("/care/emotional_wellbeing/minneapolis");
  });
});

describe("isIndexable — the doorway-page guard", () => {
  it("requires real local supply — a lone practitioner is NOT enough", () => {
    // At a bar of 1 every indexable page surfaced the same single practitioner: the doorway
    // pattern. Below the bar a page still renders honestly; it's just noindex + unlisted.
    expect(MIN_INDEXABLE_MATCHES).toBeGreaterThanOrEqual(3);
    expect(isIndexable(0)).toBe(false);
    expect(isIndexable(1)).toBe(false);
    expect(isIndexable(MIN_INDEXABLE_MATCHES - 1)).toBe(false);
    expect(isIndexable(MIN_INDEXABLE_MATCHES)).toBe(true);
    expect(isIndexable(12)).toBe(true);
  });
});

describe("carePageSupply", () => {
  it("counts every specialty × city match with the shared city semantics", () => {
    const supply = carePageSupply([
      { region: "Minneapolis and St. Paul", specialties: ["trauma_recovery", "mind_body"] },
      { region: "St. Paul, MN", specialties: ["trauma_recovery"] },
    ]);

    expect(supply.get("trauma_recovery/minneapolis")).toBe(1);
    expect(supply.get("trauma_recovery/saint-paul")).toBe(2);
    expect(supply.get("mind_body/minneapolis")).toBe(1);
    expect(supply.get("mind_body/saint-paul")).toBe(1);
  });

  it("counts each practitioner only once per specialty", () => {
    const supply = carePageSupply([
      { region: "Minneapolis", specialties: ["mind_body", "mind_body", "mind_body"] },
    ]);
    expect(supply.get("mind_body/minneapolis")).toBe(1);
  });
});

describe("page copy", () => {
  const page = resolveCarePage("grief_transitions", "saint-paul")!;

  it("titles naturally, in place", () => {
    expect(carePageTitle(page)).toContain("Saint Paul, Minnesota");
  });

  it("tells the truth in the description either way — never a fabricated count", () => {
    const withSupply = carePageDescription(page, 3);
    const without = carePageDescription(page, 0);
    expect(withSupply).toContain("Saint Paul");
    expect(without).toMatch(/growing/i);
    for (const copy of [withSupply, without]) {
      expect(copy).not.toMatch(/\b\d+\s+(therapists|practitioners)\b/i);
    }
  });

  it("draws topics from the real taxonomy, round-robin across subcategories", () => {
    const topics = carePageTopics(page.specialty, 6);
    expect(topics).toHaveLength(6);
    expect(new Set(topics).size).toBe(6);
    const all = page.specialty.subcategories.flatMap((s) => s.topics);
    for (const t of topics) expect(all).toContain(t);
    // Round-robin: with multiple subcategories, the first picks span them.
    if (page.specialty.subcategories.length > 1) {
      const firstOfEach = page.specialty.subcategories.map((s) => s.topics[0]);
      expect(topics.filter((t) => firstOfEach.includes(t)).length).toBeGreaterThan(1);
    }
  });

  it("caps topics at the requested limit even for large taxonomies", () => {
    for (const c of CATEGORIES) expect(carePageTopics(c, 4).length).toBeLessThanOrEqual(4);
  });
});

describe("the internal-link mesh", () => {
  const page = resolveCarePage("mind_body", "edina")!;

  it("suggests same-area cities and never links a page to itself", () => {
    const near = nearbyCities(page.city);
    expect(near.length).toBeGreaterThan(0);
    expect(near.every((c) => c.area === page.city.area)).toBe(true);
    expect(near.map((c) => c.slug)).not.toContain("edina");
  });

  it("suggests other specialties, excluding the current one", () => {
    const sibs = siblingSpecialties(page.specialty);
    expect(sibs.map((s) => s.id)).not.toContain("mind_body");
  });

  it("keeps only indexable destinations and filters before applying the limit", () => {
    const minneapolis = resolveCarePage("mind_body", "minneapolis")!;
    const sameArea = MN_CITIES.filter(
      (city) => city.area === minneapolis.city.area && city.slug !== minneapolis.city.slug,
    );
    expect(sameArea.length).toBeGreaterThan(6);

    const eligibleAfterSix = sameArea[6];
    const eligibleSpecialty = CATEGORIES.find((category) => category.id !== "mind_body")!;
    const supply = new Map<string, number>([
      [`mind_body/${eligibleAfterSix.slug}`, MIN_INDEXABLE_MATCHES],
      [`${eligibleSpecialty.id}/minneapolis`, MIN_INDEXABLE_MATCHES],
      // Below the threshold: neither destination may be advertised.
      [`mind_body/${sameArea[0].slug}`, MIN_INDEXABLE_MATCHES - 1],
    ]);

    const mesh = indexableCarePageMesh(minneapolis, supply, 6);
    expect(mesh.nearby.map((city) => city.slug)).toEqual([eligibleAfterSix.slug]);
    expect(mesh.siblings.map((specialty) => specialty.id)).toEqual([eligibleSpecialty.id]);
  });
});

describe("buildPractitionerWhere — the citySlug filter", () => {
  it("matches the free-text region loosely across every alias", () => {
    const where = buildPractitionerWhere({ citySlug: "saint-paul" });
    const or = (where.AND as Array<{ OR?: unknown[] }>)[0].OR as Array<{
      region: { contains: string; mode: string };
    }>;
    const aliases = or.map((c) => c.region.contains);
    expect(aliases).toEqual(expect.arrayContaining(["saint paul", "st paul", "st. paul"]));
    expect(or.every((c) => c.region.mode === "insensitive")).toBe(true);
  });

  it("an unknown city matches NOTHING rather than silently widening", () => {
    const where = buildPractitionerWhere({ citySlug: "fargo" });
    const or = (where.AND as Array<{ OR?: unknown[] }>)[0].OR as Array<Record<string, unknown>>;
    expect(or).toEqual([{ slug: "__no_such_city__" }]);
  });

  it("composes with the JSON filters without either clobbering the other", () => {
    const where = buildPractitionerWhere({
      citySlug: "duluth",
      acceptingNew: true,
      ageGroups: "adults",
      specialty: "trauma_recovery",
    });
    const and = where.AND as Array<Record<string, unknown>>;
    // Age groups + the city OR both survive. (Availability is NOT a SQL filter — it runs after
    // the query so an unset field can count as "unknown"; see passesAcceptingNewFilter.)
    expect(and).toHaveLength(2);
    expect(and.some((c) => "OR" in c)).toBe(true);
    expect(and.filter((c) => "fieldValues" in c)).toHaveLength(1);
    expect(where.specialties).toEqual({ has: "trauma_recovery" });
  });

  it("adds nothing when no city is requested", () => {
    expect(buildPractitionerWhere({})).not.toHaveProperty("AND");
  });
});

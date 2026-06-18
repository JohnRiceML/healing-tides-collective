import { describe, it, expect } from "vitest";

import {
  buildBrand,
  DIMENSION_ORDER,
  type BrandSignals,
  type Dimension,
  type DimensionId,
  type Insight,
} from "@/lib/brand";

// A fully-empty, freshly-created practitioner — every truthful read should be its
// least-ready value. Serper signals deliberately left undefined (not checked yet).
const EMPTY: BrandSignals = {
  published: false,
  completeness: 0,
  hasBio: false,
  hasValues: false,
  hasPhoto: false,
  hasModality: false,
  hasWebsite: false,
  hasRegion: false,
  specialtiesCount: 0,
  // coverage / inAnyMapPack / knowledgeGraphPresent / reviewsKnown / weeklyViews all undefined
};

// A practitioner with everything filled AND a clean Serper read.
const FULL: BrandSignals = {
  published: true,
  completeness: 100,
  hasBio: true,
  hasValues: true,
  hasPhoto: true,
  hasModality: true,
  hasWebsite: true,
  hasRegion: true,
  specialtiesCount: 5,
  coverage: { appeared: 4, total: 4 },
  inAnyMapPack: true,
  knowledgeGraphPresent: true,
  reviewsKnown: true,
  weeklyViews: { thisWeek: 3, total: 40 },
};

function byId(dims: Dimension[], id: DimensionId): Dimension {
  const d = dims.find((x) => x.id === id);
  if (!d) throw new Error(`missing dimension ${id}`);
  return d;
}

function allInsights(dims: Dimension[]): Insight[] {
  return dims.flatMap((d) => d.insights);
}

describe("buildBrand — framework shape", () => {
  it("returns exactly 5 dimensions", () => {
    expect(buildBrand(EMPTY).dimensions).toHaveLength(5);
  });

  it("returns the dimensions in the canonical order", () => {
    const ids = buildBrand(EMPTY).dimensions.map((d) => d.id);
    expect(ids).toEqual([
      "who_you_are",
      "who_youre_for",
      "where_found",
      "why_trusted",
      "how_remembered",
    ]);
    expect(ids).toEqual(DIMENSION_ORDER);
  });

  it("gives every dimension a name and a plain-language intro", () => {
    for (const d of buildBrand(EMPTY).dimensions) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.intro.length).toBeGreaterThan(0);
    }
  });

  it("gives every dimension 1–3 insights", () => {
    for (const d of buildBrand(FULL).dimensions) {
      expect(d.insights.length).toBeGreaterThanOrEqual(1);
      expect(d.insights.length).toBeLessThanOrEqual(3);
    }
    for (const d of buildBrand(EMPTY).dimensions) {
      expect(d.insights.length).toBeGreaterThanOrEqual(1);
      expect(d.insights.length).toBeLessThanOrEqual(3);
    }
  });

  it("gives every insight a valid lift and state", () => {
    const lifts = new Set(["gentle", "moderate", "deeper"]);
    const states = new Set(["not_started", "forming", "on_its_way", "settled"]);
    for (const i of allInsights(buildBrand(FULL).dimensions)) {
      expect(lifts.has(i.lift)).toBe(true);
      expect(states.has(i.state)).toBe(true);
      expect(i.what.length).toBeGreaterThan(0);
      expect(i.whyCare.length).toBeGreaterThan(0);
      expect(i.whatNext.length).toBeGreaterThan(0);
    }
  });
});

describe("buildBrand — state thresholds (worst-truthful)", () => {
  it("reads every dimension as not_started for an empty profile", () => {
    for (const d of buildBrand(EMPTY).dimensions) {
      expect(d.state).toBe("not_started");
    }
  });

  it("reads identity / focus / trust as settled-or-better for a full profile", () => {
    const { dimensions } = buildBrand(FULL);
    expect(byId(dimensions, "who_you_are").state).toBe("settled");
    expect(byId(dimensions, "who_youre_for").state).toBe("settled");
  });

  it("who_youre_for is forming with 1–2 specialties, settled with 3+", () => {
    const one = buildBrand({ ...EMPTY, specialtiesCount: 1 });
    expect(byId(one.dimensions, "who_youre_for").state).toBe("forming");

    const three = buildBrand({ ...EMPTY, specialtiesCount: 3 });
    expect(byId(three.dimensions, "who_youre_for").state).toBe("settled");
  });

  it("who_you_are is on_its_way (not settled) when core is present but completeness is low", () => {
    const partial = buildBrand({
      ...EMPTY,
      hasBio: true,
      hasValues: true,
      hasPhoto: true,
      hasModality: false,
      completeness: 40,
    });
    expect(byId(partial.dimensions, "who_you_are").state).toBe("on_its_way");
  });

  it("a single missing core field drags who_you_are back to not_started (worst-truthful)", () => {
    const noPhoto = buildBrand({
      ...FULL,
      hasPhoto: false,
    });
    // the photo insight is not_started, so the whole dimension reads not_started
    expect(byId(noPhoto.dimensions, "who_you_are").state).toBe("not_started");
  });
});

describe("buildBrand — Serper signals are optional (graceful, never invented)", () => {
  it("does not throw when every Serper-backed signal is undefined", () => {
    expect(() => buildBrand(EMPTY)).not.toThrow();
  });

  it("where_found surfaces a calm 'not checked yet' invitation when coverage is undefined", () => {
    const wf = byId(buildBrand(EMPTY).dimensions, "where_found");
    const invite = wf.insights.find((i) => i.id === "found-coverage-uninvited");
    expect(invite).toBeDefined();
    expect(invite!.state).toBe("not_started");
    // an invitation, not a verdict — no number anywhere in it
    expect(/\d/.test(invite!.what + invite!.whyCare + invite!.whatNext)).toBe(false);
  });

  it("where_found does NOT mention the map pack when inAnyMapPack is undefined", () => {
    const wf = byId(buildBrand(EMPTY).dimensions, "where_found");
    expect(wf.insights.some((i) => i.id === "found-mappack")).toBe(false);
  });

  it("how_remembered gives a calm 'build over time' invitation (NOT a fake score) when undefined", () => {
    const hr = byId(buildBrand(EMPTY).dimensions, "how_remembered");
    expect(hr.state).toBe("not_started");
    const entity = hr.insights.find((i) => i.id === "remembered-entity")!;
    expect(entity.lift).toBe("deeper");
    // never an invented metric
    expect(/\d/.test(entity.what + entity.whyCare + entity.whatNext)).toBe(false);
  });

  it("how_remembered treats false the same as undefined (calm invitation, no score)", () => {
    const checkedAbsent = buildBrand({ ...FULL, knowledgeGraphPresent: false });
    const hr = byId(checkedAbsent.dimensions, "how_remembered");
    expect(hr.state).toBe("not_started");
  });

  it("how_remembered acknowledges recognition when knowledgeGraphPresent is true", () => {
    const hr = byId(buildBrand({ ...EMPTY, knowledgeGraphPresent: true }).dimensions, "how_remembered");
    expect(hr.state).toBe("on_its_way");
  });

  it("reviews read as not_started when unknown, on_its_way when known", () => {
    const unknown = byId(buildBrand(EMPTY).dimensions, "why_trusted");
    expect(unknown.insights.find((i) => i.id === "trusted-reviews")!.state).toBe("not_started");

    const known = byId(buildBrand({ ...EMPTY, reviewsKnown: true }).dimensions, "why_trusted");
    expect(known.insights.find((i) => i.id === "trusted-reviews")!.state).toBe("on_its_way");
  });
});

describe("buildBrand — overall is a calm sentence (no number, no grade)", () => {
  it("returns a non-empty sentence ending in a period", () => {
    const { overall } = buildBrand(EMPTY);
    expect(overall.length).toBeGreaterThan(0);
    expect(overall.trim().endsWith(".")).toBe(true);
  });

  it("contains no digit / percent / grade anywhere", () => {
    for (const sig of [EMPTY, FULL, { ...EMPTY, specialtiesCount: 2 }]) {
      const { overall } = buildBrand(sig);
      expect(/\d/.test(overall)).toBe(false);
      expect(overall.includes("%")).toBe(false);
    }
  });

  it("uses no comparison / urgency / verdict vocabulary anywhere in the output", () => {
    // BRAND LAW: no ranking, no 'behind', no urgency, no harsh words — across overall + every insight.
    const banned = [
      "rank",
      "optimize",
      "boost",
      "beat",
      "missing",
      "weak",
      "incomplete",
      "behind",
      "score",
      "%",
      "better than",
      "compared",
    ];
    const brand = buildBrand(EMPTY);
    const fullBrand = buildBrand(FULL);
    const corpus = [
      brand.overall,
      fullBrand.overall,
      ...allInsights(brand.dimensions).flatMap((i) => [i.what, i.whyCare, i.whatNext]),
      ...allInsights(fullBrand.dimensions).flatMap((i) => [i.what, i.whyCare, i.whatNext]),
      ...brand.dimensions.map((d) => d.intro),
    ]
      .join(" ")
      .toLowerCase();
    for (const word of banned) {
      expect(corpus.includes(word)).toBe(false);
    }
  });

  it("a full, healthy profile reads as taking shape — never over-promising 'settled everywhere'", () => {
    // Even a complete profile with a clean Serper read tops out at 'on_its_way' for
    // where_found / why_trusted / how_remembered (presence always has further to grow),
    // so the honest overall is the encouraging "taking shape", not "settled and whole".
    const { overall } = buildBrand(FULL);
    expect(overall.toLowerCase()).toContain("taking shape");
  });

  it("the empty profile reads as a hopeful beginning, never a deficit", () => {
    const { overall } = buildBrand(EMPTY);
    expect(overall.toLowerCase()).toContain("beginning");
  });
});

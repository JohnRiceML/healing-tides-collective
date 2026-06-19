import { describe, it, expect } from "vitest";

import {
  buildBrand,
  stateFromScore,
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

describe("buildBrand — dimension state (banded from the 0–100 score)", () => {
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

  it("ETHICS: never coaches soliciting client reviews (ACA/APA/AAMFT/NASW/NBCC), even no-reviews", () => {
    const soliciting = [
      "invite a",
      "solicit",
      "would mean a lot",
      "share their experience",
      "let happy clients",
      "ask a client",
      "ask clients",
    ];
    for (const sig of [EMPTY, { ...EMPTY, reviewsKnown: true }]) {
      const r = byId(buildBrand(sig).dimensions, "why_trusted").insights.find(
        (i) => i.id === "trusted-reviews",
      )!;
      const text = (r.what + " " + r.whyCare + " " + r.whatNext).toLowerCase();
      for (const phrase of soliciting) expect(text.includes(phrase)).toBe(false);
    }
    // the no-reviews path actively PROTECTS the practitioner from the ethics line
    const noReviews = byId(buildBrand(EMPTY).dimensions, "why_trusted").insights.find(
      (i) => i.id === "trusted-reviews",
    )!;
    expect(noReviews.whatNext.toLowerCase()).toContain("never request");
    expect(noReviews.whatNext.toLowerCase()).toContain("ethics");
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
      ...brand.dimensions.map((d) => d.why),
      ...fullBrand.dimensions.map((d) => d.why),
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

describe("buildBrand nextStep (grounding in where they are now)", () => {
  it("leads with the most foundational gap — the first not_started insight, in order", () => {
    const { nextStep } = buildBrand(EMPTY);
    expect(nextStep).not.toBeNull();
    expect(nextStep?.dimensionId).toBe("who_you_are");
    expect(nextStep?.insight.state).toBe("not_started");
    expect(nextStep?.insight.whatNext.length).toBeGreaterThan(0);
  });

  it("is null when nothing's pressing (a profile in good shape) — then we just tend it", () => {
    expect(buildBrand(FULL).nextStep).toBeNull();
  });
});

describe("buildBrand — progress scores (personal, never a grade or comparison)", () => {
  it("gives every dimension a score in 0–100 and a plain 'why this matters'", () => {
    for (const d of buildBrand(FULL).dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(d.score)).toBe(true);
      expect(d.why.length).toBeGreaterThan(0);
    }
  });

  it("overallScore is the 0–100 average of the five parts", () => {
    const { dimensions, overallScore } = buildBrand({ ...EMPTY, specialtiesCount: 2 });
    const avg = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
    expect(overallScore).toBe(avg);
    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);
  });

  it("the moon state is ALWAYS the score, banded — they can never contradict", () => {
    for (const sig of [EMPTY, FULL, { ...EMPTY, specialtiesCount: 2, hasBio: true }]) {
      for (const d of buildBrand(sig).dimensions) {
        expect(d.state).toBe(stateFromScore(d.score));
      }
    }
  });

  it("an empty profile scores low across the board; a full one scores high", () => {
    const empty = buildBrand(EMPTY);
    const full = buildBrand(FULL);
    expect(empty.overallScore).toBeLessThan(25); // a hopeful beginning, not a zero
    expect(empty.overallScore).toBeGreaterThan(0); // never a stark 0 — being here is the start
    expect(full.overallScore).toBeGreaterThan(empty.overallScore);
    expect(full.overallScore).toBeGreaterThanOrEqual(75);
  });

  it("shows partial progress — a part with some pieces done scores above 'just begun'", () => {
    // bio + values + photo present (modality/completeness low) → who_you_are is partway, not zero.
    const partial = buildBrand({ ...EMPTY, hasBio: true, hasValues: true, hasPhoto: true });
    const who = partial.dimensions.find((d) => d.id === "who_you_are")!;
    expect(who.score).toBeGreaterThan(buildBrand(EMPTY).dimensions[0]!.score);
  });

  it("stateFromScore bands sensibly (0→not_started … 100→settled)", () => {
    expect(stateFromScore(0)).toBe("not_started");
    expect(stateFromScore(8)).toBe("not_started");
    expect(stateFromScore(38)).toBe("forming");
    expect(stateFromScore(68)).toBe("on_its_way");
    expect(stateFromScore(100)).toBe("settled");
  });

  it("stateFromScore bands EXACTLY at the thresholds (so an edge score can't drift a moon)", () => {
    expect(stateFromScore(24)).toBe("not_started");
    expect(stateFromScore(25)).toBe("forming");
    expect(stateFromScore(54)).toBe("forming");
    expect(stateFromScore(55)).toBe("on_its_way");
    expect(stateFromScore(84)).toBe("on_its_way");
    expect(stateFromScore(85)).toBe("settled");
  });
});

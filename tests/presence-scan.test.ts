import { describe, it, expect } from "vitest";

import {
  PRESENCE_SCAN_KEY,
  applyPresenceScan,
  brandSignalsFromScan,
  buildPresenceScan,
  describeDelta,
  presenceDelta,
  readPresenceScan,
  type PresenceScan,
} from "@/lib/presence-scan";
import type { Coverage, MapPack, TermCoverage } from "@/lib/visibility";

const SCAN: PresenceScan = {
  checkedAt: "2026-06-18T12:00:00.000Z",
  coverage: { appeared: 2, total: 5 },
  foundTerms: ["Trauma Healing Saint Paul", "Anxiety Therapy Saint Paul"],
  knowledgeGraphPresent: false,
  inAnyMapPack: true,
  reviewsKnown: false,
};

describe("readPresenceScan — defensive (never throws, malformed → null)", () => {
  it("returns null for undefined / null / non-object fieldValues", () => {
    expect(readPresenceScan(undefined)).toBeNull();
    expect(readPresenceScan(null)).toBeNull();
    expect(readPresenceScan("nope")).toBeNull();
    expect(readPresenceScan(42)).toBeNull();
  });

  it("returns null when the key is missing or not an object", () => {
    expect(readPresenceScan({ other: 1 })).toBeNull();
    expect(readPresenceScan({ [PRESENCE_SCAN_KEY]: "bad" })).toBeNull();
    expect(readPresenceScan({ [PRESENCE_SCAN_KEY]: { checkedAt: "x" } })).toBeNull(); // no coverage
  });

  it("round-trips a well-formed scan", () => {
    const fv = { [PRESENCE_SCAN_KEY]: SCAN };
    expect(readPresenceScan(fv)).toEqual(SCAN);
  });

  it("coerces partial / wrong-typed fields to safe defaults", () => {
    const fv = {
      [PRESENCE_SCAN_KEY]: {
        coverage: { appeared: "2", total: 5 }, // appeared wrong type
        foundTerms: ["ok", 7, null], // mixed → strings only
        knowledgeGraphPresent: "yes", // not boolean === true → false
      },
    };
    const got = readPresenceScan(fv)!;
    expect(got.coverage).toEqual({ appeared: 0, total: 5 });
    expect(got.foundTerms).toEqual(["ok"]);
    expect(got.knowledgeGraphPresent).toBe(false);
    expect(got.inAnyMapPack).toBeUndefined();
    expect(got.reviewsKnown).toBeUndefined();
  });

  it("round-trips questions + relatedSearches, and drops non-strings / non-arrays", () => {
    const fv = {
      [PRESENCE_SCAN_KEY]: {
        coverage: { appeared: 1, total: 3 },
        questions: ["What is EMDR?", 7, null],
        relatedSearches: "not-an-array",
      },
    };
    const got = readPresenceScan(fv)!;
    expect(got.questions).toEqual(["What is EMDR?"]);
    expect(got.relatedSearches).toBeUndefined();
  });
});

describe("applyPresenceScan — sets the reserved key, preserves every sibling", () => {
  it("writes the scan under the reserved key", () => {
    const next = applyPresenceScan({}, SCAN);
    expect(next[PRESENCE_SCAN_KEY]).toEqual(SCAN);
  });

  it("never clobbers other reserved keys (__hold, __verified) or plain fields", () => {
    const existing = {
      __hold: { message: "held" },
      __verified: ["licensed_professional"],
      about_you: "hi",
    };
    const next = applyPresenceScan(existing, SCAN);
    expect(next.__hold).toEqual({ message: "held" });
    expect(next.__verified).toEqual(["licensed_professional"]);
    expect(next.about_you).toBe("hi");
    expect(next[PRESENCE_SCAN_KEY]).toEqual(SCAN);
  });

  it("treats a null/garbage existing blob as empty", () => {
    expect(applyPresenceScan(null, SCAN)).toEqual({ [PRESENCE_SCAN_KEY]: SCAN });
    expect(applyPresenceScan("nope", SCAN)).toEqual({ [PRESENCE_SCAN_KEY]: SCAN });
  });
});

describe("brandSignalsFromScan — honest, never invents a signal", () => {
  it("returns {} for a null scan (keeps the 'not checked yet' invitations)", () => {
    expect(brandSignalsFromScan(null)).toEqual({});
  });

  it("passes through coverage / map pack / kg / reviews when present", () => {
    expect(brandSignalsFromScan(SCAN)).toEqual({
      coverage: { appeared: 2, total: 5 },
      knowledgeGraphPresent: false,
      inAnyMapPack: true,
      reviewsKnown: false,
    });
  });

  it("omits coverage when nothing was actually measured (total === 0)", () => {
    const s = { ...SCAN, coverage: { appeared: 0, total: 0 } };
    expect(brandSignalsFromScan(s).coverage).toBeUndefined();
  });

  it("omits inAnyMapPack / reviewsKnown when the scan didn't run the map pack", () => {
    const s: PresenceScan = {
      checkedAt: SCAN.checkedAt,
      coverage: { appeared: 1, total: 3 },
      foundTerms: [],
      knowledgeGraphPresent: true,
      // inAnyMapPack / reviewsKnown left undefined
    };
    const got = brandSignalsFromScan(s);
    expect(got.knowledgeGraphPresent).toBe(true);
    expect("inAnyMapPack" in got).toBe(false);
    expect("reviewsKnown" in got).toBe(false);
  });
});

describe("presenceDelta — gain-framed; first check is calm", () => {
  it("flags the first ever check (no prior to compare)", () => {
    expect(presenceDelta(null, SCAN)).toEqual({ firstCheck: true, newlyAppeared: [] });
  });

  it("reports only the terms that newly appear", () => {
    const prev: PresenceScan = { ...SCAN, foundTerms: ["Trauma Healing Saint Paul"] };
    const next: PresenceScan = {
      ...SCAN,
      foundTerms: ["Trauma Healing Saint Paul", "Anxiety Therapy Saint Paul"],
    };
    expect(presenceDelta(prev, next)).toEqual({
      firstCheck: false,
      newlyAppeared: ["Anxiety Therapy Saint Paul"],
    });
  });

  it("never surfaces what slipped (a term that dropped is not reported)", () => {
    const prev: PresenceScan = { ...SCAN, foundTerms: ["A", "B"] };
    const next: PresenceScan = { ...SCAN, foundTerms: ["A"] };
    expect(presenceDelta(prev, next).newlyAppeared).toEqual([]);
  });
});

describe("describeDelta — calm copy, null when nothing encouraging", () => {
  it("is null on the first check or when nothing new appeared", () => {
    expect(describeDelta({ firstCheck: true, newlyAppeared: [] })).toBeNull();
    expect(describeDelta({ firstCheck: false, newlyAppeared: [] })).toBeNull();
  });

  it("names the single new search", () => {
    const line = describeDelta({ firstCheck: false, newlyAppeared: ["Grief Support Saint Paul"] });
    expect(line).toContain("Grief Support Saint Paul");
  });

  it("summarises multiple without shaming language", () => {
    const line = describeDelta({ firstCheck: false, newlyAppeared: ["A", "B", "C"] })!;
    expect(line).toContain("3 new searches");
    for (const banned of ["behind", "missing", "rank", "score"]) {
      expect(line.toLowerCase()).not.toContain(banned);
    }
  });
});

// ── Test fixtures for the pure scan assembly ──────────────────────────────────────
function term(over: Partial<TermCoverage> = {}): TermCoverage {
  return { query: "q", label: "L", found: false, position: null, via: null, competitors: [], ...over };
}
function cov(
  terms: TermCoverage[],
  extra: { questions?: string[]; relatedSearches?: string[] } = {},
): Coverage {
  return {
    terms,
    appeared: terms.filter((t) => t.found).length,
    total: terms.length,
    questions: extra.questions ?? [],
    relatedSearches: extra.relatedSearches ?? [],
  };
}
function pack(
  youInPack: boolean,
  entries: Array<{ isYou?: boolean; ratingCount?: number | null; title?: string }> = [],
): MapPack {
  return {
    youInPack,
    entries: entries.map((e, i) => ({
      title: e.title ?? `Place ${i}`,
      address: null,
      rating: e.ratingCount != null ? 4.8 : null,
      ratingCount: e.ratingCount ?? null,
      website: null,
      category: null,
      position: i + 1,
      isYou: e.isYou ?? false,
    })),
  };
}

describe("buildPresenceScan — the risky aggregation, pure & tested", () => {
  const AT = "2026-06-18T00:00:00.000Z";

  it("passes coverage counts and checkedAt straight through", () => {
    const scan = buildPresenceScan({
      coverage: cov([term({ found: true }), term({ found: false })]),
      perTermKnowledgeGraph: [false, false],
      sampledMapPacks: [],
      checkedAt: AT,
    });
    expect(scan.checkedAt).toBe(AT);
    expect(scan.coverage).toEqual({ appeared: 1, total: 2 });
  });

  it("keeps the seeker's voice — questions + related searches — instead of discarding it", () => {
    const scan = buildPresenceScan({
      coverage: cov([term({ found: true })], {
        questions: ["What is somatic therapy?"],
        relatedSearches: ["nervous system healing", "trauma therapist near me"],
      }),
      perTermKnowledgeGraph: [false],
      sampledMapPacks: [],
      checkedAt: AT,
    });
    expect(scan.questions).toEqual(["What is somatic therapy?"]);
    expect(scan.relatedSearches).toEqual(["nervous system healing", "trauma therapist near me"]);
  });

  it("foundTerms = the labels of terms that appear, in order", () => {
    const scan = buildPresenceScan({
      coverage: cov([
        term({ label: "Trauma Healing SP", found: true }),
        term({ label: "Anxiety Therapy SP", found: false }),
        term({ label: "Grief Support SP", found: true }),
      ]),
      perTermKnowledgeGraph: [false, false, false],
      sampledMapPacks: [],
      checkedAt: AT,
    });
    expect(scan.foundTerms).toEqual(["Trauma Healing SP", "Grief Support SP"]);
  });

  it("knowledgeGraphPresent is an OR across every searched term", () => {
    const base = { coverage: cov([term()]), sampledMapPacks: [], checkedAt: AT };
    expect(buildPresenceScan({ ...base, perTermKnowledgeGraph: [false, true, false] }).knowledgeGraphPresent).toBe(true);
    expect(buildPresenceScan({ ...base, perTermKnowledgeGraph: [false, false] }).knowledgeGraphPresent).toBe(false);
    expect(buildPresenceScan({ ...base, perTermKnowledgeGraph: [] }).knowledgeGraphPresent).toBe(false);
  });

  it("inAnyMapPack is true iff you're in any SAMPLED pack", () => {
    const base = { coverage: cov([term()]), perTermKnowledgeGraph: [], checkedAt: AT };
    expect(buildPresenceScan({ ...base, sampledMapPacks: [pack(false), pack(true)] }).inAnyMapPack).toBe(true);
    expect(buildPresenceScan({ ...base, sampledMapPacks: [pack(false), pack(false)] }).inAnyMapPack).toBe(false);
    expect(buildPresenceScan({ ...base, sampledMapPacks: [] }).inAnyMapPack).toBe(false);
  });

  it("reviewsKnown counts only YOUR entry with a positive ratingCount", () => {
    const base = { coverage: cov([term()]), perTermKnowledgeGraph: [], checkedAt: AT };
    // your entry, real reviews → true
    expect(
      buildPresenceScan({ ...base, sampledMapPacks: [pack(true, [{ isYou: true, ratingCount: 7 }])] }).reviewsKnown,
    ).toBe(true);
    // reviews belong to a COMPETITOR, not you → false
    expect(
      buildPresenceScan({ ...base, sampledMapPacks: [pack(true, [{ isYou: false, ratingCount: 99 }])] }).reviewsKnown,
    ).toBe(false);
    // your entry, but zero / unknown reviews → false (not >0)
    expect(
      buildPresenceScan({ ...base, sampledMapPacks: [pack(true, [{ isYou: true, ratingCount: 0 }])] }).reviewsKnown,
    ).toBe(false);
    expect(
      buildPresenceScan({ ...base, sampledMapPacks: [pack(true, [{ isYou: true, ratingCount: null }])] }).reviewsKnown,
    ).toBe(false);
  });
});

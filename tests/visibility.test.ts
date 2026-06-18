import { describe, it, expect } from "vitest";

import {
  buildAuditQueries,
  buildCoverage,
  buildCoverageQueries,
  evaluateMapPack,
  evaluateQuery,
  hostOf,
  type VisibilityIdentity,
} from "@/lib/visibility";
import type { SerpResult, SerpPage, PlaceResult } from "@/lib/serper";
import { SPECIALTY_OPTIONS } from "@/app/_lib/taxonomy";

const page = (over: Partial<SerpPage> = {}): SerpPage => ({
  organic: [],
  peopleAlsoAsk: [],
  relatedSearches: [],
  knowledgeGraphPresent: false,
  ...over,
});

const result = (over: Partial<SerpResult>): SerpResult => ({
  title: "Some Clinic",
  link: "https://example.com",
  snippet: "",
  position: 1,
  ...over,
});

describe("hostOf", () => {
  it("lowercases and strips www", () => {
    expect(hostOf("https://www.Nora-Therapy.com/about")).toBe("nora-therapy.com");
  });
  it("returns null for garbage", () => {
    expect(hostOf("not a url")).toBeNull();
  });
});

describe("buildAuditQueries", () => {
  it("returns [] without a region (a local query needs a place)", () => {
    expect(buildAuditQueries(["grief_loss"], null)).toEqual([]);
    expect(buildAuditQueries(["grief_loss"], "   ")).toEqual([]);
  });

  it("appends the region to each specialty label and caps at the limit", () => {
    const id = SPECIALTY_OPTIONS[0].id;
    const qs = buildAuditQueries([id, id, id, id], "Saint Paul, MN", 2);
    expect(qs).toHaveLength(2);
    for (const q of qs) expect(q.endsWith("Saint Paul, MN")).toBe(true);
  });

  it("falls back to 'therapist {place}' when no specialties are set", () => {
    expect(buildAuditQueries([], "Duluth, MN")).toEqual(["therapist Duluth, MN"]);
  });
});

describe("evaluateQuery", () => {
  const id: VisibilityIdentity = {
    name: "Nora Hollenkamp",
    domain: "nora-therapy.com",
    profilePath: "/practitioners/nora-hollenkamp",
  };

  it("finds the practitioner by their own website domain + records position", () => {
    const r = evaluateQuery("somatic therapy saint paul", [
      result({ title: "Psychology Today", link: "https://psychologytoday.com/x", position: 1 }),
      result({ title: "Nora — Therapy", link: "https://www.nora-therapy.com/", position: 2 }),
    ], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("website");
    expect(r.position).toBe(2);
    expect(r.competitors).toContain("Psychology Today");
  });

  it("finds them via their Healing Tides profile link", () => {
    const r = evaluateQuery("q", [
      result({ link: "https://www.healingtides.co/practitioners/nora-hollenkamp", position: 3 }),
    ], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("profile");
    expect(r.position).toBe(3);
  });

  it("finds them by a name match in the title", () => {
    const r = evaluateQuery("q", [result({ title: "Meet Nora Hollenkamp, LICSW", link: "https://elsewhere.com" })], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("name");
  });

  it("matches a name only on a word boundary (not a substring of a longer word)", () => {
    const sam = { name: "Sam", domain: null, profilePath: "" };
    expect(evaluateQuery("q", [result({ title: "Samsara Wellness Center", link: "https://x.com" })], sam).found).toBe(false);
    const hit = evaluateQuery("q", [result({ title: "Sam Rivera, LICSW", link: "https://x.com" })], sam);
    expect(hit.found).toBe(true);
    expect(hit.via).toBe("name");
  });

  it("reports not-found with up to 3 competitors when they're absent", () => {
    const r = evaluateQuery("q", [
      result({ title: "A", link: "https://a.com", position: 1 }),
      result({ title: "B", link: "https://b.com", position: 2 }),
      result({ title: "C", link: "https://c.com", position: 3 }),
      result({ title: "D", link: "https://d.com", position: 4 }),
    ], id);
    expect(r.found).toBe(false);
    expect(r.position).toBeNull();
    expect(r.competitors).toEqual(["A", "B", "C"]);
  });

  it("an empty profilePath (unpublished) never matches by profile", () => {
    const r = evaluateQuery("q", [result({ link: "https://www.healingtides.co/practitioners/" })], {
      ...id,
      profilePath: "",
    });
    expect(r.found).toBe(false);
  });
});

describe("buildCoverageQueries", () => {
  it("returns [] without a region (a local query needs a place)", () => {
    expect(buildCoverageQueries(["trauma_recovery"], null)).toEqual([]);
    expect(buildCoverageQueries(["trauma_recovery"], "   ")).toEqual([]);
  });

  it("expands a category id into its real subcategory phrases, not the bucket label", () => {
    const qs = buildCoverageQueries(["trauma_recovery"], "Saint Paul, MN");
    const labels = qs.map((q) => q.label);
    expect(labels).toEqual(["Trauma Healing", "Nervous System Healing", "Addiction & Recovery"]);
    // The broad category label is NOT what we search — the warmer phrases are.
    expect(labels).not.toContain("Trauma & Recovery");
    for (const q of qs) expect(q.query.endsWith("Saint Paul, MN")).toBe(true);
    expect(qs[0]).toEqual({
      id: "trauma_healing",
      label: "Trauma Healing",
      query: "Trauma Healing Saint Paul, MN",
    });
  });

  it("falls back to a subcategory id's own label when it has no children", () => {
    const qs = buildCoverageQueries(["somatic"], "Duluth, MN");
    expect(qs).toEqual([{ id: "somatic", label: "Somatic Healing", query: "Somatic Healing Duluth, MN" }]);
  });

  it("falls back to the raw id for an unknown specialty", () => {
    const qs = buildCoverageQueries(["totally_unknown"], "Duluth, MN");
    expect(qs).toEqual([
      { id: "totally_unknown", label: "totally_unknown", query: "totally_unknown Duluth, MN" },
    ]);
  });

  it("dedupes overlapping expansions and caps at the limit", () => {
    // Two categories whose expansions don't overlap, but together exceed the cap.
    const qs = buildCoverageQueries(["trauma_recovery", "relationships_connection"], "Saint Paul, MN", 5);
    expect(qs).toHaveLength(5);
    const queries = qs.map((q) => q.query);
    expect(new Set(queries).size).toBe(queries.length); // no dupes
  });

  it("dedupes when the same id is passed twice", () => {
    const qs = buildCoverageQueries(["mens_wellness", "mens_wellness"], "Saint Paul, MN");
    expect(qs).toEqual([
      { id: "mens_mental_health", label: "Men's Mental Health", query: "Men's Mental Health Saint Paul, MN" },
    ]);
  });
});

describe("buildCoverage", () => {
  const id: VisibilityIdentity = {
    name: "Nora Hollenkamp",
    domain: "nora-therapy.com",
    profilePath: "/practitioners/nora-hollenkamp",
  };

  const mine = (position: number): SerpResult =>
    result({ title: "Nora — Therapy", link: "https://www.nora-therapy.com/", position });

  it("counts how many terms the practitioner appears for", () => {
    const cov = buildCoverage(
      [
        { query: "a place", label: "A", page: page({ organic: [mine(2)] }) },
        { query: "b place", label: "B", page: page({ organic: [result({ title: "Someone Else", link: "https://x.com", position: 1 })] }) },
        { query: "c place", label: "C", page: page({ organic: [mine(5)] }) },
      ],
      id,
    );
    expect(cov.total).toBe(3);
    expect(cov.appeared).toBe(2);
    expect(cov.terms.every((t) => typeof t.label === "string")).toBe(true);
  });

  it("orders appeared terms first (wins lead)", () => {
    const cov = buildCoverage(
      [
        { query: "absent place", label: "Absent", page: page({ organic: [result({ title: "Other", link: "https://x.com", position: 1 })] }) },
        { query: "present place", label: "Present", page: page({ organic: [mine(4)] }) },
      ],
      id,
    );
    expect(cov.terms[0].label).toBe("Present");
    expect(cov.terms[0].found).toBe(true);
    expect(cov.terms[1].found).toBe(false);
  });

  it("orders a found term ahead of a clearly-absent one regardless of input order", () => {
    const cov = buildCoverage(
      [
        { query: "absent place", label: "Absent", page: page({ organic: [result({ title: "X", link: "https://x.com", position: 1 })] }) },
        { query: "present place", label: "Present", page: page({ organic: [mine(3)] }) },
      ],
      id,
    );
    expect(cov.terms.map((t) => t.label)).toEqual(["Present", "Absent"]);
  });

  it("dedupes People-also-ask questions and related searches across pages, capping at 8", () => {
    const cov = buildCoverage(
      [
        {
          query: "a place",
          label: "A",
          page: page({
            organic: [mine(1)],
            peopleAlsoAsk: ["What is somatic therapy?", "How much does therapy cost?"],
            relatedSearches: ["trauma therapist near me", "somatic experiencing"],
          }),
        },
        {
          query: "b place",
          label: "B",
          page: page({
            organic: [mine(1)],
            // duplicate question (case-insensitive) + a new one
            peopleAlsoAsk: ["how much does therapy cost?", "Is EMDR effective?"],
            relatedSearches: ["Somatic Experiencing", "polyvagal therapy"],
          }),
        },
      ],
      id,
    );
    expect(cov.questions).toEqual([
      "What is somatic therapy?",
      "How much does therapy cost?",
      "Is EMDR effective?",
    ]);
    expect(cov.relatedSearches).toEqual([
      "trauma therapist near me",
      "somatic experiencing",
      "polyvagal therapy",
    ]);
  });

  it("caps questions and related searches at 8", () => {
    const many = Array.from({ length: 12 }, (_, i) => `Q${i}`);
    const manyRel = Array.from({ length: 12 }, (_, i) => `R${i}`);
    const cov = buildCoverage(
      [{ query: "a place", label: "A", page: page({ organic: [mine(1)], peopleAlsoAsk: many, relatedSearches: manyRel }) }],
      id,
    );
    expect(cov.questions).toHaveLength(8);
    expect(cov.relatedSearches).toHaveLength(8);
  });

  it("is empty-safe with no terms", () => {
    const cov = buildCoverage([], id);
    expect(cov).toEqual({ terms: [], appeared: 0, total: 0, questions: [], relatedSearches: [] });
  });
});

describe("evaluateMapPack", () => {
  const id: VisibilityIdentity = {
    name: "Nora Hollenkamp",
    domain: "nora-therapy.com",
    profilePath: "/practitioners/nora-hollenkamp",
  };

  const place = (over: Partial<PlaceResult>): PlaceResult => ({
    title: "Some Wellness Studio",
    address: "123 Main St, Saint Paul, MN",
    rating: 4.5,
    ratingCount: 20,
    website: "https://example.com",
    category: "Therapist",
    position: 1,
    ...over,
  });

  it("flags the practitioner by their own website host", () => {
    const pack = evaluateMapPack(
      [
        place({ title: "Calm Waters Counseling", website: "https://calm-waters.com", position: 1 }),
        place({ title: "Nora's Studio", website: "https://www.nora-therapy.com/contact", position: 2 }),
      ],
      id,
    );
    expect(pack.entries).toHaveLength(2);
    expect(pack.entries[0].isYou).toBe(false);
    expect(pack.entries[1].isYou).toBe(true);
    expect(pack.youInPack).toBe(true);
  });

  it("flags the practitioner by a name match in the title (case-insensitive)", () => {
    const pack = evaluateMapPack(
      [place({ title: "Meet NORA HOLLENKAMP, LICSW", website: "https://elsewhere.com" })],
      id,
    );
    expect(pack.entries[0].isYou).toBe(true);
    expect(pack.youInPack).toBe(true);
  });

  it("does not flag entries that match by neither host nor name", () => {
    const pack = evaluateMapPack(
      [
        place({ title: "Riverside Therapy", website: "https://riverside.com", position: 1 }),
        place({ title: "Lakeside Wellness", website: "https://lakeside.com", position: 2 }),
      ],
      id,
    );
    expect(pack.entries.every((e) => e.isYou === false)).toBe(true);
    expect(pack.youInPack).toBe(false);
  });

  it("youInPack is true when any entry is theirs, false otherwise", () => {
    const present = evaluateMapPack(
      [
        place({ title: "Other Clinic", website: "https://other.com", position: 1 }),
        place({ title: "Nora — Therapy", website: "https://nora-therapy.com", position: 2 }),
      ],
      id,
    );
    expect(present.youInPack).toBe(true);

    const absent = evaluateMapPack(
      [place({ title: "Other Clinic", website: "https://other.com", position: 1 })],
      id,
    );
    expect(absent.youInPack).toBe(false);
  });

  it("returns an empty pack for an empty list", () => {
    const pack = evaluateMapPack([], id);
    expect(pack).toEqual({ entries: [], youInPack: false });
  });

  it("does not match by host when the place has no website", () => {
    const pack = evaluateMapPack(
      [place({ title: "Unrelated Spa", website: null })],
      id,
    );
    expect(pack.entries[0].isYou).toBe(false);
    expect(pack.youInPack).toBe(false);
  });
});

import { describe, it, expect } from "vitest";

import { deriveSeekerLanguage } from "@/lib/seeker-language";
import type { PresenceScan } from "@/lib/presence-scan";

function scan(over: Partial<PresenceScan> = {}): PresenceScan {
  return {
    checkedAt: "2026-06-18T00:00:00.000Z",
    coverage: { appeared: 1, total: 4 },
    foundTerms: [],
    knowledgeGraphPresent: false,
    ...over,
  };
}

describe("deriveSeekerLanguage — honest, never invents", () => {
  it("has no data for a null scan (UI shows a calm invitation)", () => {
    const lang = deriveSeekerLanguage(null, "anything");
    expect(lang.hasData).toBe(false);
    expect(lang.questions).toEqual([]);
    expect(lang.words).toEqual([]);
    expect(lang.showingUpFor).toEqual([]);
  });

  it("has no data when a scan exists but captured no seeker voice", () => {
    expect(deriveSeekerLanguage(scan(), "bio text").hasData).toBe(false);
  });

  it("passes through the questions and the phrases they show up for", () => {
    const lang = deriveSeekerLanguage(
      scan({ questions: ["What is somatic therapy?"], foundTerms: ["Trauma Healing Saint Paul"] }),
      "",
    );
    expect(lang.hasData).toBe(true);
    expect(lang.questions).toEqual(["What is somatic therapy?"]);
    expect(lang.showingUpFor).toEqual(["Trauma Healing Saint Paul"]);
  });
});

describe("deriveSeekerLanguage — the say/search mirror", () => {
  it("marks a related search as echoed when the practitioner's words already carry it", () => {
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["nervous system regulation", "couples counseling"] }),
      "I help clients with nervous system regulation and somatic work.",
    );
    const byTerm = Object.fromEntries(lang.words.map((w) => [w.term, w.echoed]));
    expect(byTerm["nervous system regulation"]).toBe(true);
    expect(byTerm["couples counseling"]).toBe(false); // not in their bio → an open door
  });

  it("does NOT echo on generic role/geo words alone (no false matches)", () => {
    // "therapist" is a stopword; "saint paul" is the excluded region; the meaningful word is
    // "grief", which is NOT in their bio — so this must read as an open door, not an echo.
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["grief therapist saint paul"] }),
      "Somatic therapist in Saint Paul.",
      { exclude: ["Saint Paul"] },
    );
    expect(lang.words[0]?.echoed).toBe(false);
  });

  it("is case-insensitive when mirroring", () => {
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["TRAUMA Recovery"] }),
      "Trauma recovery is the heart of my practice.",
    );
    expect(lang.words[0]?.echoed).toBe(true);
  });

  it("matches on whole words only — never a substring inside another word", () => {
    // "body" must NOT match inside "somebody"; otherwise we'd invent a false "you already say this".
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["body work"] }),
      "I help somebody find peace.",
    );
    expect(lang.words[0]?.echoed).toBe(false);
  });

  it("normalizes simple plurals so 'couples' lines up with 'couple'", () => {
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["couples therapy"] }),
      "I work with couple dynamics.",
    );
    expect(lang.words[0]?.echoed).toBe(true);
  });

  it("requires EVERY care word — a partial overlap is an open door, not an echo", () => {
    // significant words: grief, work, couple. The bio has grief + work but not couples.
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["grief work with couples"] }),
      "I do grief work with individuals.",
    );
    expect(lang.words[0]?.echoed).toBe(false);
  });

  it("folds accents so an accented search word lines up with its plain spelling", () => {
    // "résilience" folds to "resilience" — without folding these would never match.
    const lang = deriveSeekerLanguage(
      scan({ relatedSearches: ["trauma résilience"] }),
      "I help with trauma and building resilience.",
    );
    expect(lang.words[0]?.echoed).toBe(true);
  });
});

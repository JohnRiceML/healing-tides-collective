import { describe, it, expect } from "vitest";

import { candidateRelevance, compareByRelevance, type CandidateSignals, type SeekerSignals } from "@/lib/match-candidates";

const seeker = (over: Partial<SeekerSignals> = {}): SeekerSignals => ({
  specialties: [],
  format: null,
  region: null,
  usesInsurance: null,
  insuranceName: null,
  genderPreference: null,
  ...over,
});

const cand = (over: Partial<CandidateSignals> = {}): CandidateSignals => ({
  specialties: [],
  modality: null,
  region: null,
  insuranceAccepted: [],
  gender: null,
  acceptingNew: true,
  ...over,
});

describe("candidateRelevance", () => {
  it("a seeker with no stated constraints produces no facts (nobody is penalized)", () => {
    const r = candidateRelevance(seeker(), cand({ specialties: ["trauma"] }));
    expect(r.facts).toEqual([]);
    expect(r.hits).toBe(0);
  });

  it("scores specialty overlap by controlled-vocab id", () => {
    const r = candidateRelevance(seeker({ specialties: ["trauma", "couples"] }), cand({ specialties: ["trauma"] }));
    expect(r.facts).toHaveLength(2);
    expect(r.facts.find((f) => f.label.includes("trauma") || f.label.includes("Trauma"))?.hit).toBe(true);
    expect(r.hits).toBe(1);
  });

  it("HYBRID satisfies both in-person and virtual; mismatch is a miss", () => {
    expect(candidateRelevance(seeker({ format: "in_person" }), cand({ modality: "HYBRID" })).facts[0].hit).toBe(true);
    expect(candidateRelevance(seeker({ format: "virtual" }), cand({ modality: "HYBRID" })).facts[0].hit).toBe(true);
    expect(candidateRelevance(seeker({ format: "in_person" }), cand({ modality: "VIRTUAL" })).facts[0].hit).toBe(false);
  });

  it("format 'either' is not a constraint (no fact)", () => {
    expect(candidateRelevance(seeker({ format: "either" }), cand({ modality: "VIRTUAL" })).facts).toEqual([]);
  });

  it("insurance only matters when the seeker wants it AND names a plan; matches loosely", () => {
    // out-of-pocket-ok → no fact even with a name
    expect(candidateRelevance(seeker({ usesInsurance: false, insuranceName: "HealthPartners" }), cand()).facts).toEqual([]);
    // wants it + named → soft contains match
    const r = candidateRelevance(
      seeker({ usesInsurance: true, insuranceName: "HealthPartners" }),
      cand({ insuranceAccepted: ["BCBS", "HealthPartners of MN"] }),
    );
    expect(r.facts[0].hit).toBe(true);
    expect(r.facts[0].soft).toBe(true);
  });

  it("region + gender are soft, case-insensitive, and never throw on nulls", () => {
    const r = candidateRelevance(
      seeker({ region: "Saint Paul", genderPreference: "female" }),
      cand({ region: "saint paul, mn", gender: "Female (she/her)" }),
    );
    expect(r.facts.every((f) => f.soft)).toBe(true);
    expect(r.facts.every((f) => f.hit)).toBe(true);
    // null candidate fields → miss, not a crash
    const miss = candidateRelevance(seeker({ region: "Duluth", genderPreference: "male" }), cand());
    expect(miss.facts.every((f) => !f.hit)).toBe(true);
  });

  it("flags a candidate not accepting new clients (surfaced, not excluded)", () => {
    expect(candidateRelevance(seeker(), cand({ acceptingNew: false })).notAcceptingNew).toBe(true);
    expect(candidateRelevance(seeker(), cand({ acceptingNew: true })).notAcceptingNew).toBe(false);
  });
});

describe("compareByRelevance", () => {
  const withHits = (hits: number, notAcceptingNew = false) => ({
    relevance: { facts: [], hits, notAcceptingNew },
  });

  it("orders more hits first, then accepting-new ahead of not", () => {
    const list = [withHits(1), withHits(3), withHits(3, true), withHits(0)];
    const sorted = [...list].sort(compareByRelevance);
    expect(sorted.map((x) => x.relevance.hits)).toEqual([3, 3, 1, 0]);
    // among the two 3-hit candidates, the accepting-new one comes first
    expect(sorted[0].relevance.notAcceptingNew).toBe(false);
    expect(sorted[1].relevance.notAcceptingNew).toBe(true);
  });
});

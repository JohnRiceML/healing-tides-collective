import { describe, it, expect } from "vitest";

import { pickGroundedNextStep, LOCAL_MAP_NEXT_STEP } from "@/lib/brand-next-step";
import type { NextStep } from "@/lib/brand";

const framework: NextStep = {
  dimensionId: "who_you_are",
  insight: {
    id: "who-photo",
    what: "Add a photo.",
    whyCare: "A face helps a seeker feel safe.",
    whatNext: "Upload a warm headshot.",
    lift: "gentle",
    state: "not_started",
  },
};

const ready = { mapChecked: true, onMap: false, profileReady: true };

describe("pickGroundedNextStep", () => {
  it("leads with the Google Business Profile step when set up but not on the local map", () => {
    expect(pickGroundedNextStep(framework, ready)).toBe(LOCAL_MAP_NEXT_STEP);
  });

  it("keeps the framework step when they're already on the local map", () => {
    expect(pickGroundedNextStep(framework, { ...ready, onMap: true })).toBe(framework);
  });

  it("keeps the framework step when the map was never checked (no scan)", () => {
    expect(pickGroundedNextStep(framework, { ...ready, mapChecked: false })).toBe(framework);
  });

  it("keeps the foundational profile gap first when the profile isn't ready yet", () => {
    // No bio/photo/publish → the map step would be premature; the profile comes first.
    expect(pickGroundedNextStep(framework, { ...ready, profileReady: false })).toBe(framework);
  });

  it("returns null (nothing pressing) only when neither the map nor the framework applies", () => {
    expect(pickGroundedNextStep(null, { ...ready, onMap: true })).toBeNull();
  });

  it("the map step is honest — a forming state, no number, an external GBP link", () => {
    expect(LOCAL_MAP_NEXT_STEP.insight.state).toBe("forming");
    expect(LOCAL_MAP_NEXT_STEP.insight.ctaHref?.startsWith("http")).toBe(true);
    const text =
      LOCAL_MAP_NEXT_STEP.insight.what +
      LOCAL_MAP_NEXT_STEP.insight.whyCare +
      LOCAL_MAP_NEXT_STEP.insight.whatNext;
    expect(/\d/.test(text)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";

import { completenessOf, COMPLETENESS_FIELDS } from "@/lib/completeness";

describe("completenessOf", () => {
  it("is 0 for an empty profile", () => {
    expect(completenessOf({})).toBe(0);
  });

  it("is 100 when every field is filled", () => {
    const full: Record<string, unknown> = {
      displayName: "A",
      bio: "b",
      values: "v",
      modality: "HYBRID",
      region: "Seattle",
      gender: "Woman",
      specialties: ["x"],
      insuranceAccepted: ["y"],
      website: "https://a.com",
    };
    expect(completenessOf(full)).toBe(100);
  });

  it("counts arrays only when non-empty", () => {
    expect(completenessOf({ specialties: [], insuranceAccepted: [] })).toBe(0);
    expect(completenessOf({ specialties: ["a"] })).toBe(
      Math.round((1 / COMPLETENESS_FIELDS.length) * 100),
    );
  });

  it("ignores empty strings and falsy values", () => {
    expect(completenessOf({ displayName: "", bio: null, region: undefined })).toBe(0);
  });

  it("rounds to the nearest percent (1 of 9 → 11)", () => {
    expect(completenessOf({ displayName: "A" })).toBe(11);
  });
});

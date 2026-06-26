import { describe, it, expect } from "vitest";

import { validateIntake, insuranceToBool, MAX_STORY } from "@/lib/seeker-intake";

const base = { name: "Jordan", email: "jordan@example.com", story: "I've been feeling stuck for a while now." };

describe("validateIntake", () => {
  it("accepts + normalizes a good intake", () => {
    const r = validateIntake({
      ...base,
      name: "  Jordan  ",
      email: "Jordan@Example.com ",
      lookingFor: ["Therapy", "Therapy", "  "],
      specialties: ["emotional_wellbeing"],
      region: "  Saint Paul  ",
      usesInsurance: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("Jordan");
      expect(r.value.email).toBe("jordan@example.com");
      expect(r.value.lookingFor).toEqual(["Therapy"]); // trimmed, deduped, blanks dropped
      expect(r.value.region).toBe("Saint Paul");
      expect(r.value.usesInsurance).toBe(true);
    }
  });

  it("requires a name", () => {
    expect(validateIntake({ ...base, name: "   " }).ok).toBe(false);
  });

  it("requires a valid email (where the shortlist goes)", () => {
    expect(validateIntake({ ...base, email: "nope" }).ok).toBe(false);
    expect(validateIntake({ ...base, email: "" }).ok).toBe(false);
  });

  it("requires a real story (>= 10 chars)", () => {
    expect(validateIntake({ ...base, story: "hi" }).ok).toBe(false);
    expect(validateIntake({ ...base, story: "" }).ok).toBe(false);
  });

  it("caps a very long story", () => {
    const r = validateIntake({ ...base, story: "x".repeat(MAX_STORY + 500) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.story.length).toBe(MAX_STORY);
  });

  it("leaves untouched optional prefs null / empty", () => {
    const r = validateIntake(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.region).toBeNull();
      expect(r.value.usesInsurance).toBeNull();
      expect(r.value.lookingFor).toEqual([]);
      expect(r.value.specialties).toEqual([]);
    }
  });
});

describe("insuranceToBool", () => {
  it("maps the UI choice to the model's nullable boolean (never a plan id)", () => {
    expect(insuranceToBool("yes")).toBe(true);
    expect(insuranceToBool("no")).toBe(false);
    expect(insuranceToBool("either")).toBeNull();
    expect(insuranceToBool(undefined)).toBeNull();
  });
});

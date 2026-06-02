import { describe, it, expect } from "vitest";

import {
  specialtyLabel,
  modalityLabel,
  SPECIALTY_OPTIONS,
  MODALITY_OPTIONS,
} from "@/app/_lib/taxonomy";

describe("taxonomy labels", () => {
  it("resolves a known category id to its label", () => {
    expect(specialtyLabel("emotional_wellbeing")).toBe("Emotional Wellbeing");
  });

  it("resolves a subcategory id too", () => {
    expect(specialtyLabel("anxiety_stress")).toBe("Anxiety & Stress");
  });

  it("falls back to the raw id for an unknown specialty", () => {
    expect(specialtyLabel("totally_unknown")).toBe("totally_unknown");
  });

  it("resolves modality enum values", () => {
    expect(modalityLabel("IN_PERSON")).toBe("In person");
    expect(modalityLabel("HYBRID")).toBe("Hybrid");
    expect(modalityLabel("VIRTUAL")).toBe("Virtual");
  });

  it("returns empty string for null / undefined modality", () => {
    expect(modalityLabel(null)).toBe("");
    expect(modalityLabel(undefined)).toBe("");
  });

  it("every option id round-trips through its label helper", () => {
    for (const s of SPECIALTY_OPTIONS) expect(specialtyLabel(s.id)).toBe(s.label);
    for (const m of MODALITY_OPTIONS) expect(modalityLabel(m.id)).toBe(m.label);
  });
});

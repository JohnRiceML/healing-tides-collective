import { describe, it, expect, vi, beforeEach } from "vitest";

// The AI writing assist — polishFieldText rephrases a practitioner's OWN draft of a
// narrative field. We mock the read-only auth (getPractitioner) and the AI call, the
// same way triage-flow mocks requireAdmin + generateObject.
const h = vi.hoisted(() => ({
  getPractitioner: vi.fn(),
  generateObject: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getPractitioner: h.getPractitioner }));
vi.mock("ai", () => ({ generateObject: h.generateObject }));

import { NARRATIVE_FIELD_IDS } from "@/app/_lib/profile-assist";
import { polishFieldText } from "@/app/practitioner/assist-actions";
import { PROFILE_SECTIONS } from "@/app/_lib/profile-fields";

// A real, faithful-length draft (≥ 40 chars) to rephrase.
const DRAFT =
  "i became a therapist after my own long road through grief. i sit with people quietly and we go slow.";

// Distinct practitioner id per test so the module-level (per-id) rate limiter never
// bleeds one test's calls into another's.
let idSeq = 0;
function signedInAs(over: Record<string, unknown> = {}) {
  const id = `p_assist_${(idSeq += 1)}`;
  h.getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: { id, ...over } });
  return id;
}

beforeEach(() => {
  h.getPractitioner.mockReset();
  h.generateObject.mockReset();
});

describe("polishFieldText — auth + practitioner gate", () => {
  it("refuses when signed out and never calls the model", async () => {
    h.getPractitioner.mockResolvedValue(null);
    const res = await polishFieldText("about_you", DRAFT);
    expect(res.ok).toBe(false);
    expect(h.generateObject).not.toHaveBeenCalled();
  });

  it("refuses when the user has no practitioner row yet", async () => {
    h.getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: null });
    const res = await polishFieldText("about_you", DRAFT);
    expect(res.ok).toBe(false);
    expect(h.generateObject).not.toHaveBeenCalled();
  });
});

describe("polishFieldText — input validation", () => {
  it("refuses a non-allowlisted field (a chips field) without calling the model", async () => {
    signedInAs();
    const res = await polishFieldText("style", DRAFT); // `style` is a chips field
    expect(res.ok).toBe(false);
    expect(h.generateObject).not.toHaveBeenCalled();
  });

  it("refuses a too-short draft with the gentle nudge, and never calls the model", async () => {
    signedInAs();
    const res = await polishFieldText("about_you", "too short");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/write a few sentences/i);
    expect(h.generateObject).not.toHaveBeenCalled();
  });
});

describe("polishFieldText — happy path + resilience", () => {
  it("returns the shaped suggestion (and optional note) on success", async () => {
    signedInAs();
    h.generateObject.mockResolvedValue({
      object: { suggestion: "I came to this work through my own long road with grief.", note: "Warmed the opening." },
    });
    const res = await polishFieldText("about_you", DRAFT);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.suggestion).toContain("grief");
      expect(res.note).toBe("Warmed the opening.");
    }
  });

  it("allows the column-backed narrative fields (values/bio)", async () => {
    signedInAs();
    h.generateObject.mockResolvedValue({
      object: { suggestion: "A shaped version of what healing means to me.", note: "Warmed the tone." },
    });
    const res = await polishFieldText("values", DRAFT);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.suggestion).toContain("shaped version");
  });

  it("degrades to {ok:false} when the AI call throws (never rethrows)", async () => {
    signedInAs();
    h.generateObject.mockRejectedValue(new Error("gateway down"));
    const res = await polishFieldText("about_you", DRAFT);
    expect(res.ok).toBe(false);
  });
});

describe("polishFieldText — per-practitioner rate limit", () => {
  it("refuses the 21st call within the window", async () => {
    signedInAs(); // one stable id for this whole test
    h.generateObject.mockResolvedValue({ object: { suggestion: "A shaped line about my work and how I hold space." } });

    for (let i = 0; i < 20; i++) {
      const ok = await polishFieldText("about_you", DRAFT);
      expect(ok.ok).toBe(true);
    }
    const capped = await polishFieldText("about_you", DRAFT);
    expect(capped.ok).toBe(false);
  });
});

describe("the allowlist is derived from the profile-fields config", () => {
  it("equals exactly the textarea field ids (never tags/chips/text)", () => {
    const expected = PROFILE_SECTIONS.flatMap((s) =>
      s.fields.filter((f) => f.type === "textarea").map((f) => f.id),
    );
    expect([...NARRATIVE_FIELD_IDS].sort()).toEqual(expected.sort());

    // And nothing structured leaked in.
    const nonTextarea = new Set(
      PROFILE_SECTIONS.flatMap((s) => s.fields.filter((f) => f.type !== "textarea").map((f) => f.id)),
    );
    for (const id of NARRATIVE_FIELD_IDS) expect(nonTextarea.has(id)).toBe(false);
  });
});

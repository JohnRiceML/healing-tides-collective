import { describe, it, expect } from "vitest";

import { buildTriagePrompt, readTriage, categoryMeta, TRIAGE_KEY, type TriageProfileInput } from "@/app/_lib/triage";
import { readAdminNotes, appendNote, ADMIN_NOTES_KEY } from "@/app/_lib/admin-notes";

const profile: TriageProfileInput = {
  displayName: "Maya Stone",
  title: "LICSW",
  bio: "I work with anxiety and trauma.",
  values: null,
  specialties: ["Anxiety", "Trauma"],
  credentials: ["LICSW"],
  region: "Saint Paul",
  modality: "In person",
  completeness: 70,
  acceptingNew: true,
  published: false,
};

describe("buildTriagePrompt", () => {
  it("includes the key facts and omits empty fields", () => {
    const out = buildTriagePrompt(profile);
    expect(out).toContain("Name: Maya Stone");
    expect(out).toContain("Focus areas: Anxiety, Trauma");
    expect(out).toContain("Profile completeness: 70%");
    expect(out).toContain("not yet published");
    expect(out).not.toContain("Values"); // values was null → omitted
  });

  it("notes when focus areas / credentials are missing", () => {
    const out = buildTriagePrompt({ ...profile, specialties: [], credentials: [] });
    expect(out).toContain("Focus areas: none listed");
    expect(out).toContain("Stated credentials: none listed");
  });
});

describe("categoryMeta", () => {
  it("maps known categories and falls back safely", () => {
    expect(categoryMeta("feature")).toEqual({ label: "Ready to feature", tone: "good" });
    expect(categoryMeta("polish").tone).toBe("warn");
    expect(categoryMeta("nonsense")).toEqual({ label: "Worth a look", tone: "neutral" });
    expect(categoryMeta(null).tone).toBe("neutral");
  });
});

describe("readTriage", () => {
  it("reads a valid stored blob, clamping arrays + coercing unknown category", () => {
    const fv = {
      [TRIAGE_KEY]: { category: "weird", tags: ["a", "b", 1, "c", "d", "e", "f"], insights: ["x", "y", "z", "w"], at: "2026-06-28T00:00:00Z", model: "m" },
    };
    const t = readTriage(fv)!;
    expect(t.category).toBe("unclear"); // unknown → unclear
    expect(t.tags).toHaveLength(5); // capped, non-strings dropped
    expect(t.insights).toHaveLength(3); // capped
  });

  it("returns null when absent or missing a timestamp", () => {
    expect(readTriage({})).toBeNull();
    expect(readTriage(null)).toBeNull();
    expect(readTriage({ [TRIAGE_KEY]: { category: "feature" } })).toBeNull(); // no `at`
  });
});

describe("admin notes", () => {
  it("appends newest-last in storage, caps at 200", () => {
    const out = appendNote({ [ADMIN_NOTES_KEY]: [{ text: "old", at: "2026-01-01T00:00:00Z", by: null }] }, {
      text: "new",
      at: "2026-06-28T00:00:00Z",
      by: "admin@x.com",
    });
    expect(out).toHaveLength(2);
    expect(out[1].text).toBe("new");
  });

  it("reads notes newest-first and ignores malformed entries", () => {
    const fv = {
      [ADMIN_NOTES_KEY]: [
        { text: "first", at: "2026-01-01T00:00:00Z", by: null },
        { text: "", at: "2026-02-01T00:00:00Z", by: null }, // blank → dropped
        { nope: true }, // malformed → dropped
        { text: "second", at: "2026-03-01T00:00:00Z", by: "a@x.com" },
      ],
    };
    const notes = readAdminNotes(fv);
    expect(notes.map((n) => n.text)).toEqual(["second", "first"]); // newest first
  });
});

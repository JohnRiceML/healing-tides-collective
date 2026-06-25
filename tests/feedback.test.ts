import { describe, it, expect } from "vitest";

import { validateFeedback, isValidStatus, feedbackStatusLabel, isOpenStatus, kindLabel } from "@/lib/feedback";

describe("validateFeedback", () => {
  it("accepts + normalizes a good submission", () => {
    const r = validateFeedback({ message: "  The filter is broken  ", kind: "bug", email: "Me@Example.com ", path: "/practitioners" });
    expect(r).toEqual({
      ok: true,
      value: { message: "The filter is broken", kind: "BUG", email: "me@example.com", path: "/practitioners" },
    });
  });

  it("requires a few words", () => {
    expect(validateFeedback({ message: "  " })).toEqual({ ok: false, error: expect.stringContaining("few words") });
    expect(validateFeedback({ message: "hi" }).ok).toBe(false);
  });

  it("caps very long messages", () => {
    expect(validateFeedback({ message: "x".repeat(2001) }).ok).toBe(false);
  });

  it("rejects a malformed email but allows a blank one", () => {
    expect(validateFeedback({ message: "hello there", email: "nope" }).ok).toBe(false);
    const ok = validateFeedback({ message: "hello there", email: "" });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.email).toBeNull();
  });

  it("falls back to OTHER for an unknown kind, and caps the path", () => {
    const r = validateFeedback({ message: "hello there", kind: "spam", path: "/" + "a".repeat(400) });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.kind).toBe("OTHER");
      expect(r.value.path?.length).toBe(300);
    }
  });
});

describe("status + kind helpers", () => {
  it("validates statuses and labels them", () => {
    expect(isValidStatus("FIXED")).toBe(true);
    expect(isValidStatus("BOGUS")).toBe(false);
    expect(feedbackStatusLabel("WONT_FIX")).toBe("Won't fix");
  });
  it("knows which statuses are still open", () => {
    expect(isOpenStatus("NEW")).toBe(true);
    expect(isOpenStatus("FIXED")).toBe(false);
  });
  it("labels kinds", () => {
    expect(kindLabel("BUG")).toBe("Something's broken");
  });
});

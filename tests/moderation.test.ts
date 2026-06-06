import { describe, it, expect } from "vitest";

import {
  HOLD_KEY,
  HOLD_HISTORY_KEY,
  applyHold,
  applyRelease,
  coercePrev,
  holdMessage,
  isOnHold,
  readHistory,
  readHold,
} from "@/app/_lib/moderation";

const AT = "2026-06-06T12:00:00.000Z";

describe("readHold / isOnHold", () => {
  it("returns null when there is no hold", () => {
    expect(readHold(null)).toBeNull();
    expect(readHold({})).toBeNull();
    expect(readHold({ title: "x" })).toBeNull();
    expect(isOnHold({ visibility: "PUBLISHED", fieldValues: {} })).toBe(false);
  });

  it("reads a hold record and reports on-hold", () => {
    const fv = { [HOLD_KEY]: { prev: "PUBLISHED", message: "hi", internalNote: "n", by: "a@b.co", at: AT } };
    expect(readHold(fv)?.prev).toBe("PUBLISHED");
    expect(readHold(fv)?.message).toBe("hi");
    expect(isOnHold({ visibility: "HIDDEN", fieldValues: fv })).toBe(true);
  });

  it("treats visibility HIDDEN as on-hold even without a record (defensive)", () => {
    expect(isOnHold({ visibility: "HIDDEN", fieldValues: {} })).toBe(true);
  });
});

describe("coercePrev", () => {
  it("never restores to HIDDEN (would leave them stuck)", () => {
    expect(coercePrev("HIDDEN")).toBe("DRAFT");
    expect(coercePrev("garbage")).toBe("DRAFT");
    expect(coercePrev(undefined)).toBe("DRAFT");
  });
  it("keeps valid restore targets", () => {
    expect(coercePrev("PUBLISHED")).toBe("PUBLISHED");
    expect(coercePrev("DRAFT")).toBe("DRAFT");
    expect(coercePrev("NEEDS_REVIEW")).toBe("NEEDS_REVIEW");
  });
});

describe("holdMessage", () => {
  it("returns the message when present, else a calm default", () => {
    expect(holdMessage({ [HOLD_KEY]: { message: "Please update your headshot." } })).toBe(
      "Please update your headshot.",
    );
    expect(holdMessage({})).toMatch(/on hold/i);
  });
});

describe("applyHold", () => {
  it("records prev + message + note and appends history, preserving other keys", () => {
    const existing = { title: "Therapist", __verified: ["licensed_professional"] };
    const next = applyHold(existing, {
      prev: "PUBLISHED",
      message: "  needs a review  ",
      internalNote: "flagged by X",
      by: "admin@ht.co",
      at: AT,
    });
    // preserves practitioner + badge data
    expect(next.title).toBe("Therapist");
    expect(next.__verified).toEqual(["licensed_professional"]);
    // hold record
    const hold = readHold(next);
    expect(hold).toEqual({ prev: "PUBLISHED", message: "needs a review", internalNote: "flagged by X", by: "admin@ht.co", at: AT });
    // history appended
    const hist = readHistory(next);
    expect(hist).toHaveLength(1);
    expect(hist[0]).toMatchObject({ action: "hold", by: "admin@ht.co", at: AT, reason: "needs a review" });
  });

  it("coerces a HIDDEN prev to DRAFT", () => {
    const next = applyHold({}, { prev: "HIDDEN", message: "", internalNote: "", by: "a", at: AT });
    expect(readHold(next)?.prev).toBe("DRAFT");
  });
});

describe("applyRelease", () => {
  it("restores prev, clears __hold, keeps badges, appends history", () => {
    const held = applyHold(
      { __verified: ["insured"] },
      { prev: "PUBLISHED", message: "m", internalNote: "n", by: "admin@ht.co", at: AT },
    );
    const { fieldValues, restore } = applyRelease(held, { by: "admin@ht.co", at: AT });
    expect(restore).toBe("PUBLISHED");
    expect(fieldValues[HOLD_KEY]).toBeUndefined();
    expect(fieldValues.__verified).toEqual(["insured"]);
    const hist = readHistory(fieldValues);
    expect(hist.map((h) => h.action)).toEqual(["hold", "release"]);
  });

  it("defaults restore to DRAFT when there was no hold record", () => {
    const { restore, fieldValues } = applyRelease({ title: "x" }, { by: "a", at: AT });
    expect(restore).toBe("DRAFT");
    expect(fieldValues.title).toBe("x");
  });
});

import { describe, it, expect } from "vitest";

import {
  BADGES,
  BADGE_ORDER,
  derivedBadges,
  badgesFor,
  FOUNDING_CUTOFF,
} from "@/app/_lib/verification";

const DAY = 86_400_000;

describe("verification badges", () => {
  it("BADGE_ORDER covers every badge exactly once", () => {
    expect([...BADGE_ORDER].sort()).toEqual(Object.keys(BADGES).sort());
    expect(new Set(BADGE_ORDER).size).toBe(BADGE_ORDER.length);
  });

  it("only Founding Member is derivable today; the rest are admin-granted", () => {
    expect(BADGES.founding_member.adminGranted).toBe(false);
    for (const id of BADGE_ORDER) {
      if (id !== "founding_member") expect(BADGES[id].adminGranted).toBe(true);
    }
  });

  it("derives Founding Member for pre-cutoff joins, not after", () => {
    expect(derivedBadges(new Date(FOUNDING_CUTOFF.getTime() - DAY))).toEqual(["founding_member"]);
    expect(derivedBadges(new Date(FOUNDING_CUTOFF.getTime() + DAY))).toEqual([]);
  });

  it("never throws on null / invalid dates", () => {
    expect(derivedBadges(null)).toEqual([]);
    expect(derivedBadges(undefined)).toEqual([]);
    expect(derivedBadges("not-a-date")).toEqual([]);
  });

  it("merges admin-granted ∪ derived, in display order, de-duped, ignoring unknowns", () => {
    const early = new Date(FOUNDING_CUTOFF.getTime() - DAY);
    const result = badgesFor({
      createdAt: early,
      verificationBadges: ["founding_member", "licensed_professional", "made_up"],
    });
    expect(result.map((b) => b.id)).toEqual(["licensed_professional", "founding_member"]);
  });

  it("returns nothing for a brand-new member with no granted badges", () => {
    expect(badgesFor({ createdAt: new Date(FOUNDING_CUTOFF.getTime() + DAY) })).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";

import {
  BADGES,
  BADGE_ORDER,
  derivedBadges,
  badgesFor,
  FOUNDING_CUTOFF,
  GRANTABLE_BADGES,
  RESERVED_BADGES_KEY,
  grantedBadgesFrom,
  sanitizeGrant,
  mergeFieldValues,
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

describe("admin-granted badge storage (reserved key)", () => {
  it("GRANTABLE_BADGES excludes the derived Founding Member", () => {
    expect(GRANTABLE_BADGES).not.toContain("founding_member");
    expect(GRANTABLE_BADGES.every((id) => BADGES[id].adminGranted)).toBe(true);
  });

  it("reads granted badges from the reserved key, ignoring junk", () => {
    const fv = { [RESERVED_BADGES_KEY]: ["licensed_professional", "founding_member", "nope", 42] };
    expect(grantedBadgesFrom(fv)).toEqual(["licensed_professional"]); // founding_member isn't grantable
  });

  it("grantedBadgesFrom is safe on missing / wrong-typed values", () => {
    expect(grantedBadgesFrom(null)).toEqual([]);
    expect(grantedBadgesFrom({})).toEqual([]);
    expect(grantedBadgesFrom({ [RESERVED_BADGES_KEY]: "licensed_professional" })).toEqual([]);
  });

  it("sanitizeGrant keeps only valid grantable ids, deduped + ordered", () => {
    expect(sanitizeGrant(["insured", "licensed_professional", "insured", "founding_member", "x"])).toEqual([
      "licensed_professional",
      "insured",
    ]);
    expect(sanitizeGrant("not an array")).toEqual([]);
  });

  it("mergeFieldValues lets a practitioner change own fields but NEVER the reserved key", () => {
    const existing = { bio: "old", [RESERVED_BADGES_KEY]: ["licensed_professional"] };
    // A practitioner save (no reserved key in their form) updates their fields...
    const merged = mergeFieldValues(existing, { bio: "new", title: "LICSW" });
    expect(merged.bio).toBe("new");
    expect(merged.title).toBe("LICSW");
    // ...and the admin-granted badges survive.
    expect(merged[RESERVED_BADGES_KEY]).toEqual(["licensed_professional"]);
  });

  it("mergeFieldValues strips a forged reserved key from client input", () => {
    const existing = { [RESERVED_BADGES_KEY]: [] };
    const merged = mergeFieldValues(existing, {
      bio: "hi",
      [RESERVED_BADGES_KEY]: ["licensed_professional"], // attacker tries to self-grant
    });
    expect(merged[RESERVED_BADGES_KEY]).toEqual([]); // forged value rejected; existing wins
  });
});

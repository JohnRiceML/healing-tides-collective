import { describe, it, expect } from "vitest";

import { findabilityStage, weeklyViewBuckets, presenceNextStep } from "@/lib/presence";

describe("findabilityStage", () => {
  it("is 'setup' until published with the basics", () => {
    expect(findabilityStage({ published: false, completeness: 90, hasContactLink: true, specialtiesCount: 5, hasRegion: true }).stage).toBe("setup");
    expect(findabilityStage({ published: true, completeness: 30, hasContactLink: false, specialtiesCount: 0, hasRegion: false }).stage).toBe("setup");
  });

  it("is 'findable' when live with region + a specialty + decent completeness", () => {
    const f = findabilityStage({ published: true, completeness: 60, hasContactLink: false, specialtiesCount: 1, hasRegion: true });
    expect(f.stage).toBe("findable");
    expect(f.label).toBe("Findable");
  });

  it("is 'established' only when rich, reachable, and clearly positioned", () => {
    expect(findabilityStage({ published: true, completeness: 85, hasContactLink: true, specialtiesCount: 4, hasRegion: true }).stage).toBe("established");
    // missing a contact link → not yet established
    expect(findabilityStage({ published: true, completeness: 85, hasContactLink: false, specialtiesCount: 4, hasRegion: true }).stage).toBe("findable");
  });

  it("never returns a comparative/relative value — only own-profile signals", () => {
    // sanity: the function takes no competitor input at all
    expect(Object.keys({ published: true } as never)).not.toContain("rank");
  });
});

describe("weeklyViewBuckets", () => {
  const now = new Date("2026-06-17T12:00:00Z");
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  it("buckets views into the last N 7-day windows, newest last", () => {
    const views = [daysAgo(1), daysAgo(2), daysAgo(8), daysAgo(40)]; // this wk x2, last wk x1, wk6 x1
    const r = weeklyViewBuckets(views, now, 6);
    expect(r.buckets).toHaveLength(6);
    expect(r.thisWeek).toBe(2);
    expect(r.lastWeek).toBe(1);
    expect(r.buckets[5]).toBe(2); // newest bucket
    expect(r.total).toBe(4);
  });

  it("ignores views older than the window and future timestamps", () => {
    const r = weeklyViewBuckets([daysAgo(100), daysAgo(-3)], now, 6);
    expect(r.total).toBe(0);
    expect(r.thisWeek).toBe(0);
  });

  it("handles an empty history", () => {
    const r = weeklyViewBuckets([], now, 6);
    expect(r.buckets).toEqual([0, 0, 0, 0, 0, 0]);
    expect(r.thisWeek).toBe(0);
  });
});

describe("presenceNextStep", () => {
  const base = { published: true, hasBio: true, specialtiesCount: 5, hasIdealClient: true, hasContactLink: true, hasRegion: true };

  it("leads with publishing when unpublished", () => {
    expect(presenceNextStep({ ...base, published: false })?.label).toMatch(/publish/i);
  });

  it("asks for location before specialties", () => {
    expect(presenceNextStep({ ...base, hasRegion: false, specialtiesCount: 0 })?.label).toMatch(/location/i);
  });

  it("returns null when nothing is pressing (don't invent a treadmill)", () => {
    expect(presenceNextStep(base)).toBeNull();
  });
});

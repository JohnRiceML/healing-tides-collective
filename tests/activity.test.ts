import { describe, it, expect } from "vitest";

import { classifyActivity, relativeShort } from "@/app/_lib/activity";

const NOW = new Date("2026-06-25T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

describe("classifyActivity", () => {
  it("flags a just-joined practitioner as new (regardless of edits)", () => {
    const a = classifyActivity({ createdAt: daysAgo(2), updatedAt: daysAgo(2), now: NOW });
    expect(a.state).toBe("new");
    expect(a.label).toBe("New");
  });

  it("new takes priority for the first 7 days even if idle since signup", () => {
    const a = classifyActivity({ createdAt: daysAgo(6), updatedAt: daysAgo(6), now: NOW });
    expect(a.state).toBe("new");
  });

  it("active when last edit is within 14 days (and not brand new)", () => {
    const a = classifyActivity({ createdAt: daysAgo(120), updatedAt: daysAgo(10), now: NOW });
    expect(a.state).toBe("active");
  });

  it("quiet when last signal is 15–30 days ago", () => {
    const a = classifyActivity({ createdAt: daysAgo(120), updatedAt: daysAgo(20), now: NOW });
    expect(a.state).toBe("quiet");
  });

  it("dormant when no signal in 30+ days", () => {
    const a = classifyActivity({ createdAt: daysAgo(200), updatedAt: daysAgo(60), now: NOW });
    expect(a.state).toBe("dormant");
    expect(a.label).toBe("Dormant");
  });

  it("a recent sign-in overrides an older edit (the newest signal wins)", () => {
    const a = classifyActivity({
      createdAt: daysAgo(200),
      updatedAt: daysAgo(60), // last edit long ago → would be dormant alone
      lastSeenAt: daysAgo(3), // but they signed in 3 days ago
      now: NOW,
    });
    expect(a.state).toBe("active");
    expect(a.lastSignalAt).toEqual(daysAgo(3));
  });

  it("ignores a null lastSeenAt (pre-migration) and falls back to the edit", () => {
    const a = classifyActivity({
      createdAt: daysAgo(200),
      updatedAt: daysAgo(40),
      lastSeenAt: null,
      now: NOW,
    });
    expect(a.state).toBe("dormant");
    expect(a.lastSignalAt).toEqual(daysAgo(40));
  });

  it("boundary: exactly 14 days idle is still active", () => {
    expect(classifyActivity({ createdAt: daysAgo(100), updatedAt: daysAgo(14), now: NOW }).state).toBe(
      "active",
    );
  });
});

describe("relativeShort", () => {
  it("returns — for null/undefined", () => {
    expect(relativeShort(null, NOW)).toBe("—");
    expect(relativeShort(undefined, NOW)).toBe("—");
  });

  it("returns — for a future date (clock skew safety)", () => {
    expect(relativeShort(new Date(NOW.getTime() + 60000), NOW)).toBe("—");
  });

  it("formats minutes / hours / days / weeks / months / years", () => {
    expect(relativeShort(new Date(NOW.getTime() - 30 * 1000), NOW)).toBe("now");
    expect(relativeShort(new Date(NOW.getTime() - 5 * 60000), NOW)).toBe("5m");
    expect(relativeShort(new Date(NOW.getTime() - 3 * 3600_000), NOW)).toBe("3h");
    expect(relativeShort(daysAgo(2), NOW)).toBe("2d");
    expect(relativeShort(daysAgo(14), NOW)).toBe("2w");
    expect(relativeShort(daysAgo(60), NOW)).toBe("2mo");
    expect(relativeShort(daysAgo(400), NOW)).toBe("1y");
  });
});

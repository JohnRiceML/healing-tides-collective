import { describe, it, expect } from "vitest";

import {
  PRESENCE_HISTORY_KEY,
  appendSnapshot,
  buildMomentum,
  readPresenceHistory,
  snapshotOf,
  type PresenceSnapshot,
} from "@/lib/presence-history";
import type { PresenceScan } from "@/lib/presence-scan";

function snap(checkedAt: string, appeared: number, foundTerms: string[] = []): PresenceSnapshot {
  return { checkedAt, appeared, total: 6, foundTerms };
}

describe("snapshotOf — compact point from a scan", () => {
  it("keeps just checkedAt + appeared/total + foundTerms", () => {
    const scan: PresenceScan = {
      checkedAt: "2026-06-18T00:00:00.000Z",
      coverage: { appeared: 2, total: 6 },
      foundTerms: ["Trauma Healing"],
      knowledgeGraphPresent: true,
      questions: ["ignored?"],
    };
    expect(snapshotOf(scan)).toEqual({
      checkedAt: "2026-06-18T00:00:00.000Z",
      appeared: 2,
      total: 6,
      foundTerms: ["Trauma Healing"],
    });
  });
});

describe("readPresenceHistory — defensive", () => {
  it("returns [] for missing / non-array / malformed", () => {
    expect(readPresenceHistory(undefined)).toEqual([]);
    expect(readPresenceHistory({ [PRESENCE_HISTORY_KEY]: "nope" })).toEqual([]);
    expect(readPresenceHistory({ [PRESENCE_HISTORY_KEY]: [1, "x", null] })).toEqual([]);
  });

  it("parses well-formed snapshots and drops entries with no timestamp", () => {
    const fv = {
      [PRESENCE_HISTORY_KEY]: [
        { checkedAt: "2026-06-01T00:00:00.000Z", appeared: 1, total: 6, foundTerms: ["A", 7] },
        { appeared: 9 }, // no checkedAt → dropped
      ],
    };
    expect(readPresenceHistory(fv)).toEqual([
      { checkedAt: "2026-06-01T00:00:00.000Z", appeared: 1, total: 6, foundTerms: ["A"] },
    ]);
  });
});

describe("appendSnapshot — rolling window, one point per day", () => {
  it("appends across different days", () => {
    const h = appendSnapshot([snap("2026-06-01T10:00:00Z", 1)], snap("2026-06-08T10:00:00Z", 2));
    expect(h.map((s) => s.appeared)).toEqual([1, 2]);
  });

  it("replaces same-day entries instead of piling up", () => {
    const h0 = [snap("2026-06-08T09:00:00Z", 1)];
    const h1 = appendSnapshot(h0, snap("2026-06-08T18:00:00Z", 3)); // same day → replace
    expect(h1).toHaveLength(1);
    expect(h1[0]?.appeared).toBe(3);
  });

  it("caps at the window size, keeping the most recent", () => {
    let h: PresenceSnapshot[] = [];
    for (let d = 1; d <= 12; d++) {
      h = appendSnapshot(h, snap(`2026-06-${String(d).padStart(2, "0")}T10:00:00Z`, d), 8);
    }
    expect(h).toHaveLength(8);
    expect(h[h.length - 1]?.appeared).toBe(12); // newest kept
    expect(h[0]?.appeared).toBe(5); // oldest five dropped
  });

  it("a same-day re-check AT the cap replaces today's entry without evicting the oldest", () => {
    let h: PresenceSnapshot[] = [];
    for (let d = 1; d <= 8; d++) {
      h = appendSnapshot(h, snap(`2026-06-${String(d).padStart(2, "0")}T10:00:00Z`, d), 8);
    }
    expect(h).toHaveLength(8);
    const h1 = appendSnapshot(h, snap("2026-06-08T18:00:00Z", 99), 8); // same day as the last → replace
    expect(h1).toHaveLength(8); // still full, no growth
    expect(h1[h1.length - 1]?.appeared).toBe(99); // today's entry updated
    expect(h1[0]?.appeared).toBe(1); // oldest NOT evicted (it was only a same-day replace)
  });
});

describe("buildMomentum — gain-framed trend", () => {
  it("is 'new' with no history or a single check", () => {
    expect(buildMomentum([]).state).toBe("new");
    expect(buildMomentum([]).checks).toBe(0);
    expect(buildMomentum([snap("2026-06-01T00:00:00Z", 1)]).state).toBe("new");
  });

  it("is 'growing' when more searches find them than at the first check", () => {
    const m = buildMomentum([snap("2026-06-01T00:00:00Z", 1), snap("2026-06-08T00:00:00Z", 3)]);
    expect(m.state).toBe("growing");
    expect(m.appearedSeries).toEqual([1, 3]);
  });

  it("reads a flat count as 'steady' — but still surfaces the new door that opened", () => {
    // Net visibility is unchanged (1 → 1), so it's honestly "steady", NOT "growing" — yet the
    // door that opened (B) is still celebrated via newlyFound.
    const m = buildMomentum([
      snap("2026-06-01T00:00:00Z", 1, ["A"]),
      snap("2026-06-08T00:00:00Z", 1, ["B"]),
    ]);
    expect(m.state).toBe("steady");
    expect(m.newlyFound).toEqual(["B"]);
  });

  it("frames a dip as 'steady', never a loss (gain-only)", () => {
    const m = buildMomentum([snap("2026-06-01T00:00:00Z", 3), snap("2026-06-08T00:00:00Z", 2)]);
    expect(m.state).toBe("steady");
  });

  it("is 'quiet' when nothing surfaces in the latest check", () => {
    const m = buildMomentum([snap("2026-06-01T00:00:00Z", 0), snap("2026-06-08T00:00:00Z", 0)]);
    expect(m.state).toBe("quiet");
  });

  it("newlyFound = terms found now but not at the first check", () => {
    const m = buildMomentum([
      snap("2026-06-01T00:00:00Z", 1, ["A"]),
      snap("2026-06-08T00:00:00Z", 2, ["A", "B"]),
    ]);
    expect(m.newlyFound).toEqual(["B"]);
  });
});

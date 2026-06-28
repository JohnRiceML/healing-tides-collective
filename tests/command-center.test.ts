import { describe, it, expect } from "vitest";

import { buildCommandCenter, greetingFor } from "@/app/admin/command-center";
import type { AdminSeekerRow } from "@/app/admin/_data";

const NOW = new Date("2026-06-28T09:00:00Z");

function intake(over: Partial<AdminSeekerRow> = {}): AdminSeekerRow {
  return {
    id: over.id ?? "i1",
    name: "Jordan",
    email: "j@x.com",
    story: "…",
    priorTherapy: null,
    stylePreference: null,
    lookingFor: [],
    specialties: [],
    region: null,
    format: null,
    ageGroup: null,
    genderPreference: null,
    usesInsurance: null,
    insuranceName: null,
    budgetNote: null,
    availability: null,
    urgency: null,
    status: "NEW",
    createdAt: new Date("2026-06-28T08:00:00Z"),
    matchCount: 0,
    ...over,
  };
}

const EMPTY = { intakes: [], invitesPending: 0, dueReminders: 0, newFeedback: 0, drafts: 0, needsReview: 0, onHold: 0 };

describe("greetingFor", () => {
  it("maps the hour to a time-of-day greeting", () => {
    expect(greetingFor(new Date("2026-06-28T08:00:00"))).toBe("Good morning");
    expect(greetingFor(new Date("2026-06-28T13:00:00"))).toBe("Good afternoon");
    expect(greetingFor(new Date("2026-06-28T19:00:00"))).toBe("Good evening");
  });
});

describe("buildCommandCenter", () => {
  it("is all-clear when nothing is waiting", () => {
    const d = buildCommandCenter(EMPTY, NOW);
    expect(d.totalActions).toBe(0);
    expect(d.lanes).toEqual([]);
    expect(d.topIntakes).toEqual([]);
  });

  it("includes only non-empty lanes, action lanes first", () => {
    const d = buildCommandCenter(
      { ...EMPTY, intakes: [intake()], invitesPending: 2, needsReview: 1 },
      NOW,
    );
    expect(d.lanes.map((l) => l.key)).toEqual(["intakes", "review", "invites"]);
    expect(d.lanes[0].count).toBe(1);
  });

  it("counts actions across queues but excludes on-hold from the total", () => {
    const d = buildCommandCenter({ ...EMPTY, invitesPending: 3, dueReminders: 2, onHold: 5 }, NOW);
    expect(d.totalActions).toBe(5); // 3 + 2, NOT the 5 on hold
    expect(d.lanes.find((l) => l.key === "hold")?.count).toBe(5); // still shown
  });

  it("only counts NEW intakes as needing a match", () => {
    const d = buildCommandCenter(
      { ...EMPTY, intakes: [intake({ id: "a" }), intake({ id: "b", status: "MATCHED" })] },
      NOW,
    );
    expect(d.lanes.find((l) => l.key === "intakes")?.count).toBe(1);
    expect(d.topIntakes).toHaveLength(1);
  });

  it("surfaces urgent intakes first, then newest, max 3", () => {
    const d = buildCommandCenter(
      {
        ...EMPTY,
        intakes: [
          intake({ id: "old", createdAt: new Date("2026-06-20T08:00:00Z") }),
          intake({ id: "new", createdAt: new Date("2026-06-28T07:00:00Z") }),
          intake({ id: "urgent", urgency: "soon", createdAt: new Date("2026-06-10T08:00:00Z") }),
          intake({ id: "newest", createdAt: new Date("2026-06-28T08:30:00Z") }),
        ],
      },
      NOW,
    );
    expect(d.topIntakes).toHaveLength(3);
    expect(d.topIntakes[0].id).toBe("urgent"); // urgency wins over recency
    expect(d.topIntakes[0].urgent).toBe(true);
    expect(d.topIntakes[1].id).toBe("newest"); // then newest
  });

  it("builds a privacy-light preview (initial + detail)", () => {
    const d = buildCommandCenter(
      { ...EMPTY, intakes: [intake({ name: "alex", region: "Saint Paul", urgency: "soon", ageGroup: "myself" })] },
      NOW,
    );
    expect(d.topIntakes[0].initial).toBe("A");
    expect(d.topIntakes[0].detail).toBe("Saint Paul · soon · myself");
  });
});

import { describe, it, expect } from "vitest";

import { computeAdminOverview } from "@/app/admin/overview";
import type { AdminPractitionerRow } from "@/app/admin/_data";

const NOW = new Date("2026-06-25T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

function row(o: Partial<AdminPractitionerRow> = {}): AdminPractitionerRow {
  return {
    id: "p",
    displayName: "P",
    slug: null,
    visibility: "PUBLISHED",
    completeness: 80,
    viewCount: 0,
    views7: 0,
    views30: 0,
    lastViewedAt: null,
    region: null,
    featured: false,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(5),
    lastSeenAt: null,
    email: null,
    verificationBadges: [],
    credentials: [],
    credentialVerification: null,
    held: false,
    holdMessage: null,
    ...o,
  };
}

describe("computeAdminOverview", () => {
  it("rolls up practitioner counts by visibility + hold (held is its own bucket)", () => {
    const o = computeAdminOverview(
      [
        row({ visibility: "PUBLISHED" }),
        row({ visibility: "PUBLISHED" }),
        row({ visibility: "DRAFT" }),
        row({ visibility: "NEEDS_REVIEW" }),
        row({ visibility: "HIDDEN", held: true }),
      ],
      { now: NOW, invitesPending: 3, dueReminders: 2 },
    );
    expect(o.practitioners).toEqual({ total: 5, published: 2, drafts: 1, onHold: 1, needsReview: 1 });
    expect(o.queue.invitesPending).toBe(3);
    expect(o.queue.dueReminders).toBe(2);
    expect(o.queue.onHold).toBe(1);
  });

  it("buckets activity from edit/sign-in recency", () => {
    const o = computeAdminOverview(
      [
        row({ createdAt: daysAgo(2), updatedAt: daysAgo(2) }), // new (joined <7d)
        row({ createdAt: daysAgo(100), updatedAt: daysAgo(5) }), // active (<14d)
        row({ createdAt: daysAgo(100), updatedAt: daysAgo(20) }), // quiet (15-30d)
        row({ createdAt: daysAgo(100), updatedAt: daysAgo(60) }), // dormant (>30d)
      ],
      { now: NOW, invitesPending: 0, dueReminders: 0 },
    );
    expect(o.activity).toEqual({ new: 1, active: 1, quiet: 1, dormant: 1 });
  });

  it("sums traction (lifetime + 7d + 30d views)", () => {
    const o = computeAdminOverview(
      [row({ viewCount: 10, views7: 1, views30: 4 }), row({ viewCount: 5, views7: 2, views30: 3 })],
      { now: NOW, invitesPending: 0, dueReminders: 0 },
    );
    expect(o.traction).toEqual({ totalViews: 15, views7: 3, views30: 7 });
  });

  it("counts credentials needing verification (stated AND not yet verified)", () => {
    const v = (status: "verified" | "not_found") => ({ status, by: "x", at: "", notes: "", credentials: [] });
    const o = computeAdminOverview(
      [
        row({ credentials: ["LICSW"], credentialVerification: null }), // to verify
        row({ credentials: ["LMFT"], credentialVerification: v("not_found") }), // still to verify
        row({ credentials: ["LP"], credentialVerification: v("verified") }), // done
        row({ credentials: [] }), // none stated → not counted
      ],
      { now: NOW, invitesPending: 0, dueReminders: 0 },
    );
    expect(o.queue.credentialsToVerify).toBe(2);
  });
});

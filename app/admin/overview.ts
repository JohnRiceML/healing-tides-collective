// Pure roll-up for the admin "health of the app" overview. Computed server-side from the
// already-fetched practitioner rows (no extra DB query) + a fixed `now`, so it's testable
// and the display component stays dumb. The Seeker side has no data yet (anonymous browse +
// mailto matching), so this is deliberately practitioner-only until matching (M2) lands.

import { classifyActivity, type ActivityState } from "@/app/_lib/activity";
import type { AdminPractitionerRow } from "./_data";

export type AdminOverview = {
  practitioners: { total: number; published: number; drafts: number; onHold: number; needsReview: number };
  activity: Record<ActivityState, number>; // new / active / quiet / dormant
  traction: { totalViews: number; views7: number; views30: number };
  /** The "needs your attention" queue — actionable counts. */
  queue: { invitesPending: number; credentialsToVerify: number; dueReminders: number; onHold: number };
};

export function computeAdminOverview(
  rows: AdminPractitionerRow[],
  opts: { now: Date; invitesPending: number; dueReminders: number },
): AdminOverview {
  const activity: Record<ActivityState, number> = { new: 0, active: 0, quiet: 0, dormant: 0 };
  let published = 0,
    drafts = 0,
    onHold = 0,
    needsReview = 0,
    totalViews = 0,
    views7 = 0,
    views30 = 0,
    credentialsToVerify = 0;

  for (const r of rows) {
    activity[
      classifyActivity({ createdAt: r.createdAt, updatedAt: r.updatedAt, lastSeenAt: r.lastSeenAt, now: opts.now }).state
    ] += 1;

    if (r.held) onHold += 1;
    else if (r.visibility === "PUBLISHED") published += 1;
    else if (r.visibility === "DRAFT") drafts += 1;
    else if (r.visibility === "NEEDS_REVIEW") needsReview += 1;

    totalViews += r.viewCount;
    views7 += r.views7;
    views30 += r.views30;

    if (r.credentials.length > 0 && r.credentialVerification?.status !== "verified") credentialsToVerify += 1;
  }

  return {
    practitioners: { total: rows.length, published, drafts, onHold, needsReview },
    activity,
    traction: { totalViews, views7, views30 },
    queue: { invitesPending: opts.invitesPending, credentialsToVerify, dueReminders: opts.dueReminders, onHold },
  };
}

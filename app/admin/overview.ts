// Pure roll-up for the admin "health of the app" overview. Computed server-side from the
// already-fetched practitioner rows (no extra DB query) + a fixed `now`, so it's testable
// and the display component stays dumb. The Seeker side has no data yet (anonymous browse +
// mailto matching), so this is deliberately practitioner-only until matching (M2) lands.

import { classifyActivity, type ActivityState } from "@/app/_lib/activity";
import type { AdminPractitionerRow } from "./_data";

export type Insight = { tone: "good" | "neutral" | "attention"; text: string };

export type AdminOverview = {
  practitioners: { total: number; published: number; drafts: number; onHold: number; needsReview: number };
  activity: Record<ActivityState, number>; // new / active / quiet / dormant
  traction: { totalViews: number; views7: number; views30: number };
  /** The "needs your attention" queue — actionable counts. */
  queue: { invitesPending: number; credentialsToVerify: number; dueReminders: number; onHold: number };
  publishedRate: number; // 0–100
  avgCompleteness: number; // 0–100
  credentials: { stated: number; verified: number };
  topViewed: { name: string; views: number } | null; // most-viewed published profile (30d)
  viewsTrend: "up" | "steady" | "quiet"; // this week vs the month's weekly pace
  /** Plain-language read of the numbers — the "so what" at the top of the dashboard. */
  insights: Insight[];
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
    credentialsToVerify = 0,
    statedCreds = 0,
    verifiedCreds = 0,
    sumCompleteness = 0;
  let topViewed: { name: string; views: number } | null = null;

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
    sumCompleteness += r.completeness;

    if (r.credentials.length > 0) {
      statedCreds += 1;
      if (r.credentialVerification?.status === "verified") verifiedCreds += 1;
      else credentialsToVerify += 1;
    }

    if (r.visibility === "PUBLISHED" && !r.held && r.views30 > (topViewed?.views ?? 0)) {
      topViewed = { name: r.displayName ?? "A practitioner", views: r.views30 };
    }
  }

  const total = rows.length;
  const publishedRate = total ? Math.round((published / total) * 100) : 0;
  const avgCompleteness = total ? Math.round(sumCompleteness / total) : 0;
  const weeklyPace = views30 / 4;
  const viewsTrend: AdminOverview["viewsTrend"] = views30 === 0 ? "quiet" : views7 > weeklyPace * 1.2 ? "up" : "steady";

  const insights = buildInsights({
    total,
    published,
    publishedRate,
    dormant: activity.dormant,
    statedCreds,
    verifiedCreds,
    totalViews,
    viewsTrend,
    avgCompleteness,
    topViewed,
  });

  return {
    practitioners: { total, published, drafts, onHold, needsReview },
    activity,
    traction: { totalViews, views7, views30 },
    queue: { invitesPending: opts.invitesPending, credentialsToVerify, dueReminders: opts.dueReminders, onHold },
    publishedRate,
    avgCompleteness,
    credentials: { stated: statedCreds, verified: verifiedCreds },
    topViewed,
    viewsTrend,
    insights,
  };
}

function buildInsights(d: {
  total: number;
  published: number;
  publishedRate: number;
  dormant: number;
  statedCreds: number;
  verifiedCreds: number;
  totalViews: number;
  viewsTrend: "up" | "steady" | "quiet";
  avgCompleteness: number;
  topViewed: { name: string; views: number } | null;
}): Insight[] {
  if (d.total === 0) {
    return [{ tone: "neutral", text: "No practitioners yet — invites and claims will populate this dashboard." }];
  }
  const out: Insight[] = [];

  out.push({
    tone: d.publishedRate >= 50 ? "good" : "neutral",
    text: `${d.published} of ${d.total} profiles are live (${d.publishedRate}%).`,
  });

  if (d.dormant > 0) {
    out.push({
      tone: "attention",
      text: `${d.dormant} ${d.dormant === 1 ? "practitioner has" : "practitioners have"} gone quiet (30+ days) — a gentle nudge could help.`,
    });
  } else {
    out.push({ tone: "good", text: "Everyone's been active recently — no one has gone quiet." });
  }

  if (d.statedCreds > 0) {
    const toVerify = d.statedCreds - d.verifiedCreds;
    out.push({
      tone: toVerify > 0 ? "attention" : "good",
      text: `${d.statedCreds} stated a license — ${d.verifiedCreds} verified${toVerify > 0 ? `, ${toVerify} still to check` : ""}.`,
    });
  }

  if (d.topViewed && d.topViewed.views > 0) {
    out.push({
      tone: "good",
      text: `${d.topViewed.name} is getting the most attention this month (${d.topViewed.views} views).`,
    });
  } else if (d.totalViews > 0) {
    const word = d.viewsTrend === "up" ? "ahead of" : d.viewsTrend === "quiet" ? "quiet against" : "in line with";
    out.push({ tone: d.viewsTrend === "up" ? "good" : "neutral", text: `Profile views this week are ${word} the month's pace.` });
  }

  if (d.avgCompleteness > 0 && d.avgCompleteness < 80) {
    out.push({ tone: "neutral", text: `Profiles average ${d.avgCompleteness}% complete — finishing them lifts findability.` });
  }

  return out;
}

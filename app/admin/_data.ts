// Admin read layer — sees ALL practitioners (incl. drafts) + their email + counts.
// ADMIN-ONLY: only ever call this behind `requireAdmin()` (the /admin page gates it).
// Unlike lib/practitioners.ts (the public, PUBLISHED-only read layer), this is the
// privileged view, so it must never be imported by a public/unauthenticated surface.
import { db } from "@/lib/db";
import type { ProfileVisibility } from "@/lib/generated/prisma/client";
import { grantedBadgesFrom } from "@/app/_lib/verification";
import { readVerification, type VerificationAttempt } from "@/app/_lib/credentials";
import { readHold } from "@/app/_lib/moderation";
import { readPrefill } from "@/lib/invites";
import { readLastReminder, type ReminderCandidate } from "@/lib/completeness-reminders";

export type AdminPractitionerRow = {
  id: string;
  displayName: string | null;
  slug: string | null;
  visibility: ProfileVisibility;
  completeness: number;
  viewCount: number; // lifetime
  views7: number; // profile views in the last 7 days
  views30: number; // profile views in the last 30 days
  lastViewedAt: Date | null; // most recent seeker view (audience traction)
  region: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date; // last profile edit (a practitioner-engagement signal)
  lastSeenAt: Date | null; // last sign-in — null until last-seen tracking lands (migration)
  email: string | null;
  verificationBadges: string[];
  credentials: string[]; // stated credentials/licensure (free-text tags)
  credentialVerification: VerificationAttempt | null; // last admin verification, if any
  held: boolean; // currently on an admin hold
  holdMessage: string | null; // practitioner-facing reason (if held)
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toStrings = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : typeof v === "string" && v.trim()
      ? [v.trim()]
      : [];

export async function getAdminPractitioners(): Promise<AdminPractitionerRow[]> {
  const now = Date.now();
  const since7 = new Date(now - 7 * DAY_MS);
  const since30 = new Date(now - 30 * DAY_MS);

  // One practitioner read + three lightweight grouped reads over profile_views
  // (viewedAt is indexed). The grouped reads give recent-window counts + last-viewed
  // without pulling every view row.
  const [rows, v7, v30, lastViewed] = await Promise.all([
    db.practitioner.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        displayName: true,
        slug: true,
        visibility: true,
        completeness: true,
        viewCount: true,
        region: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        fieldValues: true,
        user: { select: { email: true, lastSeenAt: true } },
      },
    }),
    db.profileView.groupBy({ by: ["practitionerId"], where: { viewedAt: { gte: since7 } }, _count: { _all: true } }),
    db.profileView.groupBy({ by: ["practitionerId"], where: { viewedAt: { gte: since30 } }, _count: { _all: true } }),
    db.profileView.groupBy({ by: ["practitionerId"], _max: { viewedAt: true } }),
  ]);

  const count7 = new Map(v7.map((r) => [r.practitionerId, r._count._all]));
  const count30 = new Map(v30.map((r) => [r.practitionerId, r._count._all]));
  const lastView = new Map(lastViewed.map((r) => [r.practitionerId, r._max.viewedAt]));

  return rows.map(({ user, fieldValues, ...r }) => {
    const hold = readHold(fieldValues);
    return {
      ...r,
      email: user?.email ?? null,
      verificationBadges: grantedBadgesFrom(fieldValues),
      credentials: toStrings((fieldValues as Record<string, unknown> | null)?.credentials),
      credentialVerification: readVerification(fieldValues),
      held: Boolean(hold),
      holdMessage: hold?.message || null,
      views7: count7.get(r.id) ?? 0,
      views30: count30.get(r.id) ?? 0,
      lastViewedAt: lastView.get(r.id) ?? null,
      lastSeenAt: user?.lastSeenAt ?? null,
    };
  });
}

// Practitioners as completeness-reminder candidates (pre-filtering happens in the pure
// selectReminderRecipients). ADMIN-ONLY (page/action gate).
export async function getReminderCandidates(): Promise<ReminderCandidate[]> {
  const rows = await db.practitioner.findMany({
    select: {
      id: true,
      displayName: true,
      completeness: true,
      fieldValues: true,
      user: { select: { email: true } },
    },
  });
  return rows.map(({ user, fieldValues, ...r }) => ({
    ...r,
    email: user?.email ?? null,
    lastReminderAt: readLastReminder(fieldValues),
    held: Boolean(readHold(fieldValues)),
  }));
}

export type AdminStats = {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
};

export type AdminInviteRow = {
  id: string;
  token: string;
  email: string;
  displayName: string | null;
  region: string | null;
  createdAt: Date;
  claimedAt: Date | null;
  status: "pending" | "claimed";
};

// All claim invites, newest first — the waitlist-rollout worklist. ADMIN-ONLY (page gates).
export async function getAdminInvites(): Promise<AdminInviteRow[]> {
  const rows = await db.invite.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      token: true,
      email: true,
      displayName: true,
      prefill: true,
      createdAt: true,
      claimedAt: true,
    },
  });
  return rows.map(({ prefill, claimedAt, ...r }) => ({
    ...r,
    region: readPrefill(prefill).region ?? null,
    claimedAt,
    status: claimedAt ? ("claimed" as const) : ("pending" as const),
  }));
}

export async function getAdminStats(): Promise<AdminStats> {
  const [total, published, draft, views] = await Promise.all([
    db.practitioner.count(),
    db.practitioner.count({ where: { visibility: "PUBLISHED" } }),
    db.practitioner.count({ where: { visibility: "DRAFT" } }),
    db.practitioner.aggregate({ _sum: { viewCount: true } }),
  ]);
  return { total, published, draft, totalViews: views._sum.viewCount ?? 0 };
}

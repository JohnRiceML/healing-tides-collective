// Admin read layer — sees ALL practitioners (incl. drafts) + their email + counts.
// ADMIN-ONLY: only ever call this behind `requireAdmin()` (the /admin page gates it).
// Unlike lib/practitioners.ts (the public, PUBLISHED-only read layer), this is the
// privileged view, so it must never be imported by a public/unauthenticated surface.
import { db } from "@/lib/db";
import type { ProfileVisibility } from "@/lib/generated/prisma/client";
import { grantedBadgesFrom } from "@/app/_lib/verification";
import { readHold } from "@/app/_lib/moderation";
import { readPrefill } from "@/lib/invites";
import { readLastReminder, type ReminderCandidate } from "@/lib/completeness-reminders";

export type AdminPractitionerRow = {
  id: string;
  displayName: string | null;
  slug: string | null;
  visibility: ProfileVisibility;
  completeness: number;
  viewCount: number;
  region: string | null;
  featured: boolean;
  updatedAt: Date;
  email: string | null;
  verificationBadges: string[];
  held: boolean; // currently on an admin hold
  holdMessage: string | null; // practitioner-facing reason (if held)
};

export async function getAdminPractitioners(): Promise<AdminPractitionerRow[]> {
  const rows = await db.practitioner.findMany({
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
      updatedAt: true,
      fieldValues: true,
      user: { select: { email: true } },
    },
  });
  return rows.map(({ user, fieldValues, ...r }) => {
    const hold = readHold(fieldValues);
    return {
      ...r,
      email: user?.email ?? null,
      verificationBadges: grantedBadgesFrom(fieldValues),
      held: Boolean(hold),
      holdMessage: hold?.message || null,
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

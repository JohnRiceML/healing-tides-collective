// Admin read layer — sees ALL practitioners (incl. drafts) + their email + counts.
// ADMIN-ONLY: only ever call this behind `requireAdmin()` (the /admin page gates it).
// Unlike lib/practitioners.ts (the public, PUBLISHED-only read layer), this is the
// privileged view, so it must never be imported by a public/unauthenticated surface.
import { db } from "@/lib/db";
import type { ProfileVisibility } from "@/lib/generated/prisma/client";
import { grantedBadgesFrom } from "@/app/_lib/verification";
import {
  readImportedLicense,
  readVerification,
  type ImportedLicense,
  type VerificationAttempt,
} from "@/app/_lib/credentials";
import { readHold } from "@/app/_lib/moderation";
import { readDirectoryApproval } from "@/app/_lib/directory-approval";
import { readTriage } from "@/app/_lib/triage";
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
  importedLicense: ImportedLicense | null; // license #/state/expiry from a directory import (UNVERIFIED)
  held: boolean; // currently on an admin hold
  holdMessage: string | null; // practitioner-facing reason (if held)
  directoryApproved: boolean; // admin-approved for the public directory (invites also let someone publish)
  triageCategory: string | null; // last AI-triage bucket (null = never triaged)
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
  // NOTE: the groupBy reads scan ALL views (unbounded) — they'll want a viewedAt horizon
  // when volume grows, but bounding them now would change the last-viewed semantics.
  const [rows, v7, v30, lastViewed] = await Promise.all([
    db.practitioner.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
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
      importedLicense: readImportedLicense(fieldValues),
      held: Boolean(hold),
      holdMessage: hold?.message || null,
      directoryApproved: Boolean(readDirectoryApproval(fieldValues)),
      triageCategory: readTriage(fieldValues)?.category ?? null,
      views7: count7.get(r.id) ?? 0,
      views30: count30.get(r.id) ?? 0,
      lastViewedAt: lastView.get(r.id) ?? null,
      lastSeenAt: user?.lastSeenAt ?? null,
    };
  });
}

export type AdminPractitionerDetail = {
  id: string;
  displayName: string | null;
  slug: string | null;
  visibility: ProfileVisibility;
  completeness: number;
  region: string | null;
  modality: string | null; // enum value (map to a label at the edge)
  bio: string | null;
  values: string | null;
  website: string | null;
  title: string | null;
  specialties: string[]; // taxonomy ids
  credentials: string[];
  acceptingNew: boolean;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  fieldValues: unknown; // raw — server-side reads (triage + notes) only; never hand to a client whole
};

// One practitioner, full detail — for the admin detail/triage page. ADMIN-ONLY (page gates).
export async function getAdminPractitionerDetail(id: string): Promise<AdminPractitionerDetail | null> {
  const p = await db.practitioner.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      slug: true,
      visibility: true,
      completeness: true,
      region: true,
      modality: true,
      bio: true,
      values: true,
      website: true,
      specialties: true,
      createdAt: true,
      updatedAt: true,
      fieldValues: true,
      user: { select: { email: true } },
    },
  });
  if (!p) return null;
  const fv = p.fieldValues as Record<string, unknown> | null;
  const fstr = (k: string) => {
    const v = fv?.[k];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const { user, ...rest } = p;
  return {
    ...rest,
    title: fstr("title"),
    credentials: toStrings(fv?.credentials),
    acceptingNew: fstr("availability_state") === "accepting",
    email: user?.email ?? null,
  };
}

// Practitioners as completeness-reminder candidates (pre-filtering happens in the pure
// selectReminderRecipients). ADMIN-ONLY (page/action gate).
export async function getReminderCandidates(): Promise<ReminderCandidate[]> {
  const rows = await db.practitioner.findMany({
    take: 500,
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
    take: 500,
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

export type AdminFeedbackRow = {
  id: string;
  message: string;
  kind: string;
  email: string | null;
  path: string | null;
  userId: string | null;
  role: string | null;
  screenshotUrl: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

// All feedback, newest first. ADMIN-ONLY. Resilient: if the table isn't migrated yet it
// returns [] rather than 500-ing the admin.
export async function getFeedback(): Promise<AdminFeedbackRow[]> {
  try {
    return await db.feedback.findMany({ orderBy: [{ createdAt: "desc" }], take: 500 });
  } catch {
    return [];
  }
}

// Count of un-triaged feedback for the Overview "needs attention" tile. Resilient → 0.
export async function countNewFeedback(): Promise<number> {
  try {
    return await db.feedback.count({ where: { status: "NEW" } });
  } catch {
    return 0;
  }
}

// ── Seeker intakes (M2) ──────────────────────────────────────────────────────
export type AdminSeekerRow = {
  id: string;
  name: string;
  email: string;
  story: string;
  priorTherapy: string | null;
  stylePreference: string | null;
  lookingFor: string[];
  specialties: string[];
  region: string | null;
  format: string | null;
  ageGroup: string | null;
  genderPreference: string | null;
  usesInsurance: boolean | null;
  insuranceName: string | null;
  budgetNote: string | null;
  availability: string | null;
  urgency: string | null;
  status: string;
  createdAt: Date;
  matchCount: number; // practitioners already on Nora's shortlist (Phase 2)
};

// All seeker intakes, newest first. ADMIN-ONLY. Resilient: returns [] until the table is migrated.
export async function getSeekerIntakes(): Promise<AdminSeekerRow[]> {
  try {
    const rows = await db.seekerIntake.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 500,
      select: {
        id: true,
        name: true,
        email: true,
        story: true,
        priorTherapy: true,
        stylePreference: true,
        lookingFor: true,
        specialties: true,
        region: true,
        format: true,
        ageGroup: true,
        genderPreference: true,
        usesInsurance: true,
        insuranceName: true,
        budgetNote: true,
        availability: true,
        urgency: true,
        status: true,
        createdAt: true,
        _count: { select: { matches: true } },
      },
    });
    return rows.map(({ _count, ...r }) => ({ ...r, matchCount: _count.matches }));
  } catch {
    return [];
  }
}

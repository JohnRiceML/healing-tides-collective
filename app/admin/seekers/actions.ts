"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import type { SeekerIntakeStatus } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { INTAKE_STATUSES } from "@/lib/seeker-intake";
import { sendEmail } from "@/lib/email";
import { composeShortlistEmail } from "@/lib/shortlist-email";
import { getSeekerIntake } from "./_data";

type Result = { ok: true } | { ok: false; error: string };

const DENIED: Result = { ok: false, error: "Not allowed." };
const FAILED: Result = { ok: false, error: "Something went wrong — please try again." };

function revalidate(intakeId: string) {
  revalidatePath(`/admin/seekers/${intakeId}`);
  revalidatePath("/admin/seekers");
  revalidatePath("/admin");
}

/** Add a practitioner to this intake's shortlist (idempotent). Nudges NEW → REVIEWING. */
export async function addToShortlist(intakeId: string, practitionerId: string): Promise<Result> {
  if (!(await requireAdmin())) return DENIED;
  try {
    await db.match.upsert({
      where: { seekerIntakeId_practitionerId: { seekerIntakeId: intakeId, practitionerId } },
      update: {}, // already shortlisted → no-op
      create: { seekerIntakeId: intakeId, practitionerId, status: "SUGGESTED" },
    });
    // First pick on a brand-new intake → mark it as being worked.
    await db.seekerIntake.updateMany({ where: { id: intakeId, status: "NEW" }, data: { status: "REVIEWING" } });
    revalidate(intakeId);
    return { ok: true };
  } catch {
    return FAILED;
  }
}

/** Remove a practitioner from the shortlist. */
export async function removeFromShortlist(intakeId: string, practitionerId: string): Promise<Result> {
  if (!(await requireAdmin())) return DENIED;
  try {
    await db.match.deleteMany({ where: { seekerIntakeId: intakeId, practitionerId } });
    revalidate(intakeId);
    return { ok: true };
  } catch {
    return FAILED;
  }
}

/** Save Nora's "why I thought of them" note for one shortlisted practitioner. */
export async function setMatchReason(intakeId: string, practitionerId: string, reason: string): Promise<Result> {
  if (!(await requireAdmin())) return DENIED;
  const clean = reason.trim().slice(0, 500);
  try {
    await db.match.updateMany({
      where: { seekerIntakeId: intakeId, practitionerId },
      data: { reason: clean || null },
    });
    revalidate(intakeId);
    return { ok: true };
  } catch {
    return FAILED;
  }
}

/** Move the intake through its review lifecycle (NEW → REVIEWING → MATCHED → CLOSED). */
export async function setIntakeStatus(intakeId: string, status: string): Promise<Result> {
  if (!(await requireAdmin())) return DENIED;
  if (!INTAKE_STATUSES.some((s) => s.value === status)) return { ok: false, error: "Unknown status." };
  try {
    await db.seekerIntake.update({ where: { id: intakeId }, data: { status: status as SeekerIntakeStatus } });
    revalidate(intakeId);
    return { ok: true };
  } catch {
    return FAILED;
  }
}

/** Mark the shortlist delivered: every match → SENT, the intake → MATCHED. */
async function markSent(intakeId: string): Promise<void> {
  await db.match.updateMany({ where: { seekerIntakeId: intakeId }, data: { status: "SENT" } });
  await db.seekerIntake.update({ where: { id: intakeId }, data: { status: "MATCHED" as SeekerIntakeStatus } });
}

/**
 * Deliver the shortlist to the seeker. Tries Resend first; if email isn't configured (or the send
 * fails) it returns delivered:false so the workspace falls back to a prefilled mailto Nora sends
 * herself. Only marks SENT/MATCHED when the email actually went out.
 */
export async function sendShortlist(
  intakeId: string,
): Promise<{ ok: true; delivered: boolean } | { ok: false; error: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Not allowed." };
  const intake = await getSeekerIntake(intakeId);
  if (!intake) return { ok: false, error: "Couldn't load this intake." };
  const picks = intake.matches.map((m) => ({ displayName: m.displayName, slug: m.slug, reason: m.reason }));
  if (picks.length === 0) return { ok: false, error: "Add at least one practitioner to the shortlist first." };

  const email = composeShortlistEmail({ seekerName: intake.name, seekerEmail: intake.email, picks });
  try {
    const res = await sendEmail({ to: intake.email, subject: email.subject, html: email.html, text: email.text });
    if (res.ok) {
      await markSent(intakeId);
      revalidate(intakeId);
      return { ok: true, delivered: true };
    }
  } catch {
    /* fall through to the mailto fallback */
  }
  return { ok: true, delivered: false }; // not configured / failed → client opens the mailto
}

/** Manual confirmation: Nora sent the shortlist herself (the mailto path) → mark it delivered. */
export async function markShortlistSent(intakeId: string): Promise<Result> {
  if (!(await requireAdmin())) return DENIED;
  try {
    await markSent(intakeId);
    revalidate(intakeId);
    return { ok: true };
  } catch {
    return FAILED;
  }
}

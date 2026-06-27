"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import type { SeekerIntakeStatus } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { INTAKE_STATUSES } from "@/lib/seeker-intake";

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

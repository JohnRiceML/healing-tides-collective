"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { RESERVED_BADGES_KEY, sanitizeGrant } from "@/app/_lib/verification";
import { applyHold, applyRelease, coercePrev, readHold } from "@/app/_lib/moderation";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Grant/revoke a practitioner's verification badges. ADMIN-ONLY. Writes the reserved
 * `__verified` key inside the practitioner's fieldValues, preserving all of their own
 * fields. The practitioner's save path can never touch this key (see mergeFieldValues).
 */
export async function setVerificationBadges(
  practitionerId: string,
  badges: string[],
): Promise<{ ok: true; badges: string[] } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const clean = sanitizeGrant(badges);
  const current = await db.practitioner.findUnique({
    where: { id: practitionerId },
    select: { fieldValues: true },
  });
  if (!current) return { ok: false, error: "Practitioner not found." };

  const existing = (current.fieldValues ?? {}) as Record<string, unknown>;
  const next = { ...existing, [RESERVED_BADGES_KEY]: clean };

  try {
    await db.practitioner.update({
      where: { id: practitionerId },
      data: { fieldValues: next as Prisma.InputJsonValue },
    });
  } catch {
    return { ok: false, error: "Couldn't update — please try again." };
  }
  revalidatePath("/admin");
  revalidatePath("/practitioners", "layout"); // directory + every profile under it
  return { ok: true, badges: clean };
}

/**
 * Place a practitioner ON HOLD (hide from the public) or RELEASE them. ADMIN-ONLY.
 *
 * Migration-free: a hold sets visibility=HIDDEN and stores the reason + prior visibility
 * under the reserved `__hold` key (see app/_lib/moderation.ts); release restores them to
 * that prior visibility and clears the hold. The practitioner can still edit while held
 * but can't publish/unpublish (enforced in publish-actions.ts). Every action is recorded
 * in the `__holdHistory` audit trail. Neither key is touchable by the practitioner's own
 * save (mergeFieldValues strips `__` keys).
 */
export async function setProfileHold(
  practitionerId: string,
  input: { held: boolean; message?: string; internalNote?: string },
): Promise<{ ok: true; held: boolean } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const current = await db.practitioner.findUnique({
    where: { id: practitionerId },
    select: { visibility: true, fieldValues: true },
  });
  if (!current) return { ok: false, error: "Practitioner not found." };

  const by = admin.email?.trim() || "admin";
  const at = new Date().toISOString();

  try {
    if (input.held) {
      // Preserve the original prior-visibility if they're already held (re-holding to
      // edit the message shouldn't overwrite prev with HIDDEN).
      const alreadyHeld = readHold(current.fieldValues);
      const prev = alreadyHeld ? alreadyHeld.prev : coercePrev(current.visibility);
      const next = applyHold(current.fieldValues, {
        prev,
        message: input.message ?? "",
        internalNote: input.internalNote ?? "",
        by,
        at,
      });
      await db.practitioner.update({
        where: { id: practitionerId },
        data: { visibility: "HIDDEN", fieldValues: next as Prisma.InputJsonValue },
      });
    } else {
      const { fieldValues, restore } = applyRelease(current.fieldValues, { by, at });
      await db.practitioner.update({
        where: { id: practitionerId },
        data: { visibility: restore, fieldValues: fieldValues as Prisma.InputJsonValue },
      });
    }
  } catch {
    return { ok: false, error: "Couldn't update — please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/practitioners", "layout"); // directory + every profile under it
  revalidatePath("/practitioner"); // the held practitioner's own editor banner
  return { ok: true, held: input.held };
}

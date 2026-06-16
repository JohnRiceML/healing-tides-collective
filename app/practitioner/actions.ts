"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreatePractitioner } from "@/lib/auth";
import { completenessOf } from "@/lib/completeness";
import { mergeFieldValues } from "@/app/_lib/verification";
import { safeWebsite } from "@/lib/url";
import type { Modality, Prisma } from "@/lib/generated/prisma/client";

export type ProfileInput = {
  displayName: string;
  bio: string;
  website: string;
  values: string;
  modality: Modality | "";
  region: string;
  gender: string;
  specialties: string[];
  insuranceAccepted: string[];
  /** Nora's rich "Join the Collective" fields — stored in the fieldValues JSON column. */
  fieldValues?: Record<string, string | string[]>;
};

/**
 * Explicit opt-in: turn the signed-in user into a practitioner (create the profile
 * shell + promote the role) and send them into the editor. This is the ONLY UI path
 * that promotes — page GETs are read-only (`getPractitioner`), so merely visiting
 * `/practitioner` never makes a seeker a practitioner.
 */
export async function becomePractitioner() {
  const result = await getOrCreatePractitioner();
  if (!result) redirect("/join");
  revalidatePath("/practitioner");
  redirect("/practitioner/edit");
}

export async function saveProfile(input: ProfileInput) {
  // Re-derive the practitioner from the session — never trust a client-passed id.
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };

  const data = {
    displayName: input.displayName.trim() || null,
    bio: input.bio.trim() || null,
    website: safeWebsite(input.website),
    values: input.values.trim() || null,
    modality: input.modality || null,
    region: input.region.trim() || null,
    gender: input.gender.trim() || null,
    specialties: input.specialties,
    insuranceAccepted: input.insuranceAccepted,
  };

  const completeness = completenessOf(data);
  // Merge fieldValues so a practitioner save can't set or wipe reserved (`__`) keys
  // like the admin-granted `__verified` badges. Omitting fieldValues leaves them as-is.
  const fieldValuesUpdate = input.fieldValues
    ? {
        fieldValues: mergeFieldValues(
          result.practitioner.fieldValues,
          input.fieldValues,
        ) as Prisma.InputJsonValue,
      }
    : {};
  try {
    await db.practitioner.update({
      where: { id: result.practitioner.id },
      data: { ...data, completeness, ...fieldValuesUpdate },
    });
  } catch {
    return { ok: false as const, error: "Couldn't save your changes — please try again." };
  }
  revalidatePath("/practitioner");
  return { ok: true as const, completeness };
}

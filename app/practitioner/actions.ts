"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrCreatePractitioner } from "@/lib/auth";
import { completenessOf } from "@/lib/completeness";
import { safeWebsite } from "@/lib/url";
import type { Modality } from "@/lib/generated/prisma/client";

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
  try {
    await db.practitioner.update({
      where: { id: result.practitioner.id },
      data: {
        ...data,
        completeness,
        ...(input.fieldValues ? { fieldValues: input.fieldValues } : {}),
      },
    });
  } catch {
    return { ok: false as const, error: "Couldn't save your changes — please try again." };
  }
  revalidatePath("/practitioner");
  return { ok: true as const, completeness };
}

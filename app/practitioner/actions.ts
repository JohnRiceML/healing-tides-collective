"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrCreatePractitioner } from "@/lib/auth";
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
};

// Fields that count toward "completeness" — drives the nudge now and the upsell
// later ("you got X views; complete your profile to get more").
const COMPLETENESS_FIELDS = [
  "displayName", "bio", "values", "modality", "region",
  "gender", "specialties", "insuranceAccepted", "website",
] as const;

function completenessOf(p: Record<string, unknown>): number {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const v = p[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

export async function saveProfile(input: ProfileInput) {
  // Re-derive the practitioner from the session — never trust a client-passed id.
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };

  const data = {
    displayName: input.displayName.trim() || null,
    bio: input.bio.trim() || null,
    website: input.website.trim() || null,
    values: input.values.trim() || null,
    modality: input.modality || null,
    region: input.region.trim() || null,
    gender: input.gender.trim() || null,
    specialties: input.specialties,
    insuranceAccepted: input.insuranceAccepted,
  };

  const completeness = completenessOf(data);
  await db.practitioner.update({
    where: { id: result.practitioner.id },
    data: { ...data, completeness },
  });
  revalidatePath("/practitioner");
  return { ok: true as const, completeness };
}

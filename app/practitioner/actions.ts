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

// Normalize a practitioner-supplied website into a safe, link-able value: keep
// http(s) as-is, assume https:// for a bare domain, and DROP any other scheme
// (javascript:/data:/mailto:/…) so the public profile can never link to it.
function safeWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return null; // some non-http scheme → drop
  return `https://${t}`;
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
  try {
    await db.practitioner.update({
      where: { id: result.practitioner.id },
      data: { ...data, completeness },
    });
  } catch {
    return { ok: false as const, error: "Couldn't save your changes — please try again." };
  }
  revalidatePath("/practitioner");
  return { ok: true as const, completeness };
}

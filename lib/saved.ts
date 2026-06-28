// Read layer for a signed-in seeker's persisted "basket" (SavedPractitioner). Anonymous
// browsing keeps the basket client-side (ConsideringContext); this is the account-backed copy.
// Resilient by design: if the table isn't migrated yet, reads return [] rather than throwing.

import { db } from "@/lib/db";
import type { PractitionerCard } from "@/lib/practitioners";
import { grantedBadgesFrom } from "@/app/_lib/verification";

const fieldString = (fv: unknown, key: string): string | null => {
  const v = (fv as Record<string, unknown> | null)?.[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return null;
};

/** Published practitioners this user has saved, newest-first, mapped to the directory card shape. */
export async function getSavedForUser(userId: string): Promise<PractitionerCard[]> {
  try {
    const rows = await db.savedPractitioner.findMany({
      where: {
        userId,
        practitioner: { visibility: "PUBLISHED", slug: { not: null }, displayName: { not: null } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        practitioner: {
          select: {
            slug: true,
            displayName: true,
            bio: true,
            region: true,
            modality: true,
            specialties: true,
            photoUrl: true,
            featured: true,
            createdAt: true,
            fieldValues: true,
          },
        },
      },
    });

    return rows.map(({ practitioner: p }) => ({
      slug: p.slug as string,
      displayName: p.displayName as string,
      bio: p.bio,
      region: p.region,
      modality: p.modality,
      specialties: p.specialties,
      photoUrl: p.photoUrl,
      featured: p.featured,
      createdAt: p.createdAt,
      title: fieldString(p.fieldValues, "title"),
      coverDesign: fieldString(p.fieldValues, "cover_design"),
      coverColor: fieldString(p.fieldValues, "cover_color"),
      acceptingNew: fieldString(p.fieldValues, "availability_state") === "accepting",
      verificationBadges: grantedBadgesFrom(p.fieldValues),
    }));
  } catch {
    return [];
  }
}

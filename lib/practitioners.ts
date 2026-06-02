// Public read layer for published practitioner profiles. The ONLY place the
// directory (`/practitioners`) and the SEO profile page (`/practitioners/[slug]`)
// read practitioner data from — so the "published-only" rule lives in exactly one
// place. Read-only; never writes. Mutations live in app/practitioner/*-actions.ts.

import { db } from "@/lib/db";
import type { Modality } from "@/lib/generated/prisma/client";

/** Public-safe fields for a directory card. No userId, no internal billing state. */
export type PractitionerCard = {
  slug: string;
  displayName: string;
  bio: string | null;
  region: string | null;
  modality: Modality | null;
  specialties: string[];
  photoUrl: string | null;
  featured: boolean;
};

/** Full public profile (the slug page) = card + the long-form fields. */
export type PractitionerProfile = PractitionerCard & {
  website: string | null;
  values: string | null;
  gender: string | null;
  insuranceAccepted: string[];
  fieldValues: unknown;
  viewCount: number;
};

export type DirectoryFilters = {
  specialty?: string; // a SPECIALTY_OPTIONS id
  modality?: string; // a Modality enum value
  q?: string; // free-text search
};

const CARD_SELECT = {
  slug: true,
  displayName: true,
  bio: true,
  region: true,
  modality: true,
  specialties: true,
  photoUrl: true,
  featured: true,
} as const;

/**
 * Published practitioners for the public directory, newest-and-most-complete
 * first (featured pinned on top). Capped at 200 for the MVP — revisit with
 * pagination when the directory outgrows it.
 */
export async function getPublishedPractitioners(
  filters: DirectoryFilters = {},
): Promise<PractitionerCard[]> {
  const { specialty, modality, q } = filters;
  const rows = await db.practitioner.findMany({
    where: {
      visibility: "PUBLISHED",
      slug: { not: null },
      displayName: { not: null },
      ...(specialty ? { specialties: { has: specialty } } : {}),
      ...(modality ? { modality: modality as Modality } : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
              { region: { contains: q, mode: "insensitive" } },
              { values: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: CARD_SELECT,
    orderBy: [{ featured: "desc" }, { completeness: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });
  // slug + displayName are non-null by the where-filter above; tighten the type.
  return rows.map((r) => ({
    ...r,
    slug: r.slug as string,
    displayName: r.displayName as string,
  }));
}

/** A single PUBLISHED profile by slug, or null (404) if missing/unpublished. */
export async function getPractitionerBySlug(
  slug: string,
): Promise<PractitionerProfile | null> {
  const r = await db.practitioner.findFirst({
    where: { slug, visibility: "PUBLISHED" },
    select: {
      ...CARD_SELECT,
      website: true,
      values: true,
      gender: true,
      insuranceAccepted: true,
      fieldValues: true,
      viewCount: true,
    },
  });
  if (!r || !r.slug || !r.displayName) return null;
  return { ...r, slug: r.slug, displayName: r.displayName };
}

/** Every published slug — for the sitemap. */
export async function getPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const rows = await db.practitioner.findMany({
    where: { visibility: "PUBLISHED", slug: { not: null }, displayName: { not: null } },
    select: { slug: true, updatedAt: true },
  });
  return rows.map((r) => ({ slug: r.slug as string, updatedAt: r.updatedAt }));
}

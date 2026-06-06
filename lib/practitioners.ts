// Public read layer for published practitioner profiles. The ONLY place the
// directory (`/practitioners`) and the SEO profile page (`/practitioners/[slug]`)
// read practitioner data from — so the "published-only" rule lives in exactly one
// place. Read-only; never writes. Mutations live in app/practitioner/*-actions.ts.

import { db } from "@/lib/db";
import type { Modality, Prisma } from "@/lib/generated/prisma/client";
import { grantedBadgesFrom } from "@/app/_lib/verification";

/** Read a trimmed string out of a fieldValues blob, or null. */
function fieldString(fieldValues: unknown, key: string): string | null {
  const v = (fieldValues as Record<string, unknown> | null | undefined)?.[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  // chips fields can store the value as a single-element array
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return null;
}

/** How the directory is ordered. "recommended" is the default editorial order. */
export type SortKey = "recommended" | "newest" | "name";

export function normalizeSort(value: string | undefined): SortKey {
  return value === "newest" || value === "name" ? value : "recommended";
}

const ORDER_BY: Record<SortKey, Prisma.PractitionerOrderByWithRelationInput[]> = {
  recommended: [{ featured: "desc" }, { completeness: "desc" }, { updatedAt: "desc" }],
  newest: [{ createdAt: "desc" }],
  name: [{ displayName: "asc" }],
};

/** Public-safe fields for a directory card. No userId, no internal billing state. */
export type PractitionerCard = {
  slug: string;
  displayName: string;
  bio: string | null;
  region: string | null;
  modality: Modality | null;
  title: string | null; // professional title / role, shown as the card eyebrow
  specialties: string[];
  photoUrl: string | null;
  coverTheme: string | null; // chosen cover palette (fieldValues.cover_theme); null → default
  featured: boolean;
  acceptingNew: boolean; // availability_state === "accepting" → "Accepting new clients" badge
  createdAt: Date; // for the Founding Member badge
  verificationBadges: string[]; // admin-granted badge ids (from the reserved fieldValues key)
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
  region?: string; // an exact region string (from the Location dropdown / getDistinctRegions)
  q?: string; // free-text search
  gender?: string; // free-text, matched case-insensitively (contains) — backend-only, not in the UI
  acceptingNew?: boolean; // availability_state === "accepting" (fieldValues JSON path)
};

/**
 * Build the Prisma `where` for the public directory from a set of filters.
 * Pure (no DB) so it's unit-testable. Always pins the "published, named, slugged"
 * base; every user-supplied filter is additive and omitted when absent.
 *
 * Note (insurance): `insuranceAccepted` is a free-text `String[]`, so there's no
 * reliable option list to match against — an exact `has` filter would silently
 * return nothing for almost every query. We deliberately DON'T expose an insurance
 * filter until those values are normalized to a controlled vocabulary.
 */
export function buildPractitionerWhere(filters: DirectoryFilters = {}) {
  const { specialty, modality, region, q, gender, acceptingNew } = filters;
  return {
    visibility: "PUBLISHED" as const,
    slug: { not: null },
    displayName: { not: null },
    ...(specialty ? { specialties: { has: specialty } } : {}),
    ...(modality ? { modality: modality as Modality } : {}),
    ...(region ? { region: { equals: region } } : {}),
    ...(gender ? { gender: { contains: gender, mode: "insensitive" as const } } : {}),
    ...(acceptingNew
      ? { fieldValues: { path: ["availability_state"], equals: "accepting" } }
      : {}),
    ...(q
      ? {
          OR: [
            { displayName: { contains: q, mode: "insensitive" as const } },
            { bio: { contains: q, mode: "insensitive" as const } },
            { region: { contains: q, mode: "insensitive" as const } },
            { values: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

const CARD_SELECT = {
  slug: true,
  displayName: true,
  bio: true,
  region: true,
  modality: true,
  specialties: true,
  photoUrl: true,
  featured: true,
  createdAt: true,
  fieldValues: true, // read-only here — used to derive verificationBadges
} as const;

/**
 * Published practitioners for the public directory, newest-and-most-complete
 * first (featured pinned on top). Capped at 200 for the MVP — revisit with
 * pagination when the directory outgrows it.
 */
export async function getPublishedPractitioners(
  filters: DirectoryFilters = {},
  sort: SortKey = "recommended",
): Promise<PractitionerCard[]> {
  const rows = await db.practitioner.findMany({
    where: buildPractitionerWhere(filters),
    select: CARD_SELECT,
    orderBy: ORDER_BY[sort],
    take: 200,
  });
  // slug + displayName are non-null by the where-filter above; tighten the type.
  // Strip raw fieldValues from the card payload — only derived bits leave here.
  return rows.map(({ fieldValues, ...r }) => ({
    ...r,
    slug: r.slug as string,
    displayName: r.displayName as string,
    title: fieldString(fieldValues, "title"),
    coverTheme: fieldString(fieldValues, "cover_theme"),
    acceptingNew: fieldString(fieldValues, "availability_state") === "accepting",
    verificationBadges: grantedBadgesFrom(fieldValues),
  }));
}

/** Distinct regions across published profiles — populates the Location filter. */
export async function getDistinctRegions(): Promise<string[]> {
  const rows = await db.practitioner.findMany({
    where: {
      visibility: "PUBLISHED",
      slug: { not: null },
      displayName: { not: null },
      region: { not: null },
    },
    select: { region: true },
    distinct: ["region"],
    orderBy: { region: "asc" },
    take: 200,
  });
  return rows.map((r) => r.region as string).filter(Boolean);
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
  return {
    ...r,
    slug: r.slug,
    displayName: r.displayName,
    title: fieldString(r.fieldValues, "title"),
    coverTheme: fieldString(r.fieldValues, "cover_theme"),
    acceptingNew: fieldString(r.fieldValues, "availability_state") === "accepting",
    verificationBadges: grantedBadgesFrom(r.fieldValues),
  };
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

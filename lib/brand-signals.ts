// lib/brand-signals.ts — assemble the BrandSignals a practitioner's own profile + last
// cached presence scan imply. PURE: the single place that maps a Practitioner row onto the
// brand framework's inputs, so the dashboard's compact tiles and the full brand center never
// drift out of sync. Serper-backed signals come only from the cached scan (never invented).

import type { BrandSignals } from "@/lib/brand";
import { brandSignalsFromScan, type PresenceScan } from "@/lib/presence-scan";

type PractitionerLike = {
  visibility: string;
  completeness: number;
  bio: string | null;
  values: string | null;
  photoUrl: string | null;
  modality: unknown;
  website: string | null;
  region: string | null;
  specialties: string[];
};

export function buildBrandSignals(
  p: PractitionerLike,
  weekly: { thisWeek: number; total: number },
  scan: PresenceScan | null,
): BrandSignals {
  return {
    published: p.visibility === "PUBLISHED",
    completeness: p.completeness,
    hasBio: Boolean(p.bio?.trim()),
    hasValues: Boolean(p.values?.trim()),
    hasPhoto: Boolean(p.photoUrl?.trim()),
    hasModality: Boolean(p.modality),
    hasWebsite: Boolean(p.website?.trim()),
    hasRegion: Boolean(p.region?.trim()),
    specialtiesCount: p.specialties?.length ?? 0,
    weeklyViews: { thisWeek: weekly.thisWeek, total: weekly.total },
    ...brandSignalsFromScan(scan),
  };
}

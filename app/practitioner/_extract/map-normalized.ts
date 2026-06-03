// Map a NormalizedProfile (from structured data) onto our profile fields, producing
// a fill-ready ImportData fragment + the human labels of what was filled (for the
// status bar) + verified facts we have no field for yet (license, phone) + any
// focus areas that didn't map to a category.

import type { NormalizedProfile } from "./parse-structured-data";
import { matchSpecialties } from "./taxonomy-match";
import type { ImportData, ImportExtra } from "./types";

export interface SourceContribution {
  data: ImportData;
  /** Human field labels this source filled — e.g. ["Name", "Bio", "10 focus areas"]. */
  contributed: string[];
  /** Verified facts with no profile field yet (read-only in the UI). */
  extras: ImportExtra[];
  /** knowsAbout topics that matched no category. */
  unmapped: string[];
  /** A remote headshot we found (not auto-applied — the editor offers to adopt it into Blob). */
  suggestedPhotoUrl?: string;
}

function formatRegion(loc: NonNullable<NormalizedProfile["location"]>): string | undefined {
  if (loc.city && loc.region) return `${loc.city}, ${loc.region}`;
  return loc.city ?? loc.region ?? loc.postalCode ?? undefined;
}

/** Structured profile → our fields. Facts only — narrative (values, ideal client) is the LLM's job. */
export function mapNormalized(n: NormalizedProfile, host: string): SourceContribution {
  const data: ImportData = { fields: {} };
  const contributed: string[] = [];
  const extras: ImportExtra[] = [];
  let unmapped: string[] = [];

  if (n.name) {
    data.displayName = n.name;
    contributed.push("Name");
  }
  if (n.bio) {
    data.bio = n.bio;
    contributed.push("Bio");
  }
  if (n.location) {
    const r = formatRegion(n.location);
    if (r) {
      data.region = r;
      contributed.push("Location");
    }
  }
  if (n.specialties?.length) {
    const { matched, unmatched } = matchSpecialties(n.specialties);
    if (matched.length) {
      data.specialties = matched;
      contributed.push(`${matched.length} focus area${matched.length > 1 ? "s" : ""}`);
    }
    unmapped = unmatched;
  }
  if (n.credentials) {
    const tokens = n.credentials
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length) {
      data.fields.credentials = tokens;
      contributed.push("Credentials");
    }
  }
  if (n.title) {
    data.fields.title = n.title;
    contributed.push("Professional title");
  }
  if (n.education?.length) {
    data.fields.education = n.education.join("\n");
    contributed.push("Education");
  }
  if (n.website) {
    data.website = n.website;
    contributed.push("Website");
  }

  // Verified facts with no field home yet — surfaced read-only so nothing's lost.
  if (n.license && (n.license.number || n.license.state)) {
    const value = [n.license.number ? `#${n.license.number}` : null, n.license.state]
      .filter(Boolean)
      .join(" · ");
    extras.push({ label: "License", value, source: host });
  }
  if (n.telephone) extras.push({ label: "Phone", value: n.telephone, source: host });

  return { data, contributed, extras, unmapped, suggestedPhotoUrl: n.imageUrl };
}

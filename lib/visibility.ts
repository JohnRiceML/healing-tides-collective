// Local-visibility audit logic — pure + unit-tested. Given a practitioner's
// specialties + region, it builds the local-intent queries a seeker would actually
// type ("somatic therapy Saint Paul"), and evaluates a SERP page to see whether the
// practitioner shows up (via their own website, their Healing Tides profile, or a
// name match) and who's ranking ahead of them.
//
// The network call (lib/serper) is kept OUT of this module so the matching logic is
// deterministic and testable.

import { specialtyLabel } from "@/app/_lib/taxonomy";
import type { SerpResult } from "@/lib/serper";

export type VisibilityIdentity = {
  name: string;
  domain: string | null; // their own website host (lowercased, no www), if any
  profilePath: string; // "/practitioners/{slug}", or "" if unpublished
};

export type QueryVisibility = {
  query: string;
  found: boolean;
  position: number | null; // best position they appear at, else null
  via: "website" | "profile" | "name" | null;
  competitors: string[]; // up to 3 organic titles ranking ahead that aren't them
};

/** Normalize a URL's hostname: lowercase, strip a leading www. Null if unparseable. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The local-intent queries to audit — up to `limit`, from the practitioner's top
 * specialties + their region. Returns [] when there's no region (a local query needs
 * a place); falls back to "therapist {place}" when no specialties are set yet.
 */
export function buildAuditQueries(
  specialtyIds: string[],
  region: string | null,
  limit = 3,
): string[] {
  const place = (region ?? "").trim();
  if (!place) return [];
  const labels = specialtyIds
    .slice(0, limit)
    .map((id) => specialtyLabel(id))
    .filter((l) => l && l.trim());
  const seeds = labels.length ? labels : ["therapist"];
  return seeds.slice(0, limit).map((label) => `${label} ${place}`);
}

/** Which signal, if any, marks this SERP result as the practitioner's own. */
function matchVia(r: SerpResult, id: VisibilityIdentity): QueryVisibility["via"] {
  const host = hostOf(r.link);
  if (id.domain && host && host === id.domain) return "website";
  if (id.profilePath && r.link.includes(id.profilePath)) return "profile";
  // Word-boundary match so "Sam" doesn't count "Samsara Wellness" as a hit.
  const name = id.name.trim();
  if (name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(r.title)) return "name";
  }
  return null;
}

/** Evaluate one query's SERP page against the practitioner's identity. */
export function evaluateQuery(
  query: string,
  results: SerpResult[],
  id: VisibilityIdentity,
): QueryVisibility {
  let found = false;
  let position: number | null = null;
  let via: QueryVisibility["via"] = null;
  const competitors: string[] = [];

  for (const r of results) {
    const kind = matchVia(r, id);
    if (kind) {
      if (!found) {
        found = true;
        position = r.position;
        via = kind;
      }
    } else if (competitors.length < 3 && r.title.trim()) {
      competitors.push(r.title.trim());
    }
  }

  return { query, found, position, via, competitors };
}

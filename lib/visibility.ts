// Local-visibility audit logic — pure + unit-tested. Given a practitioner's
// specialties + region, it builds the local-intent queries a seeker would actually
// type ("somatic therapy Saint Paul"), and evaluates a SERP page to see whether the
// practitioner shows up (via their own website, their Healing Tides profile, or a
// name match) and who's ranking ahead of them.
//
// The network call (lib/serper) is kept OUT of this module so the matching logic is
// deterministic and testable.

import { CATEGORIES, specialtyLabel } from "@/app/_lib/taxonomy";
import type { SerpResult, SerpPage } from "@/lib/serper";

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

// ── Coverage ──────────────────────────────────────────────────────────────
// A richer, calmer read than the audit: instead of "ranking" a handful of
// specialty queries, it expands each Area of Focus into the warmer subcategory
// phrases seekers actually type ("Trauma & Recovery" → "Trauma Healing",
// "Nervous System Healing", "Addiction & Recovery"), checks whether the
// practitioner appears, and surfaces the seeker's own follow-on questions +
// related searches as open doors. Wins lead (appear-first ordering); gaps are
// framed as opportunities, never as a rank or a deficit.

export type TermCoverage = {
  query: string;
  label: string;
  found: boolean;
  position: number | null;
  via: "website" | "profile" | "name" | null;
  competitors: string[];
};

export type Coverage = {
  terms: TermCoverage[];
  appeared: number;
  total: number;
  questions: string[];
  relatedSearches: string[];
};

/**
 * Expand each selected Area-of-Focus id into the coverage queries to check.
 *
 * For every specialty id we look it up in CATEGORIES and expand to its
 * SUBCATEGORY LABELS — the richer phrases seekers actually search ("Trauma
 * Healing", "Nervous System Healing") rather than the broad category bucket.
 * If the id resolves to no subcategories (it's already a subcategory id, or an
 * unknown id), we fall back to its own label via `specialtyLabel`. Each label
 * becomes a "{label} {region}" query. Results are de-duped (by query) and
 * capped at `limit`. Returns [] when there's no region — a local query needs a
 * place.
 */
export function buildCoverageQueries(
  specialtyIds: string[],
  region: string | null,
  limit = 8,
): { id: string; label: string; query: string }[] {
  const place = (region ?? "").trim();
  if (!place) return [];

  const out: { id: string; label: string; query: string }[] = [];
  const seen = new Set<string>();

  const push = (id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const query = `${trimmed} ${place}`;
    const key = query.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id, label: trimmed, query });
  };

  for (const id of specialtyIds) {
    const category = CATEGORIES.find((c) => c.id === id);
    if (category && category.subcategories.length) {
      for (const sub of category.subcategories) push(sub.id, sub.label);
    } else {
      // already a subcategory id, or unknown → fall back to its own label.
      push(id, specialtyLabel(id));
    }
  }

  return out.slice(0, limit);
}

/** How close a not-yet-found term is to appearing — smaller is a nearer door. */
function opportunityRank(t: TermCoverage): number {
  if (t.found) return 0; // appeared — handled before this is consulted
  // A page-2-ish near-miss (we saw them deep) is a nearer door than total absence.
  if (t.position != null) return 1;
  return 2; // clearly absent
}

/** Dedupe a list of strings (case-insensitively, first wins) and cap its length. */
function dedupeCap(values: string[], cap: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of values) {
    const v = (raw ?? "").trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= cap) break;
  }
  return out;
}

/**
 * Assemble a Coverage read from each term's SERP page. Evaluates every page
 * with `evaluateQuery`, orders appeared-terms first (wins lead) then by nearest
 * opportunity, counts how many appeared, and de-dupes the union of all
 * "People also ask" questions + related searches into two capped lists of open
 * doors.
 */
export function buildCoverage(
  perTerm: { query: string; label: string; page: SerpPage }[],
  identity: VisibilityIdentity,
): Coverage {
  const terms: TermCoverage[] = perTerm.map(({ query, label, page }) => {
    const v = evaluateQuery(query, page.organic, identity);
    return {
      query,
      label,
      found: v.found,
      position: v.position,
      via: v.via,
      competitors: v.competitors,
    };
  });

  // Appear-first; within each bucket, nearer opportunities lead, then by the
  // best position so a strong showing sits above a deeper one. Stable for ties.
  const ordered = terms
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      if (a.t.found !== b.t.found) return a.t.found ? -1 : 1;
      const oppDelta = opportunityRank(a.t) - opportunityRank(b.t);
      if (oppDelta !== 0) return oppDelta;
      const pa = a.t.position ?? Number.POSITIVE_INFINITY;
      const pb = b.t.position ?? Number.POSITIVE_INFINITY;
      if (pa !== pb) return pa - pb;
      return a.i - b.i;
    })
    .map(({ t }) => t);

  const appeared = ordered.filter((t) => t.found).length;

  const questions = dedupeCap(
    perTerm.flatMap((p) => p.page.peopleAlsoAsk),
    8,
  );
  const relatedSearches = dedupeCap(
    perTerm.flatMap((p) => p.page.relatedSearches),
    8,
  );

  return { terms: ordered, appeared, total: ordered.length, questions, relatedSearches };
}

// Pure matching helper for the Phase-2 admin matching workspace.
//
// This is deliberately NOT a fit score / ranker — see
// docs/decisions/0001-matching-workspace-curation-not-ranker.md. It produces a
// TRANSPARENT OVERLAP READ: for each constraint the seeker actually stated, does this
// candidate satisfy it? The workspace renders the result as reasons (chips), and uses
// `hits` only to ORDER the candidate list. `hits` is never shown as a number.
//
// Client-safe (no db import) so it can run in the server component or be unit-tested.

import { specialtyLabel } from "@/app/_lib/taxonomy";

/** A practitioner's matchable signals — the clean, structured fields that exist today. */
export type CandidateSignals = {
  specialties: string[]; // SPECIALTY_OPTIONS ids
  modality: string | null; // Modality enum: IN_PERSON | HYBRID | VIRTUAL (session format axis)
  region: string | null; // free text
  insuranceAccepted: string[]; // free text
  gender: string | null; // free text
  acceptingNew: boolean;
};

/** The seeker's stated constraints — only the ones we can compare cleanly today. */
export type SeekerSignals = {
  specialties: string[]; // SPECIALTY_OPTIONS ids
  format: string | null; // in_person | virtual | either
  region: string | null; // free text
  usesInsurance: boolean | null;
  insuranceName: string | null; // free text plan name
  genderPreference: string | null; // free text
};

/** One stated constraint, with whether this candidate satisfies it. `soft` = fuzzy/free-text match. */
export type MatchFact = { label: string; hit: boolean; soft?: boolean };

export type CandidateRelevance = {
  facts: MatchFact[]; // every constraint the seeker stated, hit or miss (empty if they stated none)
  hits: number; // satisfied constraints — ORDERING ONLY, never rendered as a score
  notAcceptingNew: boolean; // a soft rule-out flag, surfaced but not auto-excluded
};

const norm = (s: string) => s.trim().toLowerCase();

/** Does a candidate's session format satisfy the seeker's format preference? HYBRID covers both. */
function formatSatisfies(seekerFormat: string, modality: string | null): boolean {
  if (!modality) return false;
  if (seekerFormat === "either") return true;
  if (seekerFormat === "in_person") return modality === "IN_PERSON" || modality === "HYBRID";
  if (seekerFormat === "virtual") return modality === "VIRTUAL" || modality === "HYBRID";
  return false;
}

/**
 * Compute the overlap read for one candidate against one seeker intake.
 * Only constraints the seeker actually stated become facts — an unstated preference is
 * not a "miss," it's simply absent (so candidates aren't penalized for what wasn't asked).
 */
export function candidateRelevance(seeker: SeekerSignals, candidate: CandidateSignals): CandidateRelevance {
  const facts: MatchFact[] = [];

  // Specialty overlap — one fact per specialty the seeker named (hard-ish: controlled vocab).
  for (const id of seeker.specialties) {
    facts.push({ label: `Focus: ${specialtyLabel(id)}`, hit: candidate.specialties.includes(id) });
  }

  // Session format — hard-ish (enum vs. controlled choice).
  if (seeker.format && seeker.format !== "either") {
    const label = seeker.format === "in_person" ? "In person" : "Virtual";
    facts.push({ label, hit: formatSatisfies(seeker.format, candidate.modality) });
  }

  // Insurance — only a constraint when the seeker wants to use it AND named a plan. Free text → soft.
  if (seeker.usesInsurance === true && seeker.insuranceName) {
    const want = norm(seeker.insuranceName);
    const hit = candidate.insuranceAccepted.some((p) => norm(p).includes(want) || want.includes(norm(p)));
    facts.push({ label: `Accepts ${seeker.insuranceName}`, hit, soft: true });
  }

  // Region — free text both sides → soft, never a hard drop.
  if (seeker.region) {
    const a = norm(seeker.region);
    const b = candidate.region ? norm(candidate.region) : "";
    facts.push({ label: `Near ${seeker.region}`, hit: Boolean(b) && (a.includes(b) || b.includes(a)), soft: true });
  }

  // Gender preference — free text → soft (e.g. seeker "female", practitioner "Female, she/her").
  if (seeker.genderPreference) {
    const a = norm(seeker.genderPreference);
    const b = candidate.gender ? norm(candidate.gender) : "";
    facts.push({ label: `Prefers ${seeker.genderPreference}`, hit: Boolean(b) && b.includes(a), soft: true });
  }

  return {
    facts,
    hits: facts.filter((f) => f.hit).length,
    notAcceptingNew: !candidate.acceptingNew,
  };
}

/**
 * Stable ordering for the candidate list: more satisfied constraints first, then practitioners
 * accepting new clients ahead of those who aren't. Pure comparator over precomputed relevance.
 * Ties keep input order (the caller's read is already editorially sorted).
 */
export function compareByRelevance(
  a: { relevance: CandidateRelevance },
  b: { relevance: CandidateRelevance },
): number {
  if (a.relevance.hits !== b.relevance.hits) return b.relevance.hits - a.relevance.hits;
  if (a.relevance.notAcceptingNew !== b.relevance.notAcceptingNew) return a.relevance.notAcceptingNew ? 1 : -1;
  return 0;
}

// lib/seeker-language.ts — turn a cached presence scan into the calm "what the right people
// near you are searching" understanding. PURE (no DB/React/network).
//
// Three honest reads, all from data we already fetched:
//   • showingUpFor — the exact phrases they already appear for (the phrase IS the understanding)
//   • questions    — the real questions seekers near them ask (Google "people also ask")
//   • words        — the words seekers actually type (Google "related searches"), each mirrored
//                    against the practitioner's OWN words: does their bio already echo it, or is
//                    it an open door?
//
// HONESTY / BRAND LAW: never invent. No scores, no ranking. The say/search mirror is an
// invitation ("if it's true to you"), never keyword-stuffing pressure or a deficit.

import type { PresenceScan } from "@/lib/presence-scan";

/** One seeker phrase, with whether the practitioner's own words already echo it. */
export type SeekerWord = { term: string; echoed: boolean };

export type SeekerLanguage = {
  /** True once a scan has captured the seeker's voice (questions or words or appearances). */
  hasData: boolean;
  /** Exact phrases the practitioner already appears for. */
  showingUpFor: string[];
  /** Real questions seekers near them are asking. */
  questions: string[];
  /** Words seekers type, each mirrored against the practitioner's own language. */
  words: SeekerWord[];
};

// Light stopwords: filler + the generic role/geo words that say nothing about a practitioner's
// niche, so the say/search mirror keys on the meaningful care words, not "therapy near me".
const STOP = new Set([
  "the", "and", "for", "with", "near", "you", "your", "are", "that", "this", "what", "how",
  "who", "why", "does", "can", "from", "into", "out", "about", "they", "their",
  "therapy", "therapist", "therapists", "counseling", "counselling", "counselor", "near", "me",
]);

/** Fold accents (café → cafe) so spelling variants still line up. */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/** Light stem: drop a trailing plural "s" so "couples" lines up with "couple". Both sides are
 *  stemmed the same way, so even an imperfect stem stays internally consistent. */
function stem(w: string): string {
  return w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w;
}

/** The set of whole-word tokens in a text (folded, >3 chars, stemmed) — for word-boundary
 *  matching so "body" never matches inside "somebody". */
function tokenSet(text: string): Set<string> {
  return new Set(fold(text).split(/[^a-z]+/).filter((w) => w.length > 3).map(stem));
}

/** Meaningful CARE tokens of a phrase: >3 chars, not a stopword, not a caller-excluded word. */
function significantWords(phrase: string, exclude: Set<string>): string[] {
  return fold(phrase)
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3 && !STOP.has(w) && !exclude.has(w))
    .map(stem);
}

/**
 * Echoed only when EVERY meaningful care-word of the phrase appears as a whole word in the
 * practitioner's own text. Strict on purpose: a false "you already say this" would be a lie that
 * steers them away from a real modality, so we'd rather call a partial match an open door.
 */
function echoes(words: string[], profileTokens: Set<string>): boolean {
  return words.length > 0 && words.every((w) => profileTokens.has(w));
}

/**
 * Build the seeker-language understanding from the last cached scan + the practitioner's own
 * words (bio, values, specialty labels, joined). When there's no scan yet, hasData is false and
 * the UI shows a calm invitation to run a check — never an empty or invented read.
 *
 * `opts.exclude` lets the caller drop words that aren't about the practitioner's niche — chiefly
 * their REGION (which appears in nearly every local search AND in their profile, and would
 * otherwise create false "you already say this" echoes). Pass the region here.
 */
export function deriveSeekerLanguage(
  scan: PresenceScan | null,
  profileText: string,
  opts: { exclude?: string[] } = {},
): SeekerLanguage {
  const profileTokens = tokenSet(profileText);
  const exclude = new Set(
    (opts.exclude ?? [])
      .flatMap((s) => fold(s).split(/[^a-z]+/))
      .filter((w) => w.length > 2),
  );
  const questions = scan?.questions ?? [];
  const related = scan?.relatedSearches ?? [];
  const showingUpFor = scan?.foundTerms ?? [];
  return {
    hasData: Boolean(scan && (questions.length || related.length || showingUpFor.length)),
    showingUpFor,
    questions,
    words: related.map((term) => ({
      term,
      echoed: echoes(significantWords(term, exclude), profileTokens),
    })),
  };
}

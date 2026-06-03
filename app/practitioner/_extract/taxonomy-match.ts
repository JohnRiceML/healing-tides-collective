// Map free-text focus areas (e.g. Psychology Today's `knowsAbout`:
// "Anxiety, Body Positivity, Depression, Divorce, Relationship Issues, …") onto our
// taxonomy's top-level CATEGORY ids — the unit practitioners actually select as
// "Areas of focus". We match against a gazetteer built from every category label,
// subcategory label, AND topic, so "Divorce" → relationships_connection (via the
// "Divorce & Separation" subcategory) and "Anxiety" → emotional_wellbeing.
//
// Anything that matches nothing is returned as `unmatched` (original casing) so the
// UI can nudge the practitioner to pick the closest category, rather than silently
// dropping or force-mapping it.

import { CATEGORIES } from "@/app/_lib/taxonomy";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

type Lemma = { text: string; categoryId: string; weight: number };

const LEXICON: Lemma[] = [];
for (const c of CATEGORIES) {
  LEXICON.push({ text: norm(c.label), categoryId: c.id, weight: 3 });
  for (const s of c.subcategories) {
    LEXICON.push({ text: norm(s.label), categoryId: c.id, weight: 2 });
    for (const t of s.topics) LEXICON.push({ text: norm(t), categoryId: c.id, weight: 1 });
  }
}

function sharesToken(a: string, b: string): boolean {
  const A = new Set(a.split(" ").filter((t) => t.length >= 4));
  return b.split(" ").some((t) => t.length >= 4 && A.has(t));
}

export type SpecialtyMatch = {
  /** Distinct category ids, ranked best-first, capped at `limit`. */
  matched: string[];
  /** Input topics that matched no category (original casing). */
  unmatched: string[];
};

/**
 * Match free-text topics to category ids. `limit` defaults to 8 (Nora's 3–8 rule).
 */
export function matchSpecialties(topics: string[], limit = 8): SpecialtyMatch {
  const scores = new Map<string, number>();
  const unmatched: string[] = [];

  for (const raw of topics) {
    const q = norm(raw);
    if (!q) continue;
    let best: { categoryId: string; score: number } | null = null;
    for (const lem of LEXICON) {
      const hit =
        (lem.text.length >= 4 && q.includes(lem.text)) ||
        (q.length >= 4 && lem.text.includes(q)) ||
        sharesToken(q, lem.text);
      if (hit) {
        const score = lem.weight + (lem.text === q ? 2 : 0);
        if (!best || score > best.score) best = { categoryId: lem.categoryId, score };
      }
    }
    if (best) scores.set(best.categoryId, Math.max(scores.get(best.categoryId) ?? 0, best.score));
    else unmatched.push(raw.trim());
  }

  const matched = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit);

  return { matched, unmatched };
}

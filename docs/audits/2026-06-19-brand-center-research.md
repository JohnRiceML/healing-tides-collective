# Brand-center research & honest audit — 2026-06-19

A 5-specialist research team (brand-growth expert · overwhelm/calm-UX · state-local findability ·
internal audit · fun/guided design) reviewed what we've built for `/practitioner/brand` against the
evidence for this audience: **solo MN wellness/therapy practitioners — caring, time-poor, averse to
self-promotion, mostly do NOT think of themselves as "a brand," often perfectionism-prone.**

## The thesis (protect this above all)
Every lens converged: the winning frame for this audience is **"marketing = service / helping the
right person find help," not self-promotion.** The build already embodies it (seeker-centered
"why care," "findable not promotional," doorways-not-deficits). It is the product's single biggest
asset. Make it explicit: a line like *"This isn't marketing — it's helping the right person find
help"* where a nervous first-timer sees it immediately.

## 🔴 Two serious issues

1. **COMPLIANCE LANDMINE (high confidence — fix regardless).** `lib/brand.ts whyTrusted()` coaches
   practitioners to *solicit* client reviews/testimonials ("invite a client or two to share their
   experience"). ACA/APA/AAMFT/NASW/NBCC ethics codes **prohibit soliciting testimonials from current
   AND former clients**; MN LPC/LPCCs are ACA-governed. Advising this can put a licensed counselor in
   violation. **Fix:** reframe "why you're trusted" toward ethics-safe signals — credentials shown
   plainly, professional/colleague endorsement, a linked website, directory presence. Keep *reading*
   existing reviews (`reviewsKnown`); never *coach* solicitation.

2. **The 0–100 scores may be the wrong form for this audience (4 of 5 lenses + gamification research).**
   A visible number risks making a scoring-averse, perfectionism-prone, self-promotion-averse audience
   feel **judged/graded** — the opposite of calm — and it contradicts the codebase's own prior "no
   scores" law. The *concreteness* John wanted is right; the **raw number** is the risky part. The moon
   fill + named stage (Forming / On its way) + the guided "why it matters" already give concreteness
   without a number to flinch at. **Options:** keep · soften (demote the big "/100", reveal per-part on
   tap, or a qualitative ladder) · drop the digits, keep the moons. → *Founder's call.*

## 🟠 A real correctness bug
3. **Serper is never geo-targeted.** We append region as a string ("somatic therapy Saint Paul") but
   never pass Serper a `location` geo-target, so the SERP/map-pack we score is the *server's* location
   (default US), **not the practitioner's locale** — a single city can change 50–60% of results. So the
   read everything is scored against may not be what real local seekers near them see. **Fix:** thread
   an optional `location` ("City, State, United States") into `searchSerpPage`/`searchPlaces` and pass
   it from the practitioner's place. Capture city + state separately (today it's one free-text field).

## The "it's overwhelming to them" gaps (the user's core worry)
- **No guided first-run / "what is a brand" framing.** A new practitioner lands on 5+ scored sections at
  once — violates the product's own "one thing at a time" rule. **#1 recommended build:** a 3–4 beat
  guided intro that reframes "brand" in plain language and leads with ONE step.
- **Everything renders at once.** Linearize: hero + the single "Where to begin" first; reveal the five
  tiles / seeker-language / momentum / chapters behind a gentle "explore the rest when you're ready."
- **Operator vocabulary isn't translated.** They don't know "brand," "score," "SEO," "map pack,"
  "coverage," "entity." Add plain-language glosses in situ; soften the surface word **"brand"** →
  "how you're found" / "your presence" (keep the internal module name).
- **No felt sense of "done/enough."** The moon only ever asks for more. Add an earned **resting** state
  per part ("This part is whole — nothing to do here right now") + a whole-brand "you've done the
  meaningful parts."
- **The seeker-language mirror is the strongest, most *fun*, least-salesy surface — but it's gated**
  behind running a scan. Ungate a version (from their own profile text + generic local data) and make it
  the emotional center, not the score.
- **GBP hands them to a foreign multi-step Google flow** they'll bounce off. Add a 2–3 step calm
  walkthrough behind the "Start a Google Business Profile" CTA.
- **`how_remembered` (entity/knowledge graph)** is an SEO-insider concept, not actionable, and the only
  dimension with no CTA. Give it one tangible step (same name + headshot everywhere) or de-emphasize it.
- **No "you did it" moment.** After a step, briefly wax the relevant moon + one warm line naming what it
  now does for a seeker.

## State-local (mostly by state, as the founder noted)
- **Licensure-by-state is the missing organizing principle.** Therapists can usually only serve states
  they're licensed in → "be found" should be scoped to that. Capture licensed state(s); MN's Counseling
  Compact is an ownable advantage. **Telehealth-only / home-based practitioners should NOT be pushed to
  GBP** (physical-local) or scored down for having no public address — add an address-reality branch.
- Model "near me" + state-level query classes once geo-targeting is in.

## Assets to protect (do NOT regress)
The trauma-informed voice; the moon glyph (door-not-deficiency, no red/✗); gain-only momentum; the
"Gentle/Moderate/Deeper" energy framing; the GBP "Where to begin" bet; the pure/deterministic
visibility split (`visibility.ts` vs `serper.ts`) + graceful degradation.

## Recommended sequence
1. Compliance fix (now). 2. Geo-target Serper (correctness). 3. The scores decision (founder).
4. The guided first-run + "one calm thing" de-overwhelm (the biggest "fun + understanding" win).
5. Licensure/telehealth reality branch. 6. GBP walkthrough + ungated seeker-language + "you did it"
moments + earned resting state.

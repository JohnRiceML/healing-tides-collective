# The Practitioner Brand Center — architecture

**Last updated:** 2026-06-19 · Route: `/practitioner/brand` (Clerk-gated, `noindex`, read-only)

> The brand center helps a practitioner understand **how the right person finds and remembers
> them** — and tend it, one calm step at a time. It is **not** a marketing scoreboard. The product
> thesis, shown to the practitioner on the page: *"This isn't marketing — it's helping the right
> person find help."* Audience: solo MN wellness/therapy practitioners — caring, time-poor, averse
> to self-promotion, mostly **not** thinking of themselves as "a brand."

## The five parts (dimensions)
`lib/brand.ts` is the pure single source of truth. `buildBrand(signals: BrandSignals): Brand`
returns 5 dimensions in a fixed `DIMENSION_ORDER`:

| id | UI name | reads |
|---|---|---|
| `who_you_are` | Who you are | bio · values · photo · modality · completeness |
| `who_youre_for` | Who you're for | specialties (+ Serper coverage, when scanned) |
| `where_found` | Where you're found | published · region · coverage · map pack · weekly views |
| `why_trusted` | Why you're trusted | reviews (READ-ONLY, see ethics) · website |
| `how_remembered` | How you're remembered | knowledge-graph / entity presence |

Each `Dimension` = `{ id, name, intro, why, score, state, insights[] }`.

## Scoring + the moon (and why the number is demoted)
- Each insight has a `state` (`not_started`/`forming`/`on_its_way`/`settled`). `STATE_POINTS` map
  those to 8/38/68/100; a dimension's **`score` (0–100)** is the average. `not_started` keeps a base
  of **8** so nothing reads as a stark 0 (a 0 reads as judgment to this audience).
- The moon **`state` is BANDED from the score** via `stateFromScore` (`<25` not_started · `25–54`
  forming · `55–84` on_its_way · `≥85` settled) — so the number and the moon can never contradict.
  `Brand.overallScore` is the average of the five.
- **The number is DELIBERATELY demoted in the UI** — it is off every at-a-glance face (tiles,
  chapter summaries, overall bar) and revealed only **on tap** inside a chapter. The moon fills to
  the score (a calm dial) and the named stage carries the read. Rationale: see the ADR + the
  research audit ([../audits/2026-06-19-brand-center-research.md](../audits/2026-06-19-brand-center-research.md)).
  **Brand law: the score is personal PROGRESS — never a grade, never a comparison to other practitioners.**

## The local-visibility (Serper) stack
All findability data is the practitioner's own, on-demand, cached — never eager, never compared.

```
profile (specialties + region)
  → lib/visibility.ts  buildCoverageQueries()         (taxonomy → local-intent phrases, PURE)
  → lib/serper.ts      searchSerpPage / searchPlaces  (Google /search + /places; never throws; ""→empty)
  → lib/visibility.ts  buildCoverage / evaluateMapPack (PURE matching: do YOU appear?)
  → app/practitioner/visibility-actions.ts  runVisibilityAudit()   (the one server action)
       · captures knowledgeGraphPresent + samples the top MAP_PACK_SAMPLE(=3) map packs
       · lib/presence-scan.ts  buildPresenceScan()  → a PresenceScan (PURE)
       · persists it (best-effort, re-reads fieldValues first to avoid clobber)
```
`lib/visibility.ts` keeps the network OUT (pure + unit-tested); `lib/serper.ts` owns the only fetch
and degrades gracefully (no `SERPER_API_KEY` → empty, the UI shows a calm "not switched on").

## Cached state — reserved `fieldValues` keys (migration-free)
Schema-free features ship with **zero migration** by storing JSON under a reserved `__`-prefixed key
on `Practitioner.fieldValues`. **Registry:**

| key | owner | what |
|---|---|---|
| `__presenceScan` | `lib/presence-scan.ts` | the latest Serper scan (coverage, map-pack/kg/reviews bools, questions, relatedSearches) |
| `__presenceScanHistory` | `lib/presence-history.ts` | rolling ≤8 daily snapshots → the "growing over time" momentum read |
| `__hold` / `__holdHistory` | `app/_lib/moderation.ts` | admin hold + audit trail (see [MODERATION.md](../MODERATION.md)) |
| `__verified` | `app/_lib/verification.ts` | granted trust badges |

**Guardrail:** reserved keys are written by **direct spread** (`{ ...existing, [KEY]: value }`),
**never** through `mergeFieldValues` (which strips `__` keys so a practitioner's profile save can't
clobber admin/system state). A practitioner save preserves every `__` sibling.

## What turns the data into understanding
- `lib/seeker-language.ts` `deriveSeekerLanguage()` — the **say/search mirror**: the real questions
  (People-Also-Ask) + words (related searches) seekers near them type, with each word matched against
  their own bio (whole-word, every-care-word-required, plural/accent-folded, region excluded). Surfaced
  by `SeekerLanguageCard` — the most "fun", least-salesy surface.
- `lib/presence-history.ts` `buildMomentum()` — gain-only movement over time (`MomentumCard`). A flat
  or lower reading reads "steady," never a loss; a falling sparkline is hidden.
- `lib/brand-next-step.ts` `pickGroundedNextStep()` — the data-aware **"Start here — just one thing"**:
  once the profile is solid but they're not on the local map, leads with a free **Google Business
  Profile** (the #1 local-findability lever), else the framework's most-foundational gap.
- `lib/brand-signals.ts` `buildBrandSignals()` — the one place that maps a Practitioner + cached scan
  onto `BrandSignals`, so the dashboard band and the brand center never drift.

## ⚖️ Ethics + brand law (do not regress)
- **NEVER coach soliciting client reviews/testimonials.** ACA/APA/AAMFT/NASW/NBCC prohibit therapists
  soliciting them from current OR former clients. `why_trusted` is read-only (acknowledges reviews that
  exist) and the no-reviews path actively warns against requesting them. Guarded by a test
  (`tests/brand.test.ts` → "ETHICS: never coaches soliciting client reviews").
- No grade, no comparison, no urgency, gain-framed; the moon is a door (never red/✗); "Why care" is
  always seeker-centered. `tests/brand.test.ts` enforces no-digit/no-shame on the prose.

## UI
`app/practitioner/brand/page.tsx` (server-rendered): hero (`BrandHero` — their cover art + photo) →
thesis band → "Start here" (`groundedStep`) → the five parts (`BrandTiles` + overall moon) →
`SeekerLanguageCard` → `MomentumCard` → "Tend each part" (`DimensionChapter` ×5; the `where_found`
chapter embeds the live `VisibilityCard`). The dashboard (`app/practitioner/page.tsx`) shows a compact
"Your brand" band reusing the same `buildBrandSignals` + `BrandTiles`.

## Known gaps / queued (founder-deferred — see the research audit)
1. ✅ **FIXED 2026-06-19 — Serper is now geo-targeted.** `lib/geo.ts` `toSerperLocation()` turns the
   practitioner's free-text region into a Google `location` ("City, State, United States"), passed
   through `searchSerpPage`/`searchPlaces` so the audit reflects THEIR locale, not the server's. It's
   conservative — returns `undefined` for a bare city / nickname, and the caller falls back to the
   city-in-query (no worse than before). *Future:* capture structured city+state on the profile so
   more regions resolve (a bare "Saint Paul" currently can't be confidently placed → no geo).
2. Licensure-by-state + telehealth/home-based branch (don't push GBP / score-down a no-address practitioner).
3. Guided first-run for empty profiles · ungate the seeker-mirror · a GBP walkthrough · an earned
   "you're done here" / "you did it" state.

## Tests
`tests/brand.test.ts` · `seeker-language.test.ts` · `presence-scan.test.ts` · `presence-history.test.ts` ·
`visibility-audit.test.ts` · `brand-next-step.test.ts` · `visibility.test.ts`. See [../TESTING.md](../TESTING.md).

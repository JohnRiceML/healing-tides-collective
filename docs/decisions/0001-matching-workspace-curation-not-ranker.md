# ADR 0001 — The matching workspace is a curation tool, not a ranker

- **Status:** Accepted — 2026-06-26
- **Scope:** M2 (seeker → practitioner matching), Phase 2 (the admin workspace).
- **Owner:** John (build). Informed by Nora's matching homework (9 worked cases).
- **Supersedes one line of:** [docs/product/MATCHING-PRINCIPLES.md](../product/MATCHING-PRINCIPLES.md)
  — that doc's "rank + rule-OUT + curate" framing is narrowed here to **curate + rule-OUT, no rank**
  for v1.

---

## Context

The seeker intake (Phase 1) is live: people use **Get matched**, their intake lands in the admin
queue. Phase 2 is the screen where **Nora reads an intake and hand-builds a shortlist** of
practitioners to introduce. The question was *how smart* that screen should be on day one.

Two honest options were on the table:

- **A — Practitioner matching fields first, then a ranking workspace.** Add structured
  `primary modality + certification level + years + sliding-scale` to the practitioner profile, then
  have the workspace **rank** candidates by computed fit.
- **B — A curation workspace now.** Surface candidates with the signals that already exist, let
  Nora read + rule out + hand-pick, and add the structured fields later if they're needed.

## Decision

**We build B: a curation tool.** The workspace **reads → filters on what's clean → supports
rule-out → lets Nora hand-pick a shortlist with a reason per pick → hands off.** It does **not**
compute or display a fit score. The structured practitioner matching fields are **deferred** until
volume or a concrete need justifies them.

What the workspace shows per candidate is a **transparent overlap read** — "matches 3 of Jordan's
stated needs: in-person · accepts HealthPartners · focus: trauma" — used only to **order** the list.
It is never rendered as a number or a percentage. (Implemented as the pure `candidateRelevance()` in
[lib/match-candidates.ts](../../lib/match-candidates.ts); see its tests.)

## Why (the reasoning, so the next person doesn't re-litigate it)

1. **It honors the product law.** "The app supports Nora's judgment, it doesn't replace it." A fit
   score is the first step toward replacing it — and her homework is the *opposite* of rankable:
   it's narrative-driven and **rule-out-heavy** ("CBT made it worse → exclude"; "all-ages → not a
   specialist"). A confident ranker would either mislead her or get ignored. Either way, wasted.

2. **A ranker needs data we won't have at launch.** The structured modality/cert/years fields would
   be **mostly empty** — few practitioners, and they'd have to go back and fill them. Ranking on
   sparse data is noise dressed up as signal.

3. **Launch volume makes ranking a non-problem.** A small, curated, Minnesota-only pool + a handful
   of seekers a week → Nora can *see every candidate*. Ranking only earns its keep at a scale she
   doesn't have yet. Build for the volume you have.

4. **The signals already live in prose.** Modality, experience, and style are already in the
   bio / credentials / values she reads anyway. The workspace's job is to make that **reading fast**
   (filter the clutter, surface the rest) — not to pre-decide.

5. **It ships the whole value loop first.** intake → curate → shortlist → hand-off is what produces
   real introductions. That's the entire point of M2; a ranker is optimization on top of a loop that
   doesn't exist yet.

6. **It's cleanly additive.** When volume *does* justify structure, add the fields then — and the
   **Psychology Today importer can pre-fill them** (the credential-import path already proves this),
   so practitioners never backfill by hand. The workspace already has a slot for them.

## Consequences

- **Now:** the workspace ranks candidates by a visible-reasons overlap (hard-ish constraints that
  resolve cleanly: format, specialty, insurance, region, gender-pref, accepting-new), shows each
  candidate's readable profile, and lets Nora shortlist + write a "why" per pick. No score UI.
- **Rule-out is implicit in v1:** Nora simply doesn't add a candidate she's excluding. A dedicated
  "hide / ruled out because…" control is a deliberate v2 nicety, not in scope.
- **Region/insurance matching is fuzzy** (free-text today), so we **soft-match** (case-insensitive
  contains) and never hard-drop a candidate on a fuzzy miss — a miss is shown, not hidden.
- **Sending the shortlist (the email to the seeker) is Phase 3**, not this build. v2 of this
  workspace marks `Match.status = SENT` and the intake `MATCHED` once that path exists.

## When to revisit (the triggers that flip us toward A)

- Nora is matching enough seekers per week that **reading every candidate is too slow**, **or**
- she asks for a **specific structured filter** the prose can't satisfy (e.g. "only EMDR-certified"),
  **or**
- the practitioner pool grows past the point where eyeballing the list is practical.

At that point: add the structured practitioner fields (importer-prefilled), and let
`candidateRelevance()` weigh them. The decision here is *sequencing*, not a permanent "no ranker."

## Gates that are independent of this decision

Still **you + Christie**, and they gate *storing real seeker data in prod*, not this build:
the **crisis / acute-risk** stance + interstitial, and **PHI / retention** for the stored narrative
(LICSW obligations, how long, who reads it, BAA). Tracked in
[MATCHING-PRINCIPLES.md](../product/MATCHING-PRINCIPLES.md) §still-open.

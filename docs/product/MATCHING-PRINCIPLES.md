# Matching principles — Nora's encoded intuition

> **The canonical spec for the seeker → practitioner match.** Derived from **Nora's filled-in
> matching homework** (`healing-tides-matching-homework.docx`, 2026-06-22 — 9 worked cases, her
> real clinical reasoning, not box-ticking). **Supersedes** the strawman in
> [MATCHING-BRIEF-DRAFT.md](MATCHING-BRIEF-DRAFT.md).
>
> The match **stays human** (Phase-2 scope — "the app supports Nora's judgment, it doesn't
> replace it"). This doc tells the **workspace** what signals to surface, and the **intake** what
> to ask. There is no automated scoring.

## Core thesis — why this beats a filter directory

Nora matches on two things a checkbox can't capture:

- **Narrative** — the language the seeker uses; whether they can clearly identify their need; *where
  they are in the journey* (overwhelmed-and-just-starting vs. clear on what they want).
- **Experience** — prior therapy: what helped, what didn't, and **why** prior relationships failed —
  to avoid repeating a bad referral.

Her standing critique of platforms like Psychology Today (stated in nearly every case): they match on
the broad bucket ("anxiety"), call anyone who *lists* a specialty a specialist, **don't screen for
acuity** (SI/HI, self-harm, mania, substance), and **never look at the previous clinicians**.

## The encoded rules (consistent across all 9 cases)

1. **Specialization beats "works with all ages / everything."** Her #1 rule. An "all ages" therapist
   is *ruled out* for a specialized need (adolescent, couples, trauma) unless they have a clear,
   substantial focus there. "Therapists who list 'all ages' are generally not the preferred fit."
2. **Modality is a clinical rule-OUT, not just a preference.** Trauma → rule out CBT/SFT/EFT-primary;
   want EMDR/somatic/Brainspotting, **certified not just "trained,"** 20+ yrs. Anxious-somatic → rule
   out CBT-primary. Holistic → rule out talk-therapy-primary (CBT/IFS/psychodynamic).
3. **Seniority is case-dependent.** Trauma → 20+ yrs, no pre-licensed/<5yrs. Insurance-constrained /
   life-transition → newly-licensed / pre-licensed is *fine* (accessibility wins). Adolescent →
   *younger* clinician (~≤30) preferred, with recent adolescent experience (schools, camps, PHPs).
4. **Practice setting matters.** Burned-once skeptic → solo / independent (1–3 clinicians), *not* a
   large group practice (continuity, individualized attention). (Maps to `Practitioner.accountType`.)
5. **Shortlists can span types.** Anxious mom → somatic therapist **+ acupuncturist (sleep) + Reiki**.
   Addiction → individual **+ couples + support groups + partner resources**. A match is a curated set,
   sometimes across care types — not a single result.
6. **Safety first, every case.** She screens for SI/HI, self-harm/SIB (esp. adolescents), mania,
   substance, personality disorders → crisis line / ED. The workspace must flag this; ties to the M3
   crisis path.
7. **Tie-breaker: availability + responsiveness.** In-person vs. virtual + schedule fit; "responds to
   outreach within 1–2 business days." After-school slots are essential for adolescents.

## The intake — what she actually asks (extends the draft's 6 questions)

The draft's calm 6-question shape holds (story · format · region · who-it's-for · preferences ·
practical). Her homework adds **three high-signal questions** that drive most of her decisions:

- **Prior-therapy experience** — "Have you worked with someone before? What helped, what didn't, and
  why wasn't it a fit?" She asks this in nearly every case; it's her single biggest non-checkbox lever.
- **Therapeutic-style preference** — practical/structured/skills+homework **vs.** exploratory/insight;
  direct-and-challenging **vs.** reflective-and-listening; present-coping **vs.** processing-the-past.
- **Insurance, specifically** — *which* plan (e.g. "HealthPartners"), sliding-scale, and a budget
  ceiling. A boolean is too coarse for her referral decisions.
- *(adolescent only)* — ask the teen to name a trusted adult and what makes that relationship work
  (warm / structured / humorous / calm) → match on relational style.

## Practitioner fields the workspace needs (gaps today)

The directory profile doesn't yet capture the signals Nora ranks on. To make the workspace real:

- **Primary specialization / population** — "I *primarily* work with adolescents / couples / trauma,"
  not just a flat focus-area checklist. (Distinguish specialist from "also treats.")
- **Primary modality / approach + certification level** — somatic, EMDR, DBT, IFS, ACT, Gottman,
  EFT, Brainspotting… and *trained vs. certified*. **Nothing structured exists today** (the current
  `modality` field means in-person/virtual — a different axis).
- **Years of experience · license type · pre-licensed/supervised status.**
- **Practice setting** (have `accountType`), **sliding-scale** (gap), **faith-based / values** (values
  is prose today).

## The workspace (Phase 2) — design principles

A **rank + rule-OUT + curate** tool, not a filter:

- Lead with the seeker's **narrative + prior-therapy** front and center (that's what she reads first).
- Surface candidate practitioners with **her signals** (specialization depth, primary modality + certs,
  years, setting, insurance, availability) — not a percent score (no leaderboard; "speak in reasons").
- Support **exclusion** (rule out CBT-primary for trauma; rule out "all ages" for an adolescent).
- Let her **hand-pick a shortlist that can span care types**, and write the **"why I thought of them"**
  per pick (`Match.reason`). She always has the last word.
- **Flag safety signals** on the intake → the crisis path.
- **"No good match" is an honest answer** — nearest virtual option / waitlist / log the gap.

## Decisions her homework now answers (vs. the draft's open list)

- **Gender preference** → often **hard** for the seeker who states it (the anxious mom: "female,
  not male"). Survivor cases especially.
- **Specialization** → **primary focus**, not "all ages." Encode as a real signal.
- **Self-report trust** → she re-checks **responsiveness** as a tie-breaker; treat availability/
  insurance as practitioner-stated, re-verify at intro.

**Still open (you + Christie — unchanged):** the **crisis / acute-risk** wording + interstitial, and
**PHI / retention** for the stored narrative (Nora's LICSW obligations, how long, who reads it, BAA).
These gate storing real seeker data in prod — see [MATCHING-BRIEF-DRAFT.md](MATCHING-BRIEF-DRAFT.md) §⚠️.

## Provenance

- Source: Nora's homework — Drive `healing-tides-matching-homework.docx` (2026-06-22), 9 cases.
- Companion: [MATCHING-BRIEF-DRAFT.md](MATCHING-BRIEF-DRAFT.md) (the pre-homework strawman) ·
  [PRODUCT-SPEC.md](PRODUCT-SPEC.md) §matching · the M2 build in `app/get-matched/` + `lib/seeker-intake.ts`.

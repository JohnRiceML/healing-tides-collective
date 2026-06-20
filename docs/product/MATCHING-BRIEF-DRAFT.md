# Matching brief — a strawman for Nora

**Status:** DRAFT for Nora to react to and edit — **not** the answer. Drafted 2026-06-19 to turn "Nora authors the matching brief from a blank page" into "Nora marks up a concrete proposal in ~20 minutes." **The clinical matching logic is yours to own** — this draft is a provocation, and it deliberately leaves your judgment calls open. (Companion to [the Phase-2 reconciliation](../audits/2026-06-19-phase2-reconciliation.md); this is the input that unblocks the entire seeker side.)

---

## ⚠️ Two things to settle *before* we build any of this (you + Christie)
A 4-lens drafting + adversarial review flagged these as safety/legal non-negotiables, not product taste:

1. **Crisis / acute-risk path.** The intake invites someone to pour out a trauma narrative, then promises a human reply in *days*. Today there is **no** crisis-line language, no "this is not for emergencies," and no off-ramp if a story signals acute risk (suicidality, active DV). Before this ships you decide: the up-front expectation-setting ("days, not minutes — and not for emergencies; if you're in crisis, call/text 988"), and whether a story tripping risk language shows an interstitial. **You word this.**
2. **PHI / data retention.** [PRODUCT-SPEC.md](PRODUCT-SPEC.md) explicitly gates this surface on the HIPAA decision, and it's still open. A stored free-text health narrative tied to an identifiable person (email via Clerk + location) is health data regardless of the draft's "we quarantine it from the algorithm" claim. The real questions: is it PHI under your LICSW obligations, how long is it kept, who besides you can read it, and do we need BAA-grade infrastructure? **You + Christie.**

Everything below assumes these two are resolved.

---

## The seeker intake — draft (~6 calm questions)
The calmest version: big-picture first, single-focus steps, "skip anything that doesn't apply." (The existing `/prototype/seeker` already nails this cadence — keep it; the draft's denser 9-question version regressed on it, so this is trimmed.)

1. **"What brought you here today?"** — free text, ~2 paragraphs, optional seed prompts. *The heart of it.* This is for **feeling seen**; you read it and tag it to care categories. Not an algorithm input.
2. **"How would you like to meet?"** — in person / virtual / hybrid / no preference → **format** (a clean structured match).
3. **"Where are you located?"** — city + "virtual only / open to travel" → **region** (today free-text; see the build note below).
4. **"Who is this for?"** — me / my child or teen / my partner / a family member → **age-group** (the *one* cleanly structured match — and a **hard filter for minors**).
5. **"Anything that feels important in who you work with?"** — optional chips (trauma-informed · a gender or pronouns · shared culture/faith · lived experience · works with recovery) + an "anything else" line → preference signals.
6. **"The practical side"** *(all optional)* — what feels workable financially / when you're generally free / any access needs → soft pre-filters.
7. *(reassurance, not a question)* — "One person reads this first. Nothing reaches a practitioner until she's matched you and written the reason herself." + the consent checkbox.

> Cut from the draft for calm: stop using "modality" for three different things — call them **format** (how you meet), **care type** (therapy/acupuncture/…), and **technique** (EMDR/somatic/…). Don't ask for access needs (Q6c) until a practitioner accessibility field exists, or it's a dead-end that breaks trust.

---

## What a match looks like — 4 worked cases (the part to react to)
*"Yes, except I'd also weight…"* is exactly the feedback we want.

1. **Sarah, 38, Minneapolis (overwhelmed, first-time).** "Saying yes to everything, hitting a wall, anxiety at night, snapping at my partner — need someone who gets busy people and doesn't judge." → drivers: anxiety/stress · evening/virtual availability · warm-not-clinical. *Why it fits (seeker voice):* "You wanted efficiency and warmth without judgment."
2. **Tom, 52, St. Paul suburbs (skeptical, somatic).** "Retired, stress-related back/neck pain, don't want to talk about feelings, want something that works." → acupuncture + nervous-system · clinical credibility · direct style · daytime. *Why it fits:* "You wanted results over talk therapy."
3. **Jade, 24, Minneapolis (curious, exploring).** "Perfectionism, not-enough-ness, drawn to body-based + trauma + spiritual, want something deeper." → trauma-informed + somatic + identity work · sliding scale. *Why it fits:* "You're exploring several pathways at once — she bridges them without making you pick a lane."
4. **A grief case (45, Twin Cities).** "Mom passed six months ago, partner grieves differently, we're not connecting, open to anything that isn't traditional talk therapy." → grief + relationships · somatic/SE blend · warm · near-term availability. *Why it fits:* "Your grief is showing up in your body and your partnership — Alex bridges both."

---

## How matching would actually work — strawman, honest about the data
**The honest reality up front:** most of what we'd want to match on is **free-text or not captured**, so a "95% match" score is illusory precision. This is really **you curating, with the tool as a first-pass accelerator** — not an algorithm deciding. So:

- **No percent scores anywhere a seeker (or even the seeker-facing copy) can see.** Speak in reasons, not numbers. A care relationship isn't a leaderboard.
- **Hard filters** (drop the practitioner): accepting-new status · format (if in-person required) · **age-group fit for minors**. These resolve cleanly.
- **Soft signals you weigh by eye:** category fit (you tag the story), care type, technique, style, identity/culture preference. Today these are free-text on the practitioner side, so it's your judgment + light keyword help, not clean math.
- **"No good match" is an honest answer**, not a failure: offer the nearest virtual option, a waitlist with a real expectation, or "we don't have an in-person fit in your area yet" — and log the gap to your dashboard ("in-person trauma support needed in St. Louis Park").
- **The tool's job is to hand you a sane first pass + the reasons,** which you reorder, add to, or override. You always have the last word.

**What we'd have to *build* to make these actually matchable** (today they're dead-ends): a **structured region/city field** (for distance), structured **insurance** on the seeker side, **pronouns** + **populations-served** as real fields (today they're prose), and an **accessibility** field. Worth knowing the cost before promising precision on them.

---

## The decisions only you can make (the real point of the call)
1. **Crisis stance** — the wording + whether risk language triggers an interstitial. *(you)*
2. **PHI / retention** — is the stored story PHI, how long, who reads it, BAA needed? *(you + Christie)*
3. **Intake tagging** — do you personally read + tag every story (the "feel seen" promise, but a real bottleneck near ~20/week), or is Claude allowed to *suggest* categories you confirm? (LLM-inferred clinical labels carry liability — your call.)
4. **Gender preference** — hard filter or soft? (Survivors often need it hard.)
5. **Geographic fuzziness** — Minneapolis seeker → St. Paul practitioner? Rural → virtual-only? And do you want a structured region field built so this is even answerable?
6. **Which attributes are truly non-negotiable** hard filters vs. "note the tradeoff."
7. **Shortlist detail** — first-name-only warm de-identification vs. full profile, and what to say when the only real driver is "last one accepting near you."
8. **Self-report trust** — availability / sliding-scale / insurance are stale strings practitioners typed weeks ago; do you re-verify before introducing?
9. **Volume / when to automate** — your realistic weekly hand-matching capacity before you delegate or automate. This decides whether the manual-curation thesis is even sustainable.

---

*Built by a draft-and-critique agent pass; every data-model claim was checked against `prisma/schema.prisma` + `app/_lib/profile-fields.ts`. Treat as a starting point, not a spec.*

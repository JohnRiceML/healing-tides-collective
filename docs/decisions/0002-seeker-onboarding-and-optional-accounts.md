# ADR 0002 — Seeker onboarding is a conversational agent; accounts are optional + anonymous-by-default

- **Status:** Accepted — 2026-06-28
- **Scope:** M2 (seeker side) — the `/get-matched` onboarding experience, the surfaced-practitioner discovery UI, and optional seeker accounts (`/save-account`, `/dashboard`).
- **Owner:** John (build). Founder-validated direction (Nora); HIPAA posture pending Christie.
- **Relates to:** ADR [0001](0001-matching-workspace-curation-not-ranker.md) (the admin side of the same loop — Nora reads the intake this produces).

---

## Context

The product's thesis is *"not a directory — a decision-making tool."* The seeker side had been a
`mailto` stub. Three questions had to be answered to make it real:

1. **How does a seeker tell us what they need?** A long form, or something more human?
2. **How do they see + hold the practitioners we surface?**
3. **Do seekers get accounts** — and if so, what do we store, given this is mental-health data?

Each touches the calm, trauma-informed brand and the HIPAA question that gates real-seeker launch.

## Decision

**1. Onboarding is a real-time conversational agent, not a form.** `/get-matched` is a guide that
talks with the seeker (voice by default via OpenAI Realtime + WebRTC; a text chat as the equal
alternative; a plain form at `/get-matched/form` as the floor). It calls tools mid-conversation to
search the directory, reflect back priorities, surface crisis resources, and write the intake. One
shared tool layer (`lib/onboarding/tool-logic.ts`) backs both voice and text.

**2. Discovery is two-pane: chat on the left, practitioners as cards in a right-hand rail + a saved
"basket."** The agent *shows* people early rather than asking endless questions; the seeker saves a
few good options ("reach out to more than one") and either contacts them directly or has Nora make a
warm introduction.

**3. Seekers are anonymous by default; an account is the opt-in upgrade.** Browsing, getting matched,
and building a basket store **nothing** server-side (the basket is `localStorage`). Creating an
account (`/save-account` → `/dashboard`) is the only thing that persists a "this identified person is
interested in these mental-health practitioners" record (`SavedPractitioner` + the welcome email).

## Why

- **Conversation over a form** — the audience is people in a vulnerable moment looking for care. A
  warm, guided exchange that adapts is both better psychology (feeling heard, no blank-page anxiety)
  and a better matcher (it can probe what matters). Founder-validated; discovery should be
  big-picture-first and flexible because people arrive *with* ideas, not blank.
- **Voice-first, text-equal** — voice is the most human, lowest-friction input for someone who'd
  struggle to fill a form; text is there for anyone who can't/won't speak. The form is the
  accessibility + no-JS floor.
- **Show, don't interrogate** — the conversation comes alive when the seeker can *see* real
  practitioners and react. Cards in a side rail (not inline clutter) keep the chat calm and let the
  basket act as a persistent "good choices" tray. Encouraging *more than one* save reflects reality:
  not everyone has an opening, and fit is personal.
- **Anonymous-by-default is both the calmest psychology and the lightest compliance footprint** — no
  pressure to "sign up," it's *theirs*; and no sensitive server-side record exists until the seeker
  explicitly opts in. That keeps the whole browse/match/basket loop outside the HIPAA question and
  makes the one place that *does* store identity easy to reason about. Real-seeker launch still waits
  on Christie's determination; the code is built to be defensible now (minimal data — name + email +
  saved slugs — consent recorded for outreach via `requestIntro`).

## Notable implementation decisions (recorded so they aren't re-litigated)

- **Model = OpenAI `gpt-4.1` / `gpt-realtime`, not Claude.** The Vercel AI Gateway free tier 403s
  Claude (sonnet) for this project; OpenAI works. Revisit if a paid/direct key lands — the tool layer
  is model-agnostic.
- **Welcome email is sent exactly once via an atomic claim.** `ensureWelcomed` does a conditional
  `UPDATE … WHERE welcomed_at IS NULL` *before* sending (so two tabs can't double-send) and
  **releases the stamp if the send fails** (so a transient Resend outage retries next visit instead
  of silently never sending). `sendEmail` never throws — it resolves `{ok:false}` — so the result
  must be inspected, not ignored.
- **Deploy-order rule for shared-column migrations.** `welcomed_at` lives on the `users` table that
  `getCurrentDbUser` reads on *every* authed page, so the migration must be applied **before** the
  code deploys (additive columns are backward-compatible → the DB can lead; code-first would 500 all
  authed pages in the gap). A `/dashboard` error boundary is defense-in-depth, not the fix.
- **One basket, two save surfaces.** The chat shortlist (`ht_considering_v1`) and the directory
  "Save profile" button (`ht_saved_practitioners`) are different localStorage keys; the account sync
  merges **both** — otherwise directory saves silently vanish on account creation (caught by the
  pre-deploy review).
- **Role-aware routing.** A single "Sign in" serves both audiences, so it routes through `/welcome`,
  which sends practitioners → `/practitioner` and seekers → `/dashboard`. The nav shows "Your
  profile" only to users who actually have a `Practitioner` row.

## Consequences / trade-offs

- **Accepted:** an OpenAI dependency (a second AI vendor alongside Claude for the practitioner
  importer); voice cost is capped per session; the welcome email's from-address is a verified Resend
  subdomain (same trade-off as ADR-era email work).
- **Gained:** a real guided product (the thesis), anonymous-by-default privacy, and a clean opt-in
  account that's HIPAA-defensible by construction.
- **Cost:** more moving parts on a sensitive surface — mitigated by an adversarial pre-deploy review
  (10 confirmed findings fixed before ship) and the resilient/degrades-not-500 posture.

## Alternatives considered

- **A long structured form** — rejected as the primary path (worse psychology; blank-page anxiety);
  kept as the `/get-matched/form` floor.
- **Inline practitioner cards in the chat stream** — rejected (clutters the conversation; the rail +
  basket is calmer and persists).
- **Mandatory accounts** — rejected (pressure + a server-side sensitive record for everyone, the
  opposite of the privacy goal).
- **Defer accounts until after the HIPAA call** — rejected in favor of building the minimal,
  anonymous-by-default plumbing now (compliance-ready) and gating only the *real-seeker launch* on
  Christie, so the work is ready to flip on.

## Revisit when

- Christie's HIPAA determination lands (may add BAAs, change retention, or alter what's stored).
- A paid/direct Claude key makes the model choice worth revisiting.
- Volume justifies a smarter matcher (then ADR 0001's deferred structured fields + ranking).
- Accounts grow beyond "save a list" (messaging, status tracking) — re-examine the data model + the
  anonymous/identified boundary.

**Built by:** lead build + an adversarial pre-deploy review (4 dimensions → per-finding verification);
verified via `tsc` + ~397 tests + build + live smoke (sign-up, basket CTA, dashboard gate) before each
prod push. The migration was applied before the code per the deploy-order rule above.

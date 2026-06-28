# Healing Tides — Build Tracker (June-10 Brief)

> **What this is.** The single source of truth for *what was promised in the June-10 build brief* and where the code actually stands against it. Every status line is grounded in verified code (file paths cited), not memory.
>
> **Source brief:** the "Healing Tides — Build Brief for the App Team" (synthesizes the **June 10 sync** + **May 20 Phase-2 call**). That brief owns *strategy & intent*; this doc owns *status & evidence*.
>
> **Last verified against code:** 2026-06-28 (branch `main`, head `cce0df9`).
>
> **Code-verified reconciliation:** [audits/2026-06-19-phase2-reconciliation.md](audits/2026-06-19-phase2-reconciliation.md) — a 5-agent promised-vs-delivered pass against the *founding* brief (29 items: 13 delivered / 7 partial / 2 prototype-only / 6 not-started / 1 deferred) plus a **doc-truth audit** of where our own docs over-claimed. Its corrections are folded in below.
>
> **Supersedes PHASE-2-STATUS.md.** That older "Listing MVP" tracker has been **folded into this doc and retired** (its body is now a pointer here). Its drift — listing Stripe + Resend as "locked" when neither is wired — is corrected below: those were *decided and agent-stubbed*, never implemented. Its commit-referenced shipped ledger is preserved under [Shipped ledger](#shipped-ledger-commit-trail).

**Status legend:** ✅ Done & live · 🟡 Partial / foundation only · 🔴 Not started · 🅿️ Parked (deliberate) · 🐞 Known bug

---

## TL;DR

- **Milestone 1 (practitioner profiles + directory)** is live + demo-ready.
- **Milestone 2 (seeker side + matching)** is now **largely shipped** (2026-06-26→28): the conversational `/get-matched` agent (voice + text), `SeekerIntake`/`Match`/`SavedPractitioner` tables, Nora's `/admin/seekers` curation workspace (ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md)), shortlist delivery, and **optional anonymous-by-default seeker accounts** (`/save-account` → `/dashboard`, ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md)). The matcher is a *curation tool, not a ranker* (smarts deferred).
- **Milestone 0 (foundation)** — DB + auth + email layer are wired; the remaining gap is **Stripe** (parked, schema-ready).
- **Milestone 3 (safety, full command center, monetization)** is still greenfield (crisis page + 988 exist; the command center + billing don't).
- The old "sign-in turns any user into a practitioner" bug is **fixed** (read-only `getPractitioner` GETs; promotion only via explicit `becomePractitioner`).
- **Real-seeker launch is HIPAA-gated** (Christie) — the seeker code is built minimal + anonymous-by-default to be defensible now.

---

## Milestone 0 — Foundation

| Brief item (§3) | Status | Evidence / reality |
|---|---|---|
| **Database** (practitioners, seekers, profiles, applications, matches, messages/events) | 🟡→🟢 | `User`, `Practitioner`, `ProfileView`, `Invite`, `Feedback`, **`SeekerIntake`, `Match`, `SavedPractitioner`** all exist + are migrated to prod. The M2 foundation is in. Still absent (deliberately, until their features land): `Message`/`Consultation` (no on-platform messaging/scheduling yet). |
| **Google auth + account creation AND deletion (both user types)** | 🟡 | Clerk wired, Google enabled (`/join`, `/sign-in`). The user-facing **"Delete account"** already exists via Clerk's `UserButton` (enable the toggle in the Clerk dashboard — John). What's unresolved is **what deletion does to our data**: today `user.deleted` only *hides* the profile (not erasure). True erasure vs. hide-and-preserve is a legal call — see [decision #7](#open-decisions-brief-changed-the-plan). |
| **Stripe wired now** (before charging) | 🔴 | No Stripe dependency. **But the schema is already prepped:** `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus` enum (`NONE/TRIALING/ACTIVE/PAST_DUE/CANCELED`), plus dormant `tier` / `featured` / `accountType` on `Practitioner`. So wiring = checkout + webhook + a gating read; **no migration**. See [decision #1](#open-decisions-brief-changed-the-plan). |
| **Email automation scaffolding** (transactional + follow-up) | 🟡 | **Send layer WIRED via Resend** (2026-06-19): `lib/email.ts` (fetch-based, never-throws, env-gated — mirrors `serper.ts`) + pure templates in `lib/email-templates.ts`. First flow live: **claim invites auto-send** the claim link (best-effort; admin still gets a copyable link + an honest sent/failed/off status). Decision #2 resolved → Resend. **Still to wire:** completeness-reminder + M2 referral/intro emails (the sender is ready — just add the triggers). John sets `RESEND_API_KEY` + `EMAIL_FROM` + verifies a sending domain. |

## Milestone 1 — Practitioner profiles + directory (the networking-event deliverable)

| Brief item (§4 M1) | Status | Evidence / reality |
|---|---|---|
| Profile pages: bio, photo, social/site links, ~7 category tags, **values / "what healing means to you"** | ✅ | Live on prod. Two-column profile, Quick-details sidebar, cover system. |
| Directory + filtering, **free at launch** | ✅ | `/practitioners` — search, specialty/modality/region/accepting-new filters, sort. |
| **"Claim your profile" — auto-pull Psychology Today, one-click pre-fill** | 🟡→🟢 | **Tokenized claim flow is built + live** (`Invite` model + `/claim/[token]` + completion wiring + fill-if-empty prefill; `add_invites` migration applied). Invite emails auto-send once Resend is keyed. **PT *auto*-pull stays deferred** (ToS/Christie, [decision #3](#open-decisions-brief-changed-the-plan)) — practitioners use the URL/paste importer (Claude extract, SSRF-guarded) post-claim. |
| Credential capture + **verified badge** | 🟡 | Badge system exists (`__verified` reserved key + admin grant). **Not wired to proof or licensing-board lookup** (§6 automation unbuilt). |
| **Profile-completeness nudges** ("90% complete" + reminder emails) | ✅ | In-editor nudge live; **reminder emails built 2026-06-20** — admin-triggered `sendCompletenessReminders` (calm "finish when you're ready" email to <80% practitioners; pure `selectReminderRecipients` with a 7-day cooldown + skips held; reserved `__completenessReminder` key). Needs `EMAIL_FROM` set to actually send. |
| **Admin panel (basic):** applied / pending / approve-reject / request edits | 🟡 | Have read-only list + badge-grant + hold/release, **plus a practitioner-activity read** (2026-06-25): New/Active/Quiet/Dormant chips, recent views (7d/30d) + last-viewed, sortable columns — sign-in tracking built but gated on a migration (see Recently shipped). **No application queue, no approve/reject** — there's no "application" concept yet. |

## Milestone 2 — Matching + seeker side (~mid-July target)

| Brief item (§4 M2 / §5) | Status | Evidence / reality |
|---|---|---|
| **Seeker intake** — conversational/voice-style, ~5–10 questions | ✅ | `/get-matched` is a **real-time conversational agent** — voice by default (OpenAI Realtime + WebRTC) or text, plus a plain `/get-matched/form` floor. Shared tools in `lib/onboarding/tool-logic.ts` (search/get practitioner, reflect priorities, crisis resources, save intake → `SeekerIntake`). ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md). |
| **Matching engine** encoding Nora's clinical intuition | 🟡 | Shipped as a **curation workspace, not a ranker** (ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md)): `/admin/seekers` + `/admin/seekers/[id]` let Nora read an intake, rule out, and hand-pick a shortlist with a reason per pick → `Match` rows. A *computed* fit score + structured matching fields are deliberately deferred. |
| **Seeker accounts** with abstracted/de-identified identity | ✅ | **Optional + anonymous-by-default** (ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md)): browse/match/basket store nothing server-side; `/save-account` → `/dashboard` is the opt-in that persists the saved list (`SavedPractitioner`, minimal data: name+email+slugs). Role-fork bug fixed (2026-06-16). |
| **Referral delivery** (curated list to seeker; de-identified ping to practitioner) | 🟡 | The seeker can request a warm intro (`requestIntro`, consent recorded) and Nora delivers a shortlist from the workspace. Delivery is **mailto today / Resend once keyed** — the sender's wired, just needs `RESEND_API_KEY`+`EMAIL_FROM`. |
| **Consultation request flow** (availability → request → accept/decline → email ping) | 🔴 | No `Consultation` model; no scheduling. (Brief: keep on-platform, **no external calendars yet**.) |

## Milestone 3 — Safety / command center / monetization / expansion

| Brief item (§4 M3 / §8–§11) | Status | Evidence / reality |
|---|---|---|
| **Crisis detection & safety** (keyword flag → admin + Nora's cell; crisis page; 988; after-hours auto-reply) | 🔴 | A crisis-resources page exists only in a **dead `/prototype` route** (not in live nav). Non-negotiable per brief; design early. |
| **Full admin command center** (§9) | 🔴 | Only the basic read/badge/hold surface exists. |
| **Email automation flows live** (outreach, nudges, newsletters) | 🔴 | Blocked on M0 email decision. |
| **Tiered pricing + group-practice tier** (§10) | 🔴 | Schema pre-models it — `AccountType` enum already has `GROUP_PRACTICE` + `TREATMENT_CENTER`; `tier`/`featured` dormant. |
| **Out-of-state handling** (§11: MN-only; waitlist for other states; crisis still → 988) | 🟡 | **MINNESOTA-ONLY is now the explicit v1 scope** ([SYSTEM.md § Scope](SYSTEM.md); geo audit defaults a bare city to MN; credentials = MN boards). Still TODO: the seeker-facing out-of-state UX (soft "we're growing" message vs. waitlist) — Nora's call on aggressiveness. |

## Cross-cutting

| Area | Status | Evidence / reality |
|---|---|---|
| **Practitioner brand center** (`/practitioner/brand`) | ✅ | The flagship practitioner-retention surface (emerged post-brief): 5-dimension framework + demoted 0–100 progress scores + on-demand Serper visibility audit + seeker-language mirror + momentum. [architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md). Serper is now **geo-targeted** to the practitioner's locale (`lib/geo.ts`, fixed 2026-06-19). |
| **Moderation pillar** (hold/release, audit, Clerk→DB auto-hide on ban/delete) | ✅ | `app/_lib/moderation.ts`, `docs/MODERATION.md`, Clerk webhook. (Config still owed — see below.) |
| **§12 SEO / AI visibility** | ✅ mostly | **GA4 live & real** (`G-EJZ1TBDT3W` via `@next/third-parties` in `app/layout.tsx`). Sanity blog live (~10 posts). Structured metadata + JSON-LD (Person on profiles, Article/FAQ on posts) verified. **Gaps:** no journal↔directory internal links, no city/specialty pages, no Organization/LocalBusiness schema. |
| **§7 HIPAA guardrails** | 🅿️ clean | No seeker data is stored *anywhere* yet, so we're compliant by absence. The preferences-only / boolean-insurance / de-identified-referral principles are the design to **enforce when M2 is built**. Gated on John's compliance research. |
| **§6 Credential verification** (scoped 2026-06-20 → [CREDENTIAL-VALIDATION-SCOPING.md](product/CREDENTIAL-VALIDATION-SCOPING.md)) | 🔴 | **Honest verdict: no MN board has an API → "automatic" isn't real; MVP is admin-ASSISTED** (structured capture + board deep-links + audit trail + honest "verified on DATE" copy), ~2–3 weeks, fits the existing `__verified` system, no migration. True automation = a deferred, legally-gated Phase 2. **Blocking prereq (owed by Nora):** the license-types + priority board shortlist. **Hand-off brief for Greg:** [CREDENTIAL-VALIDATION-FOR-GREG.md](product/CREDENTIAL-VALIDATION-FOR-GREG.md) (incl. the Vercel architecture — in-project Cron job, not a microservice). |

---

## Shipped ledger (commit trail)

Audit trail of what's live, folded from the retired PHASE-2-STATUS.md. Useful for "when/where did X land."

**Foundations & infra**
- Stack *decided* (not all wired): Prisma 7 → single Neon Postgres · Clerk auth · **Stripe + Resend were planned + agent-stubbed but never implemented** — see decisions #1/#2. `28bfa77`
- DB wired: `User` (Clerk mirror + dormant Stripe fields) + `Practitioner` + `ProfileView` + enums; `prisma.config.ts`; `lib/db.ts` (pg-adapter singleton); `init` migration applied to Neon. `ed043d4`
- Auth wired: Clerk (env-gated), `proxy.ts`, `lib/auth.ts` (`getCurrentDbUser`, `getOrCreatePractitioner`), `<ClerkProvider>`. `ed043d4`
- Neon + Clerk provisioned via the Vercel Marketplace.

**Practitioner flow (live on prod)**
- Two-door model: seeker vs practitioner; seekers browse anonymously in the MVP. `e1ee99b`
- `/join` (Clerk + Google, two-column animated) `437747c` `939cc71` `4a0b6a6` `5eaad54` · `/sign-in` `d111a6a` `5f9288e` · `/practitioner` editor `1fe57f3`
- Real 11-category taxonomy (`app/_lib/taxonomy.ts`) `e5f150d` · rich "Join the Collective" fields (fieldValues JSON, **no migration**) `f3eb308` · Style Guide `a0c00c6`
- Photo → Vercel Blob `756dfdf` · AI onboarding/import (URL auto-fill, paste-bio) `1631eb6` `90c1132` `941e1b3` `09e0b46`
- Directory redesign `304acda` `2d8cf61` `6c6a7c9` · SEO profile pages + `generateMetadata` + JSON-LD + sitemap `4ad921c`
- Verification + Founding-Member badges (reserved `__verified`) `c724e7f` `9f2bbd9` · audience-aware nav `2ddac80` `f8e1c3d` `7889d1f`
- `/admin` read-only list + badge-granting `f6d664d` `92e2eea` · view instrumentation `587fd2c` · `/for-practitioners` + footer `6c6a7c9` `459e723`
- Post-merge on `feat/practitioner-listing-mvp` (→ `138bdc7`): dashboard + 4-step wizard + two-axis cover system + moderation pillar.

**Hardening & tests**
- Server-action hardening: `website` sanitized at save (drops `javascript:`/`data:`), slug-collision P2002 retry, graceful `{ ok:false }` returns. `fcbc76a`
- Vitest suite (~108 tests) `2575462` · CI (`tsc` + Vitest) gates every push/PR `4351791`.
- `feat/practitioner-listing-mvp` was **merged → `main`** (the production branch); later UI work continued on the feature branch, so `main` may trail `138bdc7`.

**Already received from Nora (don't re-ask)** — captured in [docs/product/](product/): the 11-category taxonomy, the full profile question set, pricing (originally $10/$25/$100, now simplified — decision #4), and a detailed admin-dashboard spec. Still owed: the items under [Owed by Nora](#owed-by-nora-dont-block-m1).

## Adversarial review (2026-06-17) — fixed vs. deferred

A multi-agent review of the session diff surfaced 9 distinct confirmed issues. **Fixed:**
JSON-LD `</script>` escaping on the profile page (stored-XSS, matched the layout's pattern);
claim-flow hardening — **atomic claim** (`updateMany … WHERE claimedAt IS NULL`, no double-claim race), **email-match gate** (a forwarded link can't be hijacked — only the invited Clerk-verified email may claim, with a graceful mismatch message), and **surfaced failures** (no more silent redirect); claim cookie maxAge 30→60 min; visibility name match is now **word-boundary** (no "Sam"→"Samsara"); slug-collision retry now has a unit test. **Deferred (noted, not bugs):** a cross-entity **audit-log table** for claims (`claimedAt`/`claimedByUserId` is the MVP audit; promote when the moderation audit table lands) and de-duping the client/server **publish-gate** predicate (a nit refactor).

## Open decisions — brief changed the plan

1. **Stripe: wire now, or stay parked?** Brief pulls it into M0; schema is ready so it's a contained job (checkout + webhook + gating read, no migration). Trade-off: build it cold now vs. when the ~3–6mo free-intro period actually ends.
2. ✅ **RESOLVED 2026-06-19 → Resend (built).** Email path: Microsoft Graph API vs. Resend/Postmark. Brief said Outlook/M365 (`nora@healingtides.co`) — but you can't *send automated flows from a mailbox*. **Chosen: a transactional sender (Resend), built as `lib/email.ts`.** Trade-off accepted: the from-address is a verified sending subdomain (e.g. `hello@mail.healingtides.co`), not `nora@` — revisit with Graph later if keeping her real address matters. John still owes `RESEND_API_KEY` + `EMAIL_FROM` + domain verification.
3. **Claim flow sources from Psychology Today.** Better-specified than "CSV," but PT scraping carries **ToS/legal sensitivity** (a Christie question) and changes Nora's deliverable from "spreadsheet" to "list of PT profile URLs."
4. **Pricing simplified to ~$30 single tier + 3–6mo free intro** (was $10/$25/$100). Schema supports both, so no rework — just confirm the launch shape. Free-intro window length (3 vs. 6 mo / through Dec) is itself an open call (§13).
5. **Crisis UX** (§8 open): pause/close chat vs. overlay message — design with Nora.
6. **Out-of-state messaging** aggressiveness (§11 open).
7. **Account-deletion semantics (GDPR) — Christie.** When a user deletes their Clerk account, do we *hide* their data (today's behavior, preserves an audit trail) or *hard-erase* it (true right-to-erasure)? The schema is erasure-ready (`Practitioner → User` cascade; `ProfileView` follows) but the Blob photo needs explicit cleanup. **Recommended:** split it — ban/lock → hide; voluntary `user.deleted` → erase (cascade-delete the `User` row + delete the photo blob). Code site flagged in `app/api/webhooks/clerk/route.ts`. ~1hr to implement once the call is made.

## Owed by Nora (don't block M1)

- Matching **"homework" doc** — example seeker cases + her pairings + what other platforms miss (gates M2 quality).
- Final **seeker intake questions** + pairing logic.
- **Admin dashboard sketch** (napkin-level) or "you design it" sign-off.
- **Top licenses + board-URL shortlist** for verification automation.
- The **waitlist → PT profile URL list** to seed the claim flow.
- Crisis **escalation path** when she's unavailable + the after-hours message copy.

## Config owed by John (standing)

Step-by-step for the launch-hardening items: **[RUNBOOK-prelaunch.md](RUNBOOK-prelaunch.md)**.

- 🔴 **Rotate the leaked Neon + Clerk + Serper credentials** (all shared in chat) before any production push.
- `SERPER_API_KEY` in `.env.local` + Vercel — powers the practitioner local-visibility audit (returns "not configured" until set). Rotate the one pasted in chat via [serper.dev](https://serper.dev).
- ✅ **DB migrations are all applied to prod** (`prisma migrate status` clean as of 2026-06-28): `init`, `add_invites`, `add_user_last_seen`, `add_feedback`(+context), `add_seeker_intake_and_match`, `add_saved_practitioners`. The claim/admin-invite, feedback, matching, and seeker-account code all run live. Migrations are John-run by default; he has twice explicitly authorized the agent to run `db:migrate:deploy` per-request. Full process: **[DB-OPERATIONS.md](DB-OPERATIONS.md)**.
- **`RESEND_API_KEY` + `EMAIL_FROM` in `.env.local` + Vercel**, and verify a sending domain at [resend.com](https://resend.com) — powers the now-wired email layer (claim invites auto-send once set; until then invites still mint a copyable link). `EMAIL_FROM` must be `Name <addr@verified-domain>`.
- `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel + the Clerk dashboard webhook (`user.updated` + `user.deleted` + `session.created` for the admin last-seen / who's-active read) — moderation auto-hide 501s until then.
- `ADMIN_EMAILS` in Vercel — `/admin` is closed until set.
- Paste the **Neon connection string** into `.env.local` (local dev/migrations blocked).
- Production **Clerk instance** (real Google OAuth + verified domain; replaces the dev-mode badge).
- ⏳ **POST-LAUNCH MAJOR TODO — Neon dev/prod split.** Add a **dev branch** (clone prod → dev) so local + Preview stop touching real user data, and migrations get tested on a true copy before prod. **Deliberately deferred until after launch** (decision 2026-06-20): pre-launch the DB is mostly test data, so the split earns its keep only once there's real prod data worth cloning. Pair with bumping Neon to **Launch plan** (7-day PITR) + a scheduled `pg_dump`. Setup steps: [DB-OPERATIONS.md](DB-OPERATIONS.md) § Dev / prod separation.
- **HIPAA scope** research (gates all seeker data work).
- Business **bank + Stripe payout** setup (separate LLC/EIN — per brief §3).
- ✅ Done: `feat/practitioner-listing-mvp` merged → `main`; CI (`tsc` + Vitest) gates every push/PR.

---

## Recently shipped

### 2026-06-26 → 28 — the M2 seeker loop went real (intake → match → deliver → save)
The whole guided seeker side landed across this stretch — the product's "decision tool" thesis is now live, not a prototype. Architecture/why: ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md) (matching workspace) + ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md) (onboarding agent + accounts).
- ✅ **Conversational onboarding agent** at `/get-matched` — voice by default (OpenAI Realtime + WebRTC; model `gpt-realtime`) and an equal text chat (Vercel AI SDK v6; `gpt-4.1`), plus a `/get-matched/form` floor. Shared tool layer (`lib/onboarding/tool-logic.ts`): search/get practitioner, reflect priorities, crisis resources (speaks 988/911 aloud), save intake. *Model is OpenAI, not Claude — the AI Gateway free tier 403s Claude here.*
- ✅ **Two-pane discovery** — chat on the left; practitioners surface as cards in a right-hand rail (`_discovery/SurfacedContext`) + a saved "basket" (`_considering/ConsideringContext`, localStorage). Mobile = a bottom-sheet drawer. The agent shows people early + nudges saving more than one.
- ✅ **Nora's matching workspace** (`/admin/seekers`, `/admin/seekers/[id]`) — reads an intake, rule-out + hand-pick a shortlist with a reason per pick → `Match` rows. Curation, not ranking (ADR 0001).
- ✅ **Optional seeker accounts** (`/save-account` → `/dashboard`) — anonymous-by-default; the basket (both the chat shortlist *and* the directory "Save profile" key) merges into `SavedPractitioner` on first visit; `seekerWelcomeEmail` sends once via an atomic claim; `/welcome` routes returning users by role; nav shows "Your profile" only to actual practitioners.
- 🔒 **Hardened by an adversarial pre-deploy review** (4 dimensions → per-finding verification): **10 confirmed findings fixed before ship** — incl. a HIGH where directory saves wrote a key the sync never read (silent data loss), the welcome-email double-send/never-send race, and the shared-column deploy-order trap (`welcomed_at` on `users`).
- **Verified:** `tsc` + **397 tests** + `npm run build` + secret-scan + live smoke (sign-up, basket CTA, dashboard gate) all green. **State: LIVE on `main` (`cce0df9`)** — migration applied to prod *before* the code push (deploy-order rule). **To fully light up:** set `RESEND_API_KEY`+`EMAIL_FROM` (welcome + intro emails); HIPAA determination (Christie) before real seekers; publish more practitioners (only 2 live).

### 2026-06-25 — admin practitioner-activity read ("who's active" + traction)
Answers Nora's June-10 ask for a dashboard to "monitor activity, trends, and gaps." The `/admin` practitioner table now shows engagement and traction at a glance, sortable.
- ✅ **Activity chip** per practitioner — New / Active / Quiet / Dormant, from their last profile edit. Pure + unit-tested (`app/_lib/activity.ts` + `classifyActivity`/`relativeShort`, 11 tests in `tests/activity.test.ts`).
- ✅ **Recent views** — 7-day / 30-day counts (grouped reads over `profile_views`; `viewedAt` indexed) + **last-viewed** ("seen 4d ago"). No migration.
- ✅ **Sortable columns** — name / activity / completeness / views (`app/admin/PractitionersTable.tsx`; `now` passed from the server page so relative times don't drift on hydration).
- 🟡 **Sign-in tracking** (`User.lastSeenAt`) — stamped on Clerk `session.created`, deliberately NOT on render, so the read-only `getPractitioner` GET path stays write-free (the role-fork contract). Sharpens the Activity read once on; the classifier already accepts it. **To activate, in order:** (1) `npm run db:migrate:safe -- add_user_last_seen` → review → `npm run db:migrate:deploy` (additive `ALTER TABLE "users" ADD COLUMN "last_seen_at" TIMESTAMP(3)` — zero data loss); (2) subscribe `session.created` on the Clerk webhook; (3) merge `feat/last-seen-tracking`. Until then `lastSeenAt` is null and the read falls back to last-edit — no breakage.
- **Verified:** `tsc` + **311 tests** + `npm run build` + secret-scan all green. **State (2026-06-25): LIVE on `main` (`e541f0b`)** — both parts merged + deployed; the `add_user_last_seen` migration is applied to prod (`prisma migrate status` clean; prod serving 200). To fully light up sign-in tracking, subscribe Clerk `session.created` (+ `CLERK_WEBHOOK_SIGNING_SECRET`) so `lastSeenAt` populates — until then the Activity chip reads from last-edit (no breakage). `/admin` opens once `ADMIN_EMAILS` is set in Vercel.

### 2026-06-18 → 19 — brand center evolution + a hardening pass
The 2026-06-16 brand "shell" (below) grew into the **flagship practitioner surface**. Canonical architecture: **[architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md)** + the score-demotion/ethics **ADR** in [planning/decisions-log.md](../planning/decisions-log.md). In brief:
- ✅ **Live Serper → moon states + a `__presenceScan` cache** — the fast-follow the 6/16 notes asked for, shipped migration-free via a reserved `fieldValues` key (no migration after all). A completed scan now advances the dimension states for real.
- ✅ **"What seekers near you search" mirror** (`lib/seeker-language.ts`) + **momentum over time** (`__presenceScanHistory`, gain-only) + a data-aware **"Start here"** (`lib/brand-next-step.ts` — a free Google Business Profile, the #1 local-findability lever).
- ⚠️ **Scores added, then DEMOTED** — the framework now computes 0–100 personal *progress* scores (the moon is banded from the score), but after a 5-specialist research pass flagged visible numbers as risky for this audience, John chose "soften, don't drop": the number is off every at-a-glance face and revealed on tap. **Brand law: progress, never a grade/comparison.** *(Supersedes the "never a score/grade" line in the 6/16 entry below.)*
- ⚠️ **Ethics fix** — `why_trusted` never coaches soliciting client reviews (ACA/APA/AAMFT/NASW/NBCC prohibit it for current+former clients); test-guarded.
- ✅ **Hardening pass** — removed dead code, fixed stale docstrings, +5 tests (ethics guard, score-band boundaries, accent folding, cap-boundary, GBP URL) → **~266 unit+flow tests**; wrote BRAND-CENTER.md + the ADR.
- 🐞 **Known bug (deferred):** the Serper audit isn't geo-targeted — it scores the server's locale, not the practitioner's city. Quality bug, not a launch gate.

### 2026-06-16 — the non-email/Stripe batch

- ✅ Role-fork fix (`getPractitioner` read-only GETs + explicit `becomePractitioner`).
- ✅ "Ages served" directory filter (the spec's highest-importance filter).
- ✅ Video intro + socials render as sanitized external links.
- ✅ Publish-gate nudge (button disables + names the missing field; no surprise error).
- ✅ Live `/crisis` page + footer 988 safety line + "not emergency care" disclaimer.
- ✅ Organization JSON-LD + journal↔directory internal links (AI-search/SEO).
- ✅ publish/unpublish hold-guard tests.
- ✅ **Practitioner-brand framework shell (team-built)** — a new `/practitioner/brand` page: "Your brand, cared for", a research-grounded 5-dimension framework (Who you are · Who you're for · Where you're found · Why you're trusted · How you're remembered) presented as **understanding, not an audit**. `lib/brand.ts` (`buildBrand`, pure, 22 tests) computes a calm **growing-moon state** (`○ ◔ ◑ ◕`, ⚠️ *"never a score/grade" superseded 2026-06-19 — demoted progress scores were later added; see the 6/18→19 entry above*) + insights per dimension; reusable atoms (`MoonState`/`InsightCard`/`DimensionChapter`) carry **what · why-care · what-next · lift** (Gentle/Moderate/Deeper), collapsed by default. The live coverage map + map-pack fold into dimension 3; dashboard links in. Honesty guardrails baked in (no comparison, no fake AI score — `knowledgeGraphPresent` is the only honest "remembered" proxy). **Next:** feed live Serper signals (coverage/map-pack/knowledge-graph) back into the dimension states (currently on-demand inside dim 3).
- ✅ **SERP coverage map (slices 1+2, team-built)** — the visibility card is now a calm *coverage* read, not a flat check: it expands each Area of Focus into the real subcategory phrases seekers type (taxonomy `CATEGORIES`), reports "you appear for X of N searches" (appear-first, hollow-ring-not-✗), and surfaces the **peopleAlsoAsk + relatedSearches** we used to discard ("questions your people ask" / "words seekers use") — zero new API cost. `lib/serper.ts` (`searchSerpPage`), `lib/visibility.ts` (`buildCoverageQueries`+`buildCoverage`, +13 tests), `VisibilityCard.tsx`, `visibility-actions.ts`; verified live against Google.
- ✅ **`/places` map-pack drill-in (slice 4, team-built)** — each coverage term has a calm "view the local map →" toggle that lazily fetches the Google local 3-pack (`searchPlaces` → `evaluateMapPack`, `getTermMapPack` action). Rows show name + category + reviews **as a quiet fact** (never a podium/medals); the practitioner's row is gently washed + "You"-pilled if present; when absent, the genuinely-valuable footer — "a free Google Business Profile is what puts practitioners here." Per-row lazy fetch keeps Serper cost disciplined. Verified live. **Remaining fast-follow:** a `PresenceScan` cache (free re-opens + the "what opened up since last time" hook) — needs a migration.
- ✅ **"Your presence" surface (slice #1)** — the calm, *findable-not-promotional* hub on the dashboard: a private 3-stage **Findability** indicator (own-profile signals only, never a rank), a gain-framed **"this week"** view-count tied to meaning + a 6-week sparkline (from existing `ProfileView` data, zero new API cost), and **one gentle next step** (an invitation, dismissible). Built on the research that healers resist "marketing" but lean into "being findable to people who need them." Pure logic in `lib/presence.ts` (10 tests); the Serper audit sits below it, reframed to context-not-comparison ("also showing up here"). Fast-follows: `/places` local map-pack + the "Find me on Healing Tides" backlink badge.
- ✅ **Practitioner local-visibility audit** (Serper) — a dashboard "How you show up on Google" check: runs `{specialty} {city}` searches and reports whether the practitioner appears + who's ahead. The brief §10 brand/SEO upsell hook + an event recruitment lever. On-demand (no per-load API cost); needs `SERPER_API_KEY`. Persistence + scheduled refresh + AI-search presence are v2.
- ✅ **Robust flow-test system** — 3 layers (unit · in-memory flow · gated real-DB integration), reusable factories + mock-db, `docs/TESTING.md`. `npm test` = **~266 pass** as of 2026-06-19 (was 136 when this landed; cite the `npm test` run, not the older 108/136 figures floating in earlier notes); `npm run test:integration` exercises real SQL against a throwaway `TEST_DATABASE_URL` (skips green without one).
- 🟢 **Claim flow (increments 1 + 2)** — `Invite` model + `lib/invites.ts` + admin **Create claim link** (`/admin`) + the `/claim/[token]` landing page + the **completion wiring**: "Claim" sets an httpOnly `ht_claim` cookie → Clerk sign-up → the dashboard's claim-aware empty state offers "Finish claiming" → `completeClaim` creates/promotes the practitioner, **fill-if-empty prefills** from the invite (never overwriting typed values, pure `buildClaimUpdate`), and marks the invite claimed. No fake Practitioner rows, so unclaimed invites never hit the directory. Flow-tested (mint → read → claim-once; prefill; no-overwrite; already-claimed no-op). **Still needs:** (a) John runs the safe migration (`db:migrate:safe` → `db:migrate:deploy`, see [DB-OPERATIONS.md](DB-OPERATIONS.md)) to create the `invites` table; (b) a live Clerk/DB pass to validate the redirect dance end to end; (c) email to actually *send* invites (decision #2). PT auto-pull stays deferred (ToS/Christie) — practitioners use the existing importer post-claim.

## Next up

1. **Account-deletion semantics** — decision-gated ([decision #7](#open-decisions-brief-changed-the-plan), Christie). ~1hr once decided.
2. ✅ **Email path picked + send layer built (Resend, 2026-06-19).** Claim invites auto-send. Next email increments (sender's ready, just add triggers): completeness *reminder emails* + M2 referral/intro emails. John sets `RESEND_API_KEY`/`EMAIL_FROM` + verifies the domain to switch it on.
3. **Stripe** (decision #1) — clean M0 job now while the schema's fresh, if we say go.
4. Nora-gated: claim flow, matching homework, admin dashboard sketch, license/board URLs.

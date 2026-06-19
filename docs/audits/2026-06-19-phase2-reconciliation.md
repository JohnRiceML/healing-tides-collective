# Phase 2 reconciliation — promised vs. delivered (code-verified)

**Date:** 2026-06-19 · **Method:** 5-agent reconciliation workflow (promises lens · claimed-status lens · code-truth lens · blockers lens → synthesis), every claim grounded in a cited file. **Branch:** `feat/practitioner-listing-mvp`, head `77412e2`.

> Companion to [BUILD-TRACKER.md](../BUILD-TRACKER.md) (the living milestone status) and the founding [notes/initial-brief.md](../../notes/initial-brief.md). This doc adds two things the tracker didn't: a **promised-vs-delivered tally against the *founding* brief**, and a **doc-truth audit** — places our own status docs read as more-done than the code supports.

## Headline
Phase 1 (the practitioner listing) is genuinely **~80% live and code-verified**. Phase 2 (guided seeker intake, matching, the request-intro flow, billing, the admin command center) is **greenfield — clickable prototypes with zero backend** — and is blocked far more on **Nora's matching brief + a handful of John config/decision items** than on engineering effort.

**The strategic gap to name with Nora:** the founding brief is explicit — *"We are **not** a directory… we are a decision-making tool for care."* What's live today **is** a directory (`/practitioners`) + the brand center. Both are real, shipped value and a sound practitioner-acquisition wedge — but the guided **"Get Matched"** experience that is the actual product thesis has **not been started**. Leading with the practitioner side first was the right sequence (you need practitioners before you can match anyone); the point is to say it plainly, not let a demo imply Get-Matched is built.

## Tally — 29 promised items, code-verified
| State | Count | |
|---|---|---|
| ✅ Delivered | 13 | auth · taxonomy + fields · directory + search · SEO profile pages · publish states · view analytics · basic admin · moderation + webhook · 3-layer tests + CI · Neon/Prisma · the brand center · demo-ready · prototype-scope artifact |
| 🟡 Partial | 7 | claim flow (errors until migrate) · completeness nudges (no email) · media uploads (photo only) · verified badges (no automation) · SEO links/schema gaps · crisis (page only, no detection) · tiered badges |
| 🅿️ Prototype-only | 2 | guided seeker intake · admin command center (8-section) |
| 🔴 Not started | 6 | matching/recommendations · request-intro flow · seeker dashboard · Stripe billing/tiers · out-of-state gating · waitlist invite emails |
| ⏸ Deferred | 1 | HIPAA enforcement (compliant by absence — nothing to enforce until seeker data exists) |

## ⚠️ Doc-truth audit — where our docs overclaim
These were caught by cross-checking the status docs against the actual code. Corrected in the docs as of this date; recorded here so the pattern is visible.

1. **Claim flow read as "wired."** Reality: the `Invite` model is in `schema.prisma:142` but the **only migration on disk is `20260531222940_init`** — no invites-table migration is applied to Neon, so `db.invite.*` calls (`app/claim/claim-actions.ts`, `app/admin/actions.ts`) **throw at runtime** until `npm run db:migrate` (`prisma migrate dev`) is run. "Wired" overstated a path that can't execute. (John-only; classifier blocks the agent.)
2. **Email read as "decided, not wired."** Reality: **there is no email layer at all** — no `resend`/`nodemailer`/`@microsoft/graph`/`postmark`/`sendgrid` dependency in `package.json`, no `lib/email.ts`, no `emails/`. This single missing layer blocks the most-promised flows (invites, completeness nudges, referral + intro emails). It's a build, not a wiring task.
3. **Stripe read as "schema prepped, small wiring."** Reality: **zero Stripe runtime code, no `stripe` dependency**. The dormant schema fields (`stripeCustomerId`, `subscriptionStatus` enum, `tier`, `featured`) are real, but it's a clean greenfield build.
4. **Test count cited inconsistently** (108 / 136 / 266 across docs; raw grep ≈ 555 `test`/`it` call-sites). The suite is real and substantial — the gate runs **~266 unit + flow tests** (plus gated real-DB integration) — but don't quote a precise figure to partners; pick one source (the `npm test` run) and stick to it.
5. **Prototype surfaces presented as capabilities.** `Get Matched` and the 8-section admin command center render hardcoded `app/prototype/**/mock.ts` data with no backend. Don't demo them as functioning.
6. **Brand center "works" without its caveat.** It's live and accurate, but its Serper visibility audit **never passes a geo `location`**, so it scores the *server's* locale, not the practitioner's region. A quality bug, not a launch gate — but a "works" claim should carry it.

## Critical path — what unblocks the rest
- **Nora (no ETA, gates the entire seeker side):** the matching "homework" doc — example seeker cases, *her actual pairings*, the pairing logic, final intake questions. Also the admin-dashboard sketch, the waitlist (~40 → PT-URL list), and license-types/board-URLs for badges. (Asks already drafted: [notes/nora-phase2-inputs-request.md](../../notes/nora-phase2-inputs-request.md).)
- **John (decisions):** the **email path** (Microsoft Graph to keep the `nora@` from-address vs. Resend for speed) is the single highest-fan-out call; Stripe now vs. after the free-intro window.
- **Christie (legal):** account-deletion erasure semantics; Psychology Today scraping ToS for claim seeding.
- **Launch config (John, ~1 hr batch):** `db:migrate`; rotate exposed Neon/Clerk/Serper creds; `CLERK_WEBHOOK_SIGNING_SECRET` + `ADMIN_EMAILS`; `SERPER_API_KEY` in Vercel. Security, not polish — gates *any* prod traffic. Full steps: [RUNBOOK-prelaunch.md](../RUNBOOK-prelaunch.md).

## Recommended sequence
1. **Today (~10 min):** run `db:migrate` — turns the claim flow from "throws" into working, nearly free.
2. **Before real traffic (~1 hr, one batch):** the credential-rotation + env block above.
3. **Next build (regardless of Phase-2 timing):** pick the email path and build the layer (~½ day) — unblocks invites + nudges now, intros/referrals later. Lean **Resend** unless keeping `nora@healingtides.co` as sender is non-negotiable.
4. **Next Nora call = one deliverable:** the matching brief. Until it exists, Phase 2 can't truly start — so Stripe and the seeker dashboard should wait behind it.

**Bottom line:** over-delivered on the practitioner side + the brand center; ~1 hour of config from a launchable Phase 1; Phase 2 is a *product-input* problem (Nora) before it's an *engineering* problem.

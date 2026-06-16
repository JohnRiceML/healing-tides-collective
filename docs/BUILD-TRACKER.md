# Healing Tides — Build Tracker (June-10 Brief)

> **What this is.** The single source of truth for *what was promised in the June-10 build brief* and where the code actually stands against it. Every status line is grounded in verified code (file paths cited), not memory.
>
> **Source brief:** the "Healing Tides — Build Brief for the App Team" (synthesizes the **June 10 sync** + **May 20 Phase-2 call**). That brief owns *strategy & intent*; this doc owns *status & evidence*.
>
> **Last verified against code:** 2026-06-16 (branch `feat/practitioner-listing-mvp`, head `138bdc7`).
>
> **Supersedes PHASE-2-STATUS.md.** That older "Listing MVP" tracker has been **folded into this doc and retired** (its body is now a pointer here). Its drift — listing Stripe + Resend as "locked" when neither is wired — is corrected below: those were *decided and agent-stubbed*, never implemented. Its commit-referenced shipped ledger is preserved under [Shipped ledger](#shipped-ledger-commit-trail).

**Status legend:** ✅ Done & live · 🟡 Partial / foundation only · 🔴 Not started · 🅿️ Parked (deliberate) · 🐞 Known bug

---

## TL;DR

- **Milestone 1 (practitioner profiles + directory)** is ~80% built and demo-ready.
- **Milestone 0 (foundation)** is half-there — the missing half (Stripe, email sending, the relational tables for applications/matches/messages) is exactly what Milestones 2–3 branch off.
- **Milestones 2–3 (seeker/matching, safety, command center, monetization)** are essentially greenfield.
- The brief **moves three goalposts** vs. prior plans — tracked under [Open decisions](#open-decisions-brief-changed-the-plan).
- One **live bug** blocks the seeker side: signing in silently turns any user into a *practitioner*.

---

## Milestone 0 — Foundation

| Brief item (§3) | Status | Evidence / reality |
|---|---|---|
| **Database** (practitioners, seekers, profiles, applications, matches, messages/events) | 🟡 | Only `User`, `Practitioner`, `ProfileView` exist in `prisma/schema.prisma`. **No `Application`, `Match`, `Message`, `Consultation`, or `Seeker` models** — this is the real foundational gap before M2. |
| **Google auth + account creation AND deletion (both user types)** | 🟡 | Clerk wired, Google enabled (`/join`, `/sign-in`). The user-facing **"Delete account"** already exists via Clerk's `UserButton` (enable the toggle in the Clerk dashboard — John). What's unresolved is **what deletion does to our data**: today `user.deleted` only *hides* the profile (not erasure). True erasure vs. hide-and-preserve is a legal call — see [decision #7](#open-decisions-brief-changed-the-plan). |
| **Stripe wired now** (before charging) | 🔴 | No Stripe dependency. **But the schema is already prepped:** `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus` enum (`NONE/TRIALING/ACTIVE/PAST_DUE/CANCELED`), plus dormant `tier` / `featured` / `accountType` on `Practitioner`. So wiring = checkout + webhook + a gating read; **no migration**. See [decision #1](#open-decisions-brief-changed-the-plan). |
| **Email automation scaffolding** (transactional + follow-up) | 🔴 | No email-send library present at all. ⚠️ Brief specifies Outlook/M365 — that's a *mailbox*, not a sending API. See [decision #2](#open-decisions-brief-changed-the-plan). |

## Milestone 1 — Practitioner profiles + directory (the networking-event deliverable)

| Brief item (§4 M1) | Status | Evidence / reality |
|---|---|---|
| Profile pages: bio, photo, social/site links, ~7 category tags, **values / "what healing means to you"** | ✅ | Live on prod. Two-column profile, Quick-details sidebar, cover system. |
| Directory + filtering, **free at launch** | ✅ | `/practitioners` — search, specialty/modality/region/accepting-new filters, sort. |
| **"Claim your profile" — auto-pull Psychology Today, one-click pre-fill** | 🟡 | Foundation only: the URL/paste importer (Claude extract, SSRF-guarded) *can* ingest a profile URL. The **tokenized claim flow itself is not built**. ⚠️ source changed from "Nora's CSV" to "PT URLs" — see [decision #3](#open-decisions-brief-changed-the-plan). |
| Credential capture + **verified badge** | 🟡 | Badge system exists (`__verified` reserved key + admin grant). **Not wired to proof or licensing-board lookup** (§6 automation unbuilt). |
| **Profile-completeness nudges** ("90% complete" + reminder emails) | 🟡 | Completeness is *computed* (`lib/completeness.ts`); the nudge UI + reminder emails aren't built (emails blocked on M0). |
| **Admin panel (basic):** applied / pending / approve-reject / request edits | 🟡 | Have read-only list + badge-grant + hold/release. **No application queue, no approve/reject** — there's no "application" concept yet. |

## Milestone 2 — Matching + seeker side (~mid-July target)

| Brief item (§4 M2 / §5) | Status | Evidence / reality |
|---|---|---|
| **Seeker intake** — conversational/voice-style, ~5–10 questions | 🔴 | "Get matched" is a `mailto` today. |
| **Matching engine** encoding Nora's clinical intuition | 🔴 | Gated on Nora's "homework" doc (§5). |
| **Seeker accounts** with abstracted/de-identified identity | 🔴 | Surface unbuilt — but the blocking **role-fork bug is fixed** (2026-06-16): page GETs now use the read-only `getPractitioner()`; promotion happens only via the explicit `becomePractitioner` action, so visiting `/practitioner` no longer turns a seeker into a practitioner. `lib/auth.ts`, `tests/auth.test.ts`. |
| **Referral delivery** (curated list to seeker; de-identified ping to practitioner) | 🔴 | Needs the relational tables + email sender. |
| **Consultation request flow** (availability → request → accept/decline → email ping) | 🔴 | No `Consultation` model; no scheduling. (Brief: keep on-platform, **no external calendars yet**.) |

## Milestone 3 — Safety / command center / monetization / expansion

| Brief item (§4 M3 / §8–§11) | Status | Evidence / reality |
|---|---|---|
| **Crisis detection & safety** (keyword flag → admin + Nora's cell; crisis page; 988; after-hours auto-reply) | 🔴 | A crisis-resources page exists only in a **dead `/prototype` route** (not in live nav). Non-negotiable per brief; design early. |
| **Full admin command center** (§9) | 🔴 | Only the basic read/badge/hold surface exists. |
| **Email automation flows live** (outreach, nudges, newsletters) | 🔴 | Blocked on M0 email decision. |
| **Tiered pricing + group-practice tier** (§10) | 🔴 | Schema pre-models it — `AccountType` enum already has `GROUP_PRACTICE` + `TREATMENT_CENTER`; `tier`/`featured` dormant. |
| **Out-of-state handling** (§11: MN-only; waitlist for other states; crisis still → 988) | 🔴 | No geography gating anywhere; region is free-text. |

## Cross-cutting

| Area | Status | Evidence / reality |
|---|---|---|
| **Moderation pillar** (hold/release, audit, Clerk→DB auto-hide on ban/delete) | ✅ | `app/_lib/moderation.ts`, `docs/MODERATION.md`, Clerk webhook. (Config still owed — see below.) |
| **§12 SEO / AI visibility** | ✅ mostly | **GA4 live & real** (`G-EJZ1TBDT3W` via `@next/third-parties` in `app/layout.tsx`). Sanity blog live (~10 posts). Structured metadata + JSON-LD (Person on profiles, Article/FAQ on posts) verified. **Gaps:** no journal↔directory internal links, no city/specialty pages, no Organization/LocalBusiness schema. |
| **§7 HIPAA guardrails** | 🅿️ clean | No seeker data is stored *anywhere* yet, so we're compliant by absence. The preferences-only / boolean-insurance / de-identified-referral principles are the design to **enforce when M2 is built**. Gated on John's compliance research. |
| **§6 Credential-verification automation** (board-URL scan → auto-verify) | 🔴 | Needs Nora's license-types + board-URL shortlist. |

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

## Open decisions — brief changed the plan

1. **Stripe: wire now, or stay parked?** Brief pulls it into M0; schema is ready so it's a contained job (checkout + webhook + gating read, no migration). Trade-off: build it cold now vs. when the ~3–6mo free-intro period actually ends.
2. **Email path: Microsoft Graph API vs. Resend/Postmark.** Brief says Outlook/M365 (`nora@healingtides.co`) — but you can't *send automated flows from a mailbox*. Either send via **Graph API** (keeps the from-address, more setup) or add a **transactional sender** (faster, new from-domain to verify). Blocks all M1 nudges + M2 referral emails.
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

- 🔴 **Rotate the leaked Neon + Clerk credentials** (shared in chat) before any production push.
- `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel + the Clerk dashboard webhook (`user.updated` + `user.deleted`) — moderation auto-hide 501s until then.
- `ADMIN_EMAILS` in Vercel — `/admin` is closed until set.
- Paste the **Neon connection string** into `.env.local` (local dev/migrations blocked).
- Production **Clerk instance** (real Google OAuth + verified domain; replaces the dev-mode badge).
- Neon: bump to **Launch plan** (7-day PITR) + a scheduled `pg_dump`, and add a **dev branch** so local testing never touches the prod/preview DB.
- **HIPAA scope** research (gates all seeker data work).
- Business **bank + Stripe payout** setup (separate LLC/EIN — per brief §3).
- ✅ Done: `feat/practitioner-listing-mvp` merged → `main`; CI (`tsc` + Vitest) gates every push/PR.

---

## Recently shipped (2026-06-16 — the non-email/Stripe batch)

- ✅ Role-fork fix (`getPractitioner` read-only GETs + explicit `becomePractitioner`).
- ✅ "Ages served" directory filter (the spec's highest-importance filter).
- ✅ Video intro + socials render as sanitized external links.
- ✅ Publish-gate nudge (button disables + names the missing field; no surprise error).
- ✅ Live `/crisis` page + footer 988 safety line + "not emergency care" disclaimer.
- ✅ Organization JSON-LD + journal↔directory internal links (AI-search/SEO).
- ✅ publish/unpublish hold-guard tests.

## Next up

1. **Account-deletion semantics** — decision-gated ([decision #7](#open-decisions-brief-changed-the-plan), Christie). ~1hr once decided.
2. **Pick the email path** (decision #2) → wire scaffolding → unblocks completeness *reminder emails* + M2 referrals.
3. **Stripe** (decision #1) — clean M0 job now while the schema's fresh, if we say go.
4. Nora-gated: claim flow, matching homework, admin dashboard sketch, license/board URLs.

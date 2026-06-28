# Healing Tides Collective — System Map

**Last updated:** 2026-06-28

> **This is a living document** — the canonical "where things live + current status" map. When the code moves, **update this in the same change.** When a doc and the code disagree, **the code wins — and this file gets fixed.** It lists load-bearing *entry points* and subsystems, **not every file** (exact paths drift and mislead — search the code for them). The rules that keep this alive are in [AGENTS.md](../AGENTS.md#the-living-doc-protocol--keep-docs-alive).

## What the product is
A guided "Get Matched" platform for finding clinical + holistic care — therapy, acupuncture, reiki, movement, trauma-informed support. Not a directory; a decision-making tool. Founder: **Nora L. Hollenkamp, MSW, LICSW**. Domain `healingtides.co`. Hosting: Vercel.

> **🗺️ Scope: MINNESOTA-ONLY (v1).** Practitioners, seekers, matching, credential verification, and the local-visibility audit are all scoped to Minnesota for now. This is a deliberate constraint, not a gap — keep it apparent across the system (credential boards are MN; the geo audit defaults a bare city to MN — `lib/geo.ts`; out-of-state seekers get a "we're growing" message, not a match — UX TBD with Nora). Multi-state is a future expansion; when it lands, drop the MN defaults + add a state field to intake.

## Status at a glance
| Phase | What | State |
|---|---|---|
| **Phase 1** | Immersive landing + "Meet Nora" + Sanity journal | ✅ **Live** |
| **Practitioner Listing MVP** | Practitioner sign-up → profile → public directory + SEO + brand center | ✅ **Live (prod)** |
| **Phase 2 — Get Matched (seeker side)** | Conversational onboarding agent (text + voice) → intake → Nora's matching workspace → shortlist delivery; optional seeker accounts | 🟢 **Live (prod)** — the guided core is real now, not a prototype (the old `/prototype/*` mocks remain as references only) |
| **Database** | Prisma 7 → Neon Postgres | 🟢 **Wired** — `User` · `Practitioner` · `ProfileView` · `Invite` · `Feedback` · **`SeekerIntake` · `Match` · `SavedPractitioner`**; all migrations applied to prod |
| **Phase 2 (backend)** | Clerk · Resend · Stripe | 🟡 **Clerk + Resend wired** (Resend env-gated — see config owed); **Stripe still parked** (schema-ready, dormant) — see [PHASE-2-SYSTEMS.md](architecture/PHASE-2-SYSTEMS.md) |
| **Phase 2 (scope)** | Pricing/billing, the matching engine's smarts | ⏳ Matching is a **curation workspace** today (ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md)); pricing/Stripe parked |

## Surfaces (routes)
| Path | Purpose | Status |
|---|---|---|
| `/` | Immersive, chapter-based scroll landing | Live |
| `/about` | "Meet Nora" — founder bio | Live |
| `/journal`, `/journal/[slug]` | Sanity-backed editorial journal | Live |
| `/studio` | Embedded Sanity Studio | Live |
| `/prototype/*` | Phase 2 clickable prototype (seeker / practitioner / admin / provider / resources / scope) | Prototype — UI only |
| `/join` | Practitioner sign-up (Clerk + Google) — **the practitioner door** | 🟢 Live (prod)¹ |
| `/sign-in` | Returning-practitioner sign-in (Clerk) | 🟢 Live (prod)¹ |
| `/practitioner` | Practitioner **dashboard** — Clerk-gated; profile strength, "your brand" band, "how people find you" + the editor at `/practitioner/edit` (config-driven via `app/_lib/profile-fields.ts` → `fieldValues` JSON) → Postgres + completeness + **Publish/Unpublish** | 🟢 Live (prod)¹ |
| `/practitioner/brand` | Practitioner **brand center** — Clerk-gated, read-only; the 5-part framework (who you are / who you're for / where you're found / why you're trusted / how you're remembered) as growing moons + demoted progress scores, a live on-demand Serper visibility audit, the "what seekers near you search" mirror, momentum over time, and a data-aware "Start here" (free Google Business Profile). **Full architecture: [architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md).** | 🟢 Live (prod)¹ |
| `/practitioners` | Public **directory** — published profiles, specialty/format filters + free-text search | 🟢 Live (prod)¹ |
| `/practitioners/[slug]` | Public **SEO profile page** — `generateMetadata` + JSON-LD; the "found on Google" page | 🟢 Live (prod)¹ |
| `/sitemap.xml` | Sitemap — static routes + every published practitioner URL (`app/sitemap.ts`) | 🟢 Live (prod)¹ |
| `/get-matched` | **Seeker onboarding agent** — a real-time conversational guide (voice by default via OpenAI Realtime, or text), two-pane: chat on the left, practitioners surfacing as cards in a right-hand rail + a saved "basket". Anonymous (no account). | 🟢 Live (prod)¹ |
| `/get-matched/form` | The same intake as a plain form (the non-conversational path) | 🟢 Live (prod)¹ |
| `/save-account` | **Seeker sign-up** (Clerk) → `/dashboard` — the opt-in "save your list" account. New users are `SEEKER`. | 🟢 Live (prod)¹ |
| `/dashboard` | **Seeker dashboard** — Clerk-gated; saved practitioners as cards (link through to reach out) + a resources rail. Merges the anonymous basket on first visit; sends the welcome email once. | 🟢 Live (prod)¹ |
| `/welcome` | Role-aware **post-sign-in router** — practitioner → `/practitioner`, seeker → `/dashboard` | 🟢 Live (prod)¹ |
| `/admin` | **Admin command center** — the daily-action home ("what needs you today": intakes to match, pending invites, profiles to nudge, new feedback, drafts, on-hold) + the health-of-the-app stats. ADMIN-gated (`requireAdmin`) + noindex. | 🟢 Live (prod)¹ |
| `/admin/practitioners` | Practitioner list (status / completeness / views / activity / AI-triage badge) + **bulk invite** (paste → editable rows → send claim links) + single invite + completeness reminders | 🟢 Live (prod)¹ |
| `/admin/practitioners/[id]` | **Practitioner detail / triage** — view the profile + private admin notes + direct email (Resend) + a one-click **AI triage** (categorize + insight flags, cached in `__aiTriage`). The "people management" layer. | 🟢 Live (prod)¹ |
| `/admin/seekers`, `/admin/seekers/[id]` | **Nora's matching workspace** — reads a seeker intake, hand-builds a shortlist with a reason per pick, hands off. A **curation tool, not a ranker** (ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md)). | 🟢 Live (prod)¹ |
| `/admin/feedback` | In-app feedback inbox (triage) | 🟢 Live (prod)¹ |

¹ Live in production. **`main` is the production branch** — Vercel auto-deploys `main` → Production, and the listing branch is merged into it. CI (`.github/workflows/ci.yml`) runs `tsc` + Vitest on every push / PR.

> **Two-door model** ([architecture/EXPERIENCE-MAP.md](architecture/EXPERIENCE-MAP.md)): the landing forks into **seeker** ("find care" → public directory + the guided `/get-matched` agent) and **practitioner** ("for practitioners" → pitch → `/join` → `/practitioner`). The public read layer is `lib/practitioners.ts` (published-only — the single source of public reads), publish/unpublish live in `app/practitioner/publish-actions.ts`, and the canonical origin is `lib/site.ts` (`www`). **Seekers are anonymous by default** — they browse, get matched, and build a basket with nothing stored server-side. An **optional account** is the opt-in upgrade (`/save-account` → `/dashboard`) that persists their saved list; the welcome email + dashboard sit behind it. Accounts are typed by `User.role` (`SEEKER` default); `/join` is the practitioner door, `/save-account` the seeker one. **Why anonymous-by-default:** ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md).

## Subsystems & ownership
**Frontend** — Next.js 16 App Router, React 19, Tailwind v4, Framer Motion. Entry: `app/` (landing `app/page.tsx`; prototype `app/prototype/`; shared helpers `app/_lib/`). **Owned by the style team** — tokens in `app/globals.css` (`@theme`), the canonical **[design system + style guide](design/STYLE-GUIDE.md)** + the practical [build checklist](design/UI-SYSTEM.md), the shared component library in `app/_components/ui.tsx` (Button / Card / Field / Container / ChoiceChip…; a shim keeps the prototype's old imports working). Agents: `design-system-steward` (lead) + `component-architect` / `page-builder` / `a11y-steward` / `motion-designer`.

**CMS — Sanity (editorial only).** Entry: `sanity/` (client, queries, schema types: `post` / `author` / `category`) + the `/studio` route. Journal + page copy. **Not** for app/matching data.

**Phase 2 backend — owned by [`.claude/agents/`](../.claude/agents)** (Data + Auth **wired**; Billing + Email decided, not yet wired):

| System | Owner agent | Target location (HTC: root `app/`, no `src/`) |
|---|---|---|
| Data — Prisma 7 → Neon Postgres | **DB team** (lead `db-architect` + `db-migration-engineer` / `db-performance` / `db-reliability` / `db-integrity`) | `prisma/schema.prisma`, `lib/db.ts`, client → `lib/generated/prisma` |
| Auth — Clerk (identity, roles, webhook→User mirror) | `auth-clerk` | `proxy.ts` (root; Next 16's renamed middleware), `lib/auth.ts` |
| Billing — Stripe (Checkout/portal/webhook, gating) | `billing-stripe` | `lib/subscription.ts`, Stripe webhook route |
| Email — Resend (transactional, templates) | `email-resend` | `lib/email.ts`, `emails/` |

Reference implementation for all four: the sibling **counsel-post** repo (which uses a `src/` layout — translate `src/lib/x` → our `lib/x`).

**DB layer — wired** (✅ `tsc` + Vitest pass): `prisma/schema.prisma` (`User` + `Practitioner` + `ProfileView` + `Invite` + `Feedback` + **`SeekerIntake` + `Match` + `SavedPractitioner`** + enums), `prisma.config.ts` (Prisma 7 CLI config — connection URLs live here, *not* in the schema), `lib/db.ts` (pg-adapter singleton on pooled `DATABASE_URL`), generated client → `lib/generated/prisma` (gitignored, `postinstall: prisma generate`). All migrations are **applied to prod Neon**. The public read layer is `lib/practitioners.ts` (PUBLISHED-only, no-PII selects); the seeker's saved-list read is `lib/saved.ts` (resilient → `[]` if a table is missing). **DB changes, migrations + backups have a runbook: [DB-OPERATIONS.md](DB-OPERATIONS.md)** — the safe `db:migrate:safe`→`db:migrate:deploy` flow, the Neon-branch dev/prod split, PITR + `db:backup`, and the never-accept-a-reset rule. **⚠️ Deploy-order rule (learned 2026-06-28):** a migration that adds a column to the *shared* `users` table (read by `getCurrentDbUser` on every authed page) must be applied **before** the code is deployed — additive columns are backward-compatible so the DB can lead; code-before-migration 500s all authed pages in the gap. **Pending:** rotate the Neon password (exposed in chat during setup) **before launch**.

**Testing — Vitest** (`tests/`, run via `npm test`; part of the quality gate; ~266 tests). **Three layers** — unit (`tests/*.test.ts`, Prisma/auth mocked) · flow (`tests/flows/*`, one in-memory mock-db across a real multi-step action sequence) · gated real-DB integration (`tests/integration/*`, `npm run test:integration`). Full guide: **[TESTING.md](TESTING.md).** Covers: the public read layer (`lib/practitioners.ts` — PUBLISHED-only + no-PII), the publish/save/claim/hold server actions, the pure utils, and the **whole brand center** — `brand.ts` (framework shape, score banding + boundaries, the **review-solicitation ethics guard**, no-shame prose), the Serper visibility orchestration (`visibility-audit.test.ts` — clobber-protection + sibling-key preservation), the say/search mirror, momentum history, and the grounded next step. UI / React Server Components aren't unit-tested; they're verified via screenshot in dev (the real pages are Clerk-gated — preview a throwaway public route).

**Auth — wired 2026-05-31** (env-gated; ✅ `tsc`): `lib/clerk-enabled.ts` (the gate boolean — db-free), `lib/auth.ts` (`getCurrentDbUser`, `getOrCreatePractitioner`, `getPractitioner` read-only), `proxy.ts` (Clerk proxy — **no route-level protection; gating is page-level** via `getCurrentDbUser` + `redirect`), `<ClerkProvider>` in `app/layout.tsx`. With no Clerk keys it all no-ops so the app still runs. Practitioner flow: `/join` → `/practitioner`. Seeker flow: `/save-account` → `/dashboard`. Returning users route through `/welcome` (role-aware). The nav (`app/_components/site-nav.tsx`) shows "Your profile" only to actual practitioners (`isCurrentUserPractitioner`).

**Seeker onboarding agent — live** (`/get-matched`): a real-time conversational guide that helps a seeker find care and surfaces real practitioners as cards. Two surfaces share one tool layer: the **text** chat (Vercel AI SDK v6, `app/get-matched/ChatOnboarding.tsx` + `lib/onboarding/tools.ts`) and the **voice** agent (OpenAI Realtime + WebRTC, `_voice/`, ephemeral client-secret minted server-side). Tool logic is shared in `lib/onboarding/tool-logic.ts` (search/get practitioner, reflect priorities, crisis resources, save intake); prompts in `lib/onboarding/system-prompt.ts` + `voice-system-prompt.ts`. **Model = OpenAI `gpt-4.1` / `gpt-realtime`** (the AI Gateway free tier 403s Claude; if a paid key lands, revisit). Surfaced practitioners flow to a right-hand rail (`_discovery/SurfacedContext`) + a localStorage "basket" (`_considering/ConsideringContext`). Crisis handling speaks 988/911 aloud.

**Seeker accounts — live** (opt-in): `/save-account` (Clerk sign-up) → `/dashboard` (`lib/saved.ts` read + `app/dashboard/actions.ts` `syncSaved`/`unsaveBySlug`/`ensureWelcomed`). The anonymous basket (both the chat shortlist *and* the directory "Save profile" key) merges into `SavedPractitioner` on first visit; `seekerWelcomeEmail` sends once via an **atomic claim** (no double-send; releases on a transient failure so it retries). Anonymous-by-default is deliberate (ADR [0002](decisions/0002-seeker-onboarding-and-optional-accounts.md)). **Pending:** add Clerk keys to `.env.local` + enable Google; HIPAA determination (Christie) gates pointing *real* seekers at intake/accounts.

## Where plans & decisions live
- **Brand center architecture:** [architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md) — the 5-part framework, the Serper visibility stack, the reserved `fieldValues` key registry, the scoring + "score demoted" design, and the **review-solicitation ethics rule**. Its honest audit + queued work: [audits/2026-06-19-brand-center-research.md](audits/2026-06-19-brand-center-research.md).
- **Build tracker (status & roadmap):** [BUILD-TRACKER.md](BUILD-TRACKER.md) — what's shipped vs. what's left, keyed to the June-10 brief, with open decisions. (Supersedes the retired PHASE-2-STATUS.md.)
- **Next-stage plan:** [docs/architecture/PHASE-2-SYSTEMS.md](architecture/PHASE-2-SYSTEMS.md) — stack, ownership, env contract, open scope questions.
- **Decisions (ADRs):** [planning/decisions-log.md](../planning/decisions-log.md) — why things are the way they are.
- **Brand / product:** `docs/` — `positioning`, `personas`, `content-strategy`, `design-spec`, `brand-guidelines`.
- **History / process:** `planning/` — `timeline`, `milestones`, `setup-checklist` (Phase-1 record + §11 Phase-2 provisioning).
- **Agent & contributor rules:** [AGENTS.md](../AGENTS.md).

## ⚠️ Known stale / open
- **Promised-vs-delivered status:** [BUILD-TRACKER.md](BUILD-TRACKER.md) is the living milestone status; the code-verified reconciliation against the *founding* brief is [audits/2026-06-19-phase2-reconciliation.md](audits/2026-06-19-phase2-reconciliation.md) (predates the M2 build — read it as history). **Phase 1 (practitioner listing) is live; the Phase 2 guided core is now real and live** — the conversational `/get-matched` agent, Nora's `/admin/seekers` matching workspace, shortlist delivery, optional seeker accounts, the admin **command center** (daily-action home), **bulk invite**, and the practitioner **triage + AI** layer all ship in prod. Still greenfield: **billing/Stripe** (parked by choice) and the deeper command-center pieces (a publish-blocking approve/reject gate, in-app messaging, consultations).
- **Honest caveats the surfaces table can hide** (don't over-claim): (1) the matching **workspace is a curation tool, not a ranker** — no fit score; structured matching fields are deferred (ADR [0001](decisions/0001-matching-workspace-curation-not-ranker.md)). (2) **Email is wired (Resend) but dormant until keyed** — `lib/email.ts` no-ops without `RESEND_API_KEY`+`EMAIL_FROM`, so claim invites + the seeker welcome email mint/queue but don't *send* until John sets them. (3) **Real-seeker launch is HIPAA-gated** — accounts are built minimal + anonymous-by-default, but pointing actual clients at intake/accounts waits on Christie's determination. (4) **`/prototype/*` is mock-only** and is now superseded by the real surfaces — kept only as reference.
- **Brand center caveat:** its Serper visibility audit isn't geo-targeted — it scores the server's locale, not the practitioner's city ([architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md) "Known gaps"). Quality bug, not a launch gate.
- Brand/product docs (`positioning`, `personas`, `content-strategy`) and the **final Phase 2 data model** await the client **call recap** (`notes/`). Update them when it lands.
- *(Add freshness flags here as they arise — mark wrong info ⚠️ rather than leaving it unmarked.)*

## How to keep this document alive
Per the [AGENTS.md living-doc protocol](../AGENTS.md#the-living-doc-protocol--keep-docs-alive): update this file in the **same change** that moves a subsystem / route / load-bearing file; the code wins on conflicts; record decisions in the ADR log; prefer subsystem + entry-point descriptions over exhaustive paths; and **bump the "Last updated" date above** whenever you touch it. The PR template ([.github/pull_request_template.md](../.github/pull_request_template.md)) has the checklist.

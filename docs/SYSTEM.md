# Healing Tides Collective — System Map

**Last updated:** 2026-05-31

> **This is a living document** — the canonical "where things live + current status" map. When the code moves, **update this in the same change.** When a doc and the code disagree, **the code wins — and this file gets fixed.** It lists load-bearing *entry points* and subsystems, **not every file** (exact paths drift and mislead — search the code for them). The rules that keep this alive are in [AGENTS.md](../AGENTS.md#the-living-doc-protocol--keep-docs-alive).

## What the product is
A guided "Get Matched" platform for finding clinical + holistic care — therapy, acupuncture, reiki, movement, trauma-informed support. Not a directory; a decision-making tool. Founder: **Nora L. Hollenkamp, MSW, LICSW**. Domain `healingtides.co`. Hosting: Vercel.

## Status at a glance
| Phase | What | State |
|---|---|---|
| **Phase 1** | Immersive landing + "Meet Nora" + Sanity journal | ✅ **Live** |
| **Phase 2 (UI)** | Get Matched: seeker intake, practitioner apply, admin/matching, provider portal, resources | 🧩 **Clickable prototype** (no backend) |
| **Practitioner Listing MVP** | Practitioner sign-up → profile → public directory (no PHI; ships first) | 🚧 **In build** on `feat/practitioner-listing-mvp` — [brief](briefs/practitioner-listing-mvp.md) |
| **Database** | Prisma 7 → Neon Postgres | 🟡 **Scaffolded** (schema + client wired & type-checked; live migration pending creds) |
| **Phase 2 (backend)** | Clerk · Stripe · Resend | 🟡 **Clerk wired** (env-gated, Google sign-up); Stripe/Resend decided, not wired — see [PHASE-2-SYSTEMS.md](architecture/PHASE-2-SYSTEMS.md) |
| **Phase 2 (scope)** | What we charge for, matching/email flows, data model | ⏳ **Pending the client call recap** (`notes/`) |

## Surfaces (routes)
| Path | Purpose | Status |
|---|---|---|
| `/` | Immersive, chapter-based scroll landing | Live |
| `/about` | "Meet Nora" — founder bio | Live |
| `/journal`, `/journal/[slug]` | Sanity-backed editorial journal | Live |
| `/studio` | Embedded Sanity Studio | Live |
| `/prototype/*` | Phase 2 clickable prototype (seeker / practitioner / admin / provider / resources / scope) | Prototype — UI only |
| `/join` | Practitioner sign-up (Clerk + Google) — **the practitioner door** | 🚧 In build (`feat/practitioner-listing-mvp`) |
| `/practitioner` | Signed-in practitioner home (ensures the profile row) | 🚧 In build |

> **Two-door model** ([architecture/EXPERIENCE-MAP.md](architecture/EXPERIENCE-MAP.md)): the landing forks into **seeker** ("find care" → public directory, no account) and **practitioner** ("for practitioners" → pitch → `/join` → `/practitioner`). Planned MVP routes not yet built: `/practitioners` (directory), `/practitioners/[slug]` (SEO profile page), `/for-practitioners` (pitch). Seekers browse **anonymously**; accounts are typed by `User.role`. `/join` is practitioner-only.

## Subsystems & ownership
**Frontend** — Next.js 16 App Router, React 19, Tailwind v4, Framer Motion. Entry: `app/` (landing `app/page.tsx`; prototype `app/prototype/`; shared helpers `app/_lib/`). **Owned by the style team** — tokens in `app/globals.css` (`@theme`), the build-the-UI system in [`docs/design/UI-SYSTEM.md`](design/UI-SYSTEM.md), the component library in `app/prototype/_components/ui.tsx` (to be promoted to `app/_components/`). Agents: `design-system-steward` (lead) + `component-architect` / `page-builder` / `a11y-steward` / `motion-designer`.

**CMS — Sanity (editorial only).** Entry: `sanity/` (client, queries, schema types: `post` / `author` / `category`) + the `/studio` route. Journal + page copy. **Not** for app/matching data.

**Phase 2 backend (decided, not wired) — owned by [`.claude/agents/`](../.claude/agents):**

| System | Owner agent | Target location (HTC: root `app/`, no `src/`) |
|---|---|---|
| Data — Prisma 7 → Neon Postgres | **DB team** (lead `db-architect` + `db-migration-engineer` / `db-performance` / `db-reliability` / `db-integrity`) | `prisma/schema.prisma`, `lib/db.ts`, client → `lib/generated/prisma` |
| Auth — Clerk (identity, roles, webhook→User mirror) | `auth-clerk` | `proxy.ts` (root; Next 16's renamed middleware), `lib/auth.ts` |
| Billing — Stripe (Checkout/portal/webhook, gating) | `billing-stripe` | `lib/subscription.ts`, Stripe webhook route |
| Email — Resend (transactional, templates) | `email-resend` | `lib/email.ts`, `emails/` |

Reference implementation for all four: the sibling **counsel-post** repo (which uses a `src/` layout — translate `src/lib/x` → our `lib/x`).

**DB layer — scaffolded 2026-05-31** (✅ `tsc` passes): `prisma/schema.prisma` (`User` + `Role`/`SubscriptionStatus` enums), `prisma.config.ts` (Prisma 7 CLI config — connection URLs live here, *not* in the schema), `lib/db.ts` (pg-adapter singleton on pooled `DATABASE_URL`), generated client → `lib/generated/prisma` (gitignored, `postinstall: prisma generate`). **Pending:** rotate the Neon password (exposed in chat during setup) → `vercel env pull .env.local` → `npm run db:migrate` to create the tables. **`Practitioner` + `ProfileView`** models added for the listing MVP (PII, not PHI); `Seeker`/`Match` still await the matching brief.

**Auth — wired 2026-05-31** (env-gated; ✅ `tsc`): `lib/clerk-enabled.ts` (the gate boolean — db-free), `lib/auth.ts` (`getCurrentDbUser`, `getOrCreatePractitioner`), `proxy.ts` (Clerk proxy), `<ClerkProvider>` in `app/layout.tsx`. With no Clerk keys it all no-ops so the app still runs. Flow: `/join` (sign-up) → `/practitioner`. **Pending:** add Clerk keys to `.env.local` + enable Google in the Clerk dashboard.

## Where plans & decisions live
- **Next-stage plan:** [docs/architecture/PHASE-2-SYSTEMS.md](architecture/PHASE-2-SYSTEMS.md) — stack, ownership, env contract, open scope questions.
- **Decisions (ADRs):** [planning/decisions-log.md](../planning/decisions-log.md) — why things are the way they are.
- **Brand / product:** `docs/` — `positioning`, `personas`, `content-strategy`, `design-spec`, `brand-guidelines`.
- **History / process:** `planning/` — `timeline`, `milestones`, `setup-checklist` (Phase-1 record + §11 Phase-2 provisioning).
- **Agent & contributor rules:** [AGENTS.md](../AGENTS.md).

## ⚠️ Known stale / open
- Brand/product docs (`positioning`, `personas`, `content-strategy`) and the **final Phase 2 data model** await the client **call recap** (`notes/`). Update them when it lands.
- *(Add freshness flags here as they arise — mark wrong info ⚠️ rather than leaving it unmarked.)*

## How to keep this document alive
Per the [AGENTS.md living-doc protocol](../AGENTS.md#the-living-doc-protocol--keep-docs-alive): update this file in the **same change** that moves a subsystem / route / load-bearing file; the code wins on conflicts; record decisions in the ADR log; prefer subsystem + entry-point descriptions over exhaustive paths; and **bump the "Last updated" date above** whenever you touch it. The PR template ([.github/pull_request_template.md](../.github/pull_request_template.md)) has the checklist.

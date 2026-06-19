# Healing Tides Collective — System Map

**Last updated:** 2026-06-19

> **This is a living document** — the canonical "where things live + current status" map. When the code moves, **update this in the same change.** When a doc and the code disagree, **the code wins — and this file gets fixed.** It lists load-bearing *entry points* and subsystems, **not every file** (exact paths drift and mislead — search the code for them). The rules that keep this alive are in [AGENTS.md](../AGENTS.md#the-living-doc-protocol--keep-docs-alive).

## What the product is
A guided "Get Matched" platform for finding clinical + holistic care — therapy, acupuncture, reiki, movement, trauma-informed support. Not a directory; a decision-making tool. Founder: **Nora L. Hollenkamp, MSW, LICSW**. Domain `healingtides.co`. Hosting: Vercel.

## Status at a glance
| Phase | What | State |
|---|---|---|
| **Phase 1** | Immersive landing + "Meet Nora" + Sanity journal | ✅ **Live** |
| **Phase 2 (UI)** | Get Matched: seeker intake, practitioner apply, admin/matching, provider portal, resources | 🧩 **Clickable prototype** (no backend) |
| **Practitioner Listing MVP** | Practitioner sign-up → profile → public directory (no PHI; ships first) | 🚧 **In build** on `feat/practitioner-listing-mvp` — sign-up, editor, **publish flow, public directory + SEO profile pages** now live on the branch; admin/claim/email next — [brief](briefs/practitioner-listing-mvp.md) |
| **Database** | Prisma 7 → Neon Postgres | 🟢 **Wired** (`init` migration applied; the live practitioner listing reads + writes it) |
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
| `/join` | Practitioner sign-up (Clerk + Google) — **the practitioner door** | 🟢 Live (prod)¹ |
| `/sign-in` | Returning-practitioner sign-in (Clerk) | 🟢 Live (prod)¹ |
| `/practitioner` | Practitioner **dashboard** — Clerk-gated; profile strength, "your brand" band, "how people find you" + the editor at `/practitioner/edit` (config-driven via `app/_lib/profile-fields.ts` → `fieldValues` JSON) → Postgres + completeness + **Publish/Unpublish** | 🟢 Live (prod)¹ |
| `/practitioner/brand` | Practitioner **brand center** — Clerk-gated, read-only; the 5-part framework (who you are / who you're for / where you're found / why you're trusted / how you're remembered) as growing moons + demoted progress scores, a live on-demand Serper visibility audit, the "what seekers near you search" mirror, momentum over time, and a data-aware "Start here" (free Google Business Profile). **Full architecture: [architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md).** | 🟢 Live (prod)¹ |
| `/practitioners` | Public **directory** — published profiles, specialty/format filters + free-text search | 🟢 Live (prod)¹ |
| `/practitioners/[slug]` | Public **SEO profile page** — `generateMetadata` + JSON-LD; the "found on Google" page | 🟢 Live (prod)¹ |
| `/sitemap.xml` | Sitemap — static routes + every published practitioner URL (`app/sitemap.ts`) | 🟢 Live (prod)¹ |
| `/admin` | **Admin** practitioner list (read-only) — ADMIN-gated (`requireAdmin`) + noindex; status / completeness / views + counts | 🟢 Live (prod)¹ |

¹ Live in production. **`main` is the production branch** — Vercel auto-deploys `main` → Production, and the listing branch is merged into it. CI (`.github/workflows/ci.yml`) runs `tsc` + Vitest on every push / PR.

> **Two-door model** ([architecture/EXPERIENCE-MAP.md](architecture/EXPERIENCE-MAP.md)): the landing forks into **seeker** ("find care" → public directory, no account) and **practitioner** ("for practitioners" → pitch → `/join` → `/practitioner`). `/practitioners` (directory) and `/practitioners/[slug]` (SEO profile page) are now **built**; the public read layer is `lib/practitioners.ts` (published-only — the single source of public reads), publish/unpublish live in `app/practitioner/publish-actions.ts`, and the canonical origin is `lib/site.ts` (`www`). Still planned: `/for-practitioners` (pitch). Seekers browse **anonymously**; accounts are typed by `User.role`. `/join` is practitioner-only.

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

**DB layer — wired** (✅ `tsc` + Vitest pass): `prisma/schema.prisma` (`User` + `Practitioner` + `ProfileView` + enums), `prisma.config.ts` (Prisma 7 CLI config — connection URLs live here, *not* in the schema), `lib/db.ts` (pg-adapter singleton on pooled `DATABASE_URL`), generated client → `lib/generated/prisma` (gitignored, `postinstall: prisma generate`). The `init` migration is **applied to Neon** and the live practitioner listing reads + writes it. The public read layer is `lib/practitioners.ts` (PUBLISHED-only, no-PII selects). **Pending:** rotate the Neon password (exposed in chat during setup) **before launch**; `Seeker`/`Match` await the matching brief.

**Testing — Vitest** (`tests/`, run via `npm test`; part of the quality gate; ~266 tests). **Three layers** — unit (`tests/*.test.ts`, Prisma/auth mocked) · flow (`tests/flows/*`, one in-memory mock-db across a real multi-step action sequence) · gated real-DB integration (`tests/integration/*`, `npm run test:integration`). Full guide: **[TESTING.md](TESTING.md).** Covers: the public read layer (`lib/practitioners.ts` — PUBLISHED-only + no-PII), the publish/save/claim/hold server actions, the pure utils, and the **whole brand center** — `brand.ts` (framework shape, score banding + boundaries, the **review-solicitation ethics guard**, no-shame prose), the Serper visibility orchestration (`visibility-audit.test.ts` — clobber-protection + sibling-key preservation), the say/search mirror, momentum history, and the grounded next step. UI / React Server Components aren't unit-tested; they're verified via screenshot in dev (the real pages are Clerk-gated — preview a throwaway public route).

**Auth — wired 2026-05-31** (env-gated; ✅ `tsc`): `lib/clerk-enabled.ts` (the gate boolean — db-free), `lib/auth.ts` (`getCurrentDbUser`, `getOrCreatePractitioner`), `proxy.ts` (Clerk proxy), `<ClerkProvider>` in `app/layout.tsx`. With no Clerk keys it all no-ops so the app still runs. Flow: `/join` (sign-up) → `/practitioner`. **Pending:** add Clerk keys to `.env.local` + enable Google in the Clerk dashboard.

## Where plans & decisions live
- **Brand center architecture:** [architecture/BRAND-CENTER.md](architecture/BRAND-CENTER.md) — the 5-part framework, the Serper visibility stack, the reserved `fieldValues` key registry, the scoring + "score demoted" design, and the **review-solicitation ethics rule**. Its honest audit + queued work: [audits/2026-06-19-brand-center-research.md](audits/2026-06-19-brand-center-research.md).
- **Build tracker (status & roadmap):** [BUILD-TRACKER.md](BUILD-TRACKER.md) — what's shipped vs. what's left, keyed to the June-10 brief, with open decisions. (Supersedes the retired PHASE-2-STATUS.md.)
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

# Healing Tides Collective

A modern, guided platform for finding the right care across clinical and holistic wellness — therapy, acupuncture, reiki, movement, trauma-informed support, and more.

**Positioning:** Not a directory. A decision-making tool for care. The modern front door to wellness.

**One-liner:** "Start here — we'll help you figure it out."

Founded by **Nora L. Hollenkamp, MSW, LICSW** — therapist with 20+ years across hospitals, schools, hospice, and community settings (Saint Paul, MN + telehealth across Minnesota).

- **Domain:** `healingtides.co` — canonical host is **`www.healingtides.co`** (the apex redirects to it)
- **Repo:** https://github.com/JohnRiceML/healing-tides-collective (default branch `main`)
- **Hosting:** Vercel

---

## Status

A working Next.js app, live on production.

- **Phase 1 — Landing + editorial:** ✅ **Live.** Immersive scroll landing, "Meet Nora," and a Sanity-backed journal.
- **Practitioner Listing MVP:** 🟢 **Live on production** (built on `feat/practitioner-listing-mvp`). Practitioners sign up, build a profile, and publish it to a public, SEO-ready page:
  - `/join` + `/sign-in` — practitioner auth (Clerk + Google)
  - `/practitioner` — the profile editor (saves to Postgres; live completeness; Publish / Unpublish)
  - `/practitioners` — public directory (specialty/format filters + search)
  - `/practitioners/[slug]` — public SEO profile page (metadata + JSON-LD), plus `/sitemap.xml`

  The directory shows a calm empty state until practitioners publish, and it isn't linked from the landing yet (deliberate — the "for practitioners" / "find care" entry points are a separate step).
- **Backend:** Prisma 7 → **Neon Postgres** and **Clerk** auth are **wired** (the `init` migration is applied; the listing reads + writes live). **Stripe** (billing) and **Resend** (email) are decided but **not yet wired**.
- **Phase 2 — Get Matched (seeker side / matching engine):** a **clickable prototype** under `/prototype` (UI only). The guided seeker intake + matching is a separate, deferred brief, gated on the PHI/HIPAA decision.

Living docs: **[`docs/SYSTEM.md`](docs/SYSTEM.md)** (where things live + status) · [`docs/PHASE-2-STATUS.md`](docs/PHASE-2-STATUS.md) (roadmap) · [`planning/decisions-log.md`](planning/decisions-log.md) (ADRs — why things are the way they are).

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) + the shared component library in `app/_components/ui.tsx`
- **Motion:** Framer Motion (the immersive scroll landing)
- **Database:** Prisma 7 → **Neon Postgres** (pg adapter; connection URLs live in `prisma.config.ts`, not the schema)
- **Auth:** **Clerk** (env-gated; `proxy.ts` is Next 16's renamed middleware)
- **CMS:** Sanity v5 (`next-sanity`) with an embedded Studio at `/studio` — **editorial only** (journal + page copy), never app/matching data
- **Tests:** **Vitest** (`tests/`) — core logic, the public read layer, and the publish/save server actions
- **Analytics:** GA via `@next/third-parties`
- **Decided, not yet wired:** **Stripe** (billing) · **Resend** (transactional email)

Each backend system is owned by an agent in [`.claude/agents/`](.claude/agents); the locked stack + env contract is in [`docs/architecture/PHASE-2-SYSTEMS.md`](docs/architecture/PHASE-2-SYSTEMS.md).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000  (next dev --webpack, raised Node heap)
```

`npm run build` / `npm start` for production.

### Quality gate — run before calling work done

```bash
npx tsc --noEmit     # types
npm test             # Vitest suite  (also: npm run test:watch / test:coverage)
```

### Environment (`.env.local`)

```
# Sanity (editorial)
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=

# Neon Postgres — pooled (app) + direct/unpooled (migrations). Copy from the Neon
# dashboard: Vercel marks these "Sensitive", so `vercel env pull` returns them blank.
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Clerk auth — the app no-ops cleanly when these are absent
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Full env contract: [`docs/architecture/PHASE-2-SYSTEMS.md`](docs/architecture/PHASE-2-SYSTEMS.md). **Never commit secrets** — they live only in `.env.local` (gitignored) + Vercel env, and the dev Neon/Clerk creds shared during setup must be **rotated before launch**.

```bash
npm run sanity:typegen   # regenerate sanity.types.ts from the Sanity schema
npm run db:studio        # Prisma Studio against Neon
npm run db:migrate       # create/apply a migration (dev)
```

## Routes

| Path | What it is | Status |
| --- | --- | --- |
| `/` | Immersive, chapter-based scroll landing | Live |
| `/about` | "Meet Nora" — founder bio | Live |
| `/journal`, `/journal/[slug]` | Sanity-backed editorial journal | Live |
| `/studio` | Embedded Sanity Studio | Live |
| `/join`, `/sign-in` | Practitioner auth (Clerk + Google) | Live (prod) |
| `/practitioner` | Practitioner profile editor → Postgres + Publish/Unpublish | Live (prod) |
| `/practitioners` | Public directory (filters + search) | Live (prod) |
| `/practitioners/[slug]` | Public SEO profile page (metadata + JSON-LD) | Live (prod) |
| `/sitemap.xml` | Sitemap — static routes + published practitioners | Live (prod) |
| `/prototype/*` | Phase 2 clickable prototype (seeker / practitioner / admin / provider / resources) | Prototype — UI only |

## Repository layout

```
healing-tides-collective/
├── app/                       Next.js App Router
│   ├── page.tsx               immersive scroll landing
│   ├── about/ journal/ studio/   "Meet Nora", journal, embedded Sanity Studio
│   ├── join/ sign-in/         practitioner auth (Clerk)
│   ├── practitioner/          profile editor + server actions (save, publish/unpublish)
│   ├── practitioners/         public directory + [slug] SEO profile page
│   ├── sitemap.ts             published-practitioner sitemap
│   ├── prototype/             Phase 2 clickable prototype (UI only)
│   ├── _components/ui.tsx     shared component library (Button / Card / Field / Container …)
│   ├── _lib/                  app-scoped helpers (images, taxonomy)
│   └── layout.tsx, not-found.tsx, globals.css
├── lib/                       shared infra: db (Prisma+pg), auth (Clerk), practitioners
│                              (public read layer), slug/url/completeness (pure utils),
│                              site (canonical URL), generated/ (Prisma client, gitignored)
├── prisma/                    schema.prisma + migrations/  (connection URLs in prisma.config.ts)
├── proxy.ts                   Clerk route protection (Next 16's renamed middleware)
├── tests/                     Vitest suite (read layer, publish/save actions, utils)
├── .claude/agents/            13 agents — backend system owners + the DB & style teams
├── sanity/                    client, queries, image/live helpers, schema types
├── docs/                      SYSTEM.md (the map), PHASE-2-STATUS.md, architecture/,
│                              design/UI-SYSTEM.md, brand / positioning / personas
├── planning/                  decisions-log (ADRs), timeline, milestones, setup-checklist
├── notes/ inspiration/ assets/ public/
├── AGENTS.md                  canonical contributor/agent guide (CLAUDE.md → @AGENTS.md)
└── next.config.ts  vitest.config.ts  vercel.json  tsconfig.json  sanity.config.ts
```

## Why this project

Existing wellness directories (Psychology Today, Zocdoc-for-wellness, etc.) overwhelm users with options and zero guidance. Healing Tides flips it: a short guided flow → matched practitioners → meaningful consultations. A win for users (clarity) and providers (qualified, aligned referrals).

The strategic insight: all three personas (Millennial / Gen X / Gen Z) want the *same thing* — clarity and confidence in choosing care. **Tone adapts; the flow does not.** One funnel, varied language. See `docs/personas.md` and `docs/positioning.md`.

## Contributing

Read **[`AGENTS.md`](AGENTS.md)** first — the canonical guide for humans and AI agents (conventions, the Next.js-16 caveats, the living-doc protocol). Keep [`docs/SYSTEM.md`](docs/SYSTEM.md) updated in the **same change** that moves a subsystem or route, record decisions in [`planning/decisions-log.md`](planning/decisions-log.md), and run the quality gate (`npx tsc --noEmit` + `npm test`) before opening a PR.

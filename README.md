# Healing Tides Collective

A modern, guided platform for finding the right care across clinical and holistic wellness — therapy, acupuncture, reiki, movement, trauma-informed support, and more.

**Positioning:** Not a directory. A decision-making tool for care. The modern front door to wellness.

**One-liner:** "Start here — we'll help you figure it out."

Founded by **Nora L. Hollenkamp, MSW, LICSW** — therapist with 20+ years across hospitals, schools, hospice, and community settings (Saint Paul, MN + telehealth across Minnesota).

- **Domain:** `healingtides.co`
- **Repo:** https://github.com/JohnRiceML/healing-tides-collective (public, default branch `main`)
- **Hosting:** Vercel

---

## Status

The repo has moved well past planning into a working Next.js app.

- **Phase 1 — Landing + editorial:** built. Immersive scroll landing, "Meet Nora" page, and a Sanity-backed journal. Landing CTAs currently route to Nora's direct email until `hello@` is provisioned.
- **Phase 2 — Get Matched (two-sided care matching):** exists as a **clickable prototype** under `/prototype` — seeker intake, practitioner application, Nora's admin/matching workspace, provider portal, and a public resources dashboard. UI only; not yet wired to a backend or database. The backend stack and system-ownership model are now **locked** — see [`docs/architecture/PHASE-2-SYSTEMS.md`](docs/architecture/PHASE-2-SYSTEMS.md) and the four agents in [`.claude/agents/`](.claude/agents) that own each system.

> The old "Phase 0 — no code yet" framing in earlier docs is obsolete. See `planning/decisions-log.md` for the kickoff rationale (note: that log was last appended at kickoff and trails the actual build).

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) + styled-components
- **Motion:** Framer Motion (the immersive, chapter-based scroll landing)
- **CMS:** Sanity v5 (`next-sanity`) with an **embedded Studio** at `/studio`
- **Analytics:** GA via `@next/third-parties`
- **Email:** Resend (planned for the matching flow; CTAs currently email Nora directly)

**Phase 2 backend (decided 2026-05-31, not yet wired):** Prisma 7 → single **Neon Postgres** · **Clerk** auth · **Stripe** billing · **Resend** email — provisioned via the Vercel Marketplace, migrate-later posture. Architecture + the agents that own each system: [`docs/architecture/PHASE-2-SYSTEMS.md`](docs/architecture/PHASE-2-SYSTEMS.md).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

> The `dev` script runs `next dev --webpack` (Turbopack is intentionally opted out) with a raised Node heap. `npm run build` / `npm start` for production.

Environment (`.env.local`):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
```

Sanity types are generated from the live schema:

```bash
npm run sanity:typegen   # schema extract + typegen → sanity.types.ts
```

## Routes

| Path | What it is |
| --- | --- |
| `/` | Immersive, chapter-based scroll landing (Framer Motion, owned photography) |
| `/about` | "Meet Nora" — founder bio and approach |
| `/journal`, `/journal/[slug]` | Sanity-backed editorial journal |
| `/studio` | Embedded Sanity Studio (content editing) |
| `/designs/split` | Split-screen landing layout variant |
| `/designs/_archive/*` | 13 archived landing explorations (editorial, lifetime-style, prana-style, etc.) — reference only |
| `/prototype` | Phase 2 clickable prototype hub (seeker, practitioner, admin, provider, resources, scope) |

## Repository layout

```
healing-tides-collective/
├── app/                       Next.js App Router
│   ├── page.tsx               immersive scroll landing
│   ├── about/                 "Meet Nora"
│   ├── journal/               Sanity-backed journal (+ [slug])
│   ├── studio/                embedded Sanity Studio
│   ├── designs/               landing layout explorations (split/ + _archive/)
│   ├── prototype/             Phase 2 clickable prototype (seeker / practitioner / admin / provider / resources / scope)
│   ├── _lib/                  image helpers
│   ├── layout.tsx, not-found.tsx
├── .claude/agents/           system-owner agents: db-architect, auth-clerk, billing-stripe, email-resend
├── sanity/                    client, queries, image/live helpers, schema types (post / author / category)
├── docs/                      brand-guidelines, content-strategy, design-spec, personas, positioning
│   └── architecture/          PHASE-2-SYSTEMS.md — locked stack, system ownership, env contract
├── planning/                  timeline, milestones, setup-checklist, decisions-log
├── inspiration/               mood-board, reference-sites, fetched references
├── notes/                     initial founder brief (source of truth)
├── assets/                    Logo + inspiration source images
├── public/                    shipped photography + logo
├── next.config.ts             remote image patterns (Unsplash, cdn.sanity.io)
├── sanity.config.ts, sanity.cli.ts, sanity.types.ts, schema.json
└── vercel.json
```

## Why this project

Existing wellness directories (Psychology Today, Zocdoc-for-wellness, etc.) overwhelm users with options and zero guidance. Healing Tides flips it: a short guided flow → matched practitioners → meaningful consultations. A win for users (clarity) and providers (qualified, aligned referrals).

The strategic insight: all three personas (Millennial / Gen X / Gen Z) want the *same thing* — clarity and confidence in choosing care. **Tone adapts; the flow does not.** One funnel, varied language. See `docs/personas.md` and `docs/positioning.md`.

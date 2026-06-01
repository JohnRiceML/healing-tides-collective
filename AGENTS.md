# Healing Tides Collective — Agent & Contributor Guide

Canonical instructions for **everyone working on this repo — human or AI agent.** This is the [AGENTS.md open standard](https://agents.md/); Cursor, Codex, Copilot, Claude Code, Aider, Gemini CLI, etc. all read it. Claude Code reads it via `CLAUDE.md` → `@AGENTS.md`. We will not be the only contributors — keep this file and the living docs accurate (see the protocol at the bottom).

## What this is
A guided "Get Matched" platform for finding clinical + holistic care — therapy, acupuncture, reiki, movement, trauma-informed support. **Not a directory; a decision-making tool for care.** Two-sided: seekers get clarity, practitioners get qualified referrals. Founder: **Nora L. Hollenkamp, MSW, LICSW**. Domain `healingtides.co`. Hosting: Vercel.

## Read these first
- **[docs/SYSTEM.md](docs/SYSTEM.md)** — the **living system map**: where things live + current status. The source of truth. *If this file and the code disagree, the code wins — fix the doc.*
- **[docs/architecture/PHASE-2-SYSTEMS.md](docs/architecture/PHASE-2-SYSTEMS.md)** — the Phase 2 plan: locked stack, system ownership, env contract, open scope questions.
- **[docs/PHASE-2-STATUS.md](docs/PHASE-2-STATUS.md)** — Phase 2 status & roadmap: what's shipped, what's left, what's blocked.
- **[planning/decisions-log.md](planning/decisions-log.md)** — the ADR log: *why* things are the way they are (append-only).
- **[docs/design/UI-SYSTEM.md](docs/design/UI-SYSTEM.md)** — how to build any page/component (tokens, the component library, the checklist). Read before touching UI.

## This is Next.js 16 — not the Next.js you may know
App Router, React 19. APIs and conventions may differ from older training data. When unsure about framework behavior, **read `node_modules/next/dist/docs/` before writing code.** Heed deprecation notices.

## Repo layout convention
- **Root-level `app/` — there is NO `src/` directory.** (counsel-post, our pattern reference, uses `src/`; we do not — translate its `src/lib/x` to our `lib/x`.)
- Shared infra → root **`lib/`** (e.g. `lib/db.ts`, `lib/auth.ts`). App-scoped helpers → `app/_lib/` (existing pattern, e.g. `app/_lib/images.ts`).
- Next.js **`proxy.ts` lives at the repo root** (Next 16 renamed Middleware → Proxy — same functionality, new filename; `middleware.ts` is the old ≤15 name).
- Prisma client generates to **`lib/generated/prisma`**.
- Import alias **`@/*` → repo root** (e.g. `import { db } from "@/lib/db"`).

## Dev environment
```bash
npm install
npm run dev            # http://localhost:3000  (next dev --webpack + raised Node heap — Turbopack intentionally off)
npm run build          # production build
npm run sanity:typegen # regenerate sanity.types.ts from the Sanity schema
```

## Quality gate — run before calling work done
```bash
npx tsc --noEmit   # types
npm test           # Vitest suite — core logic (public read layer, publish/save actions, utils)
```
Tests live in `tests/` (Vitest; `npm run test:watch` / `test:coverage`). **Add a test when you touch** the public read layer (`lib/practitioners.ts`), the publish/save server actions, or a pure util in `lib/`. UI / React Server Components aren't unit-tested yet.

## Conventions & boundaries
- **Sanity = editorial only** (journal, page copy). **Prisma → Neon Postgres = app data** (seekers, practitioners, matching). Never put practitioner/seeker/matching data in Sanity.
- **Full service isolation.** HTC owns its own Clerk / Stripe / Resend / Neon. Nothing is shared with other products. counsel-post is a *pattern* reference, not a shared backend.
- **External state is mirrored, not owned.** Clerk owns identity; Stripe owns billing; our DB holds mirror rows. Read the mirror; don't call the vendor in hot paths.
- **Vercel-native, migrate-later.** Provision via the Vercel Marketplace (Neon/Clerk/Resend); favor Next.js primitives over proprietary infra. Keep services swappable. Never commit secrets — env contract lives in `docs/architecture/PHASE-2-SYSTEMS.md`.

## Backend work → delegate to the system-owner agents
Each backend system is owned by an agent in `.claude/agents/` — use them; don't freelance across boundaries:
- **`db-architect`** — lead of the **DB team** (+ `db-migration-engineer`, `db-performance`, `db-reliability`, `db-integrity`): data modeling, migrations, performance, backups/restore, data safety
- **`auth-clerk`** — Clerk, route protection (`proxy.ts`), roles, the Clerk→User webhook
- **`billing-stripe`** — Stripe, Checkout/portal/webhooks, gating
- **`email-resend`** — Resend, templates, send helpers

## Frontend / UI work → the style team
Building a page or component? The canonical brand + visual reference is **[docs/design/STYLE-GUIDE.md](docs/design/STYLE-GUIDE.md)** (color, type, components, voice, accessibility); the practical build checklist is **[docs/design/UI-SYSTEM.md](docs/design/UI-SYSTEM.md)** (tokens-not-hardcoded, the component library, the checklist). Delegate to the style team in `.claude/agents/`:
- **`design-system-steward`** (lead) — tokens (`@theme`), the design spec, brand feel, routing
- **`component-architect`** — the shared component library; no hand-rolled/duplicated styles
- **`page-builder`** — new routes (page shell, SEO/metadata, responsive, loading/empty/error states)
- **`a11y-steward`** — WCAG + trauma-informed UX (calm, non-alarming, reduced-motion)
- **`motion-designer`** — Framer Motion patterns, the motion language

## Product voice & principles (stable)
- **Voice:** clear, grounded, human. Not clinical, not fluffy. Slightly elevated, approachable. Trauma-informed — the reader sets the pace.
- **Design feel:** clean, calm confidence, warm tech, spacious, intelligent simplicity.
- **One entry point:** "Get Matched" works for all three personas.
- **Avoid:** bright blues, dense directory-style listings, generic stock wellness photography.
- **Strategic insight:** all three personas (Millennial / Gen X / Gen Z) want the *same thing* — clarity + confidence in choosing care. **Tone adapts; the flow does not.** One funnel, varied language.

## The living-doc protocol — KEEP DOCS ALIVE
We will not be the only contributors, and **stale structural docs actively mislead future agents** (they'll confidently look in the wrong place). To prevent rot:
1. **Same-change updates.** If you add / move / rename / delete a subsystem, route, or load-bearing file, update **[docs/SYSTEM.md](docs/SYSTEM.md) in the same commit/PR** (docs-as-code).
2. **Code wins.** When a doc and the code disagree, the code is right — fix the doc; don't trust a stale doc.
3. **Decisions → the ADR log.** Record meaningful architectural/product decisions in [planning/decisions-log.md](planning/decisions-log.md) (append-only: supersede, don't edit).
4. **Describe subsystems, not brittle paths.** List load-bearing *entry points* + capabilities; don't inventory every file — exact paths drift. Let search find them.
5. **Date + flag, don't silently rot.** Stamp "Last updated" and mark a section ⚠️ stale rather than leaving wrong info unmarked.
6. **You touched it, you own its doc line.** Change business logic → update the behavior note. Add an env var → update the env contract.

# Decisions Log

This is the project's **ADR log** (Architecture Decision Records) — the source of truth for *why* the system is the way it is. **Append-only:** to change a past decision, add a new entry that supersedes it (link back); don't edit history. Keep each entry to ~a page. See also the living-doc system in [AGENTS.md](../AGENTS.md) and [docs/SYSTEM.md](../docs/SYSTEM.md). Format:

```
## YYYY-MM-DD — Short title
**Decision:** What we picked.
**Why:** The reasoning.
**Alternatives considered:** What we passed on.
**Revisit when:** Trigger for re-evaluating.
```

---

## 2026-04-26 — Project kickoff
**Decision:** Project is named "Healing Tides Collective" as working name. Phase 1 = landing page + waitlist, Phase 2 = Get Matched flow.
**Why:** Founder's preferred name; no domain or trademark check yet. Phase 1 narrows scope so we can validate brand + capture demand before building the matching engine.
**Alternatives considered:** Going straight to MVP matching tool — rejected as too risky without brand validation and audience.
**Revisit when:** Domain availability check completes, OR after first 50 waitlist signups (validate name resonates).

## 2026-04-26 — Stack choice
**Decision:** Next.js 16 + React 19 + Tailwind v4 + Sanity + Vercel + Resend.
**Why:** Matches John's existing toolchain (Augurian, ClawPort, CreatorReach). Reuse muscle memory. Sanity is cleanest editorial CMS for a non-technical founder. Resend is simple for transactional email.
**Alternatives considered:** Webflow (rejected — founder doesn't have it, John doesn't build there), Framer (rejected — same), Astro (rejected — Next.js gives us a better Phase 2 path for matching logic).
**Revisit when:** If founder wants to self-edit visual design later — would push us back toward Webflow / Framer.

## 2026-04-26 — Color direction
**Decision:** Sand / charcoal / ocean / teal / sage / seafoam palette per `docs/design-spec.md`.
**Why:** Aligns with founder's references (Lifetime, Kairos, Sacred Woman). Muted, warm, elevated.
**Alternatives considered:** Brighter coastal blues — rejected per founder note "avoid overly bright blues."
**Revisit when:** Logo design might shift one accent, or photography direction reveals the palette feels too cool.

## 2026-04-26 — Domain: healingtides.co
**Decision:** Use `healingtides.co` as the production domain. Founder already owns it.
**Why:** Available, on-brand, founder is committed to the name. `.co` is widely accepted; tradeoff is occasional `.com` mistypes.
**Alternatives considered:** Wait and try to acquire `healingtides.com` first. Rejected because (a) we don't know if it's available without checking, (b) `.co` is a fine TLD and we shouldn't block launch on the `.com`.
**Follow-up:** Cheap defensive move — check if `healingtides.com` is available; if so, grab it for redirect to `.co`.
**Revisit when:** Quarterly brand review, or if a `.com` collision causes user confusion in analytics.

## 2026-04-26 — Visual references locked from 4 founder images
**Decision:** Founder shared four reference images that anchor the visual direction. Saved to `assets/inspiration/`. The synthesis is documented in `inspiration/mood-board.md` ("Synthesized direction" table).
**Why:** Replaces guessed direction with concrete founder taste. Confirms: spaciousness, mature plants as architecture, warm wood, 90/10 neutral-with-color-pop, real bodies in real practice, confident large-display type (per prAna ref).
**Alternatives considered:** Continuing with text-only direction — rejected, the images sharpened "warm tech" considerably.
**Revisit when:** Logo lands, or first landing page render — re-validate that the page reads with the same temperature as these references.

## 2026-04-26 — Phase 1 ships waitlist, not matching
**Decision:** Landing page + email waitlist only on first launch. No questionnaire, no practitioner directory, no booking.
**Why:** Validate name, brand, and demand before building the harder thing. Waitlist signups become the audience for Phase 2 launch.
**Alternatives considered:** Ship a fake-door "Get Matched" button that just collects email — rejected as too cute. The waitlist framing is honest and still captures intent.
**Revisit when:** End of Phase 1 (2026-05-24).

## 2026-05-31 — Phase 2 stack locked
**Decision:** Phase 2 (the real Get Matched product) runs on **Prisma 7 → a single dedicated Neon Postgres** (shard-ready, not sharded), **Clerk** for auth, **Stripe** for billing, **Resend** for transactional email — each isolated to Healing Tides (its own Clerk app / Stripe account / Resend domain / database). Documented in `docs/architecture/PHASE-2-SYSTEMS.md`.
**Why:** Matches John's proven toolchain and, critically, the *clean* pattern already implemented in the `counsel-post` repo (Clerk owns identity → local `User` mirror; Stripe state mirrored on the row; Prisma 7 + PrismaPg adapter over Neon). One read gates a request. counsel-post becomes the reference implementation.
**Alternatives considered:** (a) Auth.js/NextAuth instead of Clerk — rejected for speed; Clerk's hosted roles/orgs/UI get seeker/practitioner/admin RBAC shipped faster. (b) Mirroring the "sharded schema" from SubredditSignals/Mochi/Narrative Nooks — rejected after investigation (see next entry). (c) Physical sharding now — rejected as premature at zero users and hostile to the seeker↔practitioner matching joins.
**Revisit when:** Real load justifies partitioning, or if a self-hosted-auth requirement appears.

## 2026-05-31 — "Sharded schema" reframed (research finding)
**Decision:** Do NOT replicate the SubredditSignals data pattern. Use a single dedicated Postgres per the entry above.
**Why:** Investigated the three repos John referenced. SubredditSignals is a single **MySQL** monolith where four products (Narrative Nooks `nn_*`, Subreddit Signals `ss_*`, GrowthMindset `gms_*`, CreatorReach `cr_*`) coexist via **table-name prefixes** — namespace isolation, not sharding. Mochi and Narrative Nooks have no standalone code repos (NN's models live inside SubredditSignals). There is no reusable sharding pattern to copy; the desired "isolated product DB + own services" pattern lives in counsel-post instead.
**Alternatives considered:** Prefix-namespacing HTC into a shared DB — rejected (data-boundary + isolation requirement).
**Revisit when:** N/A — recorded to prevent re-investigating.

## 2026-05-31 — System ownership via dedicated agents
**Decision:** Each backend system is owned by a dedicated Claude Code subagent under `.claude/agents/`: `db-architect`, `auth-clerk`, `billing-stripe`, `email-resend`. They hold the conventions/contracts/guardrails and write the integration code when invoked. No auth/db/stripe implementation code is written yet — agents + architecture first.
**Why:** Keeps each integration's rules in one place, enforces the "stay in lane" boundaries (db owns columns; auth/billing own their mirror writes + rules; email owns delivery), and lets future work be delegated cleanly.
**Alternatives considered:** One monolithic backend agent — rejected; boundaries blur and guardrails get diluted.
**Revisit when:** A fifth system appears (e.g. Stripe Connect payouts) or two agents keep stepping on each other.

## 2026-05-31 — Provisioning posture: Vercel-native, migrate-later
**Decision:** Provision the Phase 2 stack through the **Vercel Marketplace** where available (Neon, Clerk, Resend — auto-injected env vars + unified billing); wire Stripe directly. Favor Next.js primitives (Server Actions, route handlers, middleware) over bespoke infra. Treat the stack as a fast managed starting point we can migrate from later.
**Why:** The locked stack already *is* the Vercel/Next.js-recommended path, so going native costs nothing and removes setup toil. Starting managed maximizes velocity; portability is preserved — Neon is plain Postgres, Stripe/Resend are standard/swappable, and only Clerk carries real switching cost (bounded by the local `User`-mirror design + a thin `auth-clerk` surface). Full table in `docs/architecture/PHASE-2-SYSTEMS.md`.
**Alternatives considered:** Hand-provisioning each service outside the Marketplace (more toil, same result); adopting Vercel-proprietary primitives (Blob / Edge Config / Queues) up front — deferred until a real need to protect portability.
**Revisit when:** A Vercel-proprietary primitive becomes genuinely needed, or migration off Clerk is triggered.

## 2026-05-31 — Living-docs system for multi-dev / multi-agent work
**Decision:** Adopt a docs-as-code "living document" system as we enter Phase 2 with more devs + AI agents: (1) **`AGENTS.md`** at root as the canonical, tool-agnostic instruction file (the open standard — read by Cursor / Codex / Copilot / Claude / etc.); `CLAUDE.md` reduced to `@AGENTS.md`. (2) **`docs/SYSTEM.md`** as the single living "where things live + status" map, using progressive disclosure (subsystems + entry points, not exhaustive paths). (3) **this decisions log** as the ADR log. (4) **`.github/pull_request_template.md`** + a living-doc protocol in AGENTS.md to enforce same-PR doc updates.
**Why:** "We won't be the only dev/agents." Researched current best practice (agents.md open standard, ADRs, docs-as-code): the consensus is a canonical agent-readable entry file + one living source-of-truth map + append-only ADRs + co-located same-commit updates. AGENTS.md specifically serves non-Claude tools; progressive disclosure avoids the documented failure mode where stale path inventories poison agent context. Mirrors the counsel-post convention (`CLAUDE.md`→`@AGENTS.md` + `docs/SYSTEM.md`) for portfolio consistency.
**Alternatives considered:** Keep everything in `CLAUDE.md` — rejected (Claude-only; fails other agents/devs). One giant doc — rejected (rots fast; mixes stable rules with volatile status). No enforcement — rejected (docs drift without a same-PR trigger).
**Revisit when:** The repo becomes a monorepo (add nested per-package `AGENTS.md`), or doc-drift recurs despite the protocol (add automated drift detection in CI).
**Sources:** agents.md (open standard); ADR guidance (adr.github.io, Microsoft/AWS Well-Architected); docs-as-code best practices.

## 2026-05-31 — DB team (specialized agents for the data layer)
**Decision:** Expand the single `db-architect` into a **5-agent DB team**: `db-architect` (lead — data modeling, structure, shared conventions, routing) + `db-migration-engineer` (migrations, expand/contract zero-downtime, branch-testing, failed-migration recovery) + `db-performance` (indexes, query optimization, pooled-vs-direct, EXPLAIN) + `db-reliability` (backups, PITR/instant-restore, Neon branching, plan/retention, DR, conn/env provisioning) + `db-integrity` (constraints, PII/sensitive care-data, isolation, consent, security).
**Why:** "All things db" spans distinct disciplines that blur under one agent. Clean lanes keep each charter's guardrails sharp; the lead routes and owns overall coherence. Especially warranted here because (a) HTC stores **sensitive seeker care-data** → a dedicated integrity/safety lane, and (b) reliability/ops (backups, Neon PITR) is real work the schema-owner shouldn't carry. Charters only — no runtime cost until invoked; Claude Code agents don't auto-invoke each other, so the lead's roster documents the routing.
**Alternatives considered:** Keep one db-architect generalist — rejected (overloaded, guardrails dilute). Lean 3- or 4-agent split — considered; chose full 5 for coverage (user pick).
**Revisit when:** The lanes overlap in practice (merge), or a new DB concern appears (e.g. analytics / read-replicas → a `db-analytics` agent).

## 2026-05-31 — Style team + UI system
**Decision:** Create a 5-agent **style team** under `.claude/agents/` — `design-system-steward` (lead: tokens, design spec, brand feel, routing) + `component-architect` (shared component library) + `page-builder` (new routes) + `a11y-steward` (WCAG + trauma-informed UX) + `motion-designer` (Framer Motion). Add `docs/design/UI-SYSTEM.md` as the canonical "how to build pages/components" system (tokens-not-hardcoded, the component library, page shell, voice, a11y, motion, SEO, checklists). `docs/design-spec.md` stays the visual spec; `docs/brand-guidelines.md` the voice.
**Why:** As we build the practitioner MVP's many pages (profile editor, directory, profile pages, admin), UI consistency + the brand ("calm confidence, warm tech, spacious", trauma-informed) needs an owned system, not ad-hoc Tailwind. Mirrors the DB-team structure (lead + specialists). Grounded in what exists: the `@theme` tokens, the real component library in `app/prototype/_components/ui.tsx`, the brand voice.
**Alternatives considered:** One design agent — rejected (a11y + motion + components are distinct disciplines). A doc with no agents — rejected (no enforcement). Lean 3 vs full 5 — chose full 5 (user pick), incl. a dedicated motion lane (the product is motion-heavy "warm tech").
**Follow-up:** `component-architect`'s first task — promote `app/prototype/_components/ui.tsx` → shared `app/_components/ui.tsx`; refactor `/join` + `/practitioner` to use it (incl. `font-display` over the verbose `font-[family-name:…]`).
**Revisit when:** Lanes overlap (merge), or a new surface needs a lane (e.g. data-viz for the admin dashboard).

## 2026-05-31 — Two-sided experience: two self-selected doors, anonymous seekers
**Decision:** The two audiences split at **two self-selected front doors**, not a shared funnel. The landing forks into "find care" (seekers) and "for practitioners" (`/for-practitioners` pitch → `/join` → `/practitioner`). **Seekers browse the public directory anonymously** in the listing MVP; seeker accounts + the guided "get matched" intake arrive with the matching brief (PHI-gated). **`/join` is the practitioner door only** — seekers never "join." Accounts are typed by `User.role`. Full map: `docs/architecture/EXPERIENCE-MAP.md`.
**Why:** Seeker and practitioner intents are opposite (shopping vs. selling); a shared funnel hurts both. Two doors give each a tailored journey, keep the MVP free of the HIPAA question (no seeker PHI yet), and give Nora a dedicated practitioner pitch page for the June event. The revenue side (practitioners) gets a premium, focused experience.
**Alternatives considered:** A shared `/start` chooser — rejected (adds a step; asks seekers to "join" when they just want to browse). Light seeker accounts now — deferred (keeps the MVP HIPAA-free).
**Revisit when:** The matching brief lands (seeker accounts/intake), or practitioner monetization ships (the dormant `tier`/`featured` hooks).

## 2026-06-01 — Clerk widgets: render Clerk's native card, don't wrap/flatten it
**Decision:** On `/join` and `/sign-in`, let Clerk's `<SignUp>` / `<SignIn>` render its **own native, self-contained card**. Brand it only via `appearance.variables` (colors / font / radius) in `app/_components/clerk-appearance.ts`. Do **not** wrap it in our `<Card>`, force `w-full`, or flatten its chrome. The one structural override we keep is hiding Clerk's built-in header (`.cl-header { display:none }` in `app/globals.css`), since the page supplies the heading.
**Why:** Wrapping Clerk's widget in our `<Card>` *and* flattening its inner chrome (`.cl-card` / `.cl-cardBox` → transparent + `width:100%`) fought Clerk's own well-designed layout — it produced a card-in-a-card, and after flattening, a narrow form lost inside an oversized box (several iterations chasing it). Clerk's `elements` className map loses to Clerk's stylesheet on specificity, so partial overrides don't compose; the reliable surface is `variables` (inline CSS vars) for color/type, plus a few `.cl-*` `!important` rules for the rare structural tweak. Stop fighting the vendor widget. Verified headless on prod (desktop + mobile, both routes). Commit `9e5bd86`.
**Alternatives considered:** Keep wrapping + fully restyle every `.cl-*` element to match our `<Card>` — rejected (high-maintenance, brittle against Clerk updates, and the direct cause of the regressions). A fully custom Clerk flow (no `<SignUp>` component) — rejected (overkill; loses Clerk's maintained UX + security flows).
**Revisit when:** We move to the Clerk **production instance** (removes the "Development mode" badge + dev-striped footer) and want bespoke card chrome, or Clerk ships a theming API that makes structural overrides reliable.

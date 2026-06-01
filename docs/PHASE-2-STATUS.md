# Phase 2 — Status & Roadmap

> **Living tracker.** Phase 2 = the **Practitioner Listing MVP first** (no client PHI; must demo mid-June), then the matching engine (a *separate* brief, deferred). Update as work lands. **Last updated:** 2026-06-01.
>
> Sources of truth: the [brief](briefs/practitioner-listing-mvp.md) · [EXPERIENCE-MAP](architecture/EXPERIENCE-MAP.md) · [PHASE-2-SYSTEMS](architecture/PHASE-2-SYSTEMS.md) · [SYSTEM](SYSTEM.md) · [UI-SYSTEM](design/UI-SYSTEM.md) · [decisions log](../planning/decisions-log.md).

## Where we are
Foundations, the practitioner account + profile-editor flow, **the publish flow, the public directory, and SEO profile pages** are built and **live on production** (`www.healingtides.co`). What's left for the MVP: the **admin slice**, the **claim/email** flow, **photo upload**, and **Nora's content**. The seeker/matching side is deferred to its own brief.

## ✅ Shipped (this session)

**Foundations & infra**
- Stack locked: Prisma 7 → single **Neon Postgres** · **Clerk** auth · **Stripe** · **Resend**; Vercel-native, migrate-later posture. `28bfa77`
- DB wired: `User` (Clerk mirror + Stripe fields) + `Practitioner` + `ProfileView` + enums; `prisma.config.ts`; `lib/db.ts` (pg-adapter singleton); `init` migration applied to Neon. `ed043d4`
- Auth wired: Clerk (env-gated), `proxy.ts`, `lib/auth.ts` (`getCurrentDbUser`, `getOrCreatePractitioner`), `<ClerkProvider>`. `ed043d4`
- Neon + Clerk provisioned via the Vercel Marketplace; env in Vercel + `.env.local`.

**Agents & docs (the system)**
- Living-doc system: `AGENTS.md` (canonical) + `CLAUDE.md`→`@AGENTS.md`, `docs/SYSTEM.md`, the ADR log, PR template. `28bfa77`
- **DB team** (5): `db-architect` + migration-engineer / performance / reliability / integrity. `54ddb14`
- **Style team** (5): `design-system-steward` + component-architect / page-builder / a11y-steward / motion-designer + `docs/design/UI-SYSTEM.md`. `e1ee99b`
- System owners: `auth-clerk`, `billing-stripe`, `email-resend`.
- Architecture: `PHASE-2-SYSTEMS.md`, `EXPERIENCE-MAP.md` (two-door model), the brief. Shared UI library promoted to `app/_components/ui.tsx`; orphan `/designs` removed.

**Practitioner flow (deployed to prod)**
- Two-door model decided: seeker vs practitioner; seekers browse **anonymously** in the MVP. `e1ee99b`
- **`/join`** — practitioner sign-up (Clerk + Google), redesigned + mobile-friendly. `437747c` `939cc71`
- **`/sign-in`** — returning practitioners; Clerk double-header fixed. `d111a6a` `5f9288e`
- **`/practitioner`** — profile **editor**: display name, region, website, modality, specialties, the "what healing means to me" values prompt, gender, insurance → saves to Postgres + live completeness. `1fe57f3`

**Lock-down — hardening & tests**
- **Server-action hardening** — practitioner `website` sanitized at save (drops `javascript:`/`data:`), slug-collision race handled (P2002 retry), graceful `{ ok:false }` DB-error returns. `fcbc76a`
- **Vitest suite** — 43 tests across 7 files: the public read layer (PUBLISHED-only + no-PII selects), the publish/save actions (auth gate, slug-race, website sanitizer), and the pure utils; `npm test` is now part of the quality gate. ADR recorded. `2575462`

## 🔜 Remaining for the listing MVP (path to the June demo)
Roughly ordered toward the brief's success bar — *invite → claimed → published → visible*:
- [ ] **Photo upload → Vercel Blob** (the one editor field still deferred)
- [x] **Publish flow** — `draft → published` + collision-safe slug generation + the editor Publish/Unpublish control ✅
- [x] **Public directory `/practitioners`** — browse + specialty/format filters + free-text search ✅
- [x] **SEO profile pages `/practitioners/[slug]`** — `generateMetadata` + JSON-LD + `/sitemap.xml` (the "found on Google" page) ✅
- [ ] **Admin slice** — practitioner list + status + completeness; edit / publish / feature; send invites; basic counts
- [ ] **Claim flow** — import the ~40 waitlist contacts → tokenized pre-filled claim links → claim page
- [ ] **Email (Resend)** — invite + follow-up + transactional (intro, application received); verify the `hello@healingtides.co` sending domain
- [ ] **Landing fork** — add the "for practitioners" CTA on `/` + a `/for-practitioners` pitch page (Nora's June pitch)
- [ ] **Config taxonomy** (admin-owned, Postgres) — replace the placeholder specialties; profile-field schema + filters as editable config
- [ ] **Instrumentation** — wire the `ProfileView` increment + view counts; completeness nudges

## 🔒 Pre-launch hardening (before real users / going public)
- [ ] **Rotate** the leaked Neon + Clerk creds (both were shared in chat)
- [ ] Clerk **production instance** (real Google OAuth + verified domain) — replaces the dev/test instance and its "development mode" badge
- [ ] Neon: bump to **Launch plan** (7-day PITR) + a scheduled `pg_dump`
- [x] **Merged `feat/practitioner-listing-mvp` → `main`** ✅ — `main` is the production branch (Vercel auto-deploys it → Production); **CI** (`tsc` + Vitest, `.github/workflows/ci.yml`) now gates every push / PR.
- [ ] Neon **dev branch** so local testing never touches the prod/preview DB

## ⏳ Blocked on Nora's inputs (these block *content*, not the engine — brief §7)
- [ ] Practitioner **profile question set / fields** (incl. the values prompt)
- [ ] The real **category taxonomy** (~7 categories + sub-identities)
- [ ] The **~40-contact waitlist** spreadsheet (import + claim links)
- [ ] **Admin dashboard sketch**
- [ ] Confirm free-only V1 (assumed yes) + a sketch of future paid tiers (to shape the dormant `tier`/`featured` hooks)

## ⛔ Deferred — the matching engine (separate brief)
The seeker side — guided "get matched" intake → matching → seeker accounts — is its **own brief**, gated on the PHI/HIPAA decision. Profiles are already stored in structured form so the matcher consumes them with **no re-intake**. Not part of this MVP.

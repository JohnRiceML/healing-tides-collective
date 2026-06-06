# Phase 2 — Status & Roadmap

> **Living tracker.** Phase 2 = the **Practitioner Listing MVP first** (no client PHI; must demo mid-June), then the matching engine (a *separate* brief, deferred). Update as work lands. **Last updated:** 2026-06-06 (reconciled against git history).
>
> Sources of truth: the [brief](briefs/practitioner-listing-mvp.md) · [EXPERIENCE-MAP](architecture/EXPERIENCE-MAP.md) · [PHASE-2-SYSTEMS](architecture/PHASE-2-SYSTEMS.md) · [SYSTEM](SYSTEM.md) · [UI-SYSTEM](design/UI-SYSTEM.md) · [decisions log](../planning/decisions-log.md).

## Where we are
Foundations, the practitioner account + profile-editor flow, the publish flow, the public directory, SEO profile pages, **photo upload, AI-assisted profile import/onboarding, verification badges, view-count instrumentation, audience-aware navigation, and the `/for-practitioners` pitch page** are built and **live on production** (`www.healingtides.co`).

The remaining demo-critical work is the **claim/invite flow + its Resend emails** — the invite → claim → publish motion — and **neither is wired yet**. Beyond that: **admin write-actions past badge-granting**, and **pre-launch hardening** (credential rotation, Clerk production instance, Neon Launch plan). The seeker/matching side stays deferred to its own brief, gated on the PHI/HIPAA decision.

## ✅ Shipped

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
- **`/join`** — practitioner sign-up (Clerk + Google), redesigned two-column + animated step reveal, mobile-friendly. `437747c` `939cc71` `4a0b6a6` `5eaad54`
- **`/sign-in`** — returning practitioners; Clerk double-header fixed. `d111a6a` `5f9288e`
- **`/practitioner`** — profile **editor**: display name, region, website, modality, specialties, the "what healing means to me" values prompt, gender, insurance → saves to Postgres + live completeness. `1fe57f3`

**Lock-down — hardening & tests**
- **Server-action hardening** — practitioner `website` sanitized at save (drops `javascript:`/`data:`), slug-collision race handled (P2002 retry), graceful `{ ok:false }` DB-error returns. `fcbc76a`
- **Vitest suite** — 43 tests across 7 files: the public read layer (PUBLISHED-only + no-PII selects), the publish/save actions (auth gate, slug-race, website sanitizer), and the pure utils; `npm test` is now part of the quality gate. ADR recorded. `2575462`
- **CI** — GitHub Actions (`tsc` + Vitest) gates every push / PR. `4351791`

**Product build (Nora's spec, 2026-06)** — see [docs/product/](product/)
- **Real taxonomy** — Nora's 11 categories → subcategories → topics wired (`app/_lib/taxonomy.ts`); the directory filter + editor use them instead of the 7 placeholders. `e5f150d`
- **Rich profile fields** — the full "Join the Collective" form (Story / Background / Approach / Who You Support / Availability / Investment / Reflection), config-driven (`app/_lib/profile-fields.ts`), stored in the `fieldValues` JSON column (**no migration**): the editor captures + saves, the public profile renders them. `f3eb308`
- **Design System & Style Guide** — canonical [docs/design/STYLE-GUIDE.md](design/STYLE-GUIDE.md). `a0c00c6`

**Listing MVP build-out (2026-06-02 → 06-05)** — the bulk of the public surface
- **Photo upload → Vercel Blob** + "use the photo we found" — the last deferred editor field, now shipped. `756dfdf`
- **AI-assisted onboarding** — import-first welcome, URL auto-fill, structured-data-first profile import, and "paste your bio → draft your profile." `1631eb6` `90c1132` `941e1b3` `09e0b46`
- **Public directory `/practitioners`** — redesigned to Nora's mockup: warmer, image-forward, default cover art, richer specialty/format filters + free-text search. `304acda` `2d8cf61` `6c6a7c9`
- **SEO profile pages `/practitioners/[slug]`** — redesigned to the new mockup (Quick-details, collapsible long fields); `generateMetadata` + JSON-LD + `/sitemap.xml`. `4ad921c`
- **Verification / trust badges + Founding Member** — badge system (no migration; reserved `__verified` key in `fieldValues`, unreachable by the practitioner save path). `c724e7f` `9f2bbd9`
- **Audience-aware navigation** — app-wide nav with a "Find care" → `/practitioners` entry; persistent account menu (`UserButton`) for signed-in users; nav hidden on Journal/About. `2ddac80` `f8e1c3d` `7889d1f`
- **`/admin` read-only list** — status / completeness / views + summary counts, gated by the `ADMIN_EMAILS` allowlist, **plus** admin badge-granting (`app/admin/actions.ts` → `setVerificationBadges`). `f6d664d` `92e2eea`
- **View instrumentation** — `ProfileView` row + denormalized `viewCount` on every public profile view, self-views excluded (`app/practitioners/[slug]/view-actions.ts`); live match-strength bar in the editor. `587fd2c`
- **`/for-practitioners` pitch/recruiting page** + the landing CTA into it + a universal app footer. `6c6a7c9` `459e723`

## 🔜 Remaining for the listing MVP (path to the June demo)
Roughly ordered toward the brief's success bar — *invite → claimed → published → visible*:
- [ ] **Claim flow** — import the ~40 waitlist contacts → tokenized pre-filled claim links → claim page. **The core invite motion; not built yet** (blocked on Nora's spreadsheet for the data).
- [ ] **Email (Resend)** — **not wired at all yet.** Invite + follow-up + transactional (intro, application received); verify the `hello@healingtides.co` sending domain. (The claim flow depends on this.)
- [~] **Admin slice** — ✅ read-only list (`/admin`) + ✅ badge-granting; ⏳ **edit / publish-on-behalf / feature / send-invites** still pending (await Nora's dashboard sketch).
- [ ] **Completeness nudges** — view counting is live; the editor-side "you're 1 field from publishing" nudges are not.
- [~] **Config taxonomy** — ✅ Nora's real 11-category taxonomy wired (`app/_lib/taxonomy.ts`, see [product/taxonomy.md](product/taxonomy.md)); ⏳ making it admin-owned editable config (Postgres) is still future.

**✅ Done since the last revision of this doc** (was listed here as remaining): Photo upload · Publish flow · Public directory · SEO profile pages · Landing fork (`/for-practitioners` + landing CTA + "Find care" nav) · View-count instrumentation. See the build-out subsection above.

## 🔒 Pre-launch hardening (before real users / going public)
> Step-by-step: **[RUNBOOK-prelaunch.md](RUNBOOK-prelaunch.md)** — creds rotation, Clerk production instance, Neon Launch + dev branch.
- [ ] 🔴 **Rotate** the leaked Neon + Clerk creds (both were shared in chat) — do this regardless of timeline.
- [ ] Clerk **production instance** (real Google OAuth + verified domain) — replaces the dev/test instance and its "development mode" badge.
- [ ] Neon: bump to **Launch plan** (7-day PITR) + a scheduled `pg_dump`.
- [x] **Merged `feat/practitioner-listing-mvp` → `main`** ✅ — `main` is the production branch (Vercel auto-deploys it → Production); **CI** (`tsc` + Vitest, `.github/workflows/ci.yml`) now gates every push / PR.
- [ ] Neon **dev branch** so local testing never touches the prod/preview DB.

## ✅ Received from Nora (2026-06) — captured in [docs/product/](product/)
Her full spec landed (well beyond the ask) — see **[product/PRODUCT-SPEC.md](product/PRODUCT-SPEC.md)** + **[product/taxonomy.md](product/taxonomy.md)**:
- [x] **Category taxonomy** — 11 categories → subcategories → topics; **wired** into `app/_lib/taxonomy.ts`.
- [x] **Profile question set / fields** — the full "Join the Collective" form; **schema + editor + public render shipped** (`f3eb308`).
- [x] **Pricing** — Intro $10 / Premium $25 / Collective Practice $100, per-tier gates. *(Build: tier hooks + Stripe — **Stripe still not wired**.)*
- [x] **Admin founder dashboard** — detailed multi-section spec received; **read-only list + badge-granting shipped**, the rest of the write-actions pending.
- [ ] **Waitlist spreadsheet** — Nora marked the waitlist DONE, but the actual file (Name + Email [+ location/specialty/notes]) **hasn't landed yet** — it blocks the claim flow.
- 🎁 **Bonus:** the whole **seeker / matching journey**, **search/filters**, **verification badges** (now shipped), **contact/booking**, and **geography** — all captured in PRODUCT-SPEC.md.

## ⛔ Deferred — the matching engine (now spec'd, still gated)
The seeker side — guided intake → "feel seen" reflection → browse/curate → introduction → client dashboard — is now **fully spec'd by Nora** ([PRODUCT-SPEC.md §3–§7](product/PRODUCT-SPEC.md)), but remains its **own brief gated on the PHI/HIPAA decision** (free-text intake about health = sensitive). Practitioner profiles are already structured so the matcher consumes them with no re-intake.

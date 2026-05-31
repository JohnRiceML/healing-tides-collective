# Phase 2 Systems Architecture

**Status:** scaffolding — agents + conventions are set; product scope is **pending the client call recap** (`notes/Healing_Tides_Call_Recap_Handoff.docx`, once loaded).
**Last updated:** 2026-05-31.

This doc is the "structure for the next stage." It locks the stack and the system-ownership model so Phase 2 (the two-sided **Get Matched** product) can be built without re-litigating infrastructure. Phase 1 (immersive landing + journal + "Meet Nora") is already live; Phase 2 turns the `/prototype/*` clickable flows into a real product with accounts, data, and payments.

---

## The stack (locked 2026-05-31)

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, React 19) | Already in place. Non-standard build — see `AGENTS.md`. |
| ORM / DB | **Prisma 7 → single Neon Postgres** | Shard-*ready*, not sharded. One dedicated DB. |
| Auth | **Clerk** (hosted) | Owns identity; local `User` is a mirror. |
| Billing | **Stripe** | Source of truth; app mirrors subscription state. |
| Email | **Resend** (+ React Email) | Transactional only. |
| CMS | **Sanity** (existing) | Editorial / journal content — unchanged. |
| Hosting | **Vercel** | Existing. |

**Why not the "sharded schema" from the other repos?** Investigated 2026-05-31: SubredditSignals isn't actually sharded — it's a single MySQL monolith where four products coexist via table-name prefixes (`nn_*`, `ss_*`, …). Mochi / Narrative Nooks have no standalone code. That namespace-isolation pattern is the *opposite* of what we want here. The pattern we actually want — **one dedicated Postgres + its own Clerk/Stripe** — is already implemented cleanly in `counsel-post`, which is the reference implementation for every integration below.

## Hard rule: full isolation

Healing Tides owns **its own** Clerk app, **its own** Stripe account, **its own** Resend domain, and **its own** Neon database. Nothing is shared with counsel-post, SubredditSignals, or any other product (a data-boundary requirement, same as counsel-post enforces in its schema header). counsel-post is a *pattern* reference, not a shared backend.

## Provisioning & portability (Vercel-native, migrate-later)

**Directive (2026-05-31): use the Vercel/Next.js-native path wherever it's the best option, and keep everything portable enough to migrate later.** The locked stack above already *is* that path — this changes how we provision and wire it, not what it is.

- **Provision via the Vercel Marketplace.** Neon (Postgres), Clerk (auth), and Resend (email) are first-class Marketplace integrations — one-click install, **auto-injected env vars**, unified billing on the Vercel invoice. Stripe is wired directly (standard). This removes most manual env/setup toil. (Vercel's own Postgres/KV no longer exist — the Marketplace is the supported path.)
- **Storage = one Neon Postgres, nothing else yet.** The Neon integration auto-injects the connection strings (pooled + direct → `DATABASE_URL` / `DIRECT_URL`). Do **not** add a second store until a concrete trigger forces it: practitioner-uploaded media beyond Sanity → **Vercel Blob**; rate-limiting or a job queue → **Upstash**; edge-read feature flags → **Edge Config**. (Adjacent option: *Prisma Postgres* is the more Prisma-native managed DB, but we stay on Neon for parity with the counsel-post reference + maturity — both are plain Postgres, so a later switch is a dump/restore.)
- **Lean on Next.js primitives, not bespoke infra.** Server Actions + route handlers + `proxy.ts` (Next 16's middleware) for the backend. Reach for Vercel-proprietary extras (Blob, Edge Config, Queues) only when a real need appears — they trade portability for convenience.
- **Portability posture** — what "migrate from that" actually costs:

  | Service | Lock-in | Migration path |
  | --- | --- | --- |
  | Neon Postgres | **Low** | Plain Postgres — `pg_dump`/restore to any host. Prisma is host-agnostic. |
  | Stripe | **Low** | Industry standard; data exportable. No realistic reason to leave. |
  | Resend | **Low** | Swap the SDK behind `email-resend`'s send helpers; templates are portable React Email. |
  | Clerk | **Medium** | The real lock-in: Clerk owns identities. Leaving = export users + password/session re-onboarding. Mitigation: keep `auth-clerk`'s surface tiny (`getCurrentDbUser`, guards) so a swap to Auth.js touches few files; the local `User` mirror already holds our own copy of the identity graph. |

  Net: start fully managed for velocity; only Clerk carries meaningful switching cost, and the mirror-table design keeps even that bounded.

## The spine: Clerk owns identity, the DB mirrors it

Every system hangs off one idea (copied from counsel-post):

```
Clerk (identity, source of truth)
  └─ webhook (user.created/updated/deleted, verified via svix)
       └─ User row in Neon  ── clerkUserId @unique, role, + billing mirror
            ▲
            └─ Stripe (billing, source of truth)
                 └─ webhook → subscriptionStatus / currentPeriodEnd on the same row
```

A request then needs **one row read** to know who the user is, what role they have, and whether they're paid — no live Clerk/Stripe calls in the hot path.

## System ownership → the agents

Each system is owned by a dedicated agent under `.claude/agents/`. They write the integration code when invoked; this doc and the charters define the boundaries. **No auth/db/stripe implementation code exists yet — by design.**

| Agent | Owns | Must not touch |
| --- | --- | --- |
| [`db-architect`](../../.claude/agents/db-architect.md) | `prisma/schema.prisma`, `lib/db.ts`, migrations, DB env | business rules, identity, billing logic |
| [`auth-clerk`](../../.claude/agents/auth-clerk.md) | `proxy.ts` (Next 16 middleware), `lib/auth.ts`, Clerk webhook, roles | the `User` *table shape*, billing |
| [`billing-stripe`](../../.claude/agents/billing-stripe.md) | Stripe client, Checkout/portal, Stripe webhook, `lib/subscription.ts` | the `User` *table shape*, identity |
| [`email-resend`](../../.claude/agents/email-resend.md) | Resend client, templates, from-domain, send helpers | *deciding* what triggers a send |

**Interaction rule:** db-architect defines columns; auth-clerk and billing-stripe write to *their* mirror columns via webhooks; product code reads. Email is called by whoever owns the trigger. Stay in lane.

## Env var contract (Phase 2 target)

Modeled on counsel-post's `.env.example`. None of these are set yet.

```
# DB (Neon) — auto-injected by the Vercel Neon integration; leave its "Custom Prefix" EMPTY
DATABASE_URL=            # pooled endpoint — runtime
DATABASE_URL_UNPOOLED=   # direct endpoint — used as Prisma `directUrl` for migrations (counsel-post calls this DIRECT_URL)

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=

# Billing (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=         # (set depends on what we charge for — see below)

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=              # interim: Nora's address until hello@healingtides.co is verified

# App
NEXT_PUBLIC_APP_URL=
```

Auth is **env-gated** (`clerkEnabled`): with no keys set, the app runs exactly as today. Keys turn each system on with no code change.

## Data model direction (DRAFT — gated on the call recap)

The two-sided marketplace implies, at minimum: `User` (Clerk mirror, carries `role`), `Seeker` + intake, `Practitioner` + modalities/credentials/`Availability`, `MatchRequest`/`Referral` (the matching backbone), `Resource` (public care dashboard). **Do not commit models until the call recap confirms the real data requirements.** db-architect owns the final schema.

## Open scope questions for the call recap

These block real building and must be answered from the client call:
1. **What do we charge for, and who pays?** Seekers, practitioners, or both. Subscription vs one-time. → drives billing-stripe.
2. **Do practitioners get *paid through* the platform?** If yes → **Stripe Connect** (a much bigger build). If no → simple subscription.
3. **Roles & the practitioner-approval flow** — how a SEEKER applicant becomes a PRACTITIONER (admin action off `/prototype/practitioner/apply`). → auth-clerk.
4. **The exact transactional email set** and the match-introduction mechanics. → email-resend.
5. **What's in Phase 2 vs. deliberately later** — reconcile against `/prototype/scope`.

## Reference implementation map (counsel-post)

| Pattern | File in `/Users/johnrice/Projects/counsel-post` |
| --- | --- |
| Prisma 7 + PrismaPg singleton | `src/lib/db.ts` |
| Schema conventions, Clerk/Stripe mirror columns | `prisma/schema.prisma` |
| Clerk↔User glue, `clerkEnabled`, `getCurrentDbUser()` | `src/lib/auth.ts` |
| Stripe state mirror + `isSubscribed()` gating | `src/lib/subscription.ts` |
| Env var shape | `.env.example` |

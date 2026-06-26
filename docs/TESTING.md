# Testing

Four tiers, smallest/fastest first. The default `npm test` runs tiers 1–2 (no infra, runs
anywhere); tiers 3–4 are opt-in against a throwaway database.

| Tier | Location | What it proves | Runs by default? |
| --- | --- | --- | --- |
| **1 · Unit** | `tests/*.test.ts` | Pure logic + where-clause shapes + each server action in isolation (Prisma/auth mocked) | ✅ `npm test` |
| **2 · Flow** | `tests/flows/*.test.ts` | Multi-step sequences against one in-memory store — state carries across steps | ✅ `npm test` |
| **3 · Integration** | `tests/integration/*.test.ts` | Real Postgres (JSON operators, unique constraints, the live read layer) + live Resend/Serper | ⏳ `npm run test:integration` (skips without a DB / keys) |
| **4 · E2E** | `e2e/*.spec.ts` | Real Chromium driving the running app — public + signed-in flows end to end | ⏳ `npm run test:e2e` (DB-backed specs skip without a DB) |

Roughly **369 tests**: 328 unit + 17 flow + 9 integration + 15 E2E. Gates on every push/PR:
`npx tsc --noEmit` + `npm test`.

> **Coverage honesty:** the unit/flow tiers mock Prisma, so they verify the where/select
> *object shape*, not that Postgres honours it. The tiers that prove user-facing flows against
> a real DB+browser (3 and 4) **skip green** unless a test DB is wired (see below). Treat a
> skipped security/PII spec as a red, not a green. Current independent audit:
> [docs/audits](audits/) — strong on the data-integrity + authorization core. The Clerk webhook
> (signature gate + ban→HIDDEN) and the profile SEO metadata/JSON-LD are now covered; the main
> remaining gap is wiring a CI test DB so tiers 3–4 run on every push (`npm run test:e2e:db` /
> `test:integration:db` need no external DB).

## Tier 2 — flow tests (the scalable part)

A flow test wires the app's `@/lib/db` to an **in-memory mock-db** (`tests/helpers/mock-db.ts`)
so a real sequence of server actions shares one mutating store. Build data with the
**factories** in `tests/helpers/factories.ts`.

**The pattern** (copy this header — `vi.mock` factories are hoisted, so they can only
close over a `vi.hoisted()` holder):

```ts
const h = vi.hoisted(() => ({ db: undefined as unknown as MockDb, getOrCreatePractitioner: vi.fn() }));
vi.mock("@/lib/db", () => ({ get db() { return h.db; } }));           // live getter → shared store
vi.mock("@/lib/auth", () => ({ getOrCreatePractitioner: h.getOrCreatePractitioner }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { publishProfile } from "@/app/practitioner/publish-actions";

beforeEach(() => { h.db = makeMockDb({ practitioners: [aPractitioner({ id: "p1" })] }); });
```

`makeMockDb` matches rows by the scalar/unique fields in `where` (incl. `NOT: { id }`),
which covers every CRUD-by-key the flows need. It is **not** a SQL engine — complex
directory `where` clauses (`array_contains`, JSON paths, `OR`) are verified by the pure
`buildPractitionerWhere` unit tests and by tier 3, not here.

**To add a flow:** drop a file in `tests/flows/`, seed the store, drive the actions,
assert on `h.db.<model>.rows()`. See `claim-flow.test.ts` and `publish-flow.test.ts`.

## Tier 3 — real-DB integration

Exercises actual SQL against a **throwaway** database. The harness points the app's own
Prisma client at `TEST_DATABASE_URL` (never `DATABASE_URL`) and `TRUNCATE`s between tests.

```bash
# 1. a throwaway DB — a Neon branch or local Postgres. NEVER the production DB.
export TEST_DATABASE_URL="postgres://…"
# 2. create the schema on it (once per schema change)
DATABASE_URL=$TEST_DATABASE_URL npx prisma db push
# 3. run
npm run test:integration
```

Without `TEST_DATABASE_URL` the suite **skips** (green), so a fresh checkout and CI stay
clean. The live Resend / Serper cases are additionally gated on `RESEND_API_KEY` / `SERPER_API_KEY`.

**No-install option:** `embedded-postgres` (a dev dependency) downloads a real Postgres
binary into `node_modules` and runs it on a throwaway port — no system Postgres or Docker
needed. `node scripts/test-with-db.mjs <command>` starts it, `prisma db push`es the schema,
runs `<command>` with `TEST_DATABASE_URL` set, then tears it down. Used to run tiers 3–4
against a real DB locally.

## Tier 4 — E2E (Playwright)

Real Chromium over `npm run dev`, covering the **core pillars**: public surfaces (home,
crisis/988, directory, profile, unknown-slug 404), the feedback widget, the practitioner
dashboard/editor, and the admin gate. Static specs run anywhere; DB-backed specs `test.skip`
green without `TEST_DATABASE_URL`.

```bash
npx playwright install chromium     # once — the browser binary
npm run test:e2e                    # static specs run; DB-backed skip without a test DB
# full run against a real DB (no system Postgres needed):
node scripts/test-with-db.mjs npm run test:e2e
```

The seed (`e2e/global-setup.ts`) and assertions share one source of truth — `e2e/fixtures.ts`
(`SEED`). Full spec map + traps: **[docs/E2E-TESTING.md](E2E-TESTING.md)**.

### Getting around Clerk — the E2E auth bypass

Playwright can't drive a real hosted Clerk sign-in (bot detection, hosted UI, real creds), so
E2E boots the app with **Clerk disabled** + `E2E_AUTH_BYPASS=1`. In that mode
`getCurrentDbUser()` ([lib/auth.ts](../lib/auth.ts)) resolves a test identity from an
**`e2e_uid` cookie**, and every downstream gate (`getPractitioner`, `requireAdmin`, the
`authEnabled` page guards) derives from it. A spec "signs in" with
`signInAs(context, SEED.admin)` ([e2e/_auth.ts](../e2e/_auth.ts)) — no Clerk round-trip.

**It cannot fire in production — three independent guards:**
1. `E2E_AUTH_BYPASS` is set only by the Playwright webServer (never in Vercel).
2. It also requires `NODE_ENV !== "production"` — so it can't fire in a prod build even if the flag leaked.
3. It only reads inside the `!clerkEnabled` branch, and prod runs Clerk **enabled**, so that branch never executes there.

`authEnabled` (`clerkEnabled || bypass`) is what the practitioner pages gate on so the bypass
flows through them; in prod it's exactly `=== clerkEnabled`. This is a "who am I" shim only —
it deliberately does **not** exercise the hosted sign-up/sign-in UI, session claims, or the
Clerk webhook (those are out of E2E scope by design).

## Security-boundary tests

### SSRF guard (`lib/ssrf.ts`)

Every server-side fetch of a **user-supplied URL** (the bio importer's `fetchPage` and
`adoptImportedPhoto`) goes through one shared guard. `guardPublicUrl(rawUrl, resolveHost)`
rejects non-http(s) schemes, internal hostnames (`localhost`/`*.local`/`*.internal`), and any
host that resolves to a loopback / private / link-local IP — including `169.254.169.254`
(cloud metadata). The resolver is **injected**, so `tests/ssrf.test.ts` covers literal private
IPs, internal hosts, bad schemes, **DNS-rebinding** (a public name that resolves to a private
IP), and fail-closed-on-resolution-error — all without touching the network.

> **Rule:** any new server-side `fetch()` of a user-influenced URL MUST go through
> `guardPublicUrl`. Don't re-implement the check inline — that's how the two copies drifted
> and went untested before being consolidated here.

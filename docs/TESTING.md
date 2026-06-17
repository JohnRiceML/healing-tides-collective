# Testing

Three layers, smallest/fastest first. The default `npm test` runs layers 1–2 (no
infra, runs anywhere); layer 3 is opt-in against a throwaway database.

| Layer | Location | What it proves | Runs by default? |
| --- | --- | --- | --- |
| **1 · Unit** | `tests/*.test.ts` | Pure logic + where-clause shapes + each server action in isolation (Prisma/auth mocked) | ✅ `npm test` |
| **2 · Flow** | `tests/flows/*.test.ts` | Multi-step sequences against one in-memory store — state carries across steps | ✅ `npm test` |
| **3 · Integration** | `tests/integration/*.test.ts` | Real Postgres: JSON operators, unique constraints, the live read layer | ⏳ `npm run test:integration` (skips without a DB) |

Gates: `npx tsc --noEmit` + `npm test` run in CI on every push/PR.

## Layer 2 — flow tests (the scalable part)

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
`buildPractitionerWhere` unit tests and by layer 3, not here.

**To add a flow:** drop a file in `tests/flows/`, seed the store, drive the actions,
assert on `h.db.<model>.rows()`. See `claim-flow.test.ts` and `publish-flow.test.ts`.

## Layer 3 — real-DB integration

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
clean. To run it in CI, add a `TEST_DATABASE_URL` secret (a Neon branch) and a
`npm run test:integration` step.

> **Future (no-infra integration):** when network/deps allow, an in-process Postgres
> (pglite) could let layer 3 run everywhere with zero setup. Not wired yet — the repo
> currently has no network access to add the dependency.

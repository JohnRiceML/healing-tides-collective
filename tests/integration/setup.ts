// Integration-test setup. Runs ONLY under the integration vitest config (never the
// default `npm test`). Points the app's own Prisma client at a THROWAWAY test database
// so we exercise the real SQL — JSON `array_contains`, unique constraints, the actual
// read layer — which mocked tests can't.
//
// SAFETY: uses TEST_DATABASE_URL, never DATABASE_URL. Point it at a Neon *branch* or a
// local Postgres — NEVER the production DB (it gets TRUNCATEd between tests).
//
// One-time, before running: `DATABASE_URL=$TEST_DATABASE_URL npx prisma db push` to
// create the schema on the test DB. Then `npm run test:integration`.

import { afterAll, beforeEach } from "vitest";

// Redirect the app client at the test DB *before* any test imports @/lib/db.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

/** Wipe all rows between tests so each one starts clean. */
export async function resetDb() {
  const { db } = await import("@/lib/db");
  await db.$executeRawUnsafe(
    'TRUNCATE TABLE "invites","profile_views","practitioners","users" RESTART IDENTITY CASCADE',
  );
}

// Auto-wire reset + teardown for any suite that imports this file, but only when a
// test DB is actually configured (otherwise these are no-ops and suites skipIf out).
if (hasTestDb) {
  beforeEach(resetDb);
  afterAll(async () => {
    const { db } = await import("@/lib/db");
    await db.$disconnect();
  });
}

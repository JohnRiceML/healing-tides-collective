import type { FullConfig } from "@playwright/test";
import { Client } from "pg";

import { SEED, SEED_FEEDBACK } from "./fixtures";

/**
 * Seed the E2E database before the run.
 *
 * No-op (with a note) when TEST_DATABASE_URL is unset — the DB-backed specs then skip and only
 * the static smoke specs run. It ONLY ever writes to TEST_DATABASE_URL, so it can never touch
 * the production DB.
 *
 * Uses node-postgres with raw SQL rather than the Prisma client on purpose: Playwright's loader
 * can't load the app's generated client (it's TypeScript using the `@/` alias + import.meta).
 * Enum values are inline literals (Postgres coerces them to the column's enum type); the trusted
 * fixture strings are parameterized.
 *
 * Easiest full run (spins up a throwaway Postgres, no system install):
 *   node scripts/test-with-db.mjs npm run test:e2e
 */
async function globalSetup(_config: FullConfig) {
  const testDb = process.env.TEST_DATABASE_URL;
  if (!testDb) {
    console.warn(
      "\n[e2e] TEST_DATABASE_URL not set — seeding skipped; DB-backed specs will skip.\n" +
        "      Full run:  node scripts/test-with-db.mjs npm run test:e2e\n",
    );
    return;
  }

  const client = new Client({ connectionString: testDb });
  await client.connect();
  try {
    await client.query(
      'TRUNCATE TABLE "matches","seeker_intakes","feedback","invites","profile_views","practitioners","users" RESTART IDENTITY CASCADE',
    );

    // Admin identity (role ADMIN — also in the webServer's ADMIN_EMAILS).
    await client.query(
      `INSERT INTO users (id, clerk_user_id, email, role, updated_at) VALUES ($1,$2,$3,'ADMIN',now())`,
      ["e2e-admin", SEED.admin.clerkUserId, SEED.admin.email],
    );

    // Published practitioner: user + a complete-enough public profile.
    await client.query(
      `INSERT INTO users (id, clerk_user_id, email, role, updated_at) VALUES ($1,$2,$3,'PRACTITIONER',now())`,
      ["e2e-pub-user", SEED.published.clerkUserId, SEED.published.email],
    );
    await client.query(
      `INSERT INTO practitioners (id, user_id, slug, display_name, bio, region, visibility, completeness, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,'PUBLISHED',80,now())`,
      [
        "e2e-pub-prac",
        "e2e-pub-user",
        SEED.published.slug,
        SEED.published.displayName,
        SEED.published.bio,
        SEED.published.region,
      ],
    );

    // Plain seeker (no practitioner profile).
    await client.query(
      `INSERT INTO users (id, clerk_user_id, email, role, updated_at) VALUES ($1,$2,$3,'SEEKER',now())`,
      ["e2e-seeker-user", SEED.seeker.clerkUserId, SEED.seeker.email],
    );

    // One feedback row for the admin queue (kind/status match SEED_FEEDBACK).
    await client.query(`INSERT INTO feedback (id, message, kind, status) VALUES ($1,$2,'PRAISE','NEW')`, [
      "e2e-fb-1",
      SEED_FEEDBACK.message,
    ]);

    // A submitted seeker intake for the matching workspace (status defaults to NEW).
    await client.query(
      `INSERT INTO seeker_intakes (id, name, email, story, region, status, updated_at)
       VALUES ($1,$2,$3,$4,$5,'NEW',now())`,
      ["e2e-intake-1", SEED.intake.name, SEED.intake.email, SEED.intake.story, SEED.intake.region],
    );

    console.log("[e2e] seeded test database");
  } finally {
    await client.end();
  }
}

export default globalSetup;

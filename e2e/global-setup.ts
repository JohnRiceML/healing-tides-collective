import type { FullConfig } from "@playwright/test";

import { SEED, SEED_FEEDBACK } from "./fixtures";

/**
 * Seed the E2E database before the run.
 *
 * No-op (with a clear note) when TEST_DATABASE_URL is unset — the DB-backed specs then
 * skip and only the static smoke specs run. It ONLY ever writes to TEST_DATABASE_URL, so
 * it can never touch the production DB.
 *
 * One-time schema setup on the test DB:
 *   DATABASE_URL=$TEST_DATABASE_URL npx prisma db push
 */
async function globalSetup(_config: FullConfig) {
  const testDb = process.env.TEST_DATABASE_URL;
  if (!testDb) {
    console.warn(
      "\n[e2e] TEST_DATABASE_URL not set — seeding skipped; DB-backed specs will skip.\n" +
        "      Full run:  DATABASE_URL=$TEST_DATABASE_URL npx prisma db push\n" +
        "                 TEST_DATABASE_URL=… npm run test:e2e\n",
    );
    return;
  }

  // Point the app's Prisma client at the test DB before importing it.
  process.env.DATABASE_URL = testDb;
  process.env.DATABASE_URL_UNPOOLED = testDb;
  const { db } = await import("../lib/db");

  try {
    await db.$executeRawUnsafe(
      'TRUNCATE TABLE "feedback","invites","profile_views","practitioners","users" RESTART IDENTITY CASCADE',
    );

    // Admin identity.
    await db.user.create({
      data: { clerkUserId: SEED.admin.clerkUserId, email: SEED.admin.email, role: "ADMIN" },
    });

    // Published practitioner: user + a complete-enough public profile.
    const pubUser = await db.user.create({
      data: {
        clerkUserId: SEED.published.clerkUserId,
        email: SEED.published.email,
        role: "PRACTITIONER",
      },
    });
    await db.practitioner.create({
      data: {
        userId: pubUser.id,
        slug: SEED.published.slug,
        displayName: SEED.published.displayName,
        bio: SEED.published.bio,
        region: SEED.published.region,
        visibility: "PUBLISHED",
        completeness: 80,
      },
    });

    // Plain seeker (no practitioner profile).
    await db.user.create({
      data: { clerkUserId: SEED.seeker.clerkUserId, email: SEED.seeker.email },
    });

    // One feedback row for the admin queue.
    await db.feedback.create({
      data: {
        message: SEED_FEEDBACK.message,
        kind: SEED_FEEDBACK.kind,
        status: SEED_FEEDBACK.status,
      },
    });

    console.log("[e2e] seeded test database");
  } finally {
    await db.$disconnect();
  }
}

export default globalSetup;

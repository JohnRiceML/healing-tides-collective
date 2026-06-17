// Real-database flow tests — the things mocks fundamentally can't verify: actual
// Postgres JSON operators, unique constraints, and the live read layer. Gated on
// TEST_DATABASE_URL: when it's unset these all skip (so `npm run test:integration`
// is green in a fresh checkout), and they run for real once you point it at a Neon
// branch / local Postgres. See setup.ts.

import { describe, it, expect } from "vitest";

import { hasTestDb } from "./setup";

describe.skipIf(!hasTestDb)("real-DB flows", () => {
  it("age-groups filter matches via the fieldValues JSON array (array_contains)", async () => {
    const { db } = await import("@/lib/db");
    const { getPublishedPractitioners } = await import("@/lib/practitioners");

    const u1 = await db.user.create({ data: { clerkUserId: "c_adults" } });
    const u2 = await db.user.create({ data: { clerkUserId: "c_kids" } });
    await db.practitioner.create({
      data: { userId: u1.id, displayName: "Adults Only", slug: "adults-only", visibility: "PUBLISHED", fieldValues: { age_groups: ["adults"] } },
    });
    await db.practitioner.create({
      data: { userId: u2.id, displayName: "Kids Only", slug: "kids-only", visibility: "PUBLISHED", fieldValues: { age_groups: ["children"] } },
    });

    const adults = await getPublishedPractitioners({ ageGroups: "adults" });
    expect(adults.map((p) => p.slug)).toEqual(["adults-only"]);
  });

  it("enforces the practitioner slug unique constraint", async () => {
    const { db } = await import("@/lib/db");
    const a = await db.user.create({ data: { clerkUserId: "c_a" } });
    const b = await db.user.create({ data: { clerkUserId: "c_b" } });
    await db.practitioner.create({ data: { userId: a.id, slug: "taken", displayName: "A" } });
    await expect(
      db.practitioner.create({ data: { userId: b.id, slug: "taken", displayName: "B" } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("enforces the invite token unique constraint", async () => {
    const { db } = await import("@/lib/db");
    await db.invite.create({ data: { token: "dup", email: "a@x.com" } });
    await expect(
      db.invite.create({ data: { token: "dup", email: "b@x.com" } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });
});

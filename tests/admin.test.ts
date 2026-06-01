import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk + the DB before importing the modules under test.
const { auth, currentUser } = vi.hoisted(() => ({ auth: vi.fn(), currentUser: vi.fn() }));
const { findUnique, create, count, aggregate, findMany } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  findMany: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth, currentUser }));
vi.mock("@/lib/clerk-enabled", () => ({ clerkEnabled: true }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique, create },
    practitioner: { count, aggregate, findMany },
  },
}));

import { requireAdmin } from "@/lib/auth";
import { getAdminStats, getAdminPractitioners } from "@/app/admin/_data";

beforeEach(() => {
  for (const m of [auth, currentUser, findUnique, create, count, aggregate, findMany]) m.mockReset();
});

describe("requireAdmin — the /admin gate", () => {
  it("returns the user when their role is ADMIN", async () => {
    auth.mockResolvedValue({ userId: "clerk_1" });
    findUnique.mockResolvedValue({ id: "u1", clerkUserId: "clerk_1", role: "ADMIN" });
    const u = await requireAdmin();
    expect(u?.role).toBe("ADMIN");
  });

  it("returns null for a non-admin (e.g. a practitioner)", async () => {
    auth.mockResolvedValue({ userId: "clerk_1" });
    findUnique.mockResolvedValue({ id: "u1", clerkUserId: "clerk_1", role: "PRACTITIONER" });
    expect(await requireAdmin()).toBeNull();
  });

  it("returns null when nobody is signed in (no DB lookup)", async () => {
    auth.mockResolvedValue({ userId: null });
    expect(await requireAdmin()).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe("admin data", () => {
  it("getAdminStats shapes the counts + view sum", async () => {
    count.mockResolvedValueOnce(5).mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    aggregate.mockResolvedValue({ _sum: { viewCount: 42 } });
    expect(await getAdminStats()).toEqual({ total: 5, published: 3, draft: 2, totalViews: 42 });
  });

  it("getAdminStats defaults the view sum to 0 when null", async () => {
    count.mockResolvedValue(0);
    aggregate.mockResolvedValue({ _sum: { viewCount: null } });
    expect((await getAdminStats()).totalViews).toBe(0);
  });

  it("getAdminPractitioners flattens the related user email", async () => {
    findMany.mockResolvedValue([
      {
        id: "p1",
        displayName: "A",
        slug: "a",
        visibility: "PUBLISHED",
        completeness: 90,
        viewCount: 3,
        region: null,
        featured: false,
        updatedAt: new Date(0),
        user: { email: "a@b.com" },
      },
    ]);
    const rows = await getAdminPractitioners();
    expect(rows[0].email).toBe("a@b.com");
    expect(rows[0]).not.toHaveProperty("user");
  });
});

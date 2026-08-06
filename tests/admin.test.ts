import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk + the DB before importing the modules under test.
const { auth, currentUser } = vi.hoisted(() => ({ auth: vi.fn(), currentUser: vi.fn() }));
const { findUnique, create, findMany, groupBy, pFindUnique, pUpdate } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn(),
  groupBy: vi.fn(),
  pFindUnique: vi.fn(),
  pUpdate: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth, currentUser }));
vi.mock("@/lib/clerk-enabled", () => ({ clerkEnabled: true }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique, create },
    practitioner: { findMany, findUnique: pFindUnique, update: pUpdate },
    profileView: { groupBy },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { requireAdmin } from "@/lib/auth";
import { getAdminPractitioners } from "@/app/admin/_data";
import { setDirectoryApproval } from "@/app/admin/actions";
import { DIRECTORY_APPROVAL_KEY } from "@/app/_lib/directory-approval";

beforeEach(() => {
  for (const m of [auth, currentUser, findUnique, create, findMany, groupBy, pFindUnique, pUpdate]) m.mockReset();
});

/** Sign in as Nora (the ADMIN role path). */
function asAdmin() {
  auth.mockResolvedValue({ userId: "clerk_admin" });
  findUnique.mockResolvedValue({
    id: "u_admin",
    clerkUserId: "clerk_admin",
    role: "ADMIN",
    email: "nora@healingtides.co",
  });
}

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

  it("grants admin via the ADMIN_EMAILS allowlist (case-insensitive, no DB role)", async () => {
    vi.stubEnv("ADMIN_EMAILS", "founder@healingtides.co, John@Example.com");
    auth.mockResolvedValue({ userId: "clerk_1" });
    findUnique.mockResolvedValue({
      id: "u1",
      clerkUserId: "clerk_1",
      role: "PRACTITIONER",
      email: "john@example.com",
    });
    expect((await requireAdmin())?.id).toBe("u1");
    vi.unstubAllEnvs();
  });

  it("does not grant admin for an email outside the allowlist", async () => {
    vi.stubEnv("ADMIN_EMAILS", "someone@else.com");
    auth.mockResolvedValue({ userId: "clerk_1" });
    findUnique.mockResolvedValue({
      id: "u1",
      clerkUserId: "clerk_1",
      role: "PRACTITIONER",
      email: "john@example.com",
    });
    expect(await requireAdmin()).toBeNull();
    vi.unstubAllEnvs();
  });
});

describe("admin data", () => {
  it("getAdminPractitioners flattens the related user email + derives recent-view counts", async () => {
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
        createdAt: new Date(0),
        updatedAt: new Date(0),
        user: { email: "a@b.com" },
      },
    ]);
    // groupBy is called 3× (7d count, 30d count, lifetime last-viewed) — resolve each.
    groupBy
      .mockResolvedValueOnce([{ practitionerId: "p1", _count: { _all: 2 } }]) // 7d
      .mockResolvedValueOnce([{ practitionerId: "p1", _count: { _all: 5 } }]) // 30d
      .mockResolvedValueOnce([{ practitionerId: "p1", _max: { viewedAt: new Date(1000) } }]); // last viewed
    const rows = await getAdminPractitioners();
    expect(rows[0].email).toBe("a@b.com");
    expect(rows[0]).not.toHaveProperty("user");
    expect(rows[0].views7).toBe(2);
    expect(rows[0].views30).toBe(5);
    expect(rows[0].lastViewedAt).toEqual(new Date(1000));
    expect(rows[0].lastSeenAt).toBeNull();
  });
});

// Nora's approval switch — the other way (besides an invite) a profile reaches the directory.
describe("setDirectoryApproval", () => {
  it("approves a waiting profile and publishes it in the same click", async () => {
    asAdmin();
    pFindUnique.mockResolvedValue({ visibility: "NEEDS_REVIEW", slug: "aspen-rivera", fieldValues: {} });
    pUpdate.mockResolvedValue({});

    const r = await setDirectoryApproval("p1", true);

    expect(r).toMatchObject({ ok: true, approved: true, published: true });
    const data = pUpdate.mock.calls[0][0].data;
    expect(data.visibility).toBe("PUBLISHED");
    expect(data.fieldValues[DIRECTORY_APPROVAL_KEY].by).toBe("nora@healingtides.co");
  });

  it("records the approval WITHOUT publishing a draft (they publish when they're ready)", async () => {
    asAdmin();
    pFindUnique.mockResolvedValue({ visibility: "DRAFT", slug: null, fieldValues: {} });
    pUpdate.mockResolvedValue({});

    const r = await setDirectoryApproval("p1", true);

    expect(r).toMatchObject({ ok: true, published: false });
    expect(pUpdate.mock.calls[0][0].data.visibility).toBeUndefined();
  });

  it("never publishes someone who is on hold, even when approved", async () => {
    asAdmin();
    pFindUnique.mockResolvedValue({
      visibility: "NEEDS_REVIEW",
      slug: "aspen-rivera",
      fieldValues: { __hold: { message: "on hold" } },
    });
    pUpdate.mockResolvedValue({});

    const r = await setDirectoryApproval("p1", true);

    expect(r).toMatchObject({ ok: true, published: false });
    expect(pUpdate.mock.calls[0][0].data.visibility).toBeUndefined();
  });

  it("refuses a non-admin, and never writes", async () => {
    auth.mockResolvedValue({ userId: "clerk_1" });
    findUnique.mockResolvedValue({ id: "u1", clerkUserId: "clerk_1", role: "PRACTITIONER" });

    const r = await setDirectoryApproval("p1", true);

    expect(r.ok).toBe(false);
    expect(pUpdate).not.toHaveBeenCalled();
  });

  it("un-approving clears the marker and leaves visibility alone (Hold is the takedown tool)", async () => {
    asAdmin();
    pFindUnique.mockResolvedValue({
      visibility: "PUBLISHED",
      slug: "aspen-rivera",
      fieldValues: { [DIRECTORY_APPROVAL_KEY]: { by: "nora@healingtides.co", at: "2026-06-01T00:00:00.000Z" }, credentials: ["LICSW"] },
    });
    pUpdate.mockResolvedValue({});

    const r = await setDirectoryApproval("p1", false);

    expect(r).toMatchObject({ ok: true, approved: false, published: false });
    const data = pUpdate.mock.calls[0][0].data;
    expect(data.fieldValues[DIRECTORY_APPROVAL_KEY]).toBeUndefined();
    expect(data.fieldValues.credentials).toEqual(["LICSW"]); // other keys survive
    expect(data.visibility).toBeUndefined();
  });
});

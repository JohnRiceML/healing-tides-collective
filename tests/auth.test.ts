import { describe, it, expect, vi, beforeEach } from "vitest";

// Force Clerk "on" and mock its server helpers + the DB before importing auth.
const { authFn, currentUserFn } = vi.hoisted(() => ({
  authFn: vi.fn(),
  currentUserFn: vi.fn(),
}));
const { userFindUnique, userCreate, userUpdate, practitionerFindUnique, practitionerUpsert } =
  vi.hoisted(() => ({
    userFindUnique: vi.fn(),
    userCreate: vi.fn(),
    userUpdate: vi.fn(),
    practitionerFindUnique: vi.fn(),
    practitionerUpsert: vi.fn(),
  }));

vi.mock("@clerk/nextjs/server", () => ({ auth: authFn, currentUser: currentUserFn }));
vi.mock("@/lib/clerk-enabled", () => ({ clerkEnabled: true }));
vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: userFindUnique, create: userCreate, update: userUpdate },
    practitioner: { findUnique: practitionerFindUnique, upsert: practitionerUpsert },
  },
}));

import { getPractitioner } from "@/lib/auth";

beforeEach(() => {
  for (const fn of [
    authFn, currentUserFn, userFindUnique, userCreate, userUpdate,
    practitionerFindUnique, practitionerUpsert,
  ]) fn.mockReset();
});

describe("getPractitioner — read-only resolver", () => {
  it("returns null and never touches the DB when nobody is signed in", async () => {
    authFn.mockResolvedValue({ userId: null });
    const r = await getPractitioner();
    expect(r).toBeNull();
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(practitionerFindUnique).not.toHaveBeenCalled();
  });

  it("for a signed-in seeker with no profile: returns { practitioner: null } WITHOUT creating or promoting", async () => {
    authFn.mockResolvedValue({ userId: "clerk_1" });
    userFindUnique.mockResolvedValue({ id: "u1", role: "SEEKER", email: "seeker@example.com" });
    practitionerFindUnique.mockResolvedValue(null);

    const r = await getPractitioner();

    expect(r?.practitioner).toBeNull();
    expect(r?.user.role).toBe("SEEKER"); // not promoted
    // The whole point of the fix: a GET must not write.
    expect(practitionerUpsert).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
    expect(userCreate).not.toHaveBeenCalled();
    expect(practitionerFindUnique).toHaveBeenCalledWith({ where: { userId: "u1" } });
  });

  it("returns the existing profile for a practitioner, still without writing", async () => {
    authFn.mockResolvedValue({ userId: "clerk_2" });
    userFindUnique.mockResolvedValue({ id: "u2", role: "PRACTITIONER", email: "p@example.com" });
    practitionerFindUnique.mockResolvedValue({ id: "p2", userId: "u2" });

    const r = await getPractitioner();

    expect(r?.practitioner?.id).toBe("p2");
    expect(practitionerUpsert).not.toHaveBeenCalled();
    expect(userUpdate).not.toHaveBeenCalled();
  });
});

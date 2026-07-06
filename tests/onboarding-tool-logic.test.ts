import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeMockDb, type MockDb } from "./helpers/mock-db";

const h = vi.hoisted(() => ({
  db: undefined as unknown as MockDb,
  currentUser: null as { id: string } | null,
  authThrows: false,
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({
  getCurrentDbUser: async () => {
    if (h.authThrows) throw new Error("no request scope");
    return h.currentUser;
  },
}));

import { runSaveIntake } from "@/lib/onboarding/tool-logic";

const valid = { name: "Sam Rivera", email: "sam@example.com", story: "Looking for somatic trauma support." };

beforeEach(() => {
  h.db = makeMockDb();
  h.currentUser = null;
  h.authThrows = false;
});

describe("runSaveIntake — identity linkage (best-effort, never blocking)", () => {
  it("attaches the signed-in user's id when one exists", async () => {
    h.currentUser = { id: "u1" };
    const res = await runSaveIntake(valid);
    expect(res.ok).toBe(true);
    expect(h.db.seekerIntake.rows()[0].userId).toBe("u1");
  });

  it("writes userId null for an anonymous seeker", async () => {
    const res = await runSaveIntake(valid);
    expect(res.ok).toBe(true);
    expect(h.db.seekerIntake.rows()[0].userId).toBeNull();
  });

  it("still saves (userId null) when the auth lookup throws", async () => {
    h.authThrows = true;
    const res = await runSaveIntake(valid, "voice");
    expect(res.ok).toBe(true);
    const row = h.db.seekerIntake.rows()[0];
    expect(row.userId).toBeNull();
    expect(row.fieldValues.__source).toBe("voice");
  });
});

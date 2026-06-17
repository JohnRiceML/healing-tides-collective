import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";
import { aPractitioner, anInvite, aUser } from "../helpers/factories";

// Carry the token via a fake cookie jar; redirect() throws (as in Next) so we catch it
// and then assert the DB side-effects the action committed before redirecting.
const h = vi.hoisted(() => ({
  db: undefined as unknown as MockDb,
  token: "",
  getOrCreatePractitioner: vi.fn(),
  getCurrentDbUser: vi.fn(),
  cookieDelete: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ get db() { return h.db; } }));
vi.mock("@/lib/auth", () => ({
  getOrCreatePractitioner: h.getOrCreatePractitioner,
  getCurrentDbUser: h.getCurrentDbUser,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: h.token }), set: vi.fn(), delete: h.cookieDelete }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  },
}));

import { completeClaim } from "@/app/claim/claim-actions";

const db = () => h.db;

beforeEach(() => {
  h.getOrCreatePractitioner.mockReset();
  h.getCurrentDbUser.mockReset();
  h.cookieDelete.mockReset();
});

async function runRedirecting(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
    throw new Error("expected a redirect");
  } catch (e) {
    return (e as { url?: string }).url ?? "";
  }
}

describe("claim completion: prefill the empty fields, mark the invite claimed", () => {
  it("fills name + region from the invite and claims it once", async () => {
    h.token = "tok-1";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-1", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p1", userId: "u1", displayName: null, region: null })],
    });
    h.getOrCreatePractitioner.mockImplementation(async () => ({
      user: aUser({ id: "u1" }),
      practitioner: await h.db.practitioner.findFirst({ where: { id: "p1" } }),
    }));

    const url = await runRedirecting(completeClaim);
    expect(url).toBe("/practitioner/edit");

    const p = db().practitioner.rows()[0];
    expect(p.displayName).toBe("Jordan Lake");
    expect(p.region).toBe("Saint Paul, MN");

    const inv = db().invite.rows()[0];
    expect(inv.claimedAt).toBeInstanceOf(Date);
    expect(inv.claimedByUserId).toBe("u1");
    expect(h.cookieDelete).toHaveBeenCalled();
  });

  it("does not overwrite fields the practitioner already filled", async () => {
    h.token = "tok-2";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-2", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p2", userId: "u2", displayName: "Dr. Jordan", region: "Minneapolis" })],
    });
    h.getOrCreatePractitioner.mockImplementation(async () => ({
      user: aUser({ id: "u2" }),
      practitioner: await h.db.practitioner.findFirst({ where: { id: "p2" } }),
    }));

    await runRedirecting(completeClaim);

    const p = db().practitioner.rows()[0];
    expect(p.displayName).toBe("Dr. Jordan"); // kept
    expect(p.region).toBe("Minneapolis"); // kept
  });

  it("is a no-op for an already-claimed invite", async () => {
    h.token = "tok-3";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-3", claimedAt: new Date("2026-06-01T00:00:00Z") })],
      practitioners: [aPractitioner({ id: "p3", userId: "u3", displayName: "Existing" })],
    });
    h.getOrCreatePractitioner.mockImplementation(async () => ({
      user: aUser({ id: "u3" }),
      practitioner: await h.db.practitioner.findFirst({ where: { id: "p3" } }),
    }));

    await runRedirecting(completeClaim);
    // getOrCreatePractitioner is never reached for a claimed invite → no writes.
    expect(h.getOrCreatePractitioner).not.toHaveBeenCalled();
    expect(db().practitioner.rows()[0].displayName).toBe("Existing");
  });
});

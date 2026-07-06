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

// Wire the signed-in user (email must match the invite to pass the claim gate) + the
// practitioner the prefill lands on, both reading from the live store.
function signInAs(opts: { userId: string; email: string; practitionerId: string }) {
  h.getCurrentDbUser.mockResolvedValue(aUser({ id: opts.userId, email: opts.email }));
  h.getOrCreatePractitioner.mockImplementation(async () => ({
    user: aUser({ id: opts.userId, email: opts.email }),
    practitioner: await h.db.practitioner.findFirst({ where: { id: opts.practitionerId } }),
  }));
}

describe("claim completion: prefill the empty fields, mark the invite claimed", () => {
  it("fills name + region from the invite and claims it once (matching email)", async () => {
    h.token = "tok-1";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-1", email: "jordan@example.com", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p1", userId: "u1", displayName: null, region: null })],
    });
    signInAs({ userId: "u1", email: "jordan@example.com", practitionerId: "p1" });

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
      invites: [anInvite({ token: "tok-2", email: "jordan@example.com", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p2", userId: "u2", displayName: "Dr. Jordan", region: "Minneapolis" })],
    });
    signInAs({ userId: "u2", email: "jordan@example.com", practitionerId: "p2" });

    await runRedirecting(completeClaim);

    const p = db().practitioner.rows()[0];
    expect(p.displayName).toBe("Dr. Jordan"); // kept
    expect(p.region).toBe("Minneapolis"); // kept
  });

  it("refuses a claim from a different email than the invite (no claim, no prefill)", async () => {
    h.token = "tok-3";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-3", email: "jordan@example.com", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p3", userId: "u3", displayName: null })],
    });
    signInAs({ userId: "u3", email: "attacker@example.com", practitionerId: "p3" });

    const url = await runRedirecting(completeClaim);
    expect(url).toBe("/claim/tok-3?e=email_mismatch");

    expect(db().invite.rows()[0].claimedAt).toBeNull(); // not claimed
    expect(db().practitioner.rows()[0].displayName).toBeNull(); // not prefilled
    expect(h.getOrCreatePractitioner).not.toHaveBeenCalled(); // not promoted
  });

  it("keeps an existing practitioner's rich fieldValues intact (own title untouched)", async () => {
    h.token = "tok-5";
    const richFieldValues = {
      title: "Somatic Therapist", // their own — the invite's title must NOT win
      about_you: "I work gently, at your pace.",
      age_groups: ["adults", "teens"],
      __verified: ["licensed_professional"], // reserved sibling — must survive too
    };
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-5", email: "jordan@example.com", prefill: { title: "Therapist", importUrl: "https://example.com/jordan" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p5", userId: "u5", fieldValues: richFieldValues })],
    });
    signInAs({ userId: "u5", email: "jordan@example.com", practitionerId: "p5" });

    const url = await runRedirecting(completeClaim);
    expect(url).toBe("/practitioner/edit");

    const fv = db().practitioner.rows()[0].fieldValues as Record<string, unknown>;
    expect(fv.title).toBe("Somatic Therapist"); // kept — never overwritten by the invite
    expect(fv.about_you).toBe("I work gently, at your pace."); // nothing lost
    expect(fv.age_groups).toEqual(["adults", "teens"]);
    expect(fv.__verified).toEqual(["licensed_professional"]);
    expect(fv.__importUrl).toBe("https://example.com/jordan"); // the carried link still lands
  });

  it("fills an empty title from the invite without dropping the other fieldValues", async () => {
    h.token = "tok-6";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-6", email: "jordan@example.com", prefill: { title: "Therapist" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p6", userId: "u6", fieldValues: { about_you: "Already written.", __verified: ["insured"] } })],
    });
    signInAs({ userId: "u6", email: "jordan@example.com", practitionerId: "p6" });

    await runRedirecting(completeClaim);

    const fv = db().practitioner.rows()[0].fieldValues as Record<string, unknown>;
    expect(fv.title).toBe("Therapist"); // was empty → filled
    expect(fv.about_you).toBe("Already written."); // preserved
    expect(fv.__verified).toEqual(["insured"]); // reserved sibling preserved
  });

  it("un-burns the invite when the prefill update fails, so the claim can be retried", async () => {
    h.token = "tok-7";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-7", email: "jordan@example.com", displayName: "Jordan Lake", prefill: { region: "Saint Paul, MN" }, claimedAt: null })],
      practitioners: [aPractitioner({ id: "p7", userId: "u7", displayName: null, region: null })],
    });
    // The practitioner row the update targets doesn't exist in the store → the update
    // throws (P2025), exercising the rollback path.
    h.getCurrentDbUser.mockResolvedValue(aUser({ id: "u7", email: "jordan@example.com" }));
    h.getOrCreatePractitioner.mockResolvedValue({
      user: aUser({ id: "u7", email: "jordan@example.com" }),
      practitioner: aPractitioner({ id: "ghost", userId: "u7", displayName: null, region: null }),
    });

    const url = await runRedirecting(completeClaim);
    expect(url).toBe("/claim/tok-7?e=update_failed");

    const inv = db().invite.rows()[0];
    expect(inv.claimedAt).toBeNull(); // rolled back — retryable
    expect(inv.claimedByUserId).toBeNull();
  });

  it("is a no-op for an already-claimed invite", async () => {
    h.token = "tok-4";
    h.db = makeMockDb({
      invites: [anInvite({ token: "tok-4", claimedAt: new Date("2026-06-01T00:00:00Z") })],
      practitioners: [aPractitioner({ id: "p4", userId: "u4", displayName: "Existing" })],
    });

    await runRedirecting(completeClaim);
    expect(h.getCurrentDbUser).not.toHaveBeenCalled();
    expect(h.getOrCreatePractitioner).not.toHaveBeenCalled();
    expect(db().practitioner.rows()[0].displayName).toBe("Existing");
  });
});

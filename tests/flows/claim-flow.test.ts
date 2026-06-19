import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";
import { aUser } from "../helpers/factories";

// Hoisted holder: vi.mock factories are hoisted above imports, so they can only close
// over a vi.hoisted() object. The db getter re-reads `h.db` on every access, so every
// module that imports @/lib/db shares the one in-memory store this flow mutates.
const h = vi.hoisted(() => ({ db: undefined as unknown as MockDb, requireAdmin: vi.fn() }));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createInvite } from "@/app/admin/actions";
import { getInviteByToken, inviteIsClaimable } from "@/lib/invites";

const db = () => h.db;

beforeEach(() => {
  h.db = makeMockDb();
  h.requireAdmin.mockReset();
});

describe("claim flow: admin mints a link → practitioner reads it → it's claimed once", () => {
  it("runs end to end against one store", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));

    // 1. Admin mints a claim link from a waitlist entry.
    const created = await createInvite({
      email: "Waitlister@Example.com",
      displayName: "Jordan Lake",
      prefill: { region: "Saint Paul, Minnesota" },
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.url).toContain("/claim/");
    // With no RESEND env in the test, the layer is off: the link still mints, the auto-send
    // is honestly reported as "not configured" (not a failure).
    expect(created.emailed).toBe(false);
    expect(created.emailReason).toBe("not_configured");

    // It persisted exactly one invite, with a normalized email.
    expect(db().invite.rows()).toHaveLength(1);
    expect(db().invite.rows()[0].email).toBe("waitlister@example.com");

    // 2. The practitioner opens the link — the page resolves the invite by token.
    const token = created.url.split("/claim/")[1];
    const invite = await getInviteByToken(token);
    expect(invite?.displayName).toBe("Jordan Lake");
    expect(inviteIsClaimable(invite)).toBe(true);

    // 3. They claim it → the invite is marked claimed and can't be claimed again.
    await db().invite.update({ where: { token }, data: { claimedAt: new Date("2026-06-17T00:00:00Z") } });
    const after = await getInviteByToken(token);
    expect(inviteIsClaimable(after)).toBe(false);
  });

  it("refuses to mint a link for a non-admin (and writes nothing)", async () => {
    h.requireAdmin.mockResolvedValue(null);
    const res = await createInvite({ email: "x@example.com" });
    expect(res.ok).toBe(false);
    expect(db().invite.rows()).toHaveLength(0);
  });

  it("requires an email", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    const res = await createInvite({ email: "   " });
    expect(res.ok).toBe(false);
    expect(db().invite.rows()).toHaveLength(0);
  });

  it("rejects a malformed email (and writes nothing)", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    for (const bad of ["not-an-email", "user@", "@example.com", "a b@example.com"]) {
      const res = await createInvite({ email: bad });
      expect(res.ok).toBe(false);
    }
    expect(db().invite.rows()).toHaveLength(0);
  });
});

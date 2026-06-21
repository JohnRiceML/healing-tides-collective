import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

import { createInvite, resendInvite, revokeInvite, sendCompletenessReminders } from "@/app/admin/actions";
import { getAdminInvites } from "@/app/admin/_data";
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

describe("admin invite management: list, resend, revoke", () => {
  beforeEach(() => h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" })));

  const tokenOf = (r: { ok: true; url: string } | { ok: false }) =>
    r.ok ? r.url.split("/claim/")[1] : "";

  it("lists invites with derived status + prefilled region", async () => {
    await createInvite({ email: "a@example.com", displayName: "Avery", prefill: { region: "Duluth, Minnesota" } });
    const second = await createInvite({ email: "b@example.com" });
    await db().invite.updateMany({ where: { token: tokenOf(second) }, data: { claimedAt: new Date() } });

    const list = await getAdminInvites();
    const byEmail = Object.fromEntries(list.map((i) => [i.email, i]));
    expect(list).toHaveLength(2);
    expect(byEmail["a@example.com"].status).toBe("pending");
    expect(byEmail["a@example.com"].region).toBe("Duluth, Minnesota");
    expect(byEmail["b@example.com"].status).toBe("claimed");
  });

  it("resend reports not-configured when email is off; refuses a claimed invite", async () => {
    const created = await createInvite({ email: "c@example.com" });
    const token = tokenOf(created);
    expect(await resendInvite(token)).toEqual({ ok: true, emailed: false, emailReason: "not_configured" });

    await db().invite.updateMany({ where: { token }, data: { claimedAt: new Date() } });
    expect((await resendInvite(token)).ok).toBe(false); // claimed → nothing to resend
  });

  it("revoke deletes an UNCLAIMED invite but never a claimed one", async () => {
    const a = await createInvite({ email: "d@example.com" });
    const b = await createInvite({ email: "e@example.com" });
    await db().invite.updateMany({ where: { token: tokenOf(b) }, data: { claimedAt: new Date() } });

    expect((await revokeInvite(tokenOf(a))).ok).toBe(true); // unclaimed → gone
    expect((await revokeInvite(tokenOf(b))).ok).toBe(false); // claimed → refused
    expect(db().invite.rows()).toHaveLength(1); // only the claimed one survives
    expect(db().invite.rows()[0].claimedAt).toBeTruthy();
  });

  it("a non-admin can neither resend nor revoke (and deletes nothing)", async () => {
    await db().invite.create({ data: { token: "tok_x", email: "g@example.com" } });
    h.requireAdmin.mockResolvedValue(null);
    expect((await resendInvite("tok_x")).ok).toBe(false);
    expect((await revokeInvite("tok_x")).ok).toBe(false);
    expect(db().invite.rows()).toHaveLength(1);
  });
});

describe("completeness reminders (admin-triggered)", () => {
  const savedEnv = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };
  afterEach(() => {
    process.env.RESEND_API_KEY = savedEnv.key;
    process.env.EMAIL_FROM = savedEnv.from;
    vi.unstubAllGlobals();
  });

  it("refuses when email isn't configured", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect((await sendCompletenessReminders()).ok).toBe(false);
  });

  it("emails the under-complete, records the cooldown, and won't re-send within the window", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Healing Tides <hello@healingtides.co>";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "e1" }) }));

    // p1: 40% with an email → eligible. p2: 95% → already complete, skipped.
    await db().practitioner.create({
      data: { id: "p1", displayName: "Sam", completeness: 40, fieldValues: {}, user: { email: "sam@example.com" } },
    });
    await db().practitioner.create({
      data: { id: "p2", displayName: "Lee", completeness: 95, fieldValues: {}, user: { email: "lee@example.com" } },
    });

    const res = await sendCompletenessReminders();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.eligible).toBe(1);
      expect(res.sent).toBe(1);
    }
    const p1 = db().practitioner.rows().find((r) => r.id === "p1")!;
    expect(typeof p1.fieldValues.__completenessReminder).toBe("string");

    // a second click is a no-op — p1 is now inside the cooldown window.
    const again = await sendCompletenessReminders();
    if (again.ok) expect(again.sent).toBe(0);
  });
});

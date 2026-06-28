import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";
import { aUser } from "../helpers/factories";

const h = vi.hoisted(() => ({ db: undefined as unknown as MockDb, requireAdmin: vi.fn() }));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({ requireAdmin: h.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createInvitesFromRows } from "@/app/admin/actions";

const db = () => h.db;
const savedEnv = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };

beforeEach(() => {
  h.db = makeMockDb();
  h.requireAdmin.mockReset();
  h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
});
afterEach(() => {
  process.env.RESEND_API_KEY = savedEnv.key;
  process.env.EMAIL_FROM = savedEnv.from;
  vi.unstubAllGlobals();
});

describe("createInvitesFromRows — bulk invite from hand-edited rows", () => {
  it("refuses a non-admin and writes nothing", async () => {
    h.requireAdmin.mockResolvedValue(null);
    const res = await createInvitesFromRows([{ email: "a@example.com" }]);
    expect(res.ok).toBe(false);
    expect(db().invite.rows()).toHaveLength(0);
  });

  it("refuses an empty payload", async () => {
    expect((await createInvitesFromRows([])).ok).toBe(false);
    expect((await createInvitesFromRows([{ email: "   " }])).ok).toBe(false);
  });

  it("mints one invite per row (email off → copyable links, not sent)", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await createInvitesFromRows([{ email: "a@example.com", displayName: "Avery" }, { email: "b@example.com" }]);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.summary.created).toBe(2);
    expect(res.summary.emailed).toBe(0);
    expect(db().invite.rows()).toHaveLength(2);
    expect(res.rows.every((r) => r.ok && r.url?.includes("/claim/"))).toBe(true);
  });

  it("de-dupes repeated emails within the payload (case-insensitive)", async () => {
    const res = await createInvitesFromRows([{ email: "a@example.com" }, { email: "A@Example.com" }]);
    if (!res.ok) return;
    expect(res.summary.created).toBe(1);
    expect(res.summary.duplicates).toBe(1);
    expect(db().invite.rows()).toHaveLength(1);
  });

  it("skips an email that already has a PENDING invite, but not a CLAIMED one", async () => {
    await db().invite.create({ data: { token: "t-pending", email: "pending@example.com", claimedAt: null } });
    await db().invite.create({ data: { token: "t-claimed", email: "claimed@example.com", claimedAt: new Date() } });

    const res = await createInvitesFromRows([
      { email: "pending@example.com" }, // skipped (already pending)
      { email: "claimed@example.com" }, // re-invited (prior was claimed)
      { email: "fresh@example.com" }, // new
    ]);
    if (!res.ok) return;
    expect(res.summary.skippedExisting).toBe(1);
    expect(res.summary.created).toBe(2);
  });

  it("carries a Psychology Today link into the invite prefill", async () => {
    await createInvitesFromRows([{ email: "c@example.com", importUrl: "https://www.psychologytoday.com/x" }]);
    const inv = db().invite.rows().find((r) => r.email === "c@example.com");
    expect(inv?.prefill?.importUrl).toBe("https://www.psychologytoday.com/x");
  });

  it("auto-sends when email is configured", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Healing Tides <hello@healingtides.co>";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "e1" }) }));

    const res = await createInvitesFromRows([{ email: "d@example.com" }, { email: "e@example.com" }]);
    if (!res.ok) return;
    expect(res.summary.created).toBe(2);
    expect(res.summary.emailed).toBe(2);
  });
});

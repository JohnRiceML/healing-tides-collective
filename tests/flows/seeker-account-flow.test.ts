import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";

// Hoisted holder shared by the db/auth mocks (see claim-flow.test.ts for the pattern).
const h = vi.hoisted(() => ({
  db: undefined as unknown as MockDb,
  currentUserId: null as string | null,
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({
  // Reads the LIVE user row so writes (welcomedAt) are reflected across steps.
  getCurrentDbUser: async () => (h.currentUserId ? h.db.user.findUnique({ where: { id: h.currentUserId } }) : null),
  clerkEnabled: false, // so ensureWelcomed doesn't reach for currentUser()
}));
vi.mock("@clerk/nextjs/server", () => ({ currentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { syncSaved, unsaveBySlug, ensureWelcomed } from "@/app/dashboard/actions";

const db = () => h.db;
const savedEnv = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };

beforeEach(() => {
  h.db = makeMockDb({
    users: [{ id: "u1", email: "seeker@example.com", welcomedAt: null }],
    practitioners: [
      { id: "p1", slug: "maya", visibility: "PUBLISHED" },
      { id: "p2", slug: "drafty", visibility: "DRAFT" },
      { id: "p3", slug: "alex", visibility: "PUBLISHED" },
    ],
  });
  h.currentUserId = "u1";
});
afterEach(() => {
  process.env.RESEND_API_KEY = savedEnv.key;
  process.env.EMAIL_FROM = savedEnv.from;
  vi.unstubAllGlobals();
});

describe("syncSaved — merging the anonymous basket into the account", () => {
  it("refuses when signed out and writes nothing", async () => {
    h.currentUserId = null;
    const res = await syncSaved(["maya"]);
    expect(res).toEqual({ ok: false, added: 0 });
    expect(db().savedPractitioner.rows()).toHaveLength(0);
  });

  it("is a no-op for an empty basket", async () => {
    expect(await syncSaved([])).toEqual({ ok: true, added: 0 });
  });

  it("saves only PUBLISHED practitioners and returns the true insert count", async () => {
    const res = await syncSaved(["maya", "drafty", "alex", "ghost"]); // drafty=DRAFT, ghost=missing
    expect(res).toEqual({ ok: true, added: 2 }); // maya + alex only
    const saved = db().savedPractitioner.rows();
    expect(saved.map((r) => r.practitionerId).sort()).toEqual(["p1", "p3"]);
    expect(saved.every((r) => r.userId === "u1")).toBe(true);
  });

  it("skips duplicates on a re-sync (added: 0 the second time)", async () => {
    await syncSaved(["maya", "alex"]);
    const again = await syncSaved(["maya", "alex"]); // already saved
    expect(again).toEqual({ ok: true, added: 0 });
    expect(db().savedPractitioner.rows()).toHaveLength(2);
  });

  it("degrades to {ok:false} if the DB read throws (pre-migration safety)", async () => {
    h.db.practitioner.findMany = async () => {
      throw new Error("relation does not exist");
    };
    expect(await syncSaved(["maya"])).toEqual({ ok: false, added: 0 });
  });
});

describe("unsaveBySlug", () => {
  it("refuses when signed out", async () => {
    h.currentUserId = null;
    expect(await unsaveBySlug("maya")).toEqual({ ok: false });
  });

  it("removes the saved row for the signed-in user", async () => {
    await syncSaved(["maya"]);
    expect(db().savedPractitioner.rows()).toHaveLength(1);
    expect(await unsaveBySlug("maya")).toEqual({ ok: true });
    expect(db().savedPractitioner.rows()).toHaveLength(0);
  });
});

describe("ensureWelcomed — send the welcome email exactly once", () => {
  function configureEmail() {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Healing Tides <hello@healingtides.co>";
  }

  it("refuses when signed out", async () => {
    h.currentUserId = null;
    expect(await ensureWelcomed()).toEqual({ ok: false, sent: false });
  });

  it("no-ops (without claiming) when email isn't configured, so it can still send later", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect(await ensureWelcomed()).toEqual({ ok: true, sent: false });
    expect(db().user.rows()[0].welcomedAt).toBeNull(); // NOT stamped → will retry once configured
  });

  it("sends once, stamps welcomedAt, and never double-sends", async () => {
    configureEmail();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "e1" }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await ensureWelcomed()).toEqual({ ok: true, sent: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(db().user.rows()[0].welcomedAt).toBeTruthy();

    // Second call: already welcomed → no send.
    expect(await ensureWelcomed()).toEqual({ ok: true, sent: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("releases the claim when the send fails, so the next visit retries", async () => {
    configureEmail();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "boom" }));

    const res = await ensureWelcomed();
    expect(res).toEqual({ ok: false, sent: false });
    expect(db().user.rows()[0].welcomedAt).toBeNull(); // rolled back → retryable

    // Now the send succeeds → it goes through.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "e2" }) }));
    expect(await ensureWelcomed()).toEqual({ ok: true, sent: true });
    expect(db().user.rows()[0].welcomedAt).toBeTruthy();
  });
});

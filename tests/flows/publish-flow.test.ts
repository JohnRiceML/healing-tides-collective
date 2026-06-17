import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";
import { aPractitioner, aUser, aHold } from "../helpers/factories";

// getOrCreatePractitioner re-reads the live store each call, so the practitioner the
// actions see reflects every prior step's write — a real publish→unpublish sequence.
const h = vi.hoisted(() => ({ db: undefined as unknown as MockDb, getOrCreatePractitioner: vi.fn() }));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({ getOrCreatePractitioner: h.getOrCreatePractitioner }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { publishProfile, unpublishProfile } from "@/app/practitioner/publish-actions";

const db = () => h.db;
const seed = (over = {}) =>
  (h.db = makeMockDb({ practitioners: [aPractitioner({ id: "p1", slug: null, ...over })] }));

beforeEach(() => {
  h.getOrCreatePractitioner.mockReset();
  // Always resolve to the single practitioner currently in the store.
  h.getOrCreatePractitioner.mockImplementation(async () => {
    const practitioner = await h.db.practitioner.findFirst({});
    return practitioner ? { user: aUser({ id: practitioner.userId }), practitioner } : null;
  });
});

describe("publish flow: draft → publish → unpublish, all against one store", () => {
  it("publishes (mints a slug) then takes it back down", async () => {
    seed({ displayName: "Aspen Rivera", bio: "A real bio.", visibility: "DRAFT" });

    const pub = await publishProfile();
    expect(pub.ok).toBe(true);
    let row = db().practitioner.rows()[0];
    expect(row.visibility).toBe("PUBLISHED");
    expect(row.slug).toBe("aspen-rivera");

    const unpub = await unpublishProfile();
    expect(unpub.ok).toBe(true);
    row = db().practitioner.rows()[0];
    expect(row.visibility).toBe("DRAFT");
    expect(row.slug).toBe("aspen-rivera"); // slug stays stable once minted
  });

  it("won't publish a profile missing the name+bio bar (store unchanged)", async () => {
    seed({ displayName: "Aspen Rivera", bio: "", visibility: "DRAFT" });
    const r = await publishProfile();
    expect(r.ok).toBe(false);
    expect(db().practitioner.rows()[0].visibility).toBe("DRAFT");
  });

  it("won't publish or unpublish while on hold (store unchanged)", async () => {
    seed({ displayName: "Aspen Rivera", bio: "A real bio.", visibility: "PUBLISHED", slug: "aspen-rivera", fieldValues: { __hold: aHold() } });

    const pub = await publishProfile();
    expect(pub).toMatchObject({ ok: false, held: true });

    const unpub = await unpublishProfile();
    expect(unpub).toMatchObject({ ok: false, held: true });

    expect(db().practitioner.rows()[0].visibility).toBe("PUBLISHED"); // untouched
  });
});

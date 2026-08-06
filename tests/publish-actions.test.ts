import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth, the DB, and Next's cache before importing the actions.
const { getOrCreatePractitioner } = vi.hoisted(() => ({
  getOrCreatePractitioner: vi.fn(),
}));
const { update, findFirst, inviteFindFirst } = vi.hoisted(() => ({
  update: vi.fn(),
  findFirst: vi.fn(),
  inviteFindFirst: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getOrCreatePractitioner }));
vi.mock("@/lib/db", () => ({
  db: { practitioner: { update, findFirst }, invite: { findFirst: inviteFindFirst } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { publishProfile, unpublishProfile } from "@/app/practitioner/publish-actions";

const session = (p: Record<string, unknown> = {}) => ({
  user: { id: "u1", role: "PRACTITIONER" },
  practitioner: { id: "p1", slug: null, displayName: "Aspen Rivera", bio: "A bio.", ...p },
});

const p2002 = () => Object.assign(new Error("unique"), { code: "P2002" });

beforeEach(() => {
  getOrCreatePractitioner.mockReset();
  update.mockReset();
  findFirst.mockReset();
  inviteFindFirst.mockReset();
  // Default: this user claimed an invite, so they're cleared for the directory. The
  // gate itself is covered by the "directory gate" block below.
  inviteFindFirst.mockResolvedValue({ id: "inv1" });
});

describe("publishProfile", () => {
  it("rejects when not signed in (and never writes)", async () => {
    getOrCreatePractitioner.mockResolvedValue(null);
    const r = await publishProfile();
    expect(r.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("enforces the name + bio minimum bar", async () => {
    getOrCreatePractitioner.mockResolvedValue(session({ bio: "" }));
    const r = await publishProfile();
    expect(r.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("publishes: sets PUBLISHED on the session's own row + mints a slug from the name", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    findFirst.mockResolvedValue(null); // slug is free
    update.mockResolvedValue({});
    const r = await publishProfile();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.slug).toBe("aspen-rivera");
    const arg = update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "p1" }); // session-derived id, never client input
    expect(arg.data.visibility).toBe("PUBLISHED");
    expect(arg.data.slug).toBe("aspen-rivera");
  });

  it("keeps an existing slug stable (no re-minting)", async () => {
    getOrCreatePractitioner.mockResolvedValue(session({ slug: "custom-slug" }));
    update.mockResolvedValue({});
    const r = await publishProfile();
    expect(r.ok && r.slug).toBe("custom-slug");
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("retries with a fresh slug on a unique-constraint clash, then succeeds", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    findFirst.mockResolvedValue(null);
    update.mockRejectedValueOnce(p2002()).mockResolvedValueOnce({});
    const r = await publishProfile();
    expect(r.ok).toBe(true);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("appends a numeric suffix when the base slug is already taken", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    // First candidate "aspen-rivera" collides; "aspen-rivera-2" is free.
    findFirst.mockResolvedValueOnce({ id: "someone-else" }).mockResolvedValueOnce(null);
    update.mockResolvedValue({});
    const r = await publishProfile();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.slug).toBe("aspen-rivera-2");
    expect(update.mock.calls[0][0].data.slug).toBe("aspen-rivera-2");
  });

  it("returns a friendly error if the write keeps failing", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    findFirst.mockResolvedValue(null);
    update.mockRejectedValue(new Error("db down"));
    const r = await publishProfile();
    expect(r.ok).toBe(false);
  });

  it("refuses to publish while on hold, and never writes", async () => {
    getOrCreatePractitioner.mockResolvedValue(
      session({ fieldValues: { __hold: { message: "on hold" } } }),
    );
    const r = await publishProfile();
    expect(r).toMatchObject({ ok: false, held: true });
    expect(update).not.toHaveBeenCalled();
  });
});

// The directory gate: nobody reaches PUBLISHED without an invite they claimed, or an
// admin's approval. A stranger who signs up lands in NEEDS_REVIEW instead.
describe("publishProfile — directory gate", () => {
  it("sends a non-invited, non-approved practitioner to NEEDS_REVIEW, never PUBLISHED", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    inviteFindFirst.mockResolvedValue(null); // no invite claimed by this user
    findFirst.mockResolvedValue(null);
    update.mockResolvedValue({});

    const r = await publishProfile();

    expect(r).toMatchObject({ ok: true, pendingReview: true });
    expect(update.mock.calls[0][0].data.visibility).toBe("NEEDS_REVIEW");
    expect(update.mock.calls[0][0].data.visibility).not.toBe("PUBLISHED");
  });

  it("looks the invite up by the SESSION user's id (never a client-supplied one)", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    findFirst.mockResolvedValue(null);
    update.mockResolvedValue({});
    await publishProfile();
    expect(inviteFindFirst.mock.calls[0][0].where).toEqual({ claimedByUserId: "u1" });
  });

  it("publishes when an admin has approved them (no invite needed)", async () => {
    getOrCreatePractitioner.mockResolvedValue(
      session({ fieldValues: { __directoryApproval: { by: "nora@healingtides.co", at: "2026-06-01T00:00:00.000Z" } } }),
    );
    inviteFindFirst.mockResolvedValue(null);
    findFirst.mockResolvedValue(null);
    update.mockResolvedValue({});

    const r = await publishProfile();

    expect(r).toMatchObject({ ok: true, pendingReview: false });
    expect(update.mock.calls[0][0].data.visibility).toBe("PUBLISHED");
  });

  it("fails closed to NEEDS_REVIEW when the invite read errors", async () => {
    getOrCreatePractitioner.mockResolvedValue(session());
    inviteFindFirst.mockRejectedValue(new Error("db down"));
    findFirst.mockResolvedValue(null);
    update.mockResolvedValue({});

    const r = await publishProfile();

    expect(r).toMatchObject({ ok: true, pendingReview: true });
    expect(update.mock.calls[0][0].data.visibility).toBe("NEEDS_REVIEW");
  });
});

describe("unpublishProfile", () => {
  it("sets visibility back to DRAFT", async () => {
    getOrCreatePractitioner.mockResolvedValue(session({ slug: "x" }));
    update.mockResolvedValue({});
    const r = await unpublishProfile();
    expect(r.ok).toBe(true);
    expect(update.mock.calls[0][0].data.visibility).toBe("DRAFT");
  });

  it("returns a friendly error when the DB write fails", async () => {
    getOrCreatePractitioner.mockResolvedValue(session({ slug: "x" }));
    update.mockRejectedValue(new Error("db down"));
    const r = await unpublishProfile();
    expect(r.ok).toBe(false);
  });

  it("refuses to unpublish while on hold, and never writes", async () => {
    getOrCreatePractitioner.mockResolvedValue(
      session({ slug: "x", fieldValues: { __hold: { message: "on hold" } } }),
    );
    const r = await unpublishProfile();
    expect(r).toMatchObject({ ok: false, held: true });
    expect(update).not.toHaveBeenCalled();
  });
});

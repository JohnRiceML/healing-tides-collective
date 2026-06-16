import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth, the DB, and Next's cache before importing the actions.
const { getOrCreatePractitioner } = vi.hoisted(() => ({
  getOrCreatePractitioner: vi.fn(),
}));
const { update, findFirst } = vi.hoisted(() => ({
  update: vi.fn(),
  findFirst: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getOrCreatePractitioner }));
vi.mock("@/lib/db", () => ({ db: { practitioner: { update, findFirst } } }));
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

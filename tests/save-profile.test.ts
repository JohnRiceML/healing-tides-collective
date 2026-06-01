import { describe, it, expect, vi, beforeEach } from "vitest";

const { getOrCreatePractitioner } = vi.hoisted(() => ({
  getOrCreatePractitioner: vi.fn(),
}));
const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getOrCreatePractitioner }));
vi.mock("@/lib/db", () => ({ db: { practitioner: { update } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { saveProfile, type ProfileInput } from "@/app/practitioner/actions";

const input = (over: Partial<ProfileInput> = {}): ProfileInput => ({
  displayName: "Aspen",
  bio: "b",
  website: "",
  values: "",
  modality: "",
  region: "",
  gender: "",
  specialties: [],
  insuranceAccepted: [],
  ...over,
});

const signedIn = () =>
  getOrCreatePractitioner.mockResolvedValue({
    user: { id: "u1" },
    practitioner: { id: "p1" },
  });

beforeEach(() => {
  getOrCreatePractitioner.mockReset();
  update.mockReset();
  update.mockResolvedValue({});
});

describe("saveProfile", () => {
  it("rejects when not signed in (and never writes)", async () => {
    getOrCreatePractitioner.mockResolvedValue(null);
    const r = await saveProfile(input());
    expect(r.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("drops a dangerous website scheme to null before saving", async () => {
    signedIn();
    await saveProfile(input({ website: "javascript:alert(1)" }));
    expect(update.mock.calls[0][0].data.website).toBeNull();
  });

  it("normalizes a bare domain to https:// before saving", async () => {
    signedIn();
    await saveProfile(input({ website: "example.com" }));
    expect(update.mock.calls[0][0].data.website).toBe("https://example.com");
  });

  it("writes to the session-derived id and recomputes completeness", async () => {
    signedIn();
    const r = await saveProfile(input({ displayName: "Aspen", bio: "hi" }));
    expect(r.ok).toBe(true);
    expect(update.mock.calls[0][0].where).toEqual({ id: "p1" });
    expect(typeof update.mock.calls[0][0].data.completeness).toBe("number");
  });

  it("returns a friendly error when the DB write fails", async () => {
    signedIn();
    update.mockRejectedValue(new Error("db down"));
    const r = await saveProfile(input());
    expect(r.ok).toBe(false);
  });
});

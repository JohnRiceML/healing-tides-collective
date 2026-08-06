import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";

const h = vi.hoisted(() => ({ db: undefined as unknown as MockDb, ip: "1.1.1.1" }));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({ getCurrentDbUser: async () => null })); // anonymous seeker
// The admin notification has its own suite (flows/intake-notify.test.ts); stub it here so these
// tests stay about the write itself and don't log "email isn't configured" on every intake.
vi.mock("@/lib/seeker-notify", () => ({ notifyAdminOfIntake: async () => {} }));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => (k === "x-forwarded-for" ? h.ip : null) }),
}));

import { requestIntro, submitIntake } from "@/app/get-matched/actions";

const db = () => h.db;
const valid = { name: "Sam Rivera", email: "sam@example.com" };

beforeEach(() => {
  h.db = makeMockDb({
    practitioners: [
      { id: "p1", slug: "maya", visibility: "PUBLISHED" },
      { id: "p2", slug: "drafty", visibility: "DRAFT" },
      { id: "p3", slug: "alex", visibility: "PUBLISHED" },
    ],
  });
  h.ip = "1.1.1.1";
});

describe("requestIntro — consent + the warm-intro write", () => {
  it("refuses without consent (and writes nothing)", async () => {
    const res = await requestIntro({ ...valid, slugs: ["maya"], consent: false });
    expect(res.ok).toBe(false);
    expect(db().seekerIntake.rows()).toHaveLength(0);
  });

  it("refuses with an empty shortlist", async () => {
    expect((await requestIntro({ ...valid, slugs: [], consent: true })).ok).toBe(false);
  });

  it("refuses an invalid name/email", async () => {
    expect((await requestIntro({ name: "", email: "nope", slugs: ["maya"], consent: true })).ok).toBe(false);
    expect(db().seekerIntake.rows()).toHaveLength(0);
  });

  it("creates the intake + a Match per PUBLISHED slug, recording consent", async () => {
    h.ip = "2.2.2.2";
    const res = await requestIntro({ ...valid, slugs: ["maya", "alex"], consent: true });
    expect(res.ok).toBe(true);

    const intakes = db().seekerIntake.rows();
    expect(intakes).toHaveLength(1);
    expect(intakes[0].fieldValues.savedSlugs).toEqual(["maya", "alex"]);
    expect(intakes[0].fieldValues.consentVersion).toBe("v1");
    expect(typeof intakes[0].fieldValues.consentedAt).toBe("string");

    const matches = db().match.rows();
    expect(matches).toHaveLength(2);
    expect(matches.map((m) => m.practitionerId).sort()).toEqual(["p1", "p3"]);
  });

  it("matches only published slugs but persists the FULL list + flags the gap for Nora", async () => {
    h.ip = "3.3.3.3";
    const res = await requestIntro({ ...valid, slugs: ["maya", "drafty"], consent: true });
    expect(res.ok).toBe(true);
    expect(db().match.rows()).toHaveLength(1); // only the published one (maya)
    const intake = db().seekerIntake.rows()[0];
    expect(intake.fieldValues.savedSlugs).toEqual(["maya", "drafty"]); // nothing silently dropped
    expect(intake.adminNote).toContain("currently published"); // flagged
  });

  it("rate-limits a flood from one IP (8/hour)", async () => {
    h.ip = "9.9.9.9";
    for (let i = 0; i < 8; i++) {
      expect((await requestIntro({ ...valid, slugs: ["maya"], consent: true })).ok).toBe(true);
    }
    const ninth = await requestIntro({ ...valid, slugs: ["maya"], consent: true });
    expect(ninth.ok).toBe(false); // blocked
    expect(db().seekerIntake.rows()).toHaveLength(8); // the 9th never wrote
  });
});

describe("submitIntake — the public intake write", () => {
  const intake = { ...valid, story: "Looking for somatic support after a hard year." };

  it("stores a valid intake", async () => {
    h.ip = "4.4.4.4";
    expect((await submitIntake(intake)).ok).toBe(true);
    expect(db().seekerIntake.rows()).toHaveLength(1);
  });

  it("rate-limits a flood from one IP (10/hour)", async () => {
    h.ip = "10.10.10.10";
    for (let i = 0; i < 10; i++) {
      expect((await submitIntake(intake)).ok).toBe(true);
    }
    const eleventh = await submitIntake(intake);
    expect(eleventh.ok).toBe(false); // blocked
    expect(db().seekerIntake.rows()).toHaveLength(10); // the 11th never wrote
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";
import { aUser } from "../helpers/factories";

const h = vi.hoisted(() => ({
  db: undefined as unknown as MockDb,
  requireAdmin: vi.fn(),
  generateObject: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({ requireAdmin: h.requireAdmin, clerkEnabled: false }));
vi.mock("ai", () => ({ generateObject: h.generateObject }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { runTriage, saveAdminNote, messagePractitioner } from "@/app/admin/triage-actions";

const db = () => h.db;
const row = () => db().practitioner.rows()[0];
const savedEnv = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };

beforeEach(() => {
  h.db = makeMockDb({
    practitioners: [
      {
        id: "p1",
        displayName: "Maya Stone",
        slug: "maya",
        visibility: "DRAFT",
        completeness: 70,
        region: "Saint Paul",
        modality: null,
        bio: "I work with anxiety.",
        values: null,
        website: null,
        specialties: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        fieldValues: {},
        user: { email: "maya@example.com" },
      },
    ],
  });
  h.requireAdmin.mockReset();
  h.generateObject.mockReset();
});
afterEach(() => {
  process.env.RESEND_API_KEY = savedEnv.key;
  process.env.EMAIL_FROM = savedEnv.from;
  vi.unstubAllGlobals();
});

describe("runTriage — the AI categorize pass", () => {
  it("refuses a non-admin and writes nothing", async () => {
    h.requireAdmin.mockResolvedValue(null);
    expect((await runTriage("p1")).ok).toBe(false);
    expect(row().fieldValues.__aiTriage).toBeUndefined();
    expect(h.generateObject).not.toHaveBeenCalled();
  });

  it("caches the result in __aiTriage with a category, tags, insights, timestamp", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    h.generateObject.mockResolvedValue({ object: { category: "feature", tags: ["anxiety", "trauma"], insights: ["Strong bio."] } });

    const res = await runTriage("p1");
    expect(res.ok).toBe(true);
    const t = row().fieldValues.__aiTriage;
    expect(t.category).toBe("feature");
    expect(t.tags).toEqual(["anxiety", "trauma"]);
    expect(t.insights).toEqual(["Strong bio."]);
    expect(typeof t.at).toBe("string");
    expect(t.model).toContain("claude");
  });

  it("coerces an unknown AI category to 'unclear'", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    h.generateObject.mockResolvedValue({ object: { category: "make-them-famous", tags: [], insights: [] } });
    await runTriage("p1");
    expect(row().fieldValues.__aiTriage.category).toBe("unclear");
  });

  it("degrades to {ok:false} when the AI call throws, leaving no triage behind", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    h.generateObject.mockRejectedValue(new Error("gateway down"));
    expect((await runTriage("p1")).ok).toBe(false);
    expect(row().fieldValues.__aiTriage).toBeUndefined();
  });

  it("does NOT clobber a note written concurrently during the slow AI call (the lost-update fix)", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    // Simulate a note saved WHILE the model is thinking — the action must re-read fresh before writing.
    h.generateObject.mockImplementation(async () => {
      const current = (await db().practitioner.findUnique({ where: { id: "p1" } }))!.fieldValues as Record<string, unknown>;
      await db().practitioner.update({
        where: { id: "p1" },
        data: { fieldValues: { ...current, __adminNotes: [{ text: "added mid-AI", at: "2026-06-28T00:00:00Z", by: null }] } },
      });
      return { object: { category: "strong", tags: [], insights: [] } };
    });

    await runTriage("p1");
    const fv = row().fieldValues;
    expect(fv.__aiTriage.category).toBe("strong"); // triage saved
    expect(fv.__adminNotes).toHaveLength(1); // ...and the concurrent note SURVIVED
  });
});

describe("saveAdminNote", () => {
  it("refuses a non-admin / empty note", async () => {
    h.requireAdmin.mockResolvedValue(null);
    expect((await saveAdminNote("p1", "hi")).ok).toBe(false);
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    expect((await saveAdminNote("p1", "   ")).ok).toBe(false);
    expect(row().fieldValues.__adminNotes).toBeUndefined();
  });

  it("appends a note with the admin's email, preserving a prior __aiTriage", async () => {
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN", email: "nora@healingtides.co" }));
    await db().practitioner.update({ where: { id: "p1" }, data: { fieldValues: { __aiTriage: { category: "strong", tags: [], insights: [], at: "x", model: "m" } } } });

    expect((await saveAdminNote("p1", "Met at the event.")).ok).toBe(true);
    const fv = row().fieldValues;
    expect(fv.__adminNotes).toHaveLength(1);
    expect(fv.__adminNotes[0]).toMatchObject({ text: "Met at the event.", by: "nora@healingtides.co" });
    expect(fv.__aiTriage.category).toBe("strong"); // sibling key preserved
  });
});

describe("messagePractitioner", () => {
  beforeEach(() => h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN", email: "nora@healingtides.co" })));

  it("refuses a non-admin, a blank message, and a missing subject", async () => {
    h.requireAdmin.mockResolvedValue(null);
    expect((await messagePractitioner("p1", "Hi", "Body")).ok).toBe(false);
    h.requireAdmin.mockResolvedValue(aUser({ role: "ADMIN" }));
    expect((await messagePractitioner("p1", "", "Body")).ok).toBe(false);
    expect((await messagePractitioner("p1", "Hi", "  ")).ok).toBe(false);
  });

  it("refuses when email isn't configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect((await messagePractitioner("p1", "Hi", "Welcome")).ok).toBe(false);
  });

  it("sends with a reply-to and logs the outreach as a note", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Healing Tides <hello@healingtides.co>";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "e1" }) });
    vi.stubGlobal("fetch", fetchMock);

    const res = await messagePractitioner("p1", "Welcome to Healing Tides", "So glad you're here.");
    expect(res).toEqual({ ok: true, emailed: true });

    // Reply-to points at a human (the admin), not the bare sender.
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toEqual(["maya@example.com"]);
    expect(body.reply_to).toBe("nora@healingtides.co");

    // The outreach is logged as a note.
    const notes = row().fieldValues.__adminNotes;
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toContain("Emailed");
    expect(notes[0].text).toContain("Welcome to Healing Tides");
  });
});

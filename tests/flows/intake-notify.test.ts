// Every path that creates a seekerIntake must tell a person about it — the site promises a real
// human reads each summary, and before this the promise depended on someone opening /admin/seekers.
// These tests pin both halves: the notification is attempted, and it can never cost the seeker
// their submission.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeMockDb, type MockDb } from "../helpers/mock-db";

const h = vi.hoisted(() => ({
  db: undefined as unknown as MockDb,
  ip: "50.0.0.1",
  admins: ["nora@healingtides.co"] as string[],
  configured: true,
  send: vi.fn(async (_msg: unknown) => ({ ok: true, id: "e1" }) as unknown),
}));

vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));
vi.mock("@/lib/auth", () => ({
  getCurrentDbUser: async () => null, // anonymous seeker
  adminEmailAllowlist: () => h.admins,
}));
vi.mock("@/lib/email", () => ({
  emailConfigured: () => h.configured,
  sendEmail: (msg: unknown) => h.send(msg),
}));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => (k === "x-forwarded-for" ? h.ip : null) }),
}));

import { requestIntro, submitIntake } from "@/app/get-matched/actions";
import { runSaveIntake } from "@/lib/onboarding/tool-logic";

const seeker = { name: "Sam Rivera", email: "sam@example.com" };
const story = "Some weeks are heavier than others.\nA second line with details I'd rather not repeat.";

let errors: string[];
let warns: string[];

beforeEach(() => {
  h.db = makeMockDb({ practitioners: [{ id: "p1", slug: "maya", visibility: "PUBLISHED" }] });
  h.admins = ["nora@healingtides.co"];
  h.configured = true;
  h.send.mockReset();
  h.send.mockResolvedValue({ ok: true, id: "e1" });
  errors = [];
  warns = [];
  vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void errors.push(a.join(" ")));
  vi.spyOn(console, "warn").mockImplementation((...a: unknown[]) => void warns.push(a.join(" ")));
});

afterEach(() => {
  vi.restoreAllMocks();
});

const sent = () => h.send.mock.calls.map(([m]) => m as { to: string; subject: string; text: string; replyTo?: string });

describe("intake notifications — every create path tells a person", () => {
  it("submitIntake notifies with the triage facts and a direct admin link", async () => {
    h.ip = "50.0.0.1";
    expect((await submitIntake({ ...seeker, story, urgency: "soon", region: "Saint Paul" })).ok).toBe(true);

    const msgs = sent();
    expect(msgs).toHaveLength(1);
    expect(msgs[0].to).toBe("nora@healingtides.co");
    expect(msgs[0].replyTo).toBe("sam@example.com"); // a reply reaches the seeker
    expect(msgs[0].subject).toContain("Sam Rivera");
    expect(msgs[0].subject.toLowerCase()).toContain("within a week or so"); // urgency, at a glance
    expect(msgs[0].text).toContain("Saint Paul");

    const id = h.db.seekerIntake.rows()[0].id;
    expect(msgs[0].text).toContain(`/admin/seekers/${id}`);
  });

  it("requestIntro notifies too", async () => {
    h.ip = "50.0.0.2";
    const res = await requestIntro({ ...seeker, slugs: ["maya"], consent: true, note: story });
    expect(res.ok).toBe(true);
    expect(sent()).toHaveLength(1);
    expect(sent()[0].text).toContain(`/admin/seekers/${h.db.seekerIntake.rows()[0].id}`);
  });

  it("the agent's save_intake notifies too", async () => {
    expect((await runSaveIntake({ ...seeker, story })).ok).toBe(true);
    expect(sent()).toHaveLength(1);
  });

  it("sends to every admin on the allowlist", async () => {
    h.ip = "50.0.0.3";
    h.admins = ["nora@healingtides.co", "second@healingtides.co"];
    await submitIntake({ ...seeker, story });
    expect(sent().map((m) => m.to)).toEqual(["nora@healingtides.co", "second@healingtides.co"]);
  });

  it("carries only the opening line — not the whole disclosure", async () => {
    h.ip = "50.0.0.4";
    await submitIntake({ ...seeker, story });
    const body = sent()[0].text;
    expect(body).toContain("Some weeks are heavier than others.");
    expect(body).not.toContain("I'd rather not repeat");
  });
});

describe("intake notifications — a failure never costs the seeker their submission", () => {
  const cases: [string, () => Promise<{ ok: boolean }>][] = [
    ["submitIntake", () => submitIntake({ ...seeker, story })],
    ["requestIntro", () => requestIntro({ ...seeker, slugs: ["maya"], consent: true, note: story })],
    ["runSaveIntake", () => runSaveIntake({ ...seeker, story })],
  ];

  for (const [label, run] of cases) {
    it(`${label}: still succeeds and stores the row when the send throws`, async () => {
      h.ip = `51.0.0.${cases.findIndex(([l]) => l === label)}`;
      h.send.mockRejectedValue(new Error("resend is down"));

      expect((await run()).ok).toBe(true);
      expect(h.db.seekerIntake.rows()).toHaveLength(1);
      expect(errors.join("\n")).toContain("[seeker-notify]"); // logged, not swallowed
    });
  }

  it("logs (never throws) when the send reports a failure", async () => {
    h.ip = "52.0.0.1";
    h.send.mockResolvedValue({ ok: false, reason: "http_error" });
    expect((await submitIntake({ ...seeker, story })).ok).toBe(true);
    expect(errors.join("\n")).toContain("http_error");
  });

  it("logs (never throws) when email isn't configured at all", async () => {
    h.ip = "52.0.0.2";
    h.configured = false;
    expect((await submitIntake({ ...seeker, story })).ok).toBe(true);
    expect(h.send).not.toHaveBeenCalled();
    expect(warns.join("\n")).toContain("email isn't configured");
  });

  it("logs (never throws) when ADMIN_EMAILS is empty", async () => {
    h.ip = "52.0.0.3";
    h.admins = [];
    expect((await submitIntake({ ...seeker, story })).ok).toBe(true);
    expect(h.send).not.toHaveBeenCalled();
    expect(warns.join("\n")).toContain("ADMIN_EMAILS is empty");
  });

  it("never writes the seeker's story into the logs", async () => {
    h.ip = "52.0.0.4";
    h.send.mockRejectedValue(new Error("resend is down"));
    await submitIntake({ ...seeker, story });
    const all = [...errors, ...warns].join("\n");
    expect(all).not.toContain("Some weeks are heavier");
    expect(all).not.toContain("sam@example.com");
  });
});

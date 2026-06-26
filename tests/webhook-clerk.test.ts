import { describe, it, expect, vi, beforeEach } from "vitest";

// The Clerk webhook is an UNAUTHENTICATED endpoint whose only defense is the Svix signature,
// and it bridges a Clerk ban/delete → our HIDDEN visibility. Both are security-critical and were
// untested. We mock svix (to drive verify's pass/throw) + the db; applyHold/coercePrev run for real.
const h = vi.hoisted(() => ({
  verify: vi.fn(),
  db: {
    user: { updateMany: vi.fn() },
    practitioner: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

// A class (not vi.fn) so `new Webhook(secret).verify` reliably resolves under `new`.
vi.mock("svix", () => ({
  Webhook: class {
    verify = h.verify;
  },
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return h.db;
  },
}));

import { POST } from "@/app/api/webhooks/clerk/route";

function post(): Promise<Response> {
  return POST(
    new Request("http://localhost/api/webhooks/clerk", {
      method: "POST",
      body: "{}",
      headers: { "svix-id": "id_1", "svix-timestamp": "ts", "svix-signature": "sig" },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  h.verify.mockReset(); // clearAllMocks keeps implementations; drop the prior test's throw/return
  process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_test";
  h.db.practitioner.findFirst.mockResolvedValue(null);
  h.db.practitioner.update.mockResolvedValue({});
  h.db.user.updateMany.mockResolvedValue({ count: 1 });
});

describe("Clerk webhook route", () => {
  it("501s when the signing secret isn't configured (fails loud-but-safe)", async () => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    const res = await post();
    expect(res.status).toBe(501);
    expect(h.verify).not.toHaveBeenCalled();
  });

  it("400s on an invalid signature — and touches no data", async () => {
    h.verify.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await post();
    expect(res.status).toBe(400);
    expect(h.db.practitioner.update).not.toHaveBeenCalled();
    expect(h.db.user.updateMany).not.toHaveBeenCalled();
  });

  it("hides a visible practitioner on user.deleted (the ban/delete→HIDDEN bridge)", async () => {
    h.verify.mockReturnValue({ type: "user.deleted", data: { id: "clerk_1" } });
    h.db.practitioner.findFirst.mockResolvedValue({ id: "p1", visibility: "PUBLISHED", fieldValues: {} });
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.db.practitioner.update).toHaveBeenCalledTimes(1);
    const arg = h.db.practitioner.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "p1" });
    expect(arg.data.visibility).toBe("HIDDEN");
    expect(arg.data.fieldValues.__hold).toBeTruthy(); // applyHold recorded the hold
  });

  it("hides on user.updated when banned", async () => {
    h.verify.mockReturnValue({ type: "user.updated", data: { id: "clerk_1", banned: true } });
    h.db.practitioner.findFirst.mockResolvedValue({ id: "p1", visibility: "PUBLISHED", fieldValues: {} });
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.db.practitioner.update.mock.calls[0][0].data.visibility).toBe("HIDDEN");
  });

  it("is idempotent — already HIDDEN means no write", async () => {
    h.verify.mockReturnValue({ type: "user.deleted", data: { id: "clerk_1" } });
    h.db.practitioner.findFirst.mockResolvedValue({ id: "p1", visibility: "HIDDEN", fieldValues: {} });
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.db.practitioner.update).not.toHaveBeenCalled();
  });

  it("ignores a normal user.updated (not banned/locked)", async () => {
    h.verify.mockReturnValue({ type: "user.updated", data: { id: "clerk_1", banned: false } });
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.db.practitioner.findFirst).not.toHaveBeenCalled();
    expect(h.db.practitioner.update).not.toHaveBeenCalled();
  });

  it("stamps lastSeenAt on session.created (and nothing else)", async () => {
    h.verify.mockReturnValue({ type: "session.created", data: { user_id: "clerk_1" } });
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.db.user.updateMany).toHaveBeenCalledWith({
      where: { clerkUserId: "clerk_1" },
      data: { lastSeenAt: expect.any(Date) },
    });
    expect(h.db.practitioner.update).not.toHaveBeenCalled();
  });
});

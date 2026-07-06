// Per-IP throttling on the PUBLIC feedback actions (anonymous DB write + Blob upload).
// Same harness shape as intro-flow.test.ts: next/headers mocked so each test picks its own IP.
// The pure validation behavior is covered in tests/feedback.test.ts — this file is only the guard.

import { describe, it, expect, vi } from "vitest";

const h = vi.hoisted(() => ({ ip: "1.1.1.1", rows: [] as Record<string, unknown>[] }));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => (k === "x-forwarded-for" ? h.ip : null) }),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId: null }) })); // anonymous
vi.mock("@/lib/clerk-enabled", () => ({ clerkEnabled: false }));
vi.mock("@/lib/db", () => ({
  db: {
    feedback: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        h.rows.push(data);
        return data;
      },
    },
  },
}));
vi.mock("@vercel/blob", () => ({
  put: async () => ({ url: "https://x.blob.vercel-storage.com/shot.png" }),
}));

import { submitFeedback, uploadFeedbackScreenshot } from "@/app/feedback/actions";

const note = { message: "The filter on the practitioners page seems broken." };

function shot(): FormData {
  const fd = new FormData();
  fd.set("screenshot", new File([new Uint8Array(64)], "shot.png", { type: "image/png" }));
  return fd;
}

describe("feedback throttling — the public anonymous writes", () => {
  it("rate-limits a submitFeedback flood from one IP (10/hour)", async () => {
    h.ip = "5.5.5.5";
    for (let i = 0; i < 10; i++) {
      expect((await submitFeedback(note)).ok).toBe(true);
    }
    const eleventh = await submitFeedback(note);
    expect(eleventh.ok).toBe(false); // blocked
    expect(h.rows).toHaveLength(10); // the 11th never wrote
  });

  it("rate-limits an uploadFeedbackScreenshot flood from one IP (5/hour)", async () => {
    h.ip = "6.6.6.6";
    for (let i = 0; i < 5; i++) {
      expect((await uploadFeedbackScreenshot(shot())).ok).toBe(true);
    }
    const sixth = await uploadFeedbackScreenshot(shot());
    expect(sixth.ok).toBe(false); // blocked before the Blob write
  });
});

import { describe, it, expect } from "vitest";

import { createRateLimiter } from "@/lib/onboarding/voice/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to max per key, then 429s with a retry-after", () => {
    const rl = createRateLimiter(3, 60_000);
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rl.check("1.2.3.4", now).ok).toBe(true);
    const blocked = rl.check("1.2.3.4", now);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks each key independently", () => {
    const rl = createRateLimiter(2, 60_000);
    const now = 2_000_000;
    rl.check("a", now);
    rl.check("a", now);
    expect(rl.check("a", now).ok).toBe(false);
    expect(rl.check("b", now).ok).toBe(true); // different key, fresh budget
  });

  it("resets after the window elapses", () => {
    const rl = createRateLimiter(2, 60_000);
    const now = 3_000_000;
    rl.check("ip", now);
    rl.check("ip", now);
    expect(rl.check("ip", now).ok).toBe(false);
    expect(rl.check("ip", now + 60_001).ok).toBe(true); // window rolled over
  });
});

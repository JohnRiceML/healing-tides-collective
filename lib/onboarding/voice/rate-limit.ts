// Best-effort per-IP rate limiting for the PUBLIC voice endpoints. gpt-realtime bills per audio
// minute and both routes are unauthenticated, so unbounded calls are a real cost/abuse vector.
//
// HONEST LIMITATION: in-memory sliding windows — per-serverless-instance, reset on cold start,
// not shared across instances/regions. They raise the bar against casual abuse + accidental client
// loops, but a determined attacker spread across instances isn't fully stopped. The durable fix is
// a shared store (Vercel KV / Upstash) — tracked follow-up. Pure (now injected) → unit-testable.

type Bucket = { count: number; resetAt: number };

export type RateLimiter = {
  check(key: string, now: number): { ok: true } | { ok: false; retryAfterSec: number };
  reset(): void; // test-only
};

export function createRateLimiter(max: number, windowMs: number): RateLimiter {
  const buckets = new Map<string, Bucket>();
  return {
    check(key, now) {
      if (buckets.size > 5000) {
        for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      }
      const b = buckets.get(key);
      if (!b || b.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
      }
      if (b.count >= max) return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
      b.count += 1;
      return { ok: true };
    },
    reset() {
      buckets.clear();
    },
  };
}

// Minting a realtime session is the expensive thing (per-minute audio). Tight cap.
export const VOICE_SESSION_MAX = 5;
export const VOICE_SESSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const voiceSessionLimiter = createRateLimiter(VOICE_SESSION_MAX, VOICE_SESSION_WINDOW_MS);

// Tool calls are cheap individually but a single session makes many (search, get, reflect, save),
// so this is generous — it only stops scripted hammering of the unauthenticated tool route.
export const VOICE_TOOL_MAX = 120;
export const VOICE_TOOL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const voiceToolLimiter = createRateLimiter(VOICE_TOOL_MAX, VOICE_TOOL_WINDOW_MS);

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

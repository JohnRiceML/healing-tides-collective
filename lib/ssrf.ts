// SSRF guard for fetching USER-SUPPLIED URLs server-side (the bio importer + the
// adopt-imported-photo path). Both used to carry their own inline copy of this logic; it now
// lives here once, pure and injectable, so it can be exhaustively unit-tested (tests/ssrf.test.ts).
//
// The rule: only ever reach PUBLIC http(s) hosts. Reject non-http(s) schemes, internal
// hostnames, and any host that resolves to a loopback / private / link-local IP — including the
// 169.254.169.254 cloud-metadata range, the classic SSRF target.

import { isIP } from "node:net";

/** True if an IP literal is loopback / private (RFC1918) / link-local (incl. cloud metadata). */
export function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("0.") ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) || // link-local incl. cloud metadata (169.254.169.254)
    /^(fc|fd|fe80)/i.test(ip) // IPv6 ULA / link-local
  );
}

export type SsrfReason =
  | "invalid_url" // not a parseable URL
  | "bad_protocol" // not http(s)
  | "internal_host" // localhost / *.local / *.internal
  | "private_ip" // resolves to a loopback/private/link-local address
  | "unresolvable"; // DNS lookup failed

export type UrlGuardResult =
  | { ok: true; url: URL; host: string }
  | { ok: false; reason: SsrfReason };

/**
 * Validate a user-supplied URL before fetching it. `resolveHost` is injected — production passes
 * a real DNS resolver; tests pass a stub — so the DNS-resolves-to-private case (rebinding defense)
 * is testable without touching the network. A literal IP is classified directly (no DNS call).
 * Returns a reason CODE; callers map it to their own user-facing copy.
 */
export async function guardPublicUrl(
  rawUrl: string,
  resolveHost: (host: string) => Promise<string>,
): Promise<UrlGuardResult> {
  let url: URL;
  try {
    url = new URL((rawUrl ?? "").trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "bad_protocol" };
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "internal_host" };
  }
  let addr: string;
  try {
    addr = isIP(host) ? host : await resolveHost(host);
  } catch {
    return { ok: false, reason: "unresolvable" };
  }
  if (isPrivateIp(addr)) return { ok: false, reason: "private_ip" };
  return { ok: true, url, host };
}

export type GuardedFetchResult =
  | { ok: true; response: Response }
  | { ok: false; reason: SsrfReason | "too_many_redirects" };

/**
 * Fetch an ALREADY-GUARDED URL without letting redirects escape the guard: `redirect: "follow"`
 * would happily bounce to a private host AFTER the initial check, so redirects are followed
 * manually here, re-running guardPublicUrl on every hop, capped at `maxRedirects`. Network
 * errors still throw (same as fetch) — callers keep their existing try/catch + friendly copy.
 * `fetchImpl` is injected for tests, same pattern as `resolveHost`.
 */
export async function fetchGuarded(
  startUrl: URL,
  resolveHost: (host: string) => Promise<string>,
  init: RequestInit = {},
  maxRedirects = 3,
  fetchImpl: typeof fetch = fetch,
): Promise<GuardedFetchResult> {
  let url = startUrl;
  for (let hop = 0; ; hop++) {
    const res = await fetchImpl(url, { ...init, redirect: "manual" });
    const location = res.headers.get("location");
    if (res.status < 300 || res.status >= 400 || !location) return { ok: true, response: res };
    if (hop >= maxRedirects) return { ok: false, reason: "too_many_redirects" };
    let next: URL;
    try {
      next = new URL(location, url); // relative Locations resolve against the current URL
    } catch {
      return { ok: false, reason: "invalid_url" };
    }
    const guard = await guardPublicUrl(next.href, resolveHost);
    if (!guard.ok) return guard;
    url = guard.url;
  }
}

import { describe, it, expect } from "vitest";

import { isPrivateIp, guardPublicUrl, fetchGuarded } from "@/lib/ssrf";

describe("isPrivateIp", () => {
  it("flags loopback, RFC1918, and link-local ranges (incl. cloud metadata)", () => {
    const blocked = [
      "127.0.0.1",
      "::1",
      "0.0.0.0",
      "0.1.2.3",
      "10.0.0.1",
      "10.255.255.255",
      "192.168.0.1",
      "172.16.0.1",
      "172.20.5.5",
      "172.31.255.255",
      "169.254.169.254", // AWS/GCP metadata — the classic SSRF target
      "169.254.0.1",
      "fc00::1",
      "fd12:3456::1",
      "fe80::1",
    ];
    for (const ip of blocked) expect(isPrivateIp(ip), ip).toBe(true);
  });

  it("allows public IPs, including the 172.x edges just outside 16–31", () => {
    const allowed = [
      "8.8.8.8",
      "1.1.1.1",
      "93.184.216.34",
      "172.15.0.1", // below the private 172.16–31 block
      "172.32.0.1", // above it
      "11.0.0.1", // adjacent to 10/8 but public
      "169.253.0.1", // adjacent to 169.254 but public
      "2606:4700:4700::1111", // public IPv6
    ];
    for (const ip of allowed) expect(isPrivateIp(ip), ip).toBe(false);
  });
});

describe("guardPublicUrl", () => {
  // A resolver that explodes if called — proves literal IPs + structural rejects never hit DNS.
  const noDns = async (): Promise<string> => {
    throw new Error("DNS should not have been called");
  };
  const resolvesTo = (ip: string) => async () => ip;

  it("rejects unparseable input", async () => {
    expect(await guardPublicUrl("not a url", noDns)).toMatchObject({ ok: false, reason: "invalid_url" });
    expect(await guardPublicUrl("", noDns)).toMatchObject({ ok: false, reason: "invalid_url" });
  });

  it("rejects non-http(s) schemes (no SSRF via file:/ftp:/gopher:)", async () => {
    for (const u of ["file:///etc/passwd", "ftp://example.com/x", "gopher://example.com", "data:text/plain,hi"]) {
      expect(await guardPublicUrl(u, noDns), u).toMatchObject({ ok: false, reason: "bad_protocol" });
    }
  });

  it("rejects internal hostnames WITHOUT resolving them", async () => {
    for (const u of ["http://localhost/", "https://LOCALHOST/x", "http://db.local/", "http://svc.internal/"]) {
      expect(await guardPublicUrl(u, noDns), u).toMatchObject({ ok: false, reason: "internal_host" });
    }
  });

  it("rejects literal private / loopback / metadata IPs (no DNS call)", async () => {
    for (const u of [
      "http://127.0.0.1/",
      "http://169.254.169.254/latest/meta-data/",
      "http://10.0.0.5/x",
      "http://192.168.1.1/",
      "http://172.16.0.1/",
      "http://0.0.0.0/",
    ]) {
      expect(await guardPublicUrl(u, noDns), u).toMatchObject({ ok: false, reason: "private_ip" });
    }
  });

  it("rejects a PUBLIC name that resolves to a PRIVATE ip (DNS-rebinding defense)", async () => {
    expect(await guardPublicUrl("http://totally-legit.example.com/", resolvesTo("169.254.169.254"))).toMatchObject({
      ok: false,
      reason: "private_ip",
    });
    expect(await guardPublicUrl("https://cdn.example.org/avatar.png", resolvesTo("10.1.2.3"))).toMatchObject({
      ok: false,
      reason: "private_ip",
    });
  });

  it("rejects when DNS resolution fails (fail closed)", async () => {
    const r = await guardPublicUrl("http://nope.example.com/", async () => {
      throw new Error("ENOTFOUND");
    });
    expect(r).toMatchObject({ ok: false, reason: "unresolvable" });
  });

  it("allows a public host that resolves to a public ip", async () => {
    const r = await guardPublicUrl("https://example.com/bio?x=1", resolvesTo("93.184.216.34"));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.host).toBe("example.com");
      expect(r.url.href).toBe("https://example.com/bio?x=1");
    }
  });

  it("allows a public literal IP without touching DNS", async () => {
    const r = await guardPublicUrl("http://8.8.8.8/", noDns);
    expect(r.ok).toBe(true);
  });
});

describe("fetchGuarded — redirects can't escape the guard", () => {
  const publicDns = async () => "93.184.216.34";

  /** Fake fetch keyed by exact URL; throws on any URL it wasn't told about. */
  const fake = (routes: Record<string, () => Response>): typeof fetch =>
    (async (input: unknown) => {
      const key = new URL(String(input)).href;
      const route = routes[key];
      if (!route) throw new Error(`unexpected fetch: ${key}`);
      return route();
    }) as typeof fetch;

  const redirect = (to: string) => () => new Response(null, { status: 302, headers: { location: to } });

  it("follows a public→public redirect to the final response", async () => {
    const fetchImpl = fake({
      "https://a.example.com/": redirect("https://b.example.com/bio"),
      "https://b.example.com/bio": () => new Response("hi", { status: 200 }),
    });
    const r = await fetchGuarded(new URL("https://a.example.com/"), publicDns, {}, 3, fetchImpl);
    expect(r.ok).toBe(true);
    if (r.ok) expect(await r.response.text()).toBe("hi");
  });

  it("resolves a RELATIVE Location against the current URL", async () => {
    const fetchImpl = fake({
      "https://a.example.com/old": redirect("/new"),
      "https://a.example.com/new": () => new Response("moved", { status: 200 }),
    });
    const r = await fetchGuarded(new URL("https://a.example.com/old"), publicDns, {}, 3, fetchImpl);
    expect(r.ok).toBe(true);
  });

  it("blocks a redirect that bounces to the metadata IP (never fetches it)", async () => {
    const fetchImpl = fake({
      "https://a.example.com/": redirect("http://169.254.169.254/latest/meta-data/"),
      // the private target is NOT routed — fetching it would throw "unexpected fetch"
    });
    const r = await fetchGuarded(new URL("https://a.example.com/"), publicDns, {}, 3, fetchImpl);
    expect(r).toMatchObject({ ok: false, reason: "private_ip" });
  });

  it("blocks a redirect to a host that RESOLVES private (rebinding via redirect)", async () => {
    const dns = async (host: string) => (host === "evil.example.net" ? "10.0.0.5" : "93.184.216.34");
    const fetchImpl = fake({
      "https://a.example.com/": redirect("https://evil.example.net/"),
    });
    const r = await fetchGuarded(new URL("https://a.example.com/"), dns, {}, 3, fetchImpl);
    expect(r).toMatchObject({ ok: false, reason: "private_ip" });
  });

  it("gives up after the redirect cap instead of looping forever", async () => {
    const fetchImpl = fake({
      "https://loop.example.com/": redirect("https://loop.example.com/"),
    });
    const r = await fetchGuarded(new URL("https://loop.example.com/"), publicDns, {}, 3, fetchImpl);
    expect(r).toMatchObject({ ok: false, reason: "too_many_redirects" });
  });
});

import { describe, it, expect } from "vitest";

import { isPrivateIp, guardPublicUrl } from "@/lib/ssrf";

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

import { describe, it, expect, afterEach, vi } from "vitest";

import { escapeHtml, claimInviteEmail } from "@/lib/email-templates";
import { emailConfigured, sendEmail } from "@/lib/email";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<b>"Tom" & 'Co'</b>`)).toBe(
      "&lt;b&gt;&quot;Tom&quot; &amp; &#39;Co&#39;&lt;/b&gt;",
    );
  });
});

describe("claimInviteEmail — calm, honest, safe", () => {
  const url = "https://www.healingtides.co/claim/tok_abc123";

  it("puts the claim url in both the html and the plain-text bodies", () => {
    const m = claimInviteEmail({ name: "Maya", url });
    expect(m.text).toContain(url);
    expect(m.html).toContain(url);
    expect(m.subject.length).toBeGreaterThan(0);
  });

  it("greets by name, and falls back to a warm generic when there's no name", () => {
    expect(claimInviteEmail({ name: "Maya", url }).text).toContain("Hi Maya,");
    expect(claimInviteEmail({ name: null, url }).text).toContain("Hi there,");
    expect(claimInviteEmail({ name: "  ", url }).text).toContain("Hi there,");
  });

  it("ESCAPES the name in the html so it can't inject markup (XSS)", () => {
    const m = claimInviteEmail({ name: `<script>alert(1)</script>`, url });
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;");
    // the plain-text body keeps the raw name (no markup risk there)
    expect(m.text).toContain("<script>");
  });

  it("never uses urgency / pressure language (trauma-informed voice)", () => {
    const m = claimInviteEmail({ name: "Maya", url });
    const corpus = (m.subject + " " + m.text + " " + m.html).toLowerCase();
    for (const word of ["hurry", "act now", "expires", "expir", "limited time", "last chance", "don't miss", "deadline"]) {
      expect(corpus.includes(word)).toBe(false);
    }
    // and it actively reassures
    expect(m.text.toLowerCase()).toContain("no rush");
  });

  it("includes step-by-step instructions and names the sign-up email when given", () => {
    const m = claimInviteEmail({ name: "Maya", url, email: "maya@example.com" });
    expect(m.text.toLowerCase()).toContain("how to claim");
    expect(m.text.toLowerCase()).toContain("finish claiming");
    expect(m.text).toContain("maya@example.com"); // the email-match step names the address
    expect(m.html).toContain("maya@example.com");
  });

  it("mentions the one-tap Psychology Today import ONLY when an importUrl is present", () => {
    const withImport = claimInviteEmail({ name: "Maya", url, email: "maya@example.com", importUrl: "https://www.psychologytoday.com/x" });
    expect(withImport.text.toLowerCase()).toContain("psychology today");
    expect(withImport.html.toLowerCase()).toContain("psychology today");

    const without = claimInviteEmail({ name: "Maya", url, email: "maya@example.com" });
    expect(without.text.toLowerCase()).not.toContain("psychology today");
  });
});

describe("emailConfigured / sendEmail — env-gated, never throws", () => {
  const saved = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };
  afterEach(() => {
    process.env.RESEND_API_KEY = saved.key;
    process.env.EMAIL_FROM = saved.from;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const msg = { to: "a@b.com", subject: "s", html: "<p>h</p>", text: "t" };

  it("reports not-configured and sends nothing when env is missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect(emailConfigured()).toBe(false);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await sendEmail(msg)).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("treats a MALFORMED EMAIL_FROM as not-configured (no doomed 422 send)", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    for (const bad of ["@healingtides.co", "healingtides.co", "Healing Tides", "hello@"]) {
      process.env.EMAIL_FROM = bad;
      expect(emailConfigured()).toBe(false);
      expect(await sendEmail(msg)).toEqual({ ok: false, reason: "not_configured" });
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("accepts a valid from — both 'local@domain' and 'Name <local@domain>'", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "hello@healingtides.co";
    expect(emailConfigured()).toBe(true);
    process.env.EMAIL_FROM = "Healing Tides Collective <hello@healingtides.co>";
    expect(emailConfigured()).toBe(true);
  });

  it("posts to Resend and returns the id on success", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "HT <hello@mail.healingtides.co>";
    expect(emailConfigured()).toBe(true);
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "email_123" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const res = await sendEmail(msg);
    expect(res).toEqual({ ok: true, id: "email_123" });
    const [endpoint, init] = fetchSpy.mock.calls[0];
    expect(endpoint).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.from).toBe("HT <hello@mail.healingtides.co>");
    expect(body.to).toEqual(["a@b.com"]);
  });

  it("returns http_error on a non-ok response, without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "HT <hello@mail.healingtides.co>";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422 }));
    expect(await sendEmail(msg)).toEqual({ ok: false, reason: "http_error" });
  });

  it("returns exception on a network fault, without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "HT <hello@mail.healingtides.co>";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    expect(await sendEmail(msg)).toEqual({ ok: false, reason: "exception" });
  });
});

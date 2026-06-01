import { describe, it, expect } from "vitest";

import { safeWebsite } from "@/lib/url";

describe("safeWebsite", () => {
  it("keeps an http(s) URL as-is (any case)", () => {
    expect(safeWebsite("https://example.com")).toBe("https://example.com");
    expect(safeWebsite("http://x.io/path")).toBe("http://x.io/path");
    expect(safeWebsite("HTTPS://Caps.com")).toBe("HTTPS://Caps.com");
  });

  it("assumes https:// for a bare domain", () => {
    expect(safeWebsite("example.com")).toBe("https://example.com");
    expect(safeWebsite("  example.com/path  ")).toBe("https://example.com/path");
  });

  it("returns null for empty / whitespace", () => {
    expect(safeWebsite("")).toBeNull();
    expect(safeWebsite("   ")).toBeNull();
  });

  it("DROPS dangerous and non-http schemes (stored-XSS guard)", () => {
    expect(safeWebsite("javascript:alert(1)")).toBeNull();
    expect(safeWebsite("JavaScript:alert(1)")).toBeNull();
    expect(safeWebsite("data:text/html,<script>")).toBeNull();
    expect(safeWebsite("vbscript:msgbox(1)")).toBeNull();
    expect(safeWebsite("mailto:a@b.com")).toBeNull();
    expect(safeWebsite("file:///etc/passwd")).toBeNull();
  });
});

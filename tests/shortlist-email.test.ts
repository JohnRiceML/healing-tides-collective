import { describe, it, expect } from "vitest";

import { composeShortlistEmail } from "@/lib/shortlist-email";

describe("composeShortlistEmail", () => {
  const base = {
    seekerName: "Jordan",
    seekerEmail: "jordan@example.com",
    picks: [
      { displayName: "Maya Rodriguez", slug: "maya-rodriguez", reason: "Somatic, trauma-informed." },
      { displayName: "Lin Chen", slug: "lin-chen", reason: null },
    ],
  };

  it("greets the seeker and includes each pick's profile URL + reason", () => {
    const { subject, text } = composeShortlistEmail(base);
    expect(subject).toMatch(/Healing Tides/);
    expect(text).toContain("Hi Jordan");
    expect(text).toContain("https://www.healingtides.co/practitioners/maya-rodriguez");
    expect(text).toContain("https://www.healingtides.co/practitioners/lin-chen");
    expect(text).toContain("Somatic, trauma-informed.");
    expect(text).toContain("Nora"); // signed off
  });

  it("builds a mailto with the seeker address + encoded subject/body", () => {
    const { mailto } = composeShortlistEmail(base);
    expect(mailto.startsWith("mailto:jordan%40example.com?")).toBe(true);
    expect(mailto).toContain("subject=");
    expect(mailto).toContain("body=");
    expect(mailto).toContain("maya-rodriguez"); // body carries the profile link
  });

  it("drops picks missing a name or slug, and falls back to 'there' with no name", () => {
    const { text } = composeShortlistEmail({
      seekerName: "  ",
      seekerEmail: "x@y.co",
      picks: [
        { displayName: "Real One", slug: "real-one", reason: null },
        { displayName: null, slug: "ghost", reason: "x" },
        { displayName: "No Slug", slug: null, reason: "x" },
      ],
    });
    expect(text).toContain("Hi there");
    expect(text).toContain("real-one");
    expect(text).not.toContain("ghost");
    expect(text).not.toContain("No Slug");
  });
});

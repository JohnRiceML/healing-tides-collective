import { describe, it, expect } from "vitest";

import { buildStructuredData, escapeJsonLd } from "@/lib/journal-seo";
import { MN_CITIES, mnCityBySlug, mnCityFromText } from "@/lib/mn-cities";

describe("buildStructuredData — journal JSON-LD", () => {
  const base = { title: "Finding care in Minnesota", excerpt: "A calm guide.", publishedAt: "2026-07-01" };

  it("emits a plain Article when there's no clinical review", () => {
    const out = JSON.parse(buildStructuredData({ ...base, author: { name: "Nora Hollenkamp" } })!);
    expect(out["@type"]).toBe("Article");
    expect(out.author.name).toBe("Nora Hollenkamp");
    expect(out.reviewedBy).toBeUndefined();
  });

  it("upgrades to Article + MedicalWebPage with reviewedBy + lastReviewed when reviewed", () => {
    const out = JSON.parse(
      buildStructuredData({
        ...base,
        author: { name: "Staff Writer" },
        reviewedBy: { name: "Nora Hollenkamp", role: "MSW, LICSW" },
        reviewedAt: "2026-07-15",
      })!,
    );
    expect(out["@type"]).toEqual(["Article", "MedicalWebPage"]);
    expect(out.reviewedBy).toEqual({ "@type": "Person", name: "Nora Hollenkamp", jobTitle: "MSW, LICSW" });
    expect(out.lastReviewed).toBe("2026-07-15");
    expect(out.dateModified).toBe("2026-07-15");
  });

  it("appends FAQPage when the body carries a faqSection", () => {
    const out = JSON.parse(
      buildStructuredData({
        ...base,
        body: [{ _type: "faqSection", faqs: [{ question: "Is therapy covered?", answer: "Often, yes." }] }],
      })!,
    )!;
    expect(Array.isArray(out)).toBe(true);
    expect(out[1]["@type"]).toBe("FAQPage");
    expect(out[1].mainEntity[0].name).toBe("Is therapy covered?");
  });

  it("a hand-authored structuredData override wins; invalid JSON yields null", () => {
    const custom = JSON.stringify({ "@context": "https://schema.org", "@type": "MedicalWebPage" });
    expect(JSON.parse(buildStructuredData({ ...base, structuredData: custom })!)["@type"]).toBe("MedicalWebPage");
    expect(buildStructuredData({ ...base, structuredData: "{nope" })).toBeNull();
  });

  it("escapes script-breaking sequences", () => {
    expect(escapeJsonLd('</script><!-- -->')).not.toContain("</script>");
    expect(escapeJsonLd("a-->b")).toBe("a--\\u003eb");
  });
});

describe("mn-cities — the canonical registry + normalizer", () => {
  it("has unique slugs and lowercase aliases", () => {
    const slugs = MN_CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of MN_CITIES) for (const a of c.aliases) expect(a).toBe(a.toLowerCase());
  });

  it("resolves slugs case-insensitively", () => {
    expect(mnCityBySlug("Saint-Paul")?.name).toBe("Saint Paul");
    expect(mnCityBySlug("nowhere")).toBeNull();
  });

  it("normalizes the messy region strings practitioners actually type", () => {
    expect(mnCityFromText("St. Paul, MN")?.slug).toBe("saint-paul");
    expect(mnCityFromText("Saint Paul, Minnesota, United States")?.slug).toBe("saint-paul");
    expect(mnCityFromText("Telehealth from Edina")?.slug).toBe("edina");
    expect(mnCityFromText("MPLS")?.slug).toBe("minneapolis");
    expect(mnCityFromText("Saint Cloud")?.slug).toBe("st-cloud");
  });

  it("longest alias wins — 'St. Louis Park' never collapses to Saint Paul", () => {
    expect(mnCityFromText("St. Louis Park, MN")?.slug).toBe("st-louis-park");
  });

  it("returns null (never guesses) for unlisted places or empty input", () => {
    expect(mnCityFromText("Fargo, ND")).toBeNull();
    expect(mnCityFromText("")).toBeNull();
    expect(mnCityFromText(null)).toBeNull();
  });
});

import { describe, it, expect } from "vitest";

import { buildStructuredData, escapeJsonLd } from "@/lib/journal-seo";
import { MN_CITIES, mnCitiesFromText, mnCityBySlug, mnCityFromText } from "@/lib/mn-cities";

describe("buildStructuredData — journal JSON-LD", () => {
  const base = { title: "Finding care in Minnesota", excerpt: "A calm guide.", publishedAt: "2026-07-01" };

  it("always carries publisher, inLanguage and dateModified", () => {
    const out = JSON.parse(buildStructuredData({ ...base, canonicalUrl: "https://x/y" })!);
    expect(out.publisher).toMatchObject({ "@type": "Organization", name: "Healing Tides Collective" });
    expect(out.inLanguage).toBe("en-US");
    expect(out.dateModified).toBe("2026-07-01"); // defaults to publish date
    expect(out.mainEntityOfPage).toBe("https://x/y");
  });

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

  it("mnCitiesFromText returns EVERY matching city (the sitemap's set semantics)", () => {
    const both = mnCitiesFromText("Minneapolis and St. Paul").map((c) => c.slug).sort();
    expect(both).toEqual(["minneapolis", "saint-paul"]);
    expect(mnCitiesFromText("Duluth").map((c) => c.slug)).toEqual(["duluth"]);
    expect(mnCitiesFromText("Fargo, ND")).toEqual([]);
    expect(mnCitiesFromText(null)).toEqual([]);
  });

  it("returns null (never guesses) for unlisted places or empty input", () => {
    expect(mnCityFromText("Fargo, ND")).toBeNull();
    expect(mnCityFromText("")).toBeNull();
    expect(mnCityFromText(null)).toBeNull();
  });
});

describe("robots.txt directives", () => {
  it("never blocks the public directory with a bare /practitioner prefix", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const disallow = (Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]).filter(Boolean) as string[];

    // robots.txt paths are PREFIX matches: a bare "/practitioner" also blocks "/practitioners",
    // "/practitioners/[slug]" — the entire public, indexable directory. This shipped once.
    expect(disallow).not.toContain("/practitioner");
    // The private dashboard is still blocked, precisely.
    expect(disallow).toEqual(expect.arrayContaining(["/practitioner$", "/practitioner/"]));
    // Nothing in the list may swallow /practitioners.
    for (const path of disallow) {
      expect("/practitioners".startsWith(path)).toBe(false);
      expect("/practitioners/nora-l-hollenkamp".startsWith(path)).toBe(false);
    }
  });

  it("points at the canonical sitemap", async () => {
    const { default: robots } = await import("@/app/robots");
    expect(robots().sitemap).toBe("https://www.healingtides.co/sitemap.xml");
  });
});

describe("retired posts — the stopgap block", () => {
  it("blocks every fabricated post at all three enforcement points", async () => {
    const { RETIRED_POST_SLUGS, isRetiredPost } = await import("@/lib/retired-posts");
    const fs = await import("node:fs/promises");

    // The six that carry fabricated memoir and fabricated sources. If one is dropped from the set
    // it goes live again, so pin them explicitly rather than trusting the set's own length.
    for (const slug of [
      "what-an-intake-call-should-feel-like",
      "insurance-vs-cashpay",
      "somatic-or-talk",
      "on-waiting-lists",
      "on-building-a-front-door-for-care",
      "awareness-was-never-the-problem",
    ]) {
      expect(isRetiredPost(slug)).toBe(true);
    }
    expect(RETIRED_POST_SLUGS.size).toBe(6);
    expect(isRetiredPost("somatic-series-part-1")).toBe(false); // Nora's own writing stays
    expect(isRetiredPost(null)).toBe(false);

    // A block is only real if every route that can serve or advertise a post consults it: the page
    // itself, the prerender list, the listing, and the sitemap.
    for (const file of ["app/journal/[slug]/page.tsx", "app/journal/page.tsx", "app/sitemap.ts"]) {
      expect(await fs.readFile(file, "utf8")).toContain("isRetiredPost");
    }
  });
});

describe("post queries — the publish gate", () => {
  it("EVERY post query filters on publishedAt", async () => {
    // There is no preview/draft mode here, so `publishedAt < now()` is the only thing keeping an
    // unpublished post off the public web. Two queries were missing it: a post could be pulled from
    // the listing and the sitemap and still serve at its own URL, and generateStaticParams would
    // prerender it to disk. Future-dated posts leaked the same way. If you add a post query, gate it.
    const queries = await import("@/sanity/lib/queries");
    const postQueries = Object.entries(queries).filter(
      ([, q]) => typeof q === "string" && q.includes('_type == "post"'),
    );
    expect(postQueries.length).toBeGreaterThanOrEqual(4);
    for (const [name, q] of postQueries) {
      expect(`${name} :: ${q}`).toContain("publishedAt < now()");
    }
  });
});

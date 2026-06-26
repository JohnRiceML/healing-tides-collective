import { describe, it, expect } from "vitest";

import { parseStructuredData } from "@/app/practitioner/_extract/parse-structured-data";
import { matchSpecialties } from "@/app/practitioner/_extract/taxonomy-match";
import { mapNormalized } from "@/app/practitioner/_extract/map-normalized";

// The real schema.org Person JSON-LD a live Psychology Today profile serves.
const PT_LD = {
  "@context": "http://schema.org/",
  "@type": "Person",
  name: "Nora L. Hollenkamp",
  honorificSuffix: "MSW, LICSW",
  jobTitle: "Clinical Social Work/Therapist",
  telephone: "(651) 321-5835",
  url: "https://www.psychologytoday.com/us/therapists/nora-l-hollenkamp-saint-paul-mn/1002622",
  image: "https://photos.psychologytoday.com/abc/2/320x400.jpeg",
  alumniOf: { "@type": "EducationalOrganization", name: "University of Minnesota- Twin Cities" },
  knowsAbout:
    "Anxiety, Body Positivity, Codependency, Coping Skills, Depression, Divorce, Life Transitions, Relationship Issues, Stress, Women's Issues",
  hasCertification: {
    "@type": "Certification",
    certificationIdentification: "25149",
    expires: "2028-03-01",
    issuedBy: { "@type": "Organization", name: "Minnesota" },
  },
  workLocation: [
    {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: { "@type": "Country", name: "US" },
        addressLocality: "Saint Paul",
        addressRegion: "Minnesota",
        postalCode: "55102",
      },
    },
  ],
  description:
    "Sometimes life quietly drifts off course, and we find ourselves feeling lost, stuck, or unsure how we got here.",
};

const ptHtml = (ld: unknown) =>
  `<!doctype html><html><head><title>Nora L. Hollenkamp | Psychology Today</title>` +
  `<script type="application/ld+json">${JSON.stringify(ld)}</script></head><body>profile</body></html>`;

const PT_HOST = "www.psychologytoday.com";

describe("parseStructuredData — Psychology Today Person JSON-LD", () => {
  const n = parseStructuredData(ptHtml(PT_LD), PT_HOST);

  it("extracts the core identity fields", () => {
    expect(n).not.toBeNull();
    expect(n!.name).toBe("Nora L. Hollenkamp");
    expect(n!.credentials).toBe("MSW, LICSW");
    expect(n!.title).toBe("Clinical Social Work/Therapist");
    expect(n!.bio).toMatch(/^Sometimes life quietly drifts/);
    expect(n!.source).toBe("json-ld");
  });

  it("splits a comma-string knowsAbout into specialties", () => {
    expect(n!.specialties).toHaveLength(10);
    expect(n!.specialties).toContain("Anxiety");
    expect(n!.specialties).toContain("Women's Issues");
  });

  it("extracts the license from hasCertification", () => {
    expect(n!.license).toEqual({ number: "25149", state: "Minnesota", expires: "2028-03-01" });
  });

  it("unwraps the nested PostalAddress (country/region are objects)", () => {
    expect(n!.location).toEqual({
      city: "Saint Paul",
      region: "Minnesota",
      postalCode: "55102",
      country: "US",
    });
  });

  it("pulls education, phone, image", () => {
    expect(n!.education).toEqual(["University of Minnesota- Twin Cities"]);
    expect(n!.telephone).toBe("(651) 321-5835");
    expect(n!.imageUrl).toContain("photos.psychologytoday.com");
  });

  it("does NOT treat the directory page's own url as the practitioner's website", () => {
    expect(n!.website).toBeUndefined();
  });
});

describe("parseStructuredData — robustness", () => {
  it("handles knowsAbout as an array", () => {
    const n = parseStructuredData(ptHtml({ ...PT_LD, knowsAbout: ["Anxiety", "Depression"] }), PT_HOST);
    expect(n!.specialties).toEqual(["Anxiety", "Depression"]);
  });

  it("picks the Person node out of an @graph wrapper", () => {
    const graph = { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", name: "Site" }, PT_LD] };
    const n = parseStructuredData(ptHtml(graph), PT_HOST);
    expect(n!.name).toBe("Nora L. Hollenkamp");
  });

  it("decodes HTML entities inside JSON-LD strings", () => {
    const ld = { "@context": "http://schema.org", "@type": "Person", name: "O&#039;Brien &amp; Associates", description: "We&#8217;re here." };
    const n = parseStructuredData(ptHtml(ld), "obrien.com");
    expect(n!.name).toBe("O'Brien & Associates");
    expect(n!.bio).toBe("We’re here.");
  });

  it("resolves a different-domain sameAs as the website", () => {
    const ld = { ...PT_LD, sameAs: ["https://norahealing.com"] };
    const n = parseStructuredData(ptHtml(ld), PT_HOST);
    expect(n!.website).toBe("https://norahealing.com");
  });

  it("falls back to OpenGraph when there's no JSON-LD", () => {
    const html =
      `<html><head><meta property="og:title" content="Dr. Jane Rivers, LMFT, Austin, TX | Some Directory">` +
      `<meta property="og:description" content="A warm, somatic approach to anxiety."></head><body></body></html>`;
    const n = parseStructuredData(html, "somedirectory.com");
    expect(n).not.toBeNull();
    expect(n!.source).toBe("opengraph");
    expect(n!.name).toBe("Dr. Jane Rivers");
    expect(n!.bio).toMatch(/somatic approach/);
  });

  it("returns null when there's nothing usable", () => {
    expect(parseStructuredData("<html><body><p>hello</p></body></html>", "x.com")).toBeNull();
    expect(parseStructuredData("", "x.com")).toBeNull();
  });

  it("survives a malformed JSON-LD block without throwing", () => {
    const html = `<html><head><script type="application/ld+json">{ not valid json,,, }</script>${
      `<script type="application/ld+json">${JSON.stringify(PT_LD)}</script>`
    }</head><body></body></html>`;
    const n = parseStructuredData(html, PT_HOST);
    expect(n!.name).toBe("Nora L. Hollenkamp");
  });
});

describe("matchSpecialties", () => {
  const topics = PT_LD.knowsAbout.split(", ");
  const { matched, unmatched } = matchSpecialties(topics);

  it("maps free-text topics onto the right categories", () => {
    expect(matched).toContain("emotional_wellbeing"); // Anxiety, Depression, Stress
    expect(matched).toContain("relationships_connection"); // Divorce, Relationship Issues
    expect(matched).toContain("grief_transitions"); // Life Transitions
    expect(matched).toContain("womens_wellness"); // Women's Issues
  });

  it("returns truly-unmappable topics as unmatched", () => {
    expect(unmatched).toContain("Codependency");
  });

  it("respects the category cap", () => {
    expect(matched.length).toBeLessThanOrEqual(8);
  });

  it("handles an empty list", () => {
    expect(matchSpecialties([])).toEqual({ matched: [], unmatched: [] });
  });
});

describe("mapNormalized — structured profile → our fields", () => {
  const n = parseStructuredData(ptHtml(PT_LD), PT_HOST)!;
  const c = mapNormalized(n, PT_HOST);

  it("fills the core columns", () => {
    expect(c.data.displayName).toBe("Nora L. Hollenkamp");
    expect(c.data.bio).toMatch(/^Sometimes life/);
    expect(c.data.region).toBe("Saint Paul, Minnesota");
  });

  it("maps credentials/title/education into the rich fields", () => {
    expect(c.data.fields.credentials).toEqual(["MSW", "LICSW"]);
    expect(c.data.fields.title).toBe("Clinical Social Work/Therapist");
    expect(c.data.fields.education).toBe("University of Minnesota- Twin Cities");
  });

  it("derives taxonomy specialties", () => {
    expect(c.data.specialties).toContain("emotional_wellbeing");
  });

  it("surfaces the license as a read-only extra (for the import status bar)", () => {
    const license = c.extras.find((e) => e.label === "License");
    expect(license?.value).toBe("#25149 · Minnesota");
  });

  it("also surfaces the STRUCTURED license, for persistence into the admin credential check", () => {
    expect(c.license).toEqual({ number: "25149", state: "Minnesota", expires: "2028-03-01" });
  });

  it("reports what it filled, for the status bar", () => {
    expect(c.contributed).toEqual(
      expect.arrayContaining(["Name", "Bio", "Location", "Credentials", "Professional title", "Education"]),
    );
  });
});

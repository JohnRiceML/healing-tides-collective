import { describe, it, expect } from "vitest";

import { buildProfileMetadata, profileJsonLd, leadFrom } from "@/app/practitioners/[slug]/seo";
import type { PractitionerProfile } from "@/lib/practitioners";
import { SITE_URL } from "@/lib/site";

/* eslint-disable @typescript-eslint/no-explicit-any */
function profile(overrides: Partial<PractitionerProfile> = {}): PractitionerProfile {
  return {
    slug: "river-stone-therapy",
    displayName: "River Stone Therapy",
    title: "Clinical Social Work/Therapist",
    bio: "A calm,   trauma-informed   practice in the Twin Cities.",
    values: null,
    region: "Twin Cities",
    photoUrl: "https://photos.example.com/x.jpg",
    specialties: ["emotional_wellbeing"],
    insuranceAccepted: [],
    fieldValues: { languages: ["English", "Spanish"] },
    ...overrides,
  } as unknown as PractitionerProfile;
}

describe("leadFrom", () => {
  it("collapses whitespace and ellipsizes past the cap", () => {
    expect(leadFrom("  a   b  ")).toBe("a b");
    const out = leadFrom("x".repeat(200), 50);
    expect(out).toHaveLength(50);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("buildProfileMetadata", () => {
  it("builds title, collapsed description, canonical, and OpenGraph", () => {
    const m = buildProfileMetadata(profile());
    expect(m.title).toBe("River Stone Therapy — Healing Tides Collective");
    expect(m.description).toBe("A calm, trauma-informed practice in the Twin Cities.");
    expect(m.alternates?.canonical).toBe(`${SITE_URL}/practitioners/river-stone-therapy`);
    const og = m.openGraph as any;
    expect(og?.url).toBe(`${SITE_URL}/practitioners/river-stone-therapy`);
    expect(og?.type).toBe("profile");
    expect(og?.images?.[0]?.url).toBe("https://photos.example.com/x.jpg");
  });

  it("falls back to a generic description with no bio/values", () => {
    const m = buildProfileMetadata(profile({ bio: null, values: null }));
    expect(m.description).toBe("River Stone Therapy — a practitioner in the Healing Tides Collective.");
  });

  it("omits OG images when there's no photo", () => {
    const m = buildProfileMetadata(profile({ photoUrl: null }));
    expect((m.openGraph as any)?.images).toBeUndefined();
  });
});

describe("profileJsonLd", () => {
  const ld = profileJsonLd(profile());

  it("emits a Person tied to the collective", () => {
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("River Stone Therapy");
    expect(ld.url).toBe(`${SITE_URL}/practitioners/river-stone-therapy`);
    expect(ld.memberOf).toEqual({ "@type": "Organization", name: "Healing Tides Collective", url: SITE_URL });
  });

  it("maps jobTitle, collapsed description, image, knowsAbout, areaServed, languages", () => {
    expect(ld.jobTitle).toBe("Clinical Social Work/Therapist");
    expect(ld.description).toBe("A calm, trauma-informed practice in the Twin Cities.");
    expect(ld.image).toBe("https://photos.example.com/x.jpg");
    expect(Array.isArray(ld.knowsAbout)).toBe(true);
    expect(ld.areaServed).toBe("Twin Cities");
    expect(ld.knowsLanguage).toEqual(["English", "Spanish"]);
  });

  it("NEVER emits credentials into structured data (unverified self-claims stay out)", () => {
    const withCreds = profileJsonLd(profile({ fieldValues: { credentials: ["LICSW"] } as any }));
    expect(withCreds.hasCredential).toBeUndefined();
    expect(JSON.stringify(withCreds)).not.toMatch(/credential/i);
  });

  it("drops empty optionals", () => {
    const bare = profileJsonLd(
      profile({ title: null, bio: null, photoUrl: null, region: null, specialties: [], fieldValues: {} }),
    );
    for (const k of ["jobTitle", "description", "image", "knowsAbout", "areaServed", "knowsLanguage"]) {
      expect(bare[k]).toBeUndefined();
    }
  });
});

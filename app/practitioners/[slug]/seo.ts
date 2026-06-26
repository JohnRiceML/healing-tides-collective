// Pure SEO builders for a practitioner profile page — extracted from page.tsx so they're
// testable without importing the page's client components. Type-only import of
// PractitionerProfile (erased at runtime), so this module pulls in NO db/server deps.

import type { Metadata } from "next";

import type { PractitionerProfile } from "@/lib/practitioners";
import { SITE_URL } from "@/lib/site";
import { specialtyLabel } from "@/app/_lib/taxonomy";

/** First sentence (or a trimmed lead) of free text, for meta descriptions. */
export function leadFrom(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** Coerce a fieldValues entry to a clean string[] (array or comma-string). */
export function arrify(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((s) => s.trim());
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

/** Title / description / canonical / OpenGraph for a found practitioner profile. */
export function buildProfileMetadata(p: PractitionerProfile): Metadata {
  const source = p.bio?.trim() || p.values?.trim() || "";
  const description = source ? leadFrom(source) : `${p.displayName} — a practitioner in the Healing Tides Collective.`;
  const url = `${SITE_URL}/practitioners/${p.slug}`;
  return {
    title: `${p.displayName} — Healing Tides Collective`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${p.displayName} — Healing Tides Collective`,
      description,
      url,
      type: "profile",
      ...(p.photoUrl ? { images: [{ url: p.photoUrl, alt: p.displayName }] } : {}),
    },
  };
}

/**
 * schema.org Person JSON-LD for a profile. Credentials are intentionally NOT emitted as
 * `hasCredential` — they're unverified self-claims and structured data would imply more
 * authority than we've verified.
 */
export function profileJsonLd(p: PractitionerProfile): Record<string, unknown> {
  const fv = (p.fieldValues ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.displayName,
    url: `${SITE_URL}/practitioners/${p.slug}`,
    // Entity-graph signal: ties each practitioner to the directory for search + AI understanding.
    memberOf: { "@type": "Organization", name: "Healing Tides Collective", url: SITE_URL },
  };
  if (p.title) data.jobTitle = p.title;
  if (p.bio) data.description = p.bio.replace(/\s+/g, " ").trim();
  if (p.photoUrl) data.image = p.photoUrl;
  if (p.specialties.length > 0) data.knowsAbout = p.specialties.map((id) => specialtyLabel(id));
  if (p.region) data.areaServed = p.region;
  const languages = arrify(fv.languages);
  if (languages.length > 0) data.knowsLanguage = languages;
  return data;
}

// Parse a page's schema.org structured data into a normalized, source-agnostic
// profile. Therapist directories (Psychology Today, TherapyDen) and most modern
// websites (Squarespace/Wix/WordPress) embed JSON-LD — clean, deterministic data
// we can map straight into a profile draft, far more reliably than stripping the
// page to text and asking an LLM to guess.
//
// Confirmed live: a Psychology Today profile returns 200 with a single
// `<script type="application/ld+json">` `Person` node carrying name, credentials
// (honorificSuffix), jobTitle, description (bio), knowsAbout (specialties, as a
// COMMA STRING), hasCertification (license # / state / expiry), alumniOf
// (education), workLocation→PostalAddress (city/region/zip), telephone, image.
//
// Zero dependencies by design: this runs in a Server Action on the Node runtime
// where bundle size, cold start, and a small attack surface matter, and the payload
// we care about is already valid JSON. Never throws — returns null when there's
// nothing usable, so the caller cleanly falls back to text + LLM.

/** A normalized profile assembled from a page's structured data. All fields optional. */
export type NormalizedProfile = {
  name?: string;
  /** Post-nominal credentials (schema honorificSuffix), e.g. "MSW, LICSW". */
  credentials?: string;
  /** schema jobTitle, e.g. "Clinical Social Work/Therapist". */
  title?: string;
  /** Long-form bio / about (schema description). */
  bio?: string;
  /** Specialties / focus areas. Always an array (a comma string is split). */
  specialties?: string[];
  /** Professional license (schema hasCertification / hasCredential). */
  license?: { number?: string; state?: string; expires?: string };
  /** Schools / degrees (schema alumniOf). */
  education?: string[];
  /** Primary practice location (workLocation/address/PostalAddress). */
  location?: { city?: string; region?: string; postalCode?: string; country?: string };
  telephone?: string;
  imageUrl?: string;
  /** The practitioner's OWN site (never the directory page itself — see resolveWebsite). */
  website?: string;
  /** Which path produced this — for debugging/telemetry. */
  source: "json-ld" | "opengraph";
};

// ── entity decode + clean ─────────────────────────────────────────────────────
// JSON-LD/OG string values are sometimes HTML-escaped by CMSs (WordPress/Yoast,
// Wix): "O&#039;Brien", "Mary &amp; Co", "it&#8217;s". JSON.parse does NOT decode
// these. Decode AFTER parse, on extracted string values only.

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  hellip: "…", mdash: "—", ndash: "–",
};

function safeCp(cp: number): string {
  try {
    return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : "";
  } catch {
    return "";
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeCp(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}

/** Decode entities + collapse internal whitespace + trim. The chokepoint every value passes. */
function clean(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const out = decodeEntities(v).replace(/\s+/g, " ").trim();
  return out.length ? out : undefined;
}

// ── node selection ────────────────────────────────────────────────────────────

const TYPE_PRIORITY = [
  "Person", "ProfilePage",
  "Physician", "MedicalBusiness", "LocalBusiness",
  "Organization", "EducationalOrganization",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function typeMatches(node: any, want: string): boolean {
  const t = node?.["@type"];
  if (!t) return false;
  return Array.isArray(t)
    ? t.some((x) => String(x).toLowerCase() === want.toLowerCase())
    : String(t).toLowerCase() === want.toLowerCase();
}

function pickBest(nodes: any[]): any | null {
  for (const want of TYPE_PRIORITY) {
    const hit = nodes.find((n) => typeMatches(n, want));
    if (hit) return hit;
  }
  return nodes.find((n) => n?.name && (n.description || n.jobTitle)) ?? null;
}

function asArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

/** Accept array | comma-string | array-of-{name} → clean, deduped string[]. */
function toStringList(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  let parts: unknown[];
  if (Array.isArray(v)) parts = v.map((x) => (typeof x === "string" ? x : (x as any)?.name));
  else if (typeof v === "string") parts = v.split(/\s*[,;|]\s*/);
  else if (typeof v === "object" && (v as any).name) parts = [(v as any).name];
  else return undefined;
  const out = parts.map((p) => clean(p)).filter((p): p is string => !!p);
  return out.length ? Array.from(new Set(out)) : undefined;
}

function mapLicense(c: any): NormalizedProfile["license"] {
  const cert = Array.isArray(c) ? c[0] : c;
  if (!cert || typeof cert !== "object") return undefined;
  const number = clean(cert.certificationIdentification ?? cert.identifier);
  const state = clean(cert.issuedBy?.name ?? cert.recognizedBy?.name ?? cert.areaServed);
  const expires = clean(cert.expires ?? cert.validUntil);
  const lic = prune({ number, state, expires });
  return Object.keys(lic).length ? lic : undefined;
}

function pickAddress(n: any): any {
  const wl = Array.isArray(n.workLocation) ? n.workLocation[0] : n.workLocation;
  return wl?.address ?? n.address ?? n.location?.address ?? n.worksFor?.address ?? null;
}

function mapAddress(a: any): NormalizedProfile["location"] {
  if (!a || typeof a !== "object") return undefined;
  const unwrap = (x: any) => (typeof x === "string" ? x : x?.name);
  const loc = prune({
    city: clean(a.addressLocality),
    region: clean(unwrap(a.addressRegion)),
    postalCode: clean(a.postalCode),
    country: clean(unwrap(a.addressCountry)),
  });
  return Object.keys(loc).length ? loc : undefined;
}

function mapImage(v: unknown): string | undefined {
  const first = Array.isArray(v) ? v[0] : v;
  if (typeof first === "string") return clean(first);
  if (first && typeof first === "object") return clean((first as any).url ?? (first as any).contentUrl);
  return undefined;
}

function mapEducation(v: any): string[] | undefined {
  if (Array.isArray(v)) return toStringList(v.map((x) => (typeof x === "string" ? x : x?.name)));
  if (v && typeof v === "object") return toStringList([v.name]);
  return toStringList(v);
}

/** Drop undefined / empty-array / empty-object keys. */
function prune<T extends Record<string, any>>(o: T): T {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (
      v == null ||
      (Array.isArray(v) && !v.length) ||
      (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length)
    ) {
      delete o[k];
    }
  }
  return o;
}

function mapNode(n: any): NormalizedProfile {
  return prune({
    source: "json-ld",
    name: clean(n.name) ?? clean(n.legalName),
    credentials: clean(n.honorificSuffix),
    title: clean(n.jobTitle) ?? clean(n.title),
    bio: clean(n.description) ?? clean(n.disambiguatingDescription),
    specialties: toStringList(n.knowsAbout ?? n.medicalSpecialty ?? n.keywords),
    license: mapLicense(n.hasCertification ?? n.hasCredential),
    education: mapEducation(n.alumniOf),
    location: mapAddress(pickAddress(n)),
    telephone: clean(n.telephone),
    imageUrl: mapImage(n.image ?? n.photo ?? n.logo),
  }) as NormalizedProfile;
}

function hasSignal(p: NormalizedProfile): boolean {
  return !!(p.name || p.bio || (p.specialties && p.specialties.length) || p.title);
}

// ── registrable-domain helper (so the directory page isn't saved as the user's site) ──
function registrable(host: string): string {
  const parts = host.toLowerCase().replace(/^www\./, "").split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
}

/** Set website only from a same-person link on a DIFFERENT domain than the page itself. */
function resolveWebsite(n: any, pageHost?: string): string | undefined {
  const candidates = [...asArray(n.sameAs), n.url].map((u) => clean(u)).filter(Boolean) as string[];
  for (const c of candidates) {
    try {
      const h = new URL(c).hostname;
      if (!pageHost || registrable(h) !== registrable(pageHost)) {
        if (!/facebook|instagram|twitter|linkedin|psychologytoday|youtube|tiktok/i.test(h)) return c;
      }
    } catch {
      /* not a URL */
    }
  }
  return undefined;
}

// ── OpenGraph / meta fallback (when there's no usable JSON-LD) ─────────────────
function collectMeta(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<meta\s+([^>]*?)\/?>/gi;
  for (let m; (m = re.exec(html)); ) {
    const attrs = m[1];
    const key = /(?:property|name)=["']([^"']+)["']/i.exec(attrs)?.[1]?.toLowerCase();
    const content = /content=["']([^"']*)["']/i.exec(attrs)?.[1];
    if (key && content != null && out[key] === undefined) out[key] = decodeEntities(content);
  }
  return out;
}

function parseMetaFallback(html: string): NormalizedProfile | null {
  const meta = collectMeta(html);
  const titleTag = clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]);
  const ogTitle = clean(meta["og:title"]);
  const lead = ogTitle ? clean(ogTitle.split(/[|–—,]/)[0]) : undefined;
  const first = clean(meta["profile:first_name"]);
  const last = clean(meta["profile:last_name"]);
  const name = first || last ? clean(`${first ?? ""} ${last ?? ""}`) : lead ?? titleTag;
  const bio = clean(meta["og:description"]) ?? clean(meta["description"]) ?? clean(meta["twitter:description"]);
  const imageUrl = clean(meta["og:image"] ?? meta["og:image:secure_url"]);
  const p = prune({ source: "opengraph", name, bio, imageUrl } as NormalizedProfile) as NormalizedProfile;
  return hasSignal(p) ? p : null;
}

/**
 * Parse all structured data from a page's raw HTML into a NormalizedProfile.
 * Returns null when nothing usable is present (caller falls back to text + LLM).
 */
export function parseStructuredData(html: string, pageHost?: string): NormalizedProfile | null {
  if (!html || typeof html !== "string") return null;

  // 1) Every JSON-LD block (tolerant of attribute order; non-greedy).
  const blocks: string[] = [];
  const re = /<script[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (let m; (m = re.exec(html)); ) blocks.push(m[1]);

  // 2) Parse each defensively; flatten arrays + @graph into a node list.
  const nodes: any[] = [];
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").trim());
    } catch {
      continue; // one malformed block must never sink the others
    }
    for (const top of asArray(parsed)) {
      if (top && typeof top === "object") {
        if (Array.isArray((top as any)["@graph"])) nodes.push(...(top as any)["@graph"]);
        else nodes.push(top);
      }
    }
  }

  // 3) Pick the best node; unwrap ProfilePage → mainEntity.
  let node = pickBest(nodes);
  if (node && typeMatches(node, "ProfilePage") && node.mainEntity) node = node.mainEntity;

  // 4) Map it, if usable.
  if (node && typeof node === "object") {
    const profile = mapNode(node);
    const website = resolveWebsite(node, pageHost);
    if (website) profile.website = website;
    if (hasSignal(profile)) return profile;
  }

  // 5) Fallback: OpenGraph / meta tags.
  return parseMetaFallback(html);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

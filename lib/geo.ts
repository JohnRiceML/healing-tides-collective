// lib/geo.ts — turn a practitioner's free-text region into a Google/Serper "location"
// string ("City, State, United States") so the visibility audit is geo-targeted to THEIR
// locale, not the server's. Deliberately CONSERVATIVE: returns undefined whenever it can't
// confidently parse, and the caller falls back to the existing city-in-query signal — so a
// fuzzy region is never made worse (a bad location string would risk false "you don't appear").
//
// US-only for now (Minnesota-first product). Revisit if the directory goes multi-country.

const US_STATES: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
  ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
  ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri",
  mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey",
  nm: "New Mexico", ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio",
  ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
  sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
  va: "Virginia", wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
  dc: "District of Columbia",
};
const STATE_BY_NAME = new Map(Object.values(US_STATES).map((n) => [n.toLowerCase(), n]));

/** Resolve a state token (abbreviation OR full name, any case) to its canonical full name. */
function canonicalState(raw: string): string | undefined {
  const s = raw.trim().toLowerCase();
  return US_STATES[s] ?? STATE_BY_NAME.get(s);
}

function titleCase(s: string): string {
  return s.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Best-effort: free-text region → a Google/Serper `location`. Returns:
 *  - "City, State, United States"  when a (city, state) pair is recognizable
 *  - "State, United States"        when only a state is given
 *  - undefined                     when not confident (a bare city, a nickname, empty)
 */
export function toSerperLocation(
  region: string | null | undefined,
  opts: { defaultState?: string } = {},
): string | undefined {
  if (!region) return undefined;
  // Drop a trailing country so "Saint Paul, MN, USA" normalizes like "Saint Paul, MN".
  const cleaned = region.replace(/,?\s*(u\.?s\.?a\.?|united states)\s*$/i, "").trim();
  if (!cleaned) return undefined;

  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const state = canonicalState(parts[parts.length - 1]);
    const city = titleCase(parts[parts.length - 2]);
    if (state && city) return `${city}, ${state}, United States`;
    return undefined; // last token isn't a state we recognize → don't guess
  }

  // A single token: a state alone gives state-level geo. A bare city we can only place if a
  // default state is supplied — Healing Tides is MINNESOTA-ONLY for now, so the caller passes
  // "Minnesota" and "Saint Paul" resolves to Saint Paul, MN. Drop the default when we go multi-state.
  const state = canonicalState(parts[0]);
  if (state) return `${state}, United States`;
  if (opts.defaultState) return `${titleCase(parts[0])}, ${opts.defaultState}, United States`;
  return undefined;
}

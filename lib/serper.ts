// Serper.dev Google SERP API client (https://google.serper.dev). Ported from the
// CreatorReach / community-scout wrapper. Returns organic results — or [] when the key
// is missing or the call fails, so callers degrade gracefully (no SERP ⇒ empty audit,
// never a thrown error on a user-facing path).
//
// Env: SERPER_API_KEY (set in .env.local + Vercel; rotate via https://serper.dev).

const SERPER_ENDPOINT = "https://google.serper.dev/search";
const SERPER_PLACES_ENDPOINT = "https://google.serper.dev/places";

export type SerpResult = {
  title: string;
  link: string;
  snippet: string;
  position: number;
};

// Full SERP page: organic results plus the three SERP-feature signals we
// previously discarded — "People also ask" questions, related-search queries,
// and whether Google rendered a knowledge-graph panel for the query.
export type SerpPage = {
  organic: SerpResult[];
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  knowledgeGraphPresent: boolean;
};

const EMPTY_PAGE: SerpPage = {
  organic: [],
  peopleAlsoAsk: [],
  relatedSearches: [],
  knowledgeGraphPresent: false,
};

export async function searchSerpPage(
  query: string,
  opts: { num?: number; gl?: string; location?: string } = {},
): Promise<SerpPage> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return { ...EMPTY_PAGE };

  try {
    const res = await fetch(SERPER_ENDPOINT, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      // `location` geo-targets the search to the practitioner's locale (e.g. "Saint Paul,
      // Minnesota, United States"). Omitted when unknown → Google falls back to the `gl` country.
      body: JSON.stringify({
        q: query,
        num: opts.num ?? 10,
        gl: opts.gl ?? "us",
        ...(opts.location ? { location: opts.location } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[serper] HTTP ${res.status} for "${query}"`);
      return { ...EMPTY_PAGE };
    }
    const data = (await res.json()) as {
      organic?: Array<Record<string, unknown>>;
      peopleAlsoAsk?: Array<Record<string, unknown>>;
      relatedSearches?: Array<Record<string, unknown>>;
      knowledgeGraph?: unknown;
    };

    const organic: SerpResult[] = (data.organic ?? []).map((item, i) => ({
      title: typeof item.title === "string" ? item.title : "",
      link: typeof item.link === "string" ? item.link : "",
      snippet: typeof item.snippet === "string" ? item.snippet : "",
      position: typeof item.position === "number" ? item.position : i + 1,
    }));

    const peopleAlsoAsk: string[] = (data.peopleAlsoAsk ?? [])
      .map((item) => (typeof item.question === "string" ? item.question : ""))
      .filter((q) => q.length > 0);

    const relatedSearches: string[] = (data.relatedSearches ?? [])
      .map((item) => (typeof item.query === "string" ? item.query : ""))
      .filter((q) => q.length > 0);

    return {
      organic,
      peopleAlsoAsk,
      relatedSearches,
      knowledgeGraphPresent: Boolean(data.knowledgeGraph),
    };
  } catch (err) {
    console.error(`[serper] error for "${query}"`, err);
    return { ...EMPTY_PAGE };
  }
}

export async function searchSerp(
  query: string,
  opts: { num?: number; gl?: string } = {},
): Promise<SerpResult[]> {
  const page = await searchSerpPage(query, opts);
  return page.organic;
}

// Google "places" / local-pack results from the Serper /places endpoint. Used by
// the map-pack visibility check. Same env-guard + never-throw contract as the SERP
// helpers: returns [] when the key is missing or the call fails.
export type PlaceResult = {
  title: string;
  address: string | null;
  rating: number | null;
  ratingCount: number | null;
  website: string | null;
  category: string | null;
  position: number;
};

export async function searchPlaces(
  query: string,
  opts: { gl?: string; location?: string } = {},
): Promise<PlaceResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(SERPER_PLACES_ENDPOINT, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      // `location` geo-targets the map pack to the practitioner's locale (their local 3-pack,
      // not the server's). Omitted when unknown → falls back to the `gl` country.
      body: JSON.stringify({
        q: query,
        gl: opts.gl ?? "us",
        ...(opts.location ? { location: opts.location } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[serper] places HTTP ${res.status} for "${query}"`);
      return [];
    }
    const data = (await res.json()) as {
      places?: Array<Record<string, unknown>>;
    };

    return (data.places ?? []).map((item, i) => ({
      title: typeof item.title === "string" ? item.title : "",
      address: typeof item.address === "string" ? item.address : null,
      rating: typeof item.rating === "number" ? item.rating : null,
      ratingCount: typeof item.ratingCount === "number" ? item.ratingCount : null,
      website: typeof item.website === "string" ? item.website : null,
      category: typeof item.category === "string" ? item.category : null,
      position: typeof item.position === "number" ? item.position : i + 1,
    }));
  } catch (err) {
    console.error(`[serper] places error for "${query}"`, err);
    return [];
  }
}

// Serper.dev Google SERP API client (https://google.serper.dev). Ported from the
// CreatorReach / community-scout wrapper. Returns organic results — or [] when the key
// is missing or the call fails, so callers degrade gracefully (no SERP ⇒ empty audit,
// never a thrown error on a user-facing path).
//
// Env: SERPER_API_KEY (set in .env.local + Vercel; rotate via https://serper.dev).

const SERPER_ENDPOINT = "https://google.serper.dev/search";

export type SerpResult = {
  title: string;
  link: string;
  snippet: string;
  position: number;
};

export async function searchSerp(
  query: string,
  opts: { num?: number; gl?: string } = {},
): Promise<SerpResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(SERPER_ENDPOINT, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: opts.num ?? 10, gl: opts.gl ?? "us" }),
    });
    if (!res.ok) {
      console.error(`[serper] HTTP ${res.status} for "${query}"`);
      return [];
    }
    const data = (await res.json()) as { organic?: Array<Record<string, unknown>> };
    return (data.organic ?? []).map((item, i) => ({
      title: typeof item.title === "string" ? item.title : "",
      link: typeof item.link === "string" ? item.link : "",
      snippet: typeof item.snippet === "string" ? item.snippet : "",
      position: typeof item.position === "number" ? item.position : i + 1,
    }));
  } catch (err) {
    console.error(`[serper] error for "${query}"`, err);
    return [];
  }
}

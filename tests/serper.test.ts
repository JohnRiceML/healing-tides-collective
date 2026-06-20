import { describe, it, expect, afterEach, vi } from "vitest";

import { searchSerpPage, searchPlaces } from "@/lib/serper";

const saved = process.env.SERPER_API_KEY;
afterEach(() => {
  process.env.SERPER_API_KEY = saved;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetch(body: unknown) {
  const spy = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", spy);
  return spy;
}

describe("serper geo-targeting — the `location` param reaches the request body", () => {
  it("includes location in the SERP body when provided, omits it when not", async () => {
    process.env.SERPER_API_KEY = "test";
    const spy = mockFetch({ organic: [] });

    await searchSerpPage("somatic therapy", { location: "Saint Paul, Minnesota, United States" });
    expect(JSON.parse(spy.mock.calls[0][1].body)).toMatchObject({
      q: "somatic therapy",
      gl: "us",
      location: "Saint Paul, Minnesota, United States",
    });

    await searchSerpPage("somatic therapy", {});
    expect(JSON.parse(spy.mock.calls[1][1].body).location).toBeUndefined();
  });

  it("includes location in the places body when provided", async () => {
    process.env.SERPER_API_KEY = "test";
    const spy = mockFetch({ places: [] });

    await searchPlaces("somatic therapy", { location: "Duluth, Minnesota, United States" });
    expect(JSON.parse(spy.mock.calls[0][1].body)).toMatchObject({
      q: "somatic therapy",
      location: "Duluth, Minnesota, United States",
    });
  });

  it("still returns empty (never throws) with no API key", async () => {
    delete process.env.SERPER_API_KEY;
    const spy = mockFetch({ organic: [] });
    const page = await searchSerpPage("x", { location: "Anywhere" });
    expect(page.organic).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });
});

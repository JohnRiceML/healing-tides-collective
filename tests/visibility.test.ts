import { describe, it, expect } from "vitest";

import { buildAuditQueries, evaluateQuery, hostOf, type VisibilityIdentity } from "@/lib/visibility";
import type { SerpResult } from "@/lib/serper";
import { SPECIALTY_OPTIONS } from "@/app/_lib/taxonomy";

const result = (over: Partial<SerpResult>): SerpResult => ({
  title: "Some Clinic",
  link: "https://example.com",
  snippet: "",
  position: 1,
  ...over,
});

describe("hostOf", () => {
  it("lowercases and strips www", () => {
    expect(hostOf("https://www.Nora-Therapy.com/about")).toBe("nora-therapy.com");
  });
  it("returns null for garbage", () => {
    expect(hostOf("not a url")).toBeNull();
  });
});

describe("buildAuditQueries", () => {
  it("returns [] without a region (a local query needs a place)", () => {
    expect(buildAuditQueries(["grief_loss"], null)).toEqual([]);
    expect(buildAuditQueries(["grief_loss"], "   ")).toEqual([]);
  });

  it("appends the region to each specialty label and caps at the limit", () => {
    const id = SPECIALTY_OPTIONS[0].id;
    const qs = buildAuditQueries([id, id, id, id], "Saint Paul, MN", 2);
    expect(qs).toHaveLength(2);
    for (const q of qs) expect(q.endsWith("Saint Paul, MN")).toBe(true);
  });

  it("falls back to 'therapist {place}' when no specialties are set", () => {
    expect(buildAuditQueries([], "Duluth, MN")).toEqual(["therapist Duluth, MN"]);
  });
});

describe("evaluateQuery", () => {
  const id: VisibilityIdentity = {
    name: "Nora Hollenkamp",
    domain: "nora-therapy.com",
    profilePath: "/practitioners/nora-hollenkamp",
  };

  it("finds the practitioner by their own website domain + records position", () => {
    const r = evaluateQuery("somatic therapy saint paul", [
      result({ title: "Psychology Today", link: "https://psychologytoday.com/x", position: 1 }),
      result({ title: "Nora — Therapy", link: "https://www.nora-therapy.com/", position: 2 }),
    ], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("website");
    expect(r.position).toBe(2);
    expect(r.competitors).toContain("Psychology Today");
  });

  it("finds them via their Healing Tides profile link", () => {
    const r = evaluateQuery("q", [
      result({ link: "https://www.healingtides.co/practitioners/nora-hollenkamp", position: 3 }),
    ], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("profile");
    expect(r.position).toBe(3);
  });

  it("finds them by a name match in the title", () => {
    const r = evaluateQuery("q", [result({ title: "Meet Nora Hollenkamp, LICSW", link: "https://elsewhere.com" })], id);
    expect(r.found).toBe(true);
    expect(r.via).toBe("name");
  });

  it("reports not-found with up to 3 competitors when they're absent", () => {
    const r = evaluateQuery("q", [
      result({ title: "A", link: "https://a.com", position: 1 }),
      result({ title: "B", link: "https://b.com", position: 2 }),
      result({ title: "C", link: "https://c.com", position: 3 }),
      result({ title: "D", link: "https://d.com", position: 4 }),
    ], id);
    expect(r.found).toBe(false);
    expect(r.position).toBeNull();
    expect(r.competitors).toEqual(["A", "B", "C"]);
  });

  it("an empty profilePath (unpublished) never matches by profile", () => {
    const r = evaluateQuery("q", [result({ link: "https://www.healingtides.co/practitioners/" })], {
      ...id,
      profilePath: "",
    });
    expect(r.found).toBe(false);
  });
});

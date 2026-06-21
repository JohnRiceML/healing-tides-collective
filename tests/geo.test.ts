import { describe, it, expect } from "vitest";

import { toSerperLocation } from "@/lib/geo";

describe("toSerperLocation — free-text region → Google/Serper location", () => {
  it("formats a city + full state", () => {
    expect(toSerperLocation("Saint Paul, Minnesota")).toBe("Saint Paul, Minnesota, United States");
  });

  it("expands a state abbreviation and title-cases the city", () => {
    expect(toSerperLocation("minneapolis, mn")).toBe("Minneapolis, Minnesota, United States");
  });

  it("strips a trailing country", () => {
    expect(toSerperLocation("Duluth, MN, USA")).toBe("Duluth, Minnesota, United States");
    expect(toSerperLocation("Rochester, Minnesota, United States")).toBe(
      "Rochester, Minnesota, United States",
    );
  });

  it("returns state-level geo when only a state is given", () => {
    expect(toSerperLocation("MN")).toBe("Minnesota, United States");
    expect(toSerperLocation("Minnesota")).toBe("Minnesota, United States");
  });

  it("is CONSERVATIVE — returns undefined when it can't confidently place the region", () => {
    expect(toSerperLocation("Saint Paul")).toBeUndefined(); // bare city, no state, no default
    expect(toSerperLocation("Twin Cities")).toBeUndefined(); // nickname
    expect(toSerperLocation("Saint Paul, Ramsey County")).toBeUndefined(); // 2nd token not a state
    expect(toSerperLocation("")).toBeUndefined();
    expect(toSerperLocation(null)).toBeUndefined();
    expect(toSerperLocation(undefined)).toBeUndefined();
  });

  it("places a bare city under the default state (MN-only product)", () => {
    expect(toSerperLocation("Saint Paul", { defaultState: "Minnesota" })).toBe("Saint Paul, Minnesota, United States");
    expect(toSerperLocation("minneapolis", { defaultState: "Minnesota" })).toBe("Minneapolis, Minnesota, United States");
    // still conservative — a 2-part region whose 2nd token isn't a state is NOT force-defaulted
    expect(toSerperLocation("Saint Paul, Ramsey County", { defaultState: "Minnesota" })).toBeUndefined();
  });
});

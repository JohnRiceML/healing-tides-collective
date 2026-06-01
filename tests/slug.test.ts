import { describe, it, expect } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Aspen Rivera")).toBe("aspen-rivera");
  });

  it("strips accents", () => {
    expect(slugify("José García")).toBe("jose-garcia");
  });

  it("collapses non-alphanumeric runs and trims edge hyphens", () => {
    expect(slugify("  Dr. Sky!!  Wood  ")).toBe("dr-sky-wood");
    expect(slugify("--Hello--World--")).toBe("hello-world");
    expect(slugify("O'Brien & Co.")).toBe("o-brien-co");
  });

  it("caps length at 60 characters", () => {
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });

  it("falls back to 'practitioner' when nothing usable remains", () => {
    expect(slugify("")).toBe("practitioner");
    expect(slugify("   ")).toBe("practitioner");
    expect(slugify("!!!")).toBe("practitioner");
    expect(slugify("日本語")).toBe("practitioner"); // non-latin → stripped
  });
});

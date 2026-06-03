import { describe, it, expect } from "vitest";

import { pickCover } from "@/app/practitioners/_components/CoverArt";

describe("CoverArt pickCover", () => {
  it("returns a valid palette + wave for ANY seed (guards the signed-shift negative-index crash)", () => {
    for (let i = 0; i < 3000; i++) {
      const { palette, wave } = pickCover(`practitioner-slug-${i}-abc`);
      expect(palette, `palette for seed ${i}`).toBeDefined();
      expect(palette).toHaveLength(3);
      expect(wave, `wave for seed ${i}`).toBeDefined();
      expect(Array.isArray(wave.light)).toBe(true);
      expect(typeof wave.deep).toBe("string");
    }
  });

  it("handles empty / odd seeds without throwing", () => {
    for (const s of ["", " ", "a", "💧", "x".repeat(500)]) {
      expect(() => pickCover(s)).not.toThrow();
      expect(pickCover(s).palette).toHaveLength(3);
    }
  });

  it("is deterministic per seed", () => {
    expect(pickCover("nora-l-hollenkamp").gid).toBe(pickCover("nora-l-hollenkamp").gid);
    expect(pickCover("nora-l-hollenkamp").palette).toEqual(pickCover("nora-l-hollenkamp").palette);
  });
});

import { describe, it, expect } from "vitest";

import {
  boardsForCredentials,
  readVerification,
  readImportedLicense,
  IMPORTED_LICENSE_KEY,
  MN_BOARDS,
} from "@/app/_lib/credentials";

describe("boardsForCredentials", () => {
  it("matches a single stated credential to its MN board + lookup URL", () => {
    const m = boardsForCredentials(["LICSW"]);
    expect(m).toHaveLength(1);
    expect(m[0].board).toBe("MN Board of Social Work");
    expect(m[0].lookupUrl).toContain("soc.hlb.state.mn.us");
    expect(m[0].codes).toEqual(["LICSW"]);
  });

  it("accepts a comma string and groups multiple codes by board", () => {
    const m = boardsForCredentials("LICSW, LGSW, LMFT");
    const social = m.find((b) => b.board === "MN Board of Social Work");
    const mft = m.find((b) => b.board.includes("Marriage"));
    expect(social?.codes.sort()).toEqual(["LGSW", "LICSW"]);
    expect(mft?.codes).toEqual(["LMFT"]);
  });

  it("matches whole tokens only — never a substring of a word", () => {
    // "help" must not match LP; "specialist" must not match LSW/etc.
    expect(boardsForCredentials("I can help, a specialist")).toEqual([]);
    // but a real LP token does match
    expect(boardsForCredentials(["LP"])[0].board).toBe("MN Board of Psychology");
  });

  it("ignores unknown / non-licensed credentials (reiki, yoga, etc.)", () => {
    expect(boardsForCredentials(["Reiki Master", "RYT-200", "LMT"])).toEqual([]);
  });

  it("is safe on null / empty", () => {
    expect(boardsForCredentials(null)).toEqual([]);
    expect(boardsForCredentials("")).toEqual([]);
    expect(boardsForCredentials([])).toEqual([]);
  });

  it("every board has a public https lookup URL", () => {
    for (const b of MN_BOARDS) expect(b.lookupUrl).toMatch(/^https:\/\//);
  });
});

describe("readVerification", () => {
  it("reads a valid attempt", () => {
    const a = readVerification({
      __credentialVerification: { status: "verified", by: "nora@x.com", at: "2026-06-25T00:00:00Z", notes: "Active on board.", credentials: ["LICSW"] },
    });
    expect(a?.status).toBe("verified");
    expect(a?.by).toBe("nora@x.com");
    expect(a?.credentials).toEqual(["LICSW"]);
  });

  it("is null for missing / wrong-shaped / bad-status", () => {
    expect(readVerification({})).toBeNull();
    expect(readVerification(null)).toBeNull();
    expect(readVerification({ __credentialVerification: { status: "bogus" } })).toBeNull();
  });
});

describe("readImportedLicense", () => {
  it("reads a license written under the reserved key", () => {
    expect(
      readImportedLicense({
        [IMPORTED_LICENSE_KEY]: {
          number: "25149",
          state: "Minnesota",
          expires: "2028-03-01",
          source: "www.psychologytoday.com",
          at: "2026-06-26T00:00:00Z",
        },
      }),
    ).toEqual({
      number: "25149",
      state: "Minnesota",
      expires: "2028-03-01",
      source: "www.psychologytoday.com",
      at: "2026-06-26T00:00:00Z",
    });
  });

  it("is null with no number or state to act on", () => {
    expect(readImportedLicense({})).toBeNull();
    expect(readImportedLicense(null)).toBeNull();
    expect(readImportedLicense({ [IMPORTED_LICENSE_KEY]: {} })).toBeNull();
    expect(readImportedLicense({ [IMPORTED_LICENSE_KEY]: { expires: "2028-03-01" } })).toBeNull();
  });

  it("keeps just a number (state optional) and trims blanks", () => {
    expect(readImportedLicense({ [IMPORTED_LICENSE_KEY]: { number: " 25149 ", state: "  " } })).toEqual({
      number: "25149",
    });
  });
});

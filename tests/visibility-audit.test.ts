import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// runVisibilityAudit is the orchestration: auth → Serper coverage → KG + map-pack sampling →
// build the PresenceScan → re-read fieldValues → persist under the reserved __presenceScan key.
// We mock the edges (auth, db, Serper) and keep the pure logic (buildCoverage / evaluateMapPack /
// buildPresenceScan / applyPresenceScan / presenceDelta) REAL, so the real wiring is exercised.

const { getPractitioner } = vi.hoisted(() => ({ getPractitioner: vi.fn() }));
const { findUnique, update } = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn() }));
const { searchSerpPage, searchPlaces } = vi.hoisted(() => ({
  searchSerpPage: vi.fn(),
  searchPlaces: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getPractitioner }));
vi.mock("@/lib/db", () => ({ db: { practitioner: { findUnique, update } } }));
vi.mock("@/lib/serper", () => ({ searchSerpPage, searchPlaces }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// Keep all of visibility real EXCEPT the taxonomy-driven query builder, which we pin to a
// fixed two-term list so the test doesn't depend on the live category taxonomy.
vi.mock("@/lib/visibility", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/visibility")>();
  return {
    ...actual,
    buildCoverageQueries: vi.fn(() => [
      { id: "t1", label: "Trauma Healing Saint Paul", query: "trauma healing saint paul" },
      { id: "t2", label: "Anxiety Therapy Saint Paul", query: "anxiety therapy saint paul" },
    ]),
  };
});

import { runVisibilityAudit } from "@/app/practitioner/visibility-actions";

const emptyPage = {
  organic: [],
  peopleAlsoAsk: [],
  relatedSearches: [],
  knowledgeGraphPresent: false,
};

// A practitioner whose own site (x.test) shows up — and is recognised — for the "trauma" term.
function practitioner(fieldValues: Record<string, unknown>) {
  return {
    id: "p1",
    displayName: "Aspen Rivers",
    website: "https://x.test",
    slug: "aspen-rivers",
    specialties: ["trauma"],
    region: "Saint Paul",
    fieldValues,
  };
}

const priorScan = {
  checkedAt: "2026-01-01T00:00:00.000Z",
  coverage: { appeared: 0, total: 2 },
  foundTerms: [], // nothing appeared last time → the trauma term is "newly appeared" now
  knowledgeGraphPresent: false,
};

beforeEach(() => {
  process.env.SERPER_API_KEY = "test-key";
  getPractitioner.mockReset();
  findUnique.mockReset();
  update.mockReset();
  searchSerpPage.mockReset();
  searchPlaces.mockReset();
  update.mockResolvedValue({});
  // Coverage: the practitioner's own domain appears for the trauma search (→ found), with a
  // knowledge panel; the anxiety search shows nothing.
  searchSerpPage.mockImplementation(async (q: string) =>
    q.includes("trauma")
      ? {
          organic: [{ title: "Aspen Rivers, LICSW", link: "https://x.test/about", snippet: "", position: 1 }],
          peopleAlsoAsk: [],
          relatedSearches: [],
          knowledgeGraphPresent: true,
        }
      : { ...emptyPage },
  );
  // Map pack: the practitioner is in the trauma pack with real reviews.
  searchPlaces.mockImplementation(async (q: string) =>
    q.includes("trauma")
      ? [
          {
            title: "Aspen Rivers Therapy",
            address: "St Paul",
            rating: 4.9,
            ratingCount: 12,
            website: "https://x.test",
            category: "Therapist",
            position: 1,
          },
        ]
      : [],
  );
});

afterEach(() => {
  delete process.env.SERPER_API_KEY;
});

describe("runVisibilityAudit — auth & config gates (never scans or writes)", () => {
  it("returns unauthenticated when nobody is signed in", async () => {
    getPractitioner.mockResolvedValue(null);
    const r = await runVisibilityAudit();
    expect(r).toEqual({ ok: false, reason: "unauthenticated" });
    expect(searchSerpPage).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns unconfigured (and never writes) when the Serper key is absent", async () => {
    delete process.env.SERPER_API_KEY;
    getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: practitioner({}) });
    const r = await runVisibilityAudit();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("unconfigured");
    expect(update).not.toHaveBeenCalled();
  });
});

describe("runVisibilityAudit — signal aggregation into the cached scan", () => {
  it("captures KG, map-pack membership, reviews, and the appeared terms", async () => {
    getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: practitioner({}) });
    findUnique.mockResolvedValue({ fieldValues: {} });
    const r = await runVisibilityAudit();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.scan.knowledgeGraphPresent).toBe(true);
    expect(r.scan.inAnyMapPack).toBe(true);
    expect(r.scan.reviewsKnown).toBe(true);
    expect(r.scan.foundTerms).toEqual(["Trauma Healing Saint Paul"]);
    expect(r.scan.coverage).toEqual({ appeared: 1, total: 2 });
  });

  it("reports the gain-framed delta vs the previous cached scan", async () => {
    const fv = { __presenceScan: priorScan };
    getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: practitioner(fv) });
    findUnique.mockResolvedValue({ fieldValues: fv });
    const r = await runVisibilityAudit();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.delta.firstCheck).toBe(false);
    expect(r.delta.newlyAppeared).toEqual(["Trauma Healing Saint Paul"]);
  });
});

describe("runVisibilityAudit — persistence preserves reserved sibling keys", () => {
  it("writes __presenceScan to the session id WITHOUT clobbering __hold / __verified", async () => {
    const fv = {
      __hold: { message: "held by admin" },
      __holdHistory: [{ action: "hold", by: "admin@x.test", at: "2026-06-01T00:00:00Z" }],
      __verified: ["licensed_professional"],
    };
    getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: practitioner(fv) });
    findUnique.mockResolvedValue({ fieldValues: fv });

    await runVisibilityAudit();

    expect(update).toHaveBeenCalledTimes(1);
    const call = update.mock.calls[0][0];
    expect(call.where).toEqual({ id: "p1" });
    const written = call.data.fieldValues as Record<string, any>;
    expect(written.__hold).toEqual({ message: "held by admin" });
    expect(written.__holdHistory).toEqual([
      { action: "hold", by: "admin@x.test", at: "2026-06-01T00:00:00Z" },
    ]);
    expect(written.__verified).toEqual(["licensed_professional"]);
    expect(written.__presenceScan.foundTerms).toEqual(["Trauma Healing Saint Paul"]);
    // The rolling history gains a snapshot too (the "growing over time" read).
    expect(Array.isArray(written.__presenceScanHistory)).toBe(true);
    expect(written.__presenceScanHistory.at(-1).foundTerms).toEqual(["Trauma Healing Saint Paul"]);
  });

  it("merges onto the FRESH re-read, not the stale snapshot (clobber protection)", async () => {
    // getPractitioner saw no hold; an admin places a hold DURING the seconds-long scan.
    // The fresh re-read carries it, so the persisted write must keep it.
    getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: practitioner({}) });
    findUnique.mockResolvedValue({ fieldValues: { __hold: { message: "held mid-scan" } } });

    await runVisibilityAudit();

    const written = update.mock.calls[0][0].data.fieldValues as Record<string, any>;
    expect(written.__hold).toEqual({ message: "held mid-scan" });
    expect(written.__presenceScan).toBeTruthy();
  });
});

describe("runVisibilityAudit — caching is best-effort", () => {
  it("still returns the live scan, with a neutral delta, when the DB write fails", async () => {
    getPractitioner.mockResolvedValue({
      user: { id: "u1" },
      practitioner: practitioner({ __presenceScan: priorScan }),
    });
    findUnique.mockResolvedValue({ fieldValues: { __presenceScan: priorScan } });
    update.mockRejectedValue(new Error("db down"));

    const r = await runVisibilityAudit();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.scan.foundTerms).toEqual(["Trauma Healing Saint Paul"]);
    // No reliable baseline after a failed persist → neutral, no "since last time" claim.
    expect(r.delta).toEqual({ firstCheck: false, newlyAppeared: [] });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client BEFORE importing the module under test.
const { findMany, findFirst } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db: { practitioner: { findMany, findFirst } } }));

import {
  buildPractitionerWhere,
  getPublishedPractitioners,
  getPractitionerBySlug,
  getPublishedSlugs,
} from "@/lib/practitioners";

const PII_KEYS = [
  "userId",
  "id",
  "email",
  "clerkUserId",
  "stripeCustomerId",
  "subscriptionStatus",
  "completeness",
  "tier",
  "accountType",
];

const cardRow = (over = {}) => ({
  slug: "aspen",
  displayName: "Aspen",
  bio: null,
  region: null,
  modality: null,
  title: null, // derived from fieldValues.title by the read layer
  specialties: [],
  photoUrl: null,
  coverDesign: null, // derived from fieldValues.cover_design
  coverColor: null, // derived from fieldValues.cover_color
  featured: false,
  acceptingNew: false, // derived from fieldValues.availability_state
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  verificationBadges: [], // derived from fieldValues by the read layer
  ...over,
});

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
});

describe("getPublishedPractitioners", () => {
  it("only ever queries PUBLISHED profiles with a slug + name", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners();
    const where = findMany.mock.calls[0][0].where;
    expect(where.visibility).toBe("PUBLISHED");
    expect(where.slug).toEqual({ not: null });
    expect(where.displayName).toEqual({ not: null });
  });

  it("never selects PII / internal fields (allow-list only)", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners();
    const select = findMany.mock.calls[0][0].select;
    for (const k of PII_KEYS) expect(select).not.toHaveProperty(k);
    expect(select).toMatchObject({ slug: true, displayName: true });
  });

  it("builds specialty / modality / free-text filters", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners({ specialty: "grief_loss", modality: "HYBRID", q: "calm" });
    const where = findMany.mock.calls[0][0].where;
    expect(where.specialties).toEqual({ has: "grief_loss" });
    expect(where.modality).toBe("HYBRID");
    expect(Array.isArray(where.OR)).toBe(true);
    expect(
      where.OR.some(
        (c: Record<string, { contains?: string }>) => c.displayName?.contains === "calm",
      ),
    ).toBe(true);
  });

  it("omits filters that aren't provided", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners();
    const where = findMany.mock.calls[0][0].where;
    expect(where).not.toHaveProperty("specialties");
    expect(where).not.toHaveProperty("modality");
    expect(where).not.toHaveProperty("OR");
  });

  it("pins featured first, then completeness, then recency", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners();
    expect(findMany.mock.calls[0][0].orderBy).toEqual([
      { featured: "desc" },
      { completeness: "desc" },
      { updatedAt: "desc" },
    ]);
  });

  it("maps rows to cards", async () => {
    findMany.mockResolvedValue([cardRow({ slug: "x", displayName: "X" })]);
    const cards = await getPublishedPractitioners();
    expect(cards).toEqual([cardRow({ slug: "x", displayName: "X" })]);
  });

  it("derives the role (title) + accepting status + cover design/color from fieldValues", async () => {
    findMany.mockResolvedValue([
      cardRow({ fieldValues: { title: "  Acupuncturist ", availability_state: "accepting", cover_design: "mountains", cover_color: "sky" } }),
    ]);
    const [card] = await getPublishedPractitioners();
    expect(card.title).toBe("Acupuncturist");
    expect(card.acceptingNew).toBe(true);
    expect(card.coverDesign).toBe("mountains");
    expect(card.coverColor).toBe("sky");
    expect(card).not.toHaveProperty("fieldValues"); // raw blob never leaves the read layer
  });

  it("treats non-accepting availability as not-accepting", async () => {
    findMany.mockResolvedValue([cardRow({ fieldValues: { availability_state: "waitlist" } })]);
    const [card] = await getPublishedPractitioners();
    expect(card.acceptingNew).toBe(false);
    expect(card.title).toBeNull();
  });

  it("orders by the requested sort key", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners({}, "newest");
    expect(findMany.mock.calls[0][0].orderBy).toEqual([{ createdAt: "desc" }]);
    findMany.mockClear();
    await getPublishedPractitioners({}, "name");
    expect(findMany.mock.calls[0][0].orderBy).toEqual([{ displayName: "asc" }]);
  });
});

describe("buildPractitionerWhere", () => {
  it("always pins the published + slug + name base", () => {
    const where = buildPractitionerWhere();
    expect(where.visibility).toBe("PUBLISHED");
    expect(where.slug).toEqual({ not: null });
    expect(where.displayName).toEqual({ not: null });
  });

  it("omits every optional filter when nothing is provided", () => {
    const where = buildPractitionerWhere();
    expect(where).not.toHaveProperty("specialties");
    expect(where).not.toHaveProperty("modality");
    expect(where).not.toHaveProperty("gender");
    expect(where).not.toHaveProperty("fieldValues");
    expect(where).not.toHaveProperty("OR");
  });

  it("matches gender case-insensitively via contains", () => {
    const where = buildPractitionerWhere({ gender: "non-binary" });
    expect(where.gender).toEqual({ contains: "non-binary", mode: "insensitive" });
  });

  it("matches an exact region when provided (from the Location dropdown)", () => {
    const where = buildPractitionerWhere({ region: "Saint Paul, Minnesota" });
    expect(where.region).toEqual({ equals: "Saint Paul, Minnesota" });
  });

  it("omits the region filter when not provided", () => {
    expect(buildPractitionerWhere({})).not.toHaveProperty("region");
  });

  it("filters accepting-new clients via the fieldValues JSON path", () => {
    const where = buildPractitionerWhere({ acceptingNew: true });
    expect(where.fieldValues).toEqual({ path: ["availability_state"], equals: "accepting" });
  });

  it("does not add the availability filter when acceptingNew is false", () => {
    expect(buildPractitionerWhere({ acceptingNew: false })).not.toHaveProperty("fieldValues");
  });

  it("filters age groups via the fieldValues JSON array (array_contains)", () => {
    const where = buildPractitionerWhere({ ageGroups: "adults" });
    expect(where.fieldValues).toEqual({ path: ["age_groups"], array_contains: "adults" });
  });

  it("ANDs the two JSON filters when both are active (no fieldValues collision)", () => {
    const where = buildPractitionerWhere({ acceptingNew: true, ageGroups: "adolescents" });
    // They must NOT collapse onto one fieldValues key — that would drop one filter.
    expect(where).not.toHaveProperty("fieldValues");
    expect(where.AND).toEqual([
      { fieldValues: { path: ["availability_state"], equals: "accepting" } },
      { fieldValues: { path: ["age_groups"], array_contains: "adolescents" } },
    ]);
  });

  it("composes all filters together", () => {
    const where = buildPractitionerWhere({
      specialty: "grief_loss",
      modality: "VIRTUAL",
      q: "calm",
      gender: "female",
      acceptingNew: true,
    });
    expect(where.specialties).toEqual({ has: "grief_loss" });
    expect(where.modality).toBe("VIRTUAL");
    expect(where.gender).toEqual({ contains: "female", mode: "insensitive" });
    expect(where.fieldValues).toEqual({ path: ["availability_state"], equals: "accepting" });
    expect(Array.isArray(where.OR)).toBe(true);
  });

  it("passes the same where into the live findMany query", async () => {
    findMany.mockResolvedValue([]);
    await getPublishedPractitioners({ gender: "male", acceptingNew: true });
    const where = findMany.mock.calls[0][0].where;
    expect(where.gender).toEqual({ contains: "male", mode: "insensitive" });
    expect(where.fieldValues).toEqual({ path: ["availability_state"], equals: "accepting" });
  });
});

describe("getPractitionerBySlug", () => {
  it("fetches a PUBLISHED profile by slug", async () => {
    findFirst.mockResolvedValue({
      ...cardRow(),
      website: null,
      values: null,
      gender: null,
      insuranceAccepted: [],
      viewCount: 0,
    });
    const p = await getPractitionerBySlug("aspen");
    expect(findFirst.mock.calls[0][0].where).toEqual({ slug: "aspen", visibility: "PUBLISHED" });
    expect(p?.slug).toBe("aspen");
  });

  it("never selects PII / internal fields", async () => {
    findFirst.mockResolvedValue(null);
    await getPractitionerBySlug("aspen");
    const select = findFirst.mock.calls[0][0].select;
    for (const k of PII_KEYS) expect(select).not.toHaveProperty(k);
  });

  it("returns null when the slug isn't found / not published", async () => {
    findFirst.mockResolvedValue(null);
    expect(await getPractitionerBySlug("missing")).toBeNull();
  });

  it("returns null defensively if the row lacks a slug or name", async () => {
    findFirst.mockResolvedValue({ ...cardRow({ slug: null, displayName: null }) });
    expect(await getPractitionerBySlug("x")).toBeNull();
  });
});

describe("getPublishedSlugs", () => {
  it("requires PUBLISHED + slug + displayName (no half-baked sitemap URLs)", async () => {
    findMany.mockResolvedValue([{ slug: "a", updatedAt: new Date(0) }]);
    await getPublishedSlugs();
    const where = findMany.mock.calls[0][0].where;
    expect(where.visibility).toBe("PUBLISHED");
    expect(where.slug).toEqual({ not: null });
    expect(where.displayName).toEqual({ not: null });
  });
});

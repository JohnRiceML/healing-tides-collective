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
  specialties: [],
  photoUrl: null,
  featured: false,
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

  it("filters accepting-new clients via the fieldValues JSON path", () => {
    const where = buildPractitionerWhere({ acceptingNew: true });
    expect(where.fieldValues).toEqual({ path: ["availability_state"], equals: "accepting" });
  });

  it("does not add the availability filter when acceptingNew is false", () => {
    expect(buildPractitionerWhere({ acceptingNew: false })).not.toHaveProperty("fieldValues");
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

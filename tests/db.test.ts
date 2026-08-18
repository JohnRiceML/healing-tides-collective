import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const adapterOptions = vi.hoisted(() => [] as unknown[]);

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      adapterOptions.push(options);
    }
  },
}));

vi.mock("@/lib/generated/prisma/client", () => ({
  PrismaClient: class {
    constructor(_options: unknown) {}
  },
}));

const originalDatabaseUrl = process.env.DATABASE_URL;
let normalizeDatabaseConnectionString: (connectionString: string) => string;

beforeAll(async () => {
  process.env.DATABASE_URL =
    "postgresql://runtime:secret@example.test/healing_tides?sslmode=require&channel_binding=require";
  ({ normalizeDatabaseConnectionString } = await import("@/lib/db"));
});

afterAll(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  delete (globalThis as { prisma?: unknown }).prisma;
});

describe("database connection-string normalization", () => {
  it.each(["prefer", "require", "verify-ca"])(
    "upgrades sslmode=%s to verify-full",
    (sslMode) => {
      expect(
        normalizeDatabaseConnectionString(
          `postgresql://user:secret@example.test/app?sslmode=${sslMode}`,
        ),
      ).toBe("postgresql://user:secret@example.test/app?sslmode=verify-full");
    },
  );

  it("passes the normalized runtime URL to Prisma's pg adapter", () => {
    expect(adapterOptions).toContainEqual({
      connectionString:
        "postgresql://runtime:secret@example.test/healing_tides?sslmode=verify-full&channel_binding=require",
    });
  });

  it("changes only sslmode, preserving encoded credentials and other parameters", () => {
    const connectionString =
      "postgresql://user:p%40ss%2Fword@example.test:5432/app?sslmode=require&channel_binding=require&application_name=healing%20tides";

    expect(normalizeDatabaseConnectionString(connectionString)).toBe(
      "postgresql://user:p%40ss%2Fword@example.test:5432/app?sslmode=verify-full&channel_binding=require&application_name=healing%20tides",
    );
  });

  it.each([
    "postgresql://user:secret@example.test/app?sslmode=verify-full",
    "postgresql://user:secret@example.test/app?sslmode=disable",
    "postgresql://user:secret@example.test/app",
    "not a connection string",
  ])("leaves non-legacy connection strings unchanged", (connectionString) => {
    expect(normalizeDatabaseConnectionString(connectionString)).toBe(connectionString);
  });

  it("respects an explicit libpq-compatibility opt-in", () => {
    const connectionString =
      "postgresql://user:secret@example.test/app?sslmode=require&uselibpqcompat=true";

    expect(normalizeDatabaseConnectionString(connectionString)).toBe(connectionString);
  });
});

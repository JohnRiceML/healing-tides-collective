// Prisma client singleton.
//
// Prisma 7 requires a driver adapter (the client no longer opens the connection
// itself). We use @prisma/adapter-pg over node-postgres, which works with any
// Postgres — including Neon's pooled endpoint over TCP.
//
// A global cache keeps one instance per process so serverless (Vercel) and Next
// dev hot-reload don't leak connections. Generated client lives at
// lib/generated/prisma (Prisma 7 `prisma-client` generator).

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const CURRENT_VERIFY_FULL_ALIASES = new Set(["prefer", "require", "verify-ca"]);

/**
 * Keep node-postgres' current certificate + hostname verification when its SSL
 * mode semantics change in the next major release. Only the sslmode parameter
 * is changed; credentials and every other connection option stay byte-for-byte
 * as supplied. An explicit libpq-compatibility opt-in is respected.
 */
export function normalizeDatabaseConnectionString(connectionString: string): string {
  let parameters: URLSearchParams;
  try {
    parameters = new URL(connectionString).searchParams;
  } catch {
    return connectionString;
  }

  if (parameters.getAll("uselibpqcompat").at(-1) === "true") return connectionString;

  const sslMode = parameters.getAll("sslmode").at(-1);
  if (!sslMode || !CURRENT_VERIFY_FULL_ALIASES.has(sslMode)) return connectionString;

  return connectionString.replace(
    /([?&]sslmode=)(?:prefer|require|verify-ca)(?=&|#|$)/g,
    "$1verify-full",
  );
}

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set — run `vercel env pull .env.local` (see docs/architecture/PHASE-2-SYSTEMS.md).",
    );
  }
  const connectionString = normalizeDatabaseConnectionString(databaseUrl);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

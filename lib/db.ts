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

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — run `vercel env pull .env.local` (see docs/architecture/PHASE-2-SYSTEMS.md).",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

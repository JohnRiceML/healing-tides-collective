// Prisma CLI config (migrate, db pull, generate, etc.).
//
// Prisma 7 no longer accepts connection URLs in schema.prisma — they live here.
// We load .env.local FIRST (where the real Neon URLs live), then .env as a
// fallback — dotenv never overrides an already-set var, so .env.local wins.
// The CLI uses a DIRECT (non-pooled) connection for migrations: Neon exposes
// that as DATABASE_URL_UNPOOLED. The running app uses the pooled DATABASE_URL
// via the pg adapter in lib/db.ts.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `||` (not `??`) so an EMPTY string also falls back. Note: Vercel marks the
    // Neon integration's vars "Sensitive", so `vercel env pull` returns them blank —
    // copy the connection string from the Neon dashboard into .env.local instead.
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
});

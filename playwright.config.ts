import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the core-pillar suite (e2e/*.spec.ts).
 *
 * How the Clerk workaround is wired (see lib/auth.ts + e2e/_auth.ts):
 *   The webServer starts the app with Clerk DISABLED (keys blanked) and
 *   E2E_AUTH_BYPASS=1, so a test can "sign in" just by setting an `e2e_uid` cookie.
 *
 * DATABASE SAFETY:
 *   We NEVER inherit the app's real DATABASE_URL (.env.local points at the prod Neon
 *   DB — there's no dev/prod split yet). E2E uses TEST_DATABASE_URL, or a localhost
 *   fallback that cannot be prod. DB-backed specs skip green when TEST_DATABASE_URL
 *   is unset; the static smoke specs still run. One-time schema setup:
 *     DATABASE_URL=$TEST_DATABASE_URL npx prisma db push
 */

const PORT = Number(process.env.E2E_PORT ?? 3010);
const baseURL = `http://127.0.0.1:${PORT}`;

// Explicit, never-prod database for the app-under-test.
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/htc_e2e";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // The suite shares one database + one app instance — run serially for determinism.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    // These OVERRIDE .env.local — Next.js never clobbers an already-set process.env var,
    // so blanking the Clerk keys here is what flips clerkEnabled → false for the run.
    env: {
      PORT: String(PORT),
      DATABASE_URL: TEST_DB,
      DATABASE_URL_UNPOOLED: TEST_DB,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "", // → clerkEnabled false → bypass active
      CLERK_SECRET_KEY: "",
      E2E_AUTH_BYPASS: "1",
      ADMIN_EMAILS: "e2e-admin@healingtides.test",
      ANTHROPIC_API_KEY: "", // keep E2E offline — never reach Claude
      // Sanity backs /journal + /studio (NOT exercised by E2E), but sanity/env.ts asserts these
      // at import time and the root layout pulls it in — so the app won't boot without them in
      // CI (no .env.local). Self-contained dummies; never queried by any E2E spec.
      NEXT_PUBLIC_SANITY_PROJECT_ID: "e2etest",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SANITY_API_VERSION: "2026-05-07",
    },
  },
});

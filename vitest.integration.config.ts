import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Real-DB integration tests (tests/integration/**). They point the app's Prisma
// client at TEST_DATABASE_URL — a throwaway Neon branch or local Postgres, NEVER prod
// — and exercise actual SQL. They SKIP (green) when TEST_DATABASE_URL is unset.
//
// Run:
//   DATABASE_URL=$TEST_DATABASE_URL npx prisma db push   # once, to create the schema
//   TEST_DATABASE_URL=postgres://… npm run test:integration
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    fileParallelism: false, // the tests share one DB; run serially
  },
});

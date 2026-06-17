import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// The DEFAULT suite (`npm test`) — fast, no infra, runs anywhere:
//   • tests/*.test.ts        — pure utils + the read/write layers with Prisma mocked
//   • tests/flows/*.test.ts  — multi-step flows against an in-memory mock-db (helpers/)
// The real-DB integration suite (tests/integration/**) is EXCLUDED here and run
// separately via `npm run test:integration` (see vitest.integration.config.ts).
// `vite-tsconfig-paths` makes the `@/*` alias resolve exactly like the app.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "tests/integration/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/**"],
      exclude: ["lib/generated/**", "**/*.d.ts", "tests/**"],
    },
  },
});

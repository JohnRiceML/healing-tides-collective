import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit/integration tests for core logic: pure utils, the public read layer
// (Prisma mocked), and the publish/save server actions (auth + db mocked).
// No real DB and no Next runtime — anything that touches them is mocked.
// `vite-tsconfig-paths` makes the `@/*` alias resolve exactly like the app.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/**"],
      exclude: ["lib/generated/**", "**/*.d.ts", "tests/**"],
    },
  },
});

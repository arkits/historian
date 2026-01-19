import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup/vitest-setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "src/extension/**",
        "migrate.ts",
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

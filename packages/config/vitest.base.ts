import type { UserConfig } from "vitest/config";

/**
 * Shared Vitest baseline. Packages import this and spread it, so a change to
 * the test environment lands everywhere at once.
 */
export const vitestBase: UserConfig = {
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    passWithNoTests: false,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
};

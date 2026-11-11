import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts", "qa/**/*.test.ts"],
    // DB integration tests share one database; don't run files in parallel.
    fileParallelism: false,
  },
});

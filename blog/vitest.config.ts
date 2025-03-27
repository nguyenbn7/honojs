import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig({
  test: {
    passWithNoTests: true,
    globals: true,
    include: ["./test/**.test.ts"],
    env: loadEnv("testing", process.cwd(), ""),
    globalSetup: "./test/setup.ts",
  },
});

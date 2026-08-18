import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "jsdom",
    globalSetup: ["./tests/setup/global-db.ts"],
    // Set here rather than in globalSetup: workers read this before importing
    // the db singleton, and env mutations in setup do not reliably reach them.
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        "postgres://postgres:dev@localhost:55432/shaderpath_test",
    },
    // The suite shares one database, so specs must not run concurrently.
    fileParallelism: false,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3100",
  },
  webServer: {
    // Fixed non-default port — 3000 is often taken by other local apps
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100/vi",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

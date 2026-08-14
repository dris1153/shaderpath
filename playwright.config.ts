import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

// Fresh DB per run so tests are deterministic (mark-complete etc. are stateful).
// Old e2e DBs are best-effort cleaned; locked files (orphan servers) are skipped.
const dataDir = path.join(__dirname, "data");
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    if (f.startsWith("e2e-")) {
      try {
        fs.unlinkSync(path.join(dataDir, f));
      } catch {
        // locked by a running server — ignore
      }
    }
  }
}
const E2E_DB = `data/e2e-${Date.now()}.db`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Serial: parallel workers on one dev server made timing-sensitive tests
  // (frame counters, debounced saves) flaky as the app grew.
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
  },
  webServer: {
    // Fixed non-default port — 3000 is often taken by other local apps.
    // Never reuse: a reused server would keep a previous run's DB env.
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100/vi",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { SHADERPATH_DB: E2E_DB },
  },
});

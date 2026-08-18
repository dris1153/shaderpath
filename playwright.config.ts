import { execSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

// The database is Postgres in Docker (scripts/test-db.ts): globalSetup drops
// the schema and re-migrates, so every run starts empty the way the old
// per-run SQLite file did. A separate database from the unit suite keeps the
// two from clearing each other's rows if they ever overlap.
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgres://postgres:dev@localhost:55432/shaderpath_e2e";

// At config-load time, which is before the webServer spawns. globalSetup runs
// *after* the server is already up, so a reset there would leave the first
// requests hitting an unmigrated schema.
execSync("pnpm exec tsx scripts/reset-e2e-db.ts", {
  stdio: "inherit",
  env: { ...process.env, E2E_DATABASE_URL },
});

export default defineConfig({
  testDir: "./tests/e2e",
  // Serial: parallel workers on one dev server made timing-sensitive tests
  // (frame counters, debounced saves) flaky as the app grew.
  workers: 1,
  // 60s rather than the 30s default. The slow specs are bound by the dev
  // server compiling a route on first request, and reads now cross a socket to
  // Postgres instead of hitting a file in-process. Warm pages answer in tens of
  // milliseconds, so this is headroom for first-compile, not cover for a slow app.
  timeout: 60_000,
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
    env: { DATABASE_URL: E2E_DATABASE_URL },
  },
});

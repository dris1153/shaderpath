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
    baseURL: "http://localhost:3177",
  },
  webServer: {
    // Fixed non-default port. 3000 and 3100 are both commonly taken by other
    // local apps; 3177 is picked to stay clear of them. Never reuse: a reused
    // server would keep a previous run's DB env.
    command: "pnpm dev --port 3177",
    url: "http://localhost:3177/vi",
    reuseExistingServer: false,
    timeout: 120_000,
    // No NEXT_PUBLIC_SUPABASE_* on purpose: a placeholder host makes every
    // session lookup wait for a DNS/TCP timeout, and navigating away mid-request
    // aborts it — which surfaced as an uncaught exception in the dev server and
    // detached elements in the demo specs. Unconfigured means "everyone is a
    // guest", answered instantly. Specs that need an account supply the real
    // values themselves (tests/e2e/requires-auth.ts).
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      ...(process.env.E2E_SUPABASE_EMAIL
        ? {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
            NEXT_PUBLIC_SUPABASE_ANON_KEY:
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          }
        : {}),
    },
  },
});

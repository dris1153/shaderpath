import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// §11.2: delete the DB, restart, migrations auto-run, app works.
//
// playwright.config.ts already gives every run a fresh DB: it deletes prior
// `data/e2e-*.db` files, then computes `data/e2e-${Date.now()}.db` and passes
// it as SHADERPATH_DB to the webServer BEFORE spawning it — so this run's
// server boots against a file that either didn't exist yet or was just
// created by db/client.ts's `fs.mkdirSync` + `new Database(path)` on the
// first request, then migrated by instrumentation.ts's `runMigrations()`.
//
// A test process starts AFTER the webServer is already up, so it cannot
// literally observe "the file didn't exist before boot". What it CAN prove:
// (a) exactly one fresh e2e-*.db exists and its embedded timestamp is from
// this run (not a reused/stale file), and (b) the app functions correctly
// against it end to end — empty dashboard, lesson page loads, and a write
// round-trips — which is only possible if migrations ran on a virgin DB.
//
// Run ordering: this spec must execute before any other spec writes
// progress. Alphabetically "fresh-db-boot" sorts before "memory-leak",
// "shader-error-recovery" and "viewport-gpu" — the exact 4-file set this
// phase's verification command runs together.

test.describe.configure({ mode: "serial" });

test("this run's SHADERPATH_DB is a fresh e2e-*.db, not a reused file", () => {
  const dataDir = path.join(__dirname, "..", "..", "data");
  const dbFiles = fs
    .readdirSync(dataDir)
    .filter((f) => /^e2e-\d+\.db$/.test(f));

  expect(dbFiles.length).toBeGreaterThanOrEqual(1);

  const newest = dbFiles.sort().at(-1)!;
  const ts = Number(newest.slice("e2e-".length, -".db".length));
  expect(Number.isFinite(ts)).toBe(true);
  // Created at config-load time, just before this run's webServer spawned.
  expect(Date.now() - ts).toBeLessThan(5 * 60_000);
});

test("dashboard shows zero progress on the virgin DB", async ({ page }) => {
  await page.goto("/vi");
  await expect(
    page.getByRole("heading", { name: "Chào mừng đến Shaderpath" }),
  ).toBeVisible();
  // dashboard's t("empty") copy is unreachable here: `continueLesson` always
  // resolves to the first unlocked core lesson, even with zero progress rows
  // — so the real, provable "virgin DB" signal is the 0/N core · 0h stats
  // line (app/[locale]/page.tsx), not that unreachable empty-state string.
  await expect(
    page.getByText(/0\/\d+ bài core · 0 giờ đã học/),
  ).toBeVisible();
});

test("lesson page loads and a progress write round-trips (migrations ran)", async ({
  page,
}) => {
  await page.goto("/vi/lesson/dot-and-cross-products");
  await expect(
    page.getByRole("heading", { name: "Dot, Cross & Normalize" }),
  ).toBeVisible();

  await page.getByRole("radio", { name: "5" }).click();
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByText("Đã hoàn thành · tự tin 5/5")).toBeVisible();

  // Reload proves the write landed in SQLite (lesson_progress table), which
  // only exists if instrumentation.ts's migration run created the schema.
  await page.reload();
  await expect(page.getByText("Đã hoàn thành · tự tin 5/5")).toBeVisible();
});

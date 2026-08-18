import { expect, test } from "@playwright/test";

// §11.2: start from an empty database, migrations have run, the app works.
//
// playwright.config.ts points the webServer at a Postgres database that
// globalSetup dropped and re-migrated before the server spawned, so this run
// begins with an empty schema. A test process starts after the server is
// already up, so it cannot observe the reset itself. What it can prove is that
// every read resolves and a write round-trips — neither is possible unless the
// migration created the schema.
//
// Run ordering: this spec must execute before any other spec writes progress.
// Alphabetically "fresh-db-boot" sorts early enough for that.

test.describe.configure({ mode: "serial" });

test("dashboard renders against the freshly migrated database", async ({
  page,
}) => {
  await page.goto("/vi");
  await expect(
    page.getByRole("heading", { name: "Chào mừng đến Shaderpath" }),
  ).toBeVisible();
  // Not an emptiness assertion: sibling specs share this database and several
  // write progress before this file runs, so "zero" is only true depending on
  // file order. A migrated schema is what makes these reads resolve at all.
  await expect(page.getByTestId("track-map")).toContainText(/\d+\/\d+ bài/);
  const queue = page.getByTestId("action-queue");
  await expect(queue.locator("li[data-kind]").first()).toBeVisible();
  await expect(queue.locator('li[data-kind="continue"]')).toHaveCount(1);
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

  // Reload proves the write landed in lesson_progress, a table that only
  // exists because the migration ran.
  await page.reload();
  await expect(page.getByText("Đã hoàn thành · tự tin 5/5")).toBeVisible();
});

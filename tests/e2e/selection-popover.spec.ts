import { expect, test, type Page } from "@playwright/test";

// The selection popover mounts for guests too, so none of this needs an
// account. Saving a note does, and lives in knowledge-layer.spec.ts.

const noteButton = (page: Page) =>
  page.getByRole("button", { name: "Ghi chú", exact: true });
const draft = (page: Page) => page.getByPlaceholder("Viết ghi chú của bạn…");

/** Select the first theory paragraph and fire mouseup, retrying until the
 *  listener has hydrated. */
const select = async (page: Page) => {
  await expect(async () => {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const p = document.querySelector("#lesson-body p");
      if (!p) throw new Error("no paragraph");
      const range = document.createRange();
      range.selectNodeContents(p);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.dispatchEvent(new MouseEvent("mouseup"));
    });
    await expect(noteButton(page)).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 20_000 });
};

test.beforeEach(async ({ page }) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  await expect(page.locator("#lesson-body")).toBeVisible();
});

test("clicking outside closes the popover", async ({ page }) => {
  await select(page);
  await page.locator("h1").click();
  await expect(noteButton(page)).toBeHidden();
});

test("Escape closes the popover", async ({ page }) => {
  await select(page);
  await page.keyboard.press("Escape");
  await expect(noteButton(page)).toBeHidden();
});

test("scrolling closes the popover", async ({ page }) => {
  await select(page);
  await page.evaluate(() => window.scrollBy(0, 300));
  await expect(noteButton(page)).toBeHidden();
});

test("a click outside never throws away a draft", async ({ page }) => {
  await select(page);
  await noteButton(page).click();
  await draft(page).fill("chưa lưu");
  await page.locator("h1").click();
  await expect(draft(page)).toHaveValue("chưa lưu");

  await page.keyboard.press("Escape");
  await expect(draft(page)).toBeHidden();
});

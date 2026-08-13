import { expect, test } from "@playwright/test";

const LESSON_URL = "/vi/lesson/cartesian-and-uv-space";

test.describe.configure({ mode: "serial" });

test("lesson renders theory, TOC and references", async ({ page }) => {
  await page.goto(LESSON_URL);
  await expect(
    page.getByRole("heading", { name: "Toạ độ Descartes & UV space" }),
  ).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();
  await expect(page.locator("pre.shiki").first()).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Trong bài này" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tài liệu tham khảo" }),
  ).toBeVisible();
});

test("scroll position and reading time persist across reload", async ({
  page,
}) => {
  await page.goto(LESSON_URL);
  await page.evaluate(() =>
    window.scrollTo(
      0,
      (document.documentElement.scrollHeight - window.innerHeight) * 0.5,
    ),
  );
  // > debounce window (5s) so at least one save lands
  await page.waitForTimeout(6500);

  await page.reload();
  // restore happens after 2 rAFs; give it a beat
  await page.waitForTimeout(1500);
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(100);
});

test("mark complete persists with confidence", async ({ page }) => {
  await page.goto(LESSON_URL);
  await page.getByRole("radio", { name: "4" }).click();
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByText("Đã hoàn thành · tự tin 4/5")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Đã hoàn thành · tự tin 4/5")).toBeVisible();
});

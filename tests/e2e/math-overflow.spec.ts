import { expect, test } from "@playwright/test";

// KaTeX refuses to wrap display math and ships no overflow handling, so a wide
// formula used to paint outside the article and over the table of contents.
// globals.css turns .katex-display into a scroll container; this asserts the
// formula boxes stay inside the article on the lesson that broke first.
test("display math never paints outside the article column", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/vi/lesson/euler-angles-and-gimbal-lock");

  const article = page.locator("article");
  await expect(article).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);

  const box = await article.boundingBox();
  expect(box).not.toBeNull();

  const blocks = page.locator(".katex-display");
  const count = await blocks.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const math = await blocks.nth(i).boundingBox();
    expect(math).not.toBeNull();
    // Half a pixel of slack: sub-pixel layout rounding is not an overflow.
    expect(math!.x + math!.width).toBeLessThanOrEqual(box!.x + box!.width + 0.5);
    expect(math!.x).toBeGreaterThanOrEqual(box!.x - 0.5);
  }
});

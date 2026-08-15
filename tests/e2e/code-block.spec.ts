import { expect, test } from "@playwright/test";

const LESSON = "/vi/lesson/cartesian-and-uv-space";

// Shiki puts its own className on every <pre>. When the MDX mapping spread props
// after a literal className, ours was silently dropped — the blocks kept looking
// fine because shiki supplies its own background, while overflow-x-auto was gone
// and long lines painted over the table of contents.
test("code blocks keep both the app and shiki classes, and stay in the column", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON);

  const article = page.locator("article");
  await expect(article).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);

  const blocks = page.locator("article pre");
  const count = await blocks.count();
  expect(count).toBeGreaterThan(0);

  const box = await article.boundingBox();
  for (let i = 0; i < count; i++) {
    await expect(blocks.nth(i)).toHaveClass(/code-scroll/);
    await expect(blocks.nth(i)).toHaveClass(/shiki/);
    const pre = await blocks.nth(i).boundingBox();
    expect(pre!.x + pre!.width).toBeLessThanOrEqual(box!.x + box!.width + 0.5);
  }
});

test.describe("copy button", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copies the block's own code", async ({ page }) => {
    test.slow();
    await page.goto(LESSON);

    const block = page.locator("article pre").first();
    await expect(block).toBeVisible({ timeout: 30_000 });
    const source = (await block.textContent())?.trim() ?? "";
    expect(source.length).toBeGreaterThan(0);

    const frame = page.locator("article pre").first().locator("..");
    await frame.hover();
    await frame.getByRole("button", { name: "Sao chép" }).click();

    // The label flips to the copied state, and the clipboard holds the code.
    await expect(frame.getByRole("button", { name: "Đã sao chép" })).toBeVisible();
    // Chromium on Windows hands back CRLF regardless of what was written.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.replace(/\r\n/g, "\n").trim()).toBe(source);
  });
});

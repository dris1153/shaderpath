import { expect, test, type Locator } from "@playwright/test";

// Diagrams live in public/ and load through a plain <img>, so a wrong path is a
// silent failure: the element still exists, it just decodes nothing. Every
// assertion here checks naturalWidth, not visibility.
function decodedWidth(img: Locator) {
  return img.evaluate((el: HTMLImageElement) => el.naturalWidth);
}

test("a theory figure decodes and its caption follows the locale", async ({
  page,
}) => {
  test.slow();

  await page.goto("/vi/lesson/rendering-pipeline-a-to-z");
  const figure = page.locator("figure").first();
  await expect(figure).toBeVisible({ timeout: 30_000 });
  // The img is loading="lazy" — it only fetches once scrolled near the viewport.
  await figure.scrollIntoViewIfNeeded();
  await expect.poll(() => decodedWidth(figure.locator("img"))).toBeGreaterThan(0);
  await expect(figure).toContainText("code bạn viết");

  await page.goto("/en/lesson/rendering-pipeline-a-to-z");
  await expect(figure).toBeVisible({ timeout: 30_000 });
  await figure.scrollIntoViewIfNeeded();
  await expect.poll(() => decodedWidth(figure.locator("img"))).toBeGreaterThan(0);
  await expect(figure).toContainText("code you write");
});

test("a checkpoint reference image decodes once the solution is revealed", async ({
  page,
}) => {
  test.slow();
  const card = page.locator("#exercise-build-animated-quad");

  await page.goto("/vi/lesson/checkpoint-animated-quad");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator("button").first().click();

  await card.getByRole("button", { name: "Tôi đã thử", exact: true }).click();
  const reveal = card.getByRole("button", { name: "Xem lời giải" });
  await expect(reveal).toBeEnabled({ timeout: 30_000 });
  await reveal.click();

  const image = card.getByRole("img", { name: "Ảnh kết quả tham chiếu" });
  await expect(image).toBeVisible();
  await expect.poll(() => decodedWidth(image)).toBeGreaterThan(0);
});

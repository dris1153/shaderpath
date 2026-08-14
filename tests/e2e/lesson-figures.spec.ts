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

// A build exercise is judged by eye against its target, so its reference output
// sits beside the brief rather than behind the solution gate. This one is also a
// PNG rendered from the lesson's own solution, so it covers that path too.
test("a build exercise shows its reference output without revealing the solution", async ({
  page,
}) => {
  test.slow();
  const card = page.locator("#exercise-build-pattern-tile-poster");

  await page.goto("/vi/lesson/checkpoint-pattern-tile-poster");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator("button").first().click();

  const image = card.getByRole("img", { name: "Ảnh kết quả tham chiếu" });
  await expect(image).toBeVisible();
  await expect.poll(() => decodedWidth(image)).toBeGreaterThan(0);

  // The solution is still locked — the image being visible must not have
  // unlocked anything, and it must not appear a second time on reveal. While
  // locked the button carries the "mark attempted first" label, not "Xem lời giải".
  await expect(
    card.getByRole("button", { name: /Đánh dấu "Tôi đã thử"/ }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "Tôi đã thử", exact: true }).click();
  const reveal = card.getByRole("button", { name: "Xem lời giải" });
  await expect(reveal).toBeEnabled({ timeout: 30_000 });
  await reveal.click();
  await expect(image).toHaveCount(1);
});

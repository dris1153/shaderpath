import { expect, test } from "@playwright/test";

// A concept answer lives in `solutionNote` (bilingual prose), not in
// `solutionCode`. Two things regress easily: the reveal button used to be gated
// on solutionCode alone, so a note-only exercise could never be opened; and the
// note must render as prose, never as a syntax-highlighted code block.
test("a note-only solution reveals and renders as prose in both locales", async ({
  page,
}) => {
  const card = page.locator("#exercise-dot-product-angle-and-facing");

  await page.goto("/vi/lesson/dot-and-cross-products");
  // First visit compiles the lesson route on demand — give it room, the way
  // the playground specs do, instead of racing the default click timeout.
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator("button").first().click();
  await page.getByRole("button", { name: "Tôi đã thử", exact: true }).click();
  await page.getByRole("button", { name: "Xem lời giải" }).click();

  await expect(card).toContainText("được chiếu sáng");
  await expect(card.locator(".katex").first()).toBeVisible();
  await expect(card.locator("pre")).toHaveCount(0);

  await page.goto("/en/lesson/dot-and-cross-products");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator("button").first().click();
  await expect(card).toContainText("faces the light source");
  await expect(card.locator("pre")).toHaveCount(0);
});

// §9 phase 6 DoD: complete one exercise fully, reload → everything preserved.
test("exercise flow persists across reload", async ({ page }) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  const section = page.getByTestId("exercise-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText("0/2 hoàn thành")).toBeVisible();

  // Expand the concept exercise
  await section.getByText("Khái niệm").click();

  // Solution is locked before any engagement
  const lockedBtn = page.getByRole("button", {
    name: /Đánh dấu "Tôi đã thử"/,
  });
  await expect(lockedBtn).toBeDisabled();

  // Engage: mark attempted → solution unlocks
  await page.getByRole("button", { name: "Tôi đã thử", exact: true }).click();
  await page.getByRole("button", { name: "Xem lời giải" }).click();
  await expect(page.getByText("Lời giải")).toBeVisible();

  // Reveal both hints; button caps out disabled
  await page.getByRole("button", { name: /Gợi ý \(0\/2\)/ }).click();
  await page.getByRole("button", { name: /Gợi ý \(1\/2\)/ }).click();
  await expect(
    page.getByRole("button", { name: /Gợi ý \(2\/2\)/ }),
  ).toBeDisabled();

  // Tick the whole checklist and complete
  const checkboxes = section.getByRole("checkbox");
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).click();
  }
  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();
  await expect(section.getByText("1/2 hoàn thành")).toBeVisible();

  // Reload → every piece of state restored from SQLite
  await page.reload();
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText("1/2 hoàn thành")).toBeVisible();
  await section.getByText("Khái niệm").click();
  await expect(
    page.getByRole("button", { name: /Gợi ý \(2\/2\)/ }),
  ).toBeDisabled();
  await expect(page.getByText("Lời giải")).toBeVisible();
  const restored = section.getByRole("checkbox");
  for (let i = 0; i < count; i++) {
    await expect(restored.nth(i)).toBeChecked();
  }
});

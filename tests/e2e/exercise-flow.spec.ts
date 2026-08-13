import { expect, test } from "@playwright/test";

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

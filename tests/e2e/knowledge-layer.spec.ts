import { expect, test } from "@playwright/test";

test("command palette searches lessons and navigates", async ({ page }) => {
  await page.goto("/vi");
  const input = page.getByPlaceholder(/Ctrl\+K/);
  // The Ctrl+K listener attaches after hydration — retry until the dialog opens
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(input).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  await input.fill("gimbal");
  const hit = page.getByRole("option", { name: /gimbal lock/i });
  await expect(hit).toBeVisible();
  await hit.click();
  await expect(page).toHaveURL(/euler-angles-and-gimbal-lock/);
});

test("selection note persists and appears on the notes page", async ({
  page,
}) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  await expect(page.locator("#lesson-body")).toBeVisible();

  // Select the first theory paragraph programmatically, then fire mouseup.
  // The selection listener attaches after hydration — retry until the popover shows.
  const noteButton = page.getByRole("button", { name: "Ghi chú", exact: true });
  await expect(async () => {
    await page.evaluate(() => {
      const p = document.querySelector("#lesson-body p");
      if (!p) throw new Error("no paragraph");
      const range = document.createRange();
      range.selectNodeContents(p);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.dispatchEvent(new MouseEvent("mouseup"));
    });
    await expect(noteButton).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  await noteButton.click();
  await page
    .getByPlaceholder("Viết ghi chú của bạn…")
    .fill("e2e ghi chú kiểm thử");
  await page.getByRole("button", { name: "Lưu ghi chú" }).click();
  await expect(page.getByText("Đã lưu ghi chú")).toBeVisible();

  await page.goto("/vi/notes");
  await expect(page.getByText("e2e ghi chú kiểm thử")).toBeVisible();
});

test("stats page renders heatmap and cards (empty-safe)", async ({ page }) => {
  await page.goto("/vi/stats");
  await expect(
    page.getByRole("heading", { name: "Thống kê học tập" }),
  ).toBeVisible();
  await expect(page.getByTestId("heatmap")).toBeVisible();
  await expect(page.getByText("Streak hiện tại")).toBeVisible();
});

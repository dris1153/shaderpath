import { expect, test } from "@playwright/test";

// §11.6: entire app navigable by keyboard. Runs after fresh-db-boot.spec.ts
// alphabetically, so state writes here (if any) don't disturb its
// zero-progress assertion — none of the flows below mark a lesson/exercise
// complete anyway.

test("skip link is the first tab stop and Enter jumps focus to main content", async ({
  page,
}) => {
  await page.goto("/vi");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", {
    name: "Bỏ qua đến nội dung chính",
  });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("command palette: Ctrl+K opens, arrow selects an option, ESC closes and restores focus", async ({
  page,
}) => {
  await page.goto("/vi");
  const roadmapLink = page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "Lộ trình", exact: true });
  await roadmapLink.focus();
  await expect(roadmapLink).toBeFocused();

  const input = page.getByPlaceholder(/Ctrl\+K/);
  // The Ctrl+K listener attaches after hydration — retry until the dialog opens.
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(input).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  await page.keyboard.press("ArrowDown");
  const selected = page.locator('[cmdk-item][data-selected="true"]');
  await expect(selected).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
  await expect(roadmapLink).toBeFocused();
});

test("dialog: save-snippet dialog traps focus and ESC restores focus to its trigger", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // .first(): the dialog portals its own "Lưu" submit button to the end of
  // <body> once open, so the trigger — earlier in DOM order — stays index 0.
  const trigger = page.getByRole("button", { name: "Lưu", exact: true }).first();
  await trigger.click();

  const dialogContent = page.locator('[data-slot="dialog-content"]');
  await expect(dialogContent).toBeVisible();
  await expect(page.getByLabel("Tên snippet")).toBeVisible();

  const focusInsideDialog = await page.evaluate(() => {
    const d = document.querySelector('[data-slot="dialog-content"]');
    return !!d && d.contains(document.activeElement);
  });
  expect(focusInsideDialog).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialogContent).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("lesson page: TOC links and demo controls are keyboard-reachable and labelled", async ({
  page,
}) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  await expect(
    page.getByRole("heading", { name: "Toạ độ Descartes & UV space" }),
  ).toBeVisible();

  const toc = page.getByRole("navigation", { name: "Trong bài này" });
  await expect(toc).toBeVisible();
  const firstTocLink = toc.getByRole("link").first();
  await firstTocLink.focus();
  await expect(firstTocLink).toBeFocused();
  // Not a focus trap: Tab moves on to the next focusable element.
  await page.keyboard.press("Tab");
  await expect(firstTocLink).not.toBeFocused();

  // Demo controls carry real accessible names (aria-labelledby fix in
  // components/viz/demo-controls.tsx), reachable independent of DOM order.
  const demoContainer = page.locator("[data-demo-container]").first();
  await demoContainer.scrollIntoViewIfNeeded();
  const uSlider = page.getByRole("slider", { name: "u (ngang)" });
  const flipSwitch = page.getByRole("switch", {
    name: "Đảo trục v (ảnh ↔ WebGL)",
  });
  await uSlider.focus();
  await expect(uSlider).toBeFocused();
  await flipSwitch.focus();
  await expect(flipSwitch).toBeFocused();
});

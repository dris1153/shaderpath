import { expect, test } from "@playwright/test";

// The dashboard is the "what do I do now" screen: it must show the queue, keep
// review grading reachable (this is the only screen that offers it), and keep
// the syllabus collapsed until asked for.
test("dashboard shows the action queue and an expandable track map", async ({
  page,
}) => {
  test.slow();
  await page.goto("/vi");

  const queue = page.getByTestId("action-queue");
  await expect(queue).toBeVisible({ timeout: 30_000 });

  const map = page.getByTestId("track-map");
  await expect(map).toBeVisible();

  // Collapsed by default — the track listing is not in the DOM yet.
  const trigger = map.locator("button").first();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(map.locator("ol li").first()).toBeVisible();
});

test("the chips filter the queue without losing the review actions", async ({
  page,
}) => {
  test.slow();
  await page.goto("/vi");

  const queue = page.getByTestId("action-queue");
  await expect(queue).toBeVisible({ timeout: 30_000 });

  const rows = queue.locator("li[data-kind]");
  const total = await rows.count();
  test.skip(total === 0, "no progress recorded yet, nothing to filter");

  // Filtering to a group must never show a row from another group.
  await page.getByRole("button", { name: /Chỗ yếu/ }).click();
  const shown = queue.locator("li[data-kind]");
  for (let i = 0; i < (await shown.count()); i++) {
    const kind = await shown.nth(i).getAttribute("data-kind");
    expect(["leech", "shaky", "hinted"]).toContain(kind);
  }

  await page.getByRole("button", { name: /Tất cả/ }).click();
  await expect(queue.locator("li[data-kind]")).toHaveCount(total);
});

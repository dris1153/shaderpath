import { expect, test } from "@playwright/test";

// The map view is content, so a guest sees the whole thing; only the progress
// colouring needs an account.
test("the minimap draws a rect for every node", async ({ page }) => {
  await page.goto("/vi/roadmap");
  await page.getByRole("button", { name: "Sơ đồ" }).click();

  const nodes = page.locator(".react-flow__node");
  await expect.poll(() => nodes.count(), { timeout: 15_000 }).toBeGreaterThan(50);

  // MiniMap skips any node it cannot get dimensions for, and uncontrolled
  // nodes never receive `measured` — which left it drawing only its mask.
  await expect
    .poll(() => page.locator(".react-flow__minimap-node").count(), {
      timeout: 15_000,
    })
    .toBe(await nodes.count());
});

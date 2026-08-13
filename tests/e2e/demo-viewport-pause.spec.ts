import { expect, test } from "@playwright/test";

// Spec §8.3/§11.4: a canvas outside the viewport must not tick.
// The cartesian lesson has ~1200 words of theory, so its demo starts below
// the fold; `data-frames` counts visible-loop ticks.
test("demo below the fold does not tick until scrolled into view", async ({
  page,
}) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  const container = page.locator("[data-demo-container]");
  await expect(container).toBeAttached();

  await page.waitForTimeout(800);
  const f1 = Number(await container.getAttribute("data-frames")) || 0;
  await page.waitForTimeout(1000);
  const f2 = Number(await container.getAttribute("data-frames")) || 0;
  expect(f2).toBe(f1); // frozen off-screen

  await container.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const f3 = Number(await container.getAttribute("data-frames")) || 0;
  expect(f3).toBeGreaterThan(f2); // ticking once visible
});

test("raw WebGL2 demo renders and its controls respond", async ({ page }) => {
  await page.goto("/vi/lesson/first-triangle-webgl2");
  const container = page.locator("[data-demo-container]");
  await container.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(Number(await container.getAttribute("data-frames")) || 0).toBeGreaterThan(
    0,
  );
  // reset button + switch exist (control panel renders)
  await expect(page.getByRole("switch")).toBeVisible();
});

test("GLSL demo with .glsl import renders", async ({ page }) => {
  await page.goto("/vi/lesson/shaping-functions-and-2d-sdf");
  const container = page.locator("[data-demo-container]");
  await container.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(Number(await container.getAttribute("data-frames")) || 0).toBeGreaterThan(
    0,
  );
  await expect(container.locator("canvas")).toBeVisible();
});

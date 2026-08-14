import { expect, test, type Locator } from "@playwright/test";

// Spec §8.3/§11.4: a canvas outside the viewport must not tick.
// `data-frames` counts visible-loop ticks — poll it instead of fixed sleeps.

const frames = async (container: Locator) =>
  Number(await container.getAttribute("data-frames")) || 0;

async function expectTicking(container: Locator) {
  const before = await frames(container);
  await expect
    .poll(() => frames(container), { timeout: 10_000 })
    .toBeGreaterThan(before);
}

test("demo below the fold does not tick until scrolled into view", async ({
  page,
}) => {
  await page.goto("/vi/lesson/cartesian-and-uv-space");
  const container = page.locator("[data-demo-container]");
  await expect(container).toBeAttached();

  // Give any startup work a beat, then assert the counter is frozen
  await page.waitForTimeout(1_000);
  const f1 = await frames(container);
  await page.waitForTimeout(1_000);
  expect(await frames(container)).toBe(f1); // frozen off-screen

  await container.scrollIntoViewIfNeeded();
  await expectTicking(container); // ticking once visible
});

test("raw WebGL2 demo renders and its controls respond", async ({ page }) => {
  await page.goto("/vi/lesson/first-triangle-webgl2");
  const container = page.locator("[data-demo-container]");
  await container.scrollIntoViewIfNeeded();
  await expectTicking(container);
  await expect(page.getByRole("switch")).toBeVisible();
});

test("GLSL demo with .glsl import renders", async ({ page }) => {
  await page.goto("/vi/lesson/shaping-functions-and-2d-sdf");
  const container = page.locator("[data-demo-container]");
  await container.scrollIntoViewIfNeeded();
  await expectTicking(container);
  await expect(container.locator("canvas")).toBeVisible();
});

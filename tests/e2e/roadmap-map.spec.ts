import { expect, test, type Page } from "@playwright/test";

// The map view is content, so a guest sees the whole thing; only the progress
// colouring needs an account.

const openMap = async (page: Page) => {
  await page.goto("/vi/roadmap");
  await page.getByRole("button", { name: "Sơ đồ" }).click();
  await expect
    .poll(() => page.locator(".react-flow__node").count(), { timeout: 15_000 })
    .toBeGreaterThan(0);
};

/** Drive the viewport directly: wheel events over a canvas are flaky, and the
 *  band only cares about the zoom number. */
const zoomTo = async (page: Page, zoom: number) => {
  await page.evaluate((z) => {
    const el = document.querySelector<HTMLElement>(".react-flow__pane");
    el?.dispatchEvent(
      new WheelEvent("wheel", { deltaY: z, bubbles: true, ctrlKey: true }),
    );
  }, zoom);
};

const visible = (page: Page) =>
  page.locator(".react-flow__node:not(.react-flow__node.hidden)");

test("the minimap draws a rect for every visible node", async ({ page }) => {
  await openMap(page);

  // MiniMap skips any node it cannot get dimensions for, and uncontrolled
  // nodes never receive `measured` — which left it drawing only its mask.
  await expect
    .poll(() => page.locator(".react-flow__minimap-node").count(), {
      timeout: 15_000,
    })
    .toBe(await visible(page).count());
});

test("the far band shows tracks only, not 162 lessons", async ({ page }) => {
  await openMap(page);

  // fitView lands near 0.2 with this many nodes, so the map opens wide.
  await expect.poll(() => visible(page).count(), { timeout: 15_000 }).toBe(14);
  await expect(page.getByText("Nền tảng Toán học cho đồ hoạ")).toBeVisible();
});

test("zooming in reaches every lesson", async ({ page }) => {
  await openMap(page);
  await expect.poll(() => visible(page).count(), { timeout: 15_000 }).toBe(14);

  // Ctrl+wheel up until the deepest band; 211 = 14 tracks + 35 modules + 162.
  for (let i = 0; i < 40; i++) {
    await zoomTo(page, -120);
    if ((await visible(page).count()) === 211) break;
  }
  expect(await visible(page).count()).toBe(211);
});

test("a guest gets the shape, just not the paint", async ({ page }) => {
  await openMap(page);
  await expect.poll(() => visible(page).count(), { timeout: 15_000 }).toBe(14);

  // Positions cannot depend on progress — layoutCurriculumMap is never handed
  // it — so the only thing an account adds is the legend and the colouring.
  // An empty map for a signed-out visitor would be the failure.
  await expect(page.getByText("Đã hoàn thành")).toHaveCount(0);
  await expect(page.getByText("Nền tảng Toán học cho đồ hoạ")).toBeVisible();
});

test("the keyboard walks the 14 tracks in curriculum order", async ({
  page,
}) => {
  await openMap(page);
  await expect.poll(() => visible(page).count(), { timeout: 15_000 }).toBe(14);

  // Every track label is a real link, so the default band is navigable
  // without a mouse — the thing the old caveat admitted it was not.
  const links = page.locator(".react-flow__node a");
  await expect(links).toHaveCount(14);
  expect(await links.first().getAttribute("href")).toContain("/track/math");
  expect(await links.last().getAttribute("href")).toContain("/track/capstones");
});

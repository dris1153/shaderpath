import { expect, test, type Locator, type Page } from "@playwright/test";

// §11.4: scroll a page with 3 canvases → only the in-viewport canvas
// consumes GPU.
//
// components/viz/demo.tsx wraps exactly one child, so no single lesson page
// in this content set renders 3 simultaneous canvases — demo-viewport-
// pause.spec.ts already proves the freeze/tick invariant for 3 canvas TYPES
// (R3F, raw WebGL2, .glsl import) one at a time, sequentially. This spec
// extends that to what it can't reach alone: 3 canvases open and running
// CONCURRENTLY (3 tabs in one browser context), proving the per-canvas
// IntersectionObserver gate holds under real simultaneous multi-context GPU
// load — and that an out-of-view canvas freezes independently of the other
// two staying active, not duplicating the single-canvas cases already
// covered.
const SLUGS = [
  "canvas-context-and-dpr",
  "glsl-builtin-functions",
  "precision-qualifiers",
] as const;

const frames = async (container: Locator) =>
  Number(await container.getAttribute("data-frames")) || 0;

async function expectTicking(container: Locator) {
  const before = await frames(container);
  await expect
    .poll(() => frames(container), { timeout: 10_000 })
    .toBeGreaterThan(before);
}

async function expectFrozen(page: Page, container: Locator) {
  const before = await frames(container);
  await page.waitForTimeout(1_000);
  expect(await frames(container)).toBe(before);
}

test("3 concurrently open canvases only tick while in view (§11.4)", async ({
  browser,
}) => {
  const context = await browser.newContext();
  try {
    const pages = await Promise.all(
      SLUGS.map(async (slug) => {
        const page = await context.newPage();
        await page.goto(`/vi/lesson/${slug}`);
        return page;
      }),
    );
    const containers = pages.map((p) => p.locator("[data-demo-container]"));
    for (const c of containers) await expect(c).toBeAttached();

    // Demos sit below the theory content on every lesson page — all 3 start
    // off-screen and frozen.
    await pages[0]!.waitForTimeout(500);
    for (const c of containers) await expectFrozen(pages[0]!, c);

    // Scroll tab 0's demo into view: it ticks while 1 and 2 (untouched,
    // separate tabs) stay frozen — proves one active GPU context doesn't
    // wake the others.
    await containers[0]!.scrollIntoViewIfNeeded();
    await expectTicking(containers[0]!);
    await expectFrozen(pages[1]!, containers[1]!);
    await expectFrozen(pages[2]!, containers[2]!);

    // Bring all 3 into view — all 3 tick simultaneously (the literal
    // "≥3 canvases active at once" case §11.4 asks for).
    await containers[1]!.scrollIntoViewIfNeeded();
    await containers[2]!.scrollIntoViewIfNeeded();
    await expectTicking(containers[1]!);
    await expectTicking(containers[2]!);
    expect(await frames(containers[0]!)).toBeGreaterThan(0);

    // Scroll tab 1 back out while 0 and 2 remain in view: only 1 freezes —
    // the core §11.4 assertion, now proven with 3 canvases open at once.
    await pages[1]!.evaluate(() => window.scrollTo(0, 0));
    // Settle: the IntersectionObserver callback (and its rafId cancellation)
    // fires asynchronously after scroll, so one more frame can legitimately
    // land right after scrollTo — let that transition finish before sampling.
    await pages[1]!.waitForTimeout(300);
    await expectFrozen(pages[1]!, containers[1]!);
    await expectTicking(containers[0]!);
    await expectTicking(containers[2]!);
  } finally {
    await context.close();
  }
});

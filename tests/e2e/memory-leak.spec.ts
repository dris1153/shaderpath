import { expect, test, type CDPSession, type Page } from "@playwright/test";

// §11.3 (advisory): navigating many lesson demos must not grow the JS heap
// linearly. Chromium-only — HeapProfiler/Performance are CDP domains with no
// Firefox/WebKit equivalent exposed through Playwright.
//
// 12 slugs pulled from content/lesson-registry.generated.ts DEMO_REGISTRY
// (11 math-track + 1 webgl-track demo — kept lightweight on purpose so the
// whole spec stays in the ~60-90s budget).
const LESSONS = [
  "cartesian-and-uv-space",
  "dot-and-cross-products",
  "euler-angles-and-gimbal-lock",
  "homogeneous-coordinates-4x4",
  "interpolation-and-easing",
  "matrix-basics",
  "model-view-projection",
  "quaternions",
  "srgb-linear-and-gamma",
  "trigonometry-for-animation",
  "vector-basics",
  "attributes-uniforms-varyings",
] as const;

const SAMPLE_AFTER = new Set([2, 7, 12]);

async function heapUsedBytes(cdp: CDPSession): Promise<number> {
  // Two collectGarbage passes with a settle gap: the first sweeps cycles
  // freed by the just-unmounted demo, the second catches what that GC
  // itself made collectable — reduces sampling a mid-GC transient.
  await cdp.send("HeapProfiler.collectGarbage");
  await new Promise((r) => setTimeout(r, 200));
  await cdp.send("HeapProfiler.collectGarbage");
  const { metrics } = await cdp.send("Performance.getMetrics");
  return metrics.find((m) => m.name === "JSHeapUsedSize")?.value ?? 0;
}

async function visitLesson(page: Page, slug: string) {
  await page.goto(`/vi/lesson/${slug}`);
  const container = page.locator("[data-demo-container]");
  await container.scrollIntoViewIfNeeded();
  // Let the demo mount and tick a few real frames before moving on.
  await expect
    .poll(
      async () => Number(await container.getAttribute("data-frames")) || 0,
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
}

test("navigating 12 lesson demos does not grow the heap superlinearly (§11.3)", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "HeapProfiler/Performance CDP domains are Chromium-only",
  );
  test.setTimeout(120_000);

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.enable");

  const samples: number[] = [];

  for (let i = 0; i < LESSONS.length; i++) {
    await visitLesson(page, LESSONS[i]!);
    const n = i + 1;
    if (SAMPLE_AFTER.has(n)) {
      // Settle before sampling: let in-flight R3F/GC-eligible work land.
      await page.waitForTimeout(500);
      samples.push(await heapUsedBytes(cdp));
    }
  }

  expect(samples).toHaveLength(3);
  const [afterTwo, , afterTwelve] = samples as [number, number, number];

  // Advisory trend guard, not an absolute bound — heap sizing is noisy
  // across machines/CI. A true leak grows roughly linearly per navigation
  // (~6x from sample 1 to sample 3, since 12/2=6); this only fails on
  // clearly non-linear, leak-shaped growth, with slack for GC/JIT noise.
  expect(afterTwelve).toBeLessThan(afterTwo * 2.5);
});

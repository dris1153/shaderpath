import { expect, test, type Page } from "@playwright/test";
import { applyShader, BROKEN } from "./playground-helpers";

// The uPrev contract, tested from outside: the previous frame really is the
// previous frame, and a shader that never asks for it pays nothing.

/** Holds a seeded 0.5 by copying itself forward. Any loss in the round-trip —
 *  a wrong format, a bad sample coordinate, a mixed-up swap — shows up as
 *  drift away from 128. */
const HOLD = `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  if (uFrame == 0) { fragColor = vec4(0.5, 0.5, 0.5, 1.0); return; }
  fragColor = vec4(texture(uPrev, uv).rgb, 1.0);
}`;

/** Climbs from black, so a restart is visible as a sudden drop. */
const RAMP = `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  if (uFrame == 0) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  fragColor = vec4(texture(uPrev, uv).rgb + 0.02, 1.0);
}`;

const NO_FEEDBACK = `void main() {
  fragColor = vec4(gl_FragCoord.xy / uResolution, 0.5, 1.0);
}`;

async function meanRed(page: Page) {
  const shot = await page.getByTestId("shader-canvas").screenshot();
  return page.evaluate(async (b64: string) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    if (!ctx) return -1;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    // 15% margin: the card clips the canvas with rounded corners, so the
    // outermost pixels are page background rather than shader output.
    const m = Math.floor(Math.min(c.width, c.height) * 0.15);
    let sum = 0;
    let n = 0;
    for (let y = m; y < c.height - m; y += 5) {
      for (let x = m; x < c.width - m; x += 5) {
        sum += data[(y * c.width + x) * 4]!;
        n++;
      }
    }
    return sum / n;
  }, shot.toString("base64"));
}

test("a shader reading uPrev gets the previous frame back unchanged", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // BROKEN first: applyShader waits for the compile badge, and the badge is
  // already showing from the default shader. Without this it returns before
  // anything recompiles — the same trap the preset sweep documents.
  await applyShader(page, BROKEN, "compile-errors");
  await applyShader(page, HOLD, "compile-ok");

  const first = await meanRed(page);
  await page.waitForTimeout(700);
  const later = await meanRed(page);

  // 0.5 written into the pair and copied forward every frame for ~40 frames.
  expect(first).toBeGreaterThan(120);
  expect(first).toBeLessThan(136);
  expect(Math.abs(later - first)).toBeLessThan(4);
});

test("a shader that never reads uPrev allocates no feedback buffers", async ({
  page,
}) => {
  // Wrapping the prototype from the test keeps the production path free of
  // any counter it would only ever need for this assertion.
  await page.addInitScript(() => {
    const proto = WebGL2RenderingContext.prototype;
    const create = proto.createTexture;
    const destroy = proto.deleteTexture;
    const w = window as unknown as { __live: number };
    w.__live = 0;
    proto.createTexture = function (this: WebGL2RenderingContext) {
      w.__live++;
      return create.call(this);
    };
    proto.deleteTexture = function (
      this: WebGL2RenderingContext,
      t: WebGLTexture | null,
    ) {
      if (t) w.__live--;
      return destroy.call(this, t);
    };
  });

  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
  const live = () => page.evaluate(() => (window as unknown as { __live: number }).__live);

  await applyShader(page, BROKEN, "compile-errors");
  await applyShader(page, NO_FEEDBACK, "compile-ok");
  await page.waitForTimeout(300);
  const withoutFeedback = await live();

  await applyShader(page, BROKEN, "compile-errors");
  await applyShader(page, HOLD, "compile-ok");
  await page.waitForTimeout(300);
  const withFeedback = await live();

  // Exactly the ping-pong pair, and nothing while it is not needed.
  expect(withFeedback - withoutFeedback).toBe(2);

  // Going back frees them again rather than leaking a pair per edit.
  await applyShader(page, BROKEN, "compile-errors");
  await applyShader(page, NO_FEEDBACK, "compile-ok");
  await page.waitForTimeout(300);
  expect(await live()).toBe(withoutFeedback);
});

test("a resize restarts the simulation instead of rendering garbage", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
  await applyShader(page, BROKEN, "compile-errors");
  await applyShader(page, RAMP, "compile-ok");

  await page.waitForTimeout(800);
  const climbed = await meanRed(page);
  expect(climbed).toBeGreaterThan(60);

  // A window drag or a quality-tier change both land here. The buffers cannot
  // carry state across a reallocation, so the honest behaviour is to reseed.
  const size = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.setViewportSize({ width: size.width - 220, height: size.height });
  const afterResize = await meanRed(page);
  expect(afterResize).toBeLessThan(climbed);
});

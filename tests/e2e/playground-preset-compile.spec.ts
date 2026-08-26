import { expect, test } from "@playwright/test";
import {
  ALL_PRESETS,
  presetSource,
} from "../../content/playground-presets";
import { applyShader, BROKEN } from "./playground-helpers";

// The built-in presets are static GLSL that nothing else compiles: without a
// test they rot silently the first time the prelude or a uniform changes.
// Importing the registry means new presets are covered automatically.
//
// Signed out on purpose. This used to live in playground-presets.spec.ts,
// which calls requiresAuth() for its dropdown tests — so the sweep was skipped
// on every credential-less run, which is every run.

/** Widest span between the darkest and brightest sample, per channel.
 *  A compile-clean shader that paints one flat colour scores 0 here. */
async function colourSpread(page: import("@playwright/test").Page) {
  const shot = await page.getByTestId("shader-canvas").screenshot();
  // Decoding in the browser rather than in Node: the canvas has no
  // preserveDrawingBuffer, so readback has to go through a real screenshot,
  // and the page already has a PNG decoder we would otherwise add a dep for.
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
    const min = [255, 255, 255];
    const max = [0, 0, 0];
    // Skip a 15% margin: the card clips the canvas with rounded corners, so the
    // corner pixels are page background. Sampling them scored a flat grey
    // shader at 178 and sailed it straight through this gate.
    const m = Math.floor(Math.min(c.width, c.height) * 0.15);
    for (let y = m; y < c.height - m; y += 5) {
      for (let x = m; x < c.width - m; x += 5) {
        const i = (y * c.width + x) * 4;
        for (let ch = 0; ch < 3; ch++) {
          const v = data[i + ch]!;
          if (v < min[ch]!) min[ch] = v;
          if (v > max[ch]!) max[ch] = v;
        }
      }
    }
    return Math.max(max[0]! - min[0]!, max[1]! - min[1]!, max[2]! - min[2]!);
  }, shot.toString("base64"));
}

test("every built-in preset compiles and renders something", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  expect(ALL_PRESETS.length).toBeGreaterThan(0);
  for (const preset of ALL_PRESETS) {
    // Without this the next assertion would just re-observe the PREVIOUS
    // preset's compile-ok badge and pass without compiling anything.
    await applyShader(page, BROKEN, "compile-errors");
    await applyShader(page, presetSource(preset, "vi"), "compile-ok");
    await expect(
      page.getByTestId("compile-errors"),
      `preset "${preset.slug}" must compile cleanly`,
    ).toHaveCount(0);

    // Compiling proves the syntax; it does not prove the shader draws. A black
    // rectangle is the usual way shader content fails, and it passes every
    // other gate in this repo.
    expect(
      await colourSpread(page),
      `preset "${preset.slug}" renders one flat colour`,
    ).toBeGreaterThan(12);
  }
});

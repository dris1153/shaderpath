import { expect, test, type Locator, type Page } from "@playwright/test";

// §11.5 acceptance owner: shader syntax error → correct line number, no
// crash. playground-compile-error.spec.ts already covers the happy-path
// flow (missing-semicolon → error badge → fix → compile-ok), but that error
// can legitimately surface on either the offending statement's line or the
// next line (its assertion tolerates `/Dòng [23]/` for that reason). This
// spec extends coverage with what that test does NOT check:
//   1. A KNOWN, single-line-only error (undeclared identifier reference,
//      never ambiguous with a neighboring line) — asserts the EXACT line.
//   2. The keep-last-good-frame guarantee itself: the render loop
//      (`data-frames`) must keep advancing WHILE the shader is broken,
//      proving the previous compiled program still drives the RAF loop —
//      not just that the <canvas> element remains present in the DOM.

// Same pattern as playground-compile-error.spec.ts: typing into Monaco
// fights auto-closing pairs, and setValue can race the React change
// listener attaching — set via the API and retry until compile state reacts.
async function applyShader(
  page: Page,
  source: string,
  expectedTestId: "compile-ok" | "compile-errors",
) {
  await page.waitForFunction(
    () => {
      const w = window as unknown as {
        monaco?: { editor: { getEditors(): unknown[] } };
      };
      return (w.monaco?.editor.getEditors().length ?? 0) > 0;
    },
    { timeout: 20_000 },
  );

  await expect(async () => {
    await page.evaluate((src) => {
      const w = window as unknown as {
        monaco?: {
          editor: { getEditors(): { setValue(v: string): void }[] };
        };
      };
      for (const ed of w.monaco?.editor.getEditors() ?? []) {
        try {
          ed.setValue(src);
        } catch {
          // disposed editor (Strict Mode leftovers)
        }
      }
    }, source);
    await expect(page.getByTestId(expectedTestId)).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 20_000 });
}

const frames = async (container: Locator) =>
  Number(await container.getAttribute("data-frames")) || 0;

test.describe.configure({ mode: "serial" });

test("undeclared-identifier error reports the exact line, keeps rendering, and recovers (§11.5)", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // Playground's ShaderPreview wraps its <canvas data-testid="shader-canvas">
  // in the same containerRef useVisibleRaf ticks — this div is the direct parent.
  const container = page.locator(
    'div:has(> canvas[data-testid="shader-canvas"])',
  );
  await expect(container).toBeAttached();
  const framesBefore = await frames(container);

  // Line 2 references an identifier that is never declared anywhere in the
  // assembled source — ANGLE reports this deterministically on that exact
  // line, unlike a missing semicolon whose error can shift to the next line.
  await applyShader(
    page,
    "void main() {\n  fragColor = vec4(undeclaredValueXyz, 1.0, 1.0, 1.0);\n}",
    "compile-errors",
  );
  await expect(page.getByTestId("compile-errors")).toContainText("Dòng 2");

  // Keep-last-good: the RAF pump keeps drawing the PREVIOUS good program
  // while the broken one is rejected — the loop must not stall or crash.
  await expect
    .poll(async () => frames(container), { timeout: 10_000 })
    .toBeGreaterThan(framesBefore);
  await expect(page.getByTestId("shader-canvas")).toBeVisible();

  // Fix it: compile-ok returns, and frames keep advancing after recovery too.
  const framesAtError = await frames(container);
  await applyShader(
    page,
    "void main() {\n  fragColor = vec4(0.1, 0.6, 0.9, 1.0);\n}",
    "compile-ok",
  );
  await expect
    .poll(async () => frames(container), { timeout: 10_000 })
    .toBeGreaterThan(framesAtError);
});

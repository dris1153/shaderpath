import { expect, test, type Page } from "@playwright/test";
import { ALL_PRESETS, PRESET_GROUPS } from "../../content/playground-presets";

// The built-in presets are static GLSL that nothing else compiles: without a
// test they rot silently the first time the prelude or a uniform changes.
// Importing the registry means new presets are covered automatically.

// Monaco fights typed input (auto-closing pairs) and setValue can race the
// React change listener attaching — same applyShader pattern as the other
// playground specs: set via the API and retry until compile state reacts.
async function applyShader(
  page: Page,
  source: string,
  expected: "compile-ok" | "compile-errors",
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
        monaco?: { editor: { getEditors(): { setValue(v: string): void }[] } };
      };
      for (const ed of w.monaco?.editor.getEditors() ?? []) {
        try {
          ed.setValue(src);
        } catch {
          // disposed editor (Strict Mode leftovers)
        }
      }
    }, source);
    await expect(page.getByTestId(expected)).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 25_000 });
}

const editorValue = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as {
      monaco?: { editor: { getEditors(): { getValue(): string }[] } };
    };
    return w.monaco?.editor.getEditors()[0]?.getValue() ?? "";
  });

// A shader that can never compile: used to force the state away from
// compile-ok between presets, so each preset must flip it back itself.
const BROKEN = "void main() {\n  fragColor = neverDeclaredXyz;\n}";

test.describe.configure({ mode: "serial" });

test("picking a preset from the dropdown loads its exact source", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  const firstGroup = PRESET_GROUPS[0];
  const firstPreset = firstGroup?.presets[0];
  if (!firstGroup || !firstPreset) throw new Error("no presets registered");

  // Exercises the real wiring: grouped Select → onSelect → editor source.
  await page.getByRole("combobox", { name: "Snippet đã lưu" }).click();
  await expect(
    page.getByRole("group", { name: firstGroup.label.vi }),
  ).toBeVisible();
  await page.getByRole("option", { name: firstPreset.title.vi }).click();

  await expect
    .poll(async () => (await editorValue(page)).trim(), { timeout: 10_000 })
    .toBe(firstPreset.source.trim());
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
});

test("every built-in preset compiles without errors", async ({ page }) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  expect(ALL_PRESETS.length).toBeGreaterThan(0);
  for (const preset of ALL_PRESETS) {
    // Without this the next assertion would just re-observe the PREVIOUS
    // preset's compile-ok badge and pass without compiling anything.
    await applyShader(page, BROKEN, "compile-errors");
    await applyShader(page, preset.source, "compile-ok");
    await expect(
      page.getByTestId("compile-errors"),
      `preset "${preset.slug}" must compile cleanly`,
    ).toHaveCount(0);
  }
});

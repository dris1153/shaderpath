import { expect, type Page } from "@playwright/test";

// Monaco fights typed input (auto-closing pairs) and setValue can race the
// React change listener attaching — set via the API and retry until the
// compile state visibly reacts.
export async function applyShader(
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

export const editorValue = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as {
      monaco?: { editor: { getEditors(): { getValue(): string }[] } };
    };
    return w.monaco?.editor.getEditors()[0]?.getValue() ?? "";
  });

/** A shader that can never compile: forces the state away from compile-ok
 *  between presets, so each preset must flip it back itself. */
export const BROKEN = "void main() {\n  fragColor = neverDeclaredXyz;\n}";

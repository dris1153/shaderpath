import { expect, test, type Page } from "@playwright/test";
import { PRESET_GROUPS } from "../../content/playground-presets";
import { requiresAuth, signIn } from "./requires-auth";

test.describe.configure({ mode: "serial" });

// Typing into Monaco fights auto-closing pairs, and setValue can land before
// the React wrapper attaches its change listener. So: set the value through
// the API and RETRY until the compile pipeline visibly reacts.
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

test("playground compiles the default shader", async ({ page }) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("shader-canvas")).toBeVisible();
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
});

test("a syntax error shows the correct user line and the app survives (§11.5)", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // 2-line body with a missing semicolon — ANGLE reports line 2 or 3
  await applyShader(
    page,
    "void main() {\n  fragColor = vec4(1.0)\n}",
    "compile-errors",
  );
  await expect(page.getByTestId("compile-errors")).toContainText(/Dòng [23]/);

  // App alive: canvas still there, last good frame still rendering
  await expect(page.getByTestId("shader-canvas")).toBeVisible();

  // Fixing the error brings the ✓ badge back
  await applyShader(
    page,
    "void main() {\n  fragColor = vec4(uMouse, 0.5, 1.0);\n}",
    "compile-ok",
  );
});

test.describe("saved snippets", () => {
  // Saving a snippet writes a row, so it needs an account.
  requiresAuth();
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("snippets persist across reload", async ({ page }) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // Flip to an error state first: proves the editor→React binding is live,
  // otherwise "compile-ok" would pass without the new source ever landing.
  await applyShader(page, "void broken(", "compile-errors");
  await applyShader(
    page,
    "void main() {\n  fragColor = vec4(0.2, 0.8, 0.4, 1.0);\n}",
    "compile-ok",
  );

  await page.getByRole("button", { name: "Lưu" }).click();
  await page.getByLabel("Tên snippet").fill("e2e-snippet");
  await page.getByRole("dialog").getByRole("button", { name: "Lưu" }).click();
  await expect(page.getByText("Đã lưu snippet")).toBeVisible();

  await page.reload();
  await page.getByLabel("Snippet đã lưu").click();
  await page.getByRole("option", { name: "e2e-snippet" }).click();
  await expect(page.locator(".monaco-editor")).toContainText("0.8");
});

  // The reason preset values are namespaced "p:<slug>" and snippets "u:<id>".
  // If loading a preset rebound the current snippet id, this Save would
  // silently overwrite e2e-snippet instead of forking — data loss that looks
  // like a UI quirk.
  test("saving while a preset is open forks instead of overwriting", async ({
    page,
  }) => {
    await page.goto("/vi/playground");
    await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
    await applyShader(page, "void broken(", "compile-errors");
    await applyShader(
      page,
      "void main() {\n  fragColor = vec4(0.11, 0.22, 0.33, 1.0);\n}",
      "compile-ok",
    );
    await page.getByRole("button", { name: "Lưu" }).click();
    await page.getByLabel("Tên snippet").fill("fork-origin");
    await page.getByRole("dialog").getByRole("button", { name: "Lưu" }).click();
    await expect(page.getByText("Đã lưu snippet")).toBeVisible();

    await page.getByLabel("Snippet đã lưu").click();
    await page.getByRole("option", { name: PRESET_GROUPS[0]!.presets[0]!.title.vi }).click();
    await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Lưu" }).click();
    await page.getByLabel("Tên snippet").fill("fork-copy");
    await page.getByRole("dialog").getByRole("button", { name: "Lưu" }).click();
    await expect(page.getByText("Đã lưu snippet")).toBeVisible();

    // The original must still hold its own source, untouched by either step.
    await page.getByLabel("Snippet đã lưu").click();
    await page.getByRole("option", { name: "fork-origin" }).click();
    await expect(page.locator(".monaco-editor")).toContainText("0.11");
  });
});

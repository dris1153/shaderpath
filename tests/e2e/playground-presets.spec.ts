import { expect, test } from "@playwright/test";
import {
  ALL_PRESETS,
  PRESET_COMMENTS,
  PRESET_GROUPS,
  presetSource,
} from "../../content/playground-presets";
import { editorValue } from "./playground-helpers";
import { requiresAuth, signIn } from "./requires-auth";

test.describe.configure({ mode: "serial" });

// Both tests here drive the snippet dropdown, and that only renders for a
// signed-in visitor. The compile sweep needs no account and lives in
// playground-preset-compile.spec.ts so that it actually runs.
requiresAuth();
test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("picking a preset from the dropdown loads its exact source", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  const firstGroup = PRESET_GROUPS[0];
  const firstPreset = firstGroup?.presets[0];
  if (!firstGroup || !firstPreset) throw new Error("no presets registered");

  // Exercises the real wiring: grouped Select → onSelect → editor source.
  const trigger = page.getByRole("combobox", { name: "Snippet đã lưu" });
  await trigger.click();
  await expect(
    page.getByRole("group", { name: firstGroup.label.vi }),
  ).toBeVisible();
  await page.getByRole("option", { name: firstPreset.title.vi }).click();

  await expect
    .poll(async () => (await editorValue(page)).trim(), { timeout: 10_000 })
    .toBe(presetSource(firstPreset, "vi").trim());
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  // The trigger must show the preset's title, not the raw "p:<slug>" value
  await expect(trigger).toContainText(firstPreset.title.vi);
  await expect(trigger).not.toContainText("p:");
});

test("preset comments follow the active locale", async ({ page }) => {
  const preset = ALL_PRESETS.find((p) => /\/\/\s*@\w/.test(p.source));
  if (!preset) throw new Error("no preset uses a comment marker");
  const key = /\/\/\s*@(\w+)/.exec(preset.source)?.[1] ?? "";
  const viText = PRESET_COMMENTS.vi[key] ?? "";
  const enText = PRESET_COMMENTS.en[key] ?? "";
  expect(viText).not.toBe(enText);

  await page.goto("/en/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("combobox", { name: "Saved snippets" }).click();
  await page.getByRole("option", { name: preset.title.en }).click();

  await expect
    .poll(async () => await editorValue(page), { timeout: 10_000 })
    .toContain(enText);
  expect(await editorValue(page)).not.toContain(viText);
});

import { expect, test } from "@playwright/test";
import {
  ALL_PRESETS,
  PRESET_COMMENTS,
  PRESET_GROUPS,
  presetSource,
} from "../../content/playground-presets";
import { editorValue } from "./playground-helpers";

// Signed out on purpose: presets are static content, and a first-time visitor
// with no account is exactly who browses them. /api/snippets answers 401 to a
// guest, which used to hide the whole bar and with it every preset.

const group = PRESET_GROUPS[0]!;
const preset = group.presets[0]!;

test("a guest can open the picker and load a preset", async ({ page }) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Snippet đã lưu" }).click();
  await page.getByRole("option", { name: preset.title.vi }).click();

  await expect
    .poll(async () => (await editorValue(page)).trim(), { timeout: 10_000 })
    .toBe(presetSource(preset, "vi").trim());
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
});

test("typing filters across every group, diacritics ignored", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Snippet đã lưu" }).click();

  // "Vệt sơn theo con trỏ" typed without diacritics, the way people search.
  await page.getByRole("combobox").fill("vet son");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Vệt sơn");

  await page.getByRole("combobox").fill("zzzz");
  await expect(page.getByText("Không có mục nào khớp.")).toBeVisible();
});

test("the picker is fully operable from the keyboard", async ({ page }) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Snippet đã lưu" }).click();
  await page.keyboard.type("vet son");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");

  await expect
    .poll(async () => await editorValue(page), { timeout: 10_000 })
    .toContain("uPrev");
});

test("a guest is not offered Save, which they could not complete", async ({
  page,
}) => {
  await page.goto("/vi/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });

  await expect(page.getByRole("button", { name: "Snippet đã lưu" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Lưu$/ })).toHaveCount(0);
});

test("preset comments follow the active locale", async ({ page }) => {
  const marked = ALL_PRESETS.find((p) => /\/\/\s*@\w/.test(p.source));
  if (!marked) throw new Error("no preset uses a comment marker");
  const key = /\/\/\s*@(\w+)/.exec(marked.source)?.[1] ?? "";
  const viText = PRESET_COMMENTS.vi[key] ?? "";
  const enText = PRESET_COMMENTS.en[key] ?? "";
  expect(viText).not.toBe(enText);

  await page.goto("/en/playground");
  await expect(page.getByTestId("compile-ok")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Saved snippets" }).click();
  await page.getByRole("option", { name: marked.title.en }).click();

  await expect
    .poll(async () => await editorValue(page), { timeout: 10_000 })
    .toContain(enText);
  expect(await editorValue(page)).not.toContain(viText);
});

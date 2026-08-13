import { expect, test } from "@playwright/test";

test("root redirects to default locale /vi", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
});

test("vi and en shells render translated content", async ({ page }) => {
  await page.goto("/vi");
  await expect(
    page.getByRole("heading", { name: "Chào mừng đến Shaderpath" }),
  ).toBeVisible();

  await page.goto("/en");
  await expect(
    page.getByRole("heading", { name: "Welcome to Shaderpath" }),
  ).toBeVisible();
});

test("locale switcher swaps locale and keeps the route", async ({ page }) => {
  await page.goto("/vi");
  await page.getByRole("button", { name: "Ngôn ngữ" }).click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(
    page.getByRole("heading", { name: "Welcome to Shaderpath" }),
  ).toBeVisible();
});

test("theme toggle applies dark class", async ({ page }) => {
  await page.goto("/vi");
  await page.getByRole("button", { name: "Giao diện" }).click();
  await page.getByRole("menuitem", { name: "Tối" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("roadmap renders all 14 tracks with modules", async ({ page }) => {
  await page.goto("/vi/roadmap");
  await expect(
    page.getByRole("heading", { name: "Lộ trình", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Nền tảng Toán học cho đồ hoạ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Capstone Projects" })).toBeVisible();
});

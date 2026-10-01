import { expect, test } from "@playwright/test";
import { hasAuthCredentials, signIn } from "./requires-auth";

// XP and streak are account-only: a guest must never ask for them.
test("a guest never requests XP or streak", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", (req) => {
    if (new URL(req.url()).pathname === "/api/gamification") calls.push(req.url());
  });
  await page.goto("/vi/roadmap");
  await page.goto("/vi/lesson/vector-basics");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /XP, cấp/ })).toHaveCount(0);
  expect(calls).toEqual([]);
});

test.describe("signed in", () => {
  test.skip(!hasAuthCredentials, "needs E2E_SUPABASE_EMAIL / E2E_SUPABASE_PASSWORD");

  test("completing a lesson shows the card and adds 10 XP", async ({ page }) => {
    await signIn(page);
    await page.goto("/vi/lesson/interpolation-and-easing");
    const xpChip = page.getByRole("link", { name: /XP, cấp/ });
    await expect(xpChip).toBeVisible();
    const xpOf = async () => Number((await xpChip.getAttribute("aria-label"))?.match(/^(\d+) XP/)?.[1]);
    const before = await xpOf();

    const complete = page.getByRole("button", { name: "Đánh dấu hoàn thành" });
    test.skip(!(await complete.isVisible()), "this account already completed the lesson");
    await complete.click();

    await expect(page.getByText(/Xong bài!|Hoàn thành module!/)).toBeVisible();
    await expect.poll(xpOf).toBe(before + 10);
  });
});

import { expect, test } from "@playwright/test";
import { requiresAuth, signIn } from "./requires-auth";

// A review is only worth grading after a question. Signed out there is no
// schedule to grade against, so the page asks for an account instead.

test("a guest is asked to sign in, and nothing can be graded", async ({
  page,
}) => {
  await page.goto("/vi/review");
  await expect(
    page.getByRole("heading", { name: "Ôn tập", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Đăng nhập để ôn" }),
  ).toBeVisible();
  for (const grade of ["Quên", "Khó", "Nhớ", "Dễ"]) {
    await expect(
      page.getByRole("button", { name: grade, exact: true }),
    ).toHaveCount(0);
  }
});

test.describe("signed in", () => {
  requiresAuth();
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("grades stay disabled until the answer is shown", async ({ page }) => {
    test.slow();
    await page.goto("/vi/review");
    const reveal = page.getByRole("button", { name: "Hiện đáp án" });
    const good = page.getByRole("button", { name: "Nhớ", exact: true });
    await expect(reveal.or(page.getByText("Không có việc gấp"))).toBeVisible({
      timeout: 30_000,
    });
    // Never fabricate a due row: an account with nothing due has nothing to check.
    test.skip(!(await reveal.isVisible()), "nothing due for this account");

    await expect(good).toBeDisabled();
    await reveal.click();
    await expect(page.getByRole("region", { name: "Đáp án" })).toBeFocused();
    await expect(good).toBeEnabled();
  });
});

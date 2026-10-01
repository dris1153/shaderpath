import { expect, test } from "@playwright/test";

// Account-only pages must not fetch for a guest — no request means no 401 and
// no "failed to load" — and must say how to get an account instead.
const ACCOUNT_PAGES = [
  { path: "/vi/stats", heading: "Thống kê học tập" },
  { path: "/vi/notes", heading: "Ghi chú & Bookmark" },
  { path: "/vi/review", heading: "Ôn tập" },
];

for (const { path, heading } of ACCOUNT_PAGES) {
  test(`a guest on ${path} is asked to sign in and nothing is fetched`, async ({ page }) => {
    const dataCalls: string[] = [];
    page.on("request", (req) => {
      if (/\/api\/(stats|notes|dashboard)(\?|$)/.test(new URL(req.url()).pathname)) dataCalls.push(req.url());
    });
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng ký" })).toBeVisible();
    await expect(page.getByText("Không tải được nội dung")).toHaveCount(0);
    expect(dataCalls).toEqual([]);
  });
}

test("an unknown path renders the in-app 404", async ({ page }) => {
  const res = await page.goto("/vi/khong-co-trang-nay");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Trang này không tồn tại" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toBeVisible();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the tab bar reaches every destination and nothing overflows", async ({ page }) => {
    await page.goto("/vi/roadmap");
    const tabs = page.getByRole("navigation", { name: "Điều hướng chính" });
    for (const name of ["Học", "Ôn tập", "Playground", "Bạn"]) {
      await expect(tabs.getByRole("link", { name })).toBeVisible();
    }
    await expect(tabs.getByRole("link", { name: "Học" })).toHaveAttribute("aria-current", "page");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    await tabs.getByRole("link", { name: "Bạn" }).click();
    await expect(page).toHaveURL(/\/vi\/stats$/);
  });

  test("lesson pages leave the bottom bar to the lesson", async ({ page }) => {
    await page.goto("/vi/lesson/vector-basics");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toHaveCount(0);
  });
});

// The lesson's first paragraph is the point of the page: header, chips and
// notices must leave it above the fold, and the video must cost nothing until
// the reader asks for it.
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`the first lesson paragraph is above the fold at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/vi/lesson/vector-basics");
    const first = page.locator("article #lesson-body p").first();
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    expect(box?.y ?? Infinity).toBeLessThan(viewport.height);
  });
}

test("the lesson video loads nothing from YouTube until the chip and play are pressed", async ({ page }) => {
  const youtube: string[] = [];
  page.on("request", (req) => {
    if (/youtube|ytimg|googlevideo/.test(new URL(req.url()).hostname)) youtube.push(req.url());
  });
  await page.goto("/vi/lesson/vector-basics");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(youtube).toEqual([]);
  await page.getByRole("button", { name: "Xem video" }).click();
  await expect(page.getByRole("button", { name: /Phát video/ })).toBeVisible();
  expect(youtube).toEqual([]);
});

test.describe("mobile playground", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("switches between code and preview, one pane at a time", async ({ page }) => {
    await page.goto("/vi/playground");
    const editor = page.locator(".monaco-editor").first();
    const canvas = page.getByTestId("shader-canvas");
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await expect(canvas).toBeHidden();

    await page.getByRole("button", { name: "Xem trước", exact: true }).click();
    await expect(canvas).toBeVisible();
    await expect(editor).toBeHidden();

    await page.getByRole("button", { name: "Code", exact: true }).click();
    await expect(editor).toBeVisible();
  });
});

import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// §11.6-adjacent a11y gate: axe on every route class, serious/critical = hard
// fail. moderate/minor (e.g. content-MDX heading order — out of this phase's
// sweep scope, see phase-10 plan) are advisory: logged, never failing.
//
// Read-only: no lesson/exercise completions or note/bookmark writes here —
// tests/e2e/fresh-db-boot.spec.ts asserts a zero-progress dashboard and this
// file runs earliest alphabetically, so it must stay a pure navigation scan.

const BLOCKING_IMPACT = new Set(["serious", "critical"]);

async function scanBlocking(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter(
    (v) => v.impact && BLOCKING_IMPACT.has(v.impact),
  );
  const advisory = violations.filter(
    (v) => !v.impact || !BLOCKING_IMPACT.has(v.impact),
  );
  if (advisory.length > 0) {
    // moderate/minor only — not asserted, kept visible in CI output for triage.
    console.log(
      `[a11y] ${page.url()} — ${advisory.length} advisory violation(s):`,
      advisory.map((v) => `${v.id}(${v.impact ?? "n/a"}) x${v.nodes.length}`),
    );
  }
  return blocking;
}

const ROUTES: { name: string; path: string; heading: string }[] = [
  { name: "home (signed out)", path: "/vi", heading: "Cái đang chuyển động sau chữ này, bạn sẽ tự viết được." },
  { name: "roadmap", path: "/vi/roadmap", heading: "Lộ trình" },
  {
    name: "track",
    path: "/vi/track/math",
    heading: "Nền tảng Toán học cho đồ hoạ",
  },
  {
    name: "lesson (theory)",
    path: "/vi/lesson/cartesian-and-uv-space",
    heading: "Toạ độ Descartes & UV space",
  },
  { name: "playground", path: "/vi/playground", heading: "GLSL Playground" },
  { name: "notes", path: "/vi/notes", heading: "Ghi chú & Bookmark" },
  { name: "review", path: "/vi/review", heading: "Ôn tập" },
  { name: "stats", path: "/vi/stats", heading: "Thống kê học tập" },
  { name: "settings", path: "/vi/settings", heading: "Cài đặt" },
  { name: "login", path: "/vi/login", heading: "Đăng nhập" },
  { name: "register", path: "/vi/register", heading: "Tạo tài khoản" },
  { name: "lesson (video, demo, exercises)", path: "/vi/lesson/vector-basics", heading: "Vector cơ bản" },
  { name: "not found", path: "/vi/khong-co-trang-nay", heading: "Trang này không tồn tại" },
];

// Every route in both themes and at desktop and phone width; the Arcade tokens
// are checked on the rendered colours, not on paper.
const MATRIX = [
  { name: "light desktop", colorScheme: "light", viewport: { width: 1440, height: 900 } },
  { name: "dark desktop", colorScheme: "dark", viewport: { width: 1440, height: 900 } },
  { name: "light mobile", colorScheme: "light", viewport: { width: 390, height: 844 } },
  { name: "dark mobile", colorScheme: "dark", viewport: { width: 390, height: 844 } },
] as const;

for (const mode of MATRIX) {
  test.describe(mode.name, () => {
    test.use({ colorScheme: mode.colorScheme, viewport: mode.viewport });

    for (const route of ROUTES) {
      test(`axe: ${route.name} (${route.path}) has no serious/critical violations`, async ({
        page,
      }) => {
        await page.goto(route.path);
        await expect(
          page.getByRole("heading", { name: route.heading, exact: true }).first(),
        ).toBeVisible();

        if (route.path === "/vi/playground") {
          // Let Monaco fully mount so its own ARIA surface (ariaLabel option) is scanned too.
          await page
            .waitForSelector(".monaco-editor", { state: "attached", timeout: 15_000 })
            .catch(() => {});
        }
        await page.waitForTimeout(500);

        const blocking = await scanBlocking(page);
        expect(
          blocking,
          blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`).join("\n"),
        ).toEqual([]);
      });
    }
  });
}

// Reduced motion must not hide anything or break contrast.
test.describe("reduced motion", () => {
  test("home has no serious/critical violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/vi");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(500);
    expect(await scanBlocking(page)).toEqual([]);
  });
});

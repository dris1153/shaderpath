import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

// Reports display-math blocks that overflow their column. KaTeX refuses to wrap
// display math, so a formula that is too wide either scrolls (fine on a phone,
// ugly on a desktop) or, before the globals.css fix, painted over the TOC.
// Run against an already-running server: pnpm audit:math [baseUrl]
// The lesson list is derived from the content, so new lessons are covered
// automatically.

const BASE = process.argv[2] ?? "http://localhost:3000";
const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

function lessonsWithDisplayMath(): string[] {
  const slugs: string[] = [];
  for (const track of fs.readdirSync(LESSONS_DIR)) {
    if (track.startsWith("_")) continue;
    for (const slug of fs.readdirSync(path.join(LESSONS_DIR, track))) {
      const file = path.join(LESSONS_DIR, track, slug, "theory.vi.mdx");
      if (fs.existsSync(file) && fs.readFileSync(file, "utf8").includes("$$")) {
        slugs.push(slug);
      }
    }
  }
  return slugs;
}

interface Overflow {
  slug: string;
  locale: string;
  viewport: string;
  overflowPx: number;
  formula: string;
}

async function measure(
  page: Page,
  slug: string,
  locale: string,
  viewport: string,
): Promise<Overflow[]> {
  await page.goto(`${BASE}/${locale}/lesson/${slug}`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".katex-display").first().waitFor({ timeout: 30_000 });
  // KaTeX lays out with web fonts; measuring before they land reports garbage.
  await page.evaluate(() => document.fonts.ready);

  const found = await page.evaluate(() =>
    [...document.querySelectorAll(".katex-display")]
      .map((el) => ({
        overflowPx: Math.round(el.scrollWidth - el.clientWidth),
        formula: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
      }))
      .filter((r) => r.overflowPx > 1),
  );
  return found.map((f) => ({ slug, locale, viewport, ...f }));
}

async function main() {
  const slugs = lessonsWithDisplayMath();
  console.log(`${slugs.length} lessons with display math, 2 locales, 2 viewports`);

  const browser = await chromium.launch();
  const results: Overflow[] = [];

  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    for (const slug of slugs) {
      for (const locale of ["vi", "en"]) {
        results.push(...(await measure(page, slug, locale, viewport.name)));
      }
    }
    await page.close();
  }
  await browser.close();

  for (const viewport of VIEWPORTS) {
    const rows = results
      .filter((r) => r.viewport === viewport.name)
      .sort((a, b) => b.overflowPx - a.overflowPx);
    console.log(`\n=== ${viewport.name} (${viewport.width}px): ${rows.length} overflowing ===`);
    // Both locales overflow identically for the same formula; show it once.
    const seen = new Set<string>();
    for (const r of rows) {
      const key = `${r.slug}|${r.formula}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`${String(r.overflowPx).padStart(5)}px  ${r.slug}  ${r.formula}`);
    }
  }
}

void main();

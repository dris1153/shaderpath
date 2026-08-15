import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

// Reports lesson demos that draw nothing. The e2e suite already proves a demo is
// *alive* — the frame counter ticks, and it freezes off-screen — but liveness is
// not output: a canvas whose camera never got a projection matrix pumps frames
// forever while showing an empty box. That gap let a whole class of blank demos
// ship green, so this measures the composited pixels instead.
// Run against a running server: pnpm audit:demos [baseUrl] [limit]

const BASE = process.argv[2] ?? "http://localhost:3100";
const LIMIT = Number(process.argv[3] ?? 999);
// A canvas showing only the container behind it lands in the twenties; anything
// actually drawn clears 150. The gap is wide, so the threshold is not delicate.
const MIN_SPREAD = 40;

const REGISTRY = path.join(process.cwd(), "content", "demo-registry.generated.ts");

function demoSlugs(): string[] {
  const src = fs.readFileSync(REGISTRY, "utf8");
  return [...src.matchAll(/"([a-z0-9-]+)":\s*\(\)/g)]
    .map((m) => m[1])
    .filter((s): s is string => s !== undefined)
    .slice(0, LIMIT);
}

async function spreadOf(page: Page): Promise<number> {
  const container = page.locator("[data-demo-container]").first();
  if ((await container.count()) === 0) return -1;
  await container.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // Track 5 animates the DOM, so those demos have no canvas at all — measure
  // whatever the container shows rather than calling them broken.
  const canvas = container.locator("canvas").first();
  const target = (await canvas.count()) > 0 ? canvas : container;
  const shot = (await target.screenshot()).toString("base64");

  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    if (!ctx) return -1;
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    let widest = 0;
    for (let channel = 0; channel < 3; channel++) {
      let lo = 255;
      let hi = 0;
      // Prime stride: sample the whole canvas without aliasing against rows.
      for (let i = channel; i < px.length; i += 4 * 53) {
        const v = px[i] ?? 0;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      widest = Math.max(widest, hi - lo);
    }
    return widest;
  }, shot);
}

async function main() {
  const slugs = demoSlugs();
  console.log(`checking ${slugs.length} lesson demos against ${BASE}`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const shaderErrors = new Set<string>();
  page.on("console", (m) => {
    if (m.type() === "error" && /Shader Error|WebGLProgram/.test(m.text())) {
      shaderErrors.add(m.text().split("\n")[0]?.slice(0, 100) ?? "");
    }
  });

  const blank: string[] = [];
  for (const slug of slugs) {
    await page.goto(`${BASE}/vi/lesson/${slug}`, { waitUntil: "domcontentloaded" });
    const spread = await spreadOf(page);
    if (spread < MIN_SPREAD) {
      blank.push(slug);
      console.log(`BLANK  spread=${String(spread).padStart(4)}  ${slug}`);
    }
  }
  await browser.close();

  console.log(`\n${blank.length} of ${slugs.length} demos draw nothing`);
  if (shaderErrors.size > 0) {
    console.log("shader errors seen:\n  " + [...shaderErrors].join("\n  "));
  }
  if (blank.length > 0) process.exit(1);
}

void main();

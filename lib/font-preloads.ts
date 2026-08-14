import fs from "node:fs";
import path from "node:path";

// Next 16 (Turbopack) does not emit <link rel="preload"> for next/font files
// even though it marks them with the `-s.p.` infix. Late-arriving text fonts
// re-record LCP on every page, so we recover the hashed URLs from the built
// CSS once per server process and let the layout hoist explicit preloads.
let cached: string[] | null = null;

export function getFontPreloadHrefs(): string[] {
  if (cached) return cached;
  const found = new Set<string>();
  try {
    const dir = path.join(process.cwd(), ".next", "static", "chunks");
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".css")) continue;
      const css = fs.readFileSync(path.join(dir, file), "utf8");
      for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
        const face = block[1];
        if (!face) continue;
        const url = /url\((\.\.\/media\/[^)]+-s\.p\.[^)]+\.woff2)\)/.exec(
          face,
        )?.[1];
        const range = /unicode-range:([^;]+)/.exec(face)?.[1];
        if (!url || !range) continue;
        const href = url.replace("../media/", "/_next/static/media/");
        // Only the text-critical subsets: Vietnamese (U+1EA0…) and base latin.
        if (/U\+1EA0/i.test(range) || /U\+0000-00FF/i.test(range)) {
          found.add(href);
        }
      }
    }
  } catch {
    // Dev server / missing build output — preloads are a prod optimization.
  }
  cached = [...found];
  return cached;
}

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { renderStill } from "@remotion/renderer";
import { CHROMIUM, outDir, ROOT, withComposition } from "./remotion";

// pnpm thumbnail <slug> --lines "PIXEL|→ UV|→ NDC" [--code "u = (x + 0.5) / W"] [--bg <file under public/>] [--out <name>]
// Renders the "thumbnail" composition to out/<slug>/<name>.png (1280×720, under YouTube's 2 MB).
const USAGE = 'pnpm thumbnail <slug> --lines "A|B|C" [--code <text>] [--bg <file under public/>] [--out <name>]';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    lines: { type: "string" },
    code: { type: "string" },
    bg: { type: "string" },
    out: { type: "string", default: "thumbnail" },
  },
});
const [slug] = positionals;
if (!slug || !values.lines) {
  console.error(`usage: ${USAGE}`);
  process.exit(1);
}
if (values.bg && !fs.existsSync(path.join(ROOT, "public", values.bg))) {
  throw new Error(`no background at public/${values.bg}`);
}
const props = { lines: values.lines.split("|"), code: values.code, background: values.bg };

await withComposition("thumbnail", "en", async ({ serveUrl, browser, composition, inputProps }) => {
  const output = path.join(outDir(slug, "en"), "..", `${values.out}.png`);
  await renderStill({ serveUrl, composition, inputProps, frame: 0, output, puppeteerInstance: browser, chromiumOptions: CHROMIUM });
  console.log(`done → ${path.relative(process.cwd(), output)} (${Math.round(fs.statSync(output).size / 1024)} KB)`);
}, props);

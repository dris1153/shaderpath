import fs from "node:fs";
import path from "node:path";
import { renderStill } from "@remotion/renderer";
import { CHROMIUM, outDir, parseArgs, withComposition } from "./remotion";

// pnpm stills <slug> <locale> <frame,frame,...>
const usage = "pnpm stills <slug> <locale> <frame,frame,...>";
const [slug, locale, frameList] = parseArgs(usage, 3) as [string, string, string];
if (!/^\d+(,\d+)*$/.test(frameList)) {
  console.error(`bad frame list "${frameList}"\nusage: ${usage}`);
  process.exit(1);
}
const frames = frameList.split(",").map(Number);

const rendered = await withComposition(slug, locale, async ({ serveUrl, browser, composition, inputProps }) => {
  const dir = path.join(outDir(slug, locale), "stills");
  fs.mkdirSync(dir, { recursive: true });
  let count = 0;
  for (const frame of frames) {
    if (frame >= composition.durationInFrames) {
      console.warn(`skip frame ${frame}: last frame is ${composition.durationInFrames - 1}`);
      continue;
    }
    const output = path.join(dir, `f${String(frame).padStart(5, "0")}.png`);
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      frame,
      output,
      puppeteerInstance: browser,
      chromiumOptions: CHROMIUM,
    });
    console.log(path.relative(process.cwd(), output));
    count++;
  }
  return count;
});
if (rendered === 0) process.exitCode = 1;

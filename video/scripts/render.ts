import fs from "node:fs";
import path from "node:path";
import { renderMedia } from "@remotion/renderer";
import type { Timing } from "../src/scene/timing";
import { CHROMIUM, ffmpeg, generatedDir, outDir, parseArgs, withComposition } from "./remotion";

// pnpm render <slug> [locale]
// final.mp4 = picture + voice (preview); video.mp4 = the same picture with the
// audio stream dropped, so languages only swap the voice and subtitle files.
const [slug, locale = "en"] = parseArgs("pnpm render <slug> [locale]", 1) as [string, string?];
const out = outDir(slug, locale);
const final = path.join(out, "final.mp4");

await withComposition(slug, locale, async ({ serveUrl, browser, composition, inputProps }) => {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  let lastLogged = -1;
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: "h264",
    outputLocation: final,
    puppeteerInstance: browser,
    chromiumOptions: CHROMIUM,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== lastLogged) {
        lastLogged = pct;
        process.stdout.write(`render ${pct}%\n`);
      }
    },
  });

  ffmpeg(["-y", "-loglevel", "error", "-i", final, "-an", "-c:v", "copy", path.join(out, "video.mp4")]);

  const timing = (composition.props as { timing: Timing }).timing;
  const src = generatedDir(slug, locale);
  for (const file of ["timing.json", "subs.vtt", timing.audio]) {
    if (file && fs.existsSync(path.join(src, file))) {
      fs.copyFileSync(path.join(src, file), path.join(out, file));
    }
  }
});
console.log(`done → ${path.relative(process.cwd(), out)}`);

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";
import { MEDIA_SHARED } from "./lesson-assets";
import { ffmpeg, outDir, parseArgs, ROOT } from "./remotion";

// pnpm outro [lang ...]   (default: en vi)
// Renders the `dummy` fixture, whose last scene is the shared outro, and cuts that
// scene (picture + voice, 14 s) into media/shared/outro/outro.<lang>.mp4 (gitignored: videos are not pushed).
const langs = process.argv.length > 2 ? parseArgs("pnpm outro [lang ...]", 0) : ["en", "vi"];
const target = path.join(MEDIA_SHARED, "outro");
fs.mkdirSync(target, { recursive: true });

for (const lang of langs) {
  // Same entry point a human would use, so the render is the one QC and the lessons see.
  execFileSync("pnpm", ["render", "dummy", lang], { cwd: ROOT, stdio: "inherit", shell: true });
  const dir = outDir("dummy", lang);
  const timing = JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;
  const scene = timing.scenes.find((s) => s.id === "outro");
  if (!scene) throw new Error(`dummy/${lang} has no outro scene; does its script set "outro: true"?`);
  const start = scene.from / timing.fps;
  const seconds = scene.durationInFrames / timing.fps;
  const output = path.join(target, `outro.${lang}.mp4`);
  // Seeking after -i is frame-accurate, and re-encoding keeps the cut on a clean frame.
  ffmpeg([
    "-y", "-loglevel", "error", "-i", path.join(dir, "final.mp4"), "-ss", start.toFixed(4), "-t", seconds.toFixed(4),
    "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", output,
  ]);
  console.log(`${lang}: ${seconds.toFixed(2)} s → ${path.relative(process.cwd(), output)} (${Math.round(fs.statSync(output).size / 1024)} KB)`);
}

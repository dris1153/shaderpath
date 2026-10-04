import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";
import { CONTENT_SHARED, MEDIA_SHARED } from "./lesson-assets";
import { audioSeconds, ffmpeg, generatedDir, outDir, parseArgs, ROOT } from "./remotion";

// pnpm outro [lang ...]   (default: en vi)
// The outro is one picture with a voice per language, like every lesson. This renders
// the `dummy` fixture (its last scene is the shared outro) once, in English, and cuts
// that scene's frame range into:
//   media/shared/outro/outro.mp4              the silent picture (gitignored: videos are not pushed)
//   content/shared/outro/outro.<lang>.mp3     each language's voice over the same range
// Every language is fitted to the English picture, so one range serves them all.
const langs = process.argv.length > 2 ? parseArgs("pnpm outro [lang ...]", 0) : ["en", "vi"];
const readTiming = (lang: string) => JSON.parse(fs.readFileSync(path.join(generatedDir("dummy", lang), "timing.json"), "utf8")) as Timing;
const outroOf = (t: Timing) => t.scenes.find((s) => s.id === "outro");
const totalSec = (t: Timing) => t.scenes.reduce((n, s) => n + s.durationInFrames, 0) / t.fps;
const masterTiming = readTiming("en");
for (const lang of langs) {
  const voice = path.join(generatedDir("dummy", lang), "voice.mp3");
  if (!fs.existsSync(voice)) throw new Error(`no dummy voice for "${lang}": run pnpm tts dummy ${lang} (--fit en for other languages)`);
  // The English range is cut from every voice, so each must be fitted to the same picture.
  const mine = outroOf(readTiming(lang));
  const want = outroOf(masterTiming);
  if (mine?.from !== want?.from || mine?.durationInFrames !== want?.durationInFrames) {
    throw new Error(`dummy/${lang} is not fitted to the English picture: run pnpm tts dummy ${lang} --fit en --model <model>`);
  }
  if (Math.abs(audioSeconds(voice) - totalSec(masterTiming)) > 0.06) {
    throw new Error(`dummy/${lang}/voice.mp3 does not match the picture length: re-run pnpm tts dummy ${lang}`);
  }
}

// Same entry point a human would use, so the render is the one QC and the lessons see.
execFileSync("pnpm", ["render", "dummy", "en"], { cwd: ROOT, stdio: "inherit", shell: true });
const dir = outDir("dummy", "en");
const timing = JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;
const scene = timing.scenes.find((s) => s.id === "outro");
if (!scene) throw new Error('dummy has no outro scene; does its script set "outro: true"?');
const start = (scene.from / timing.fps).toFixed(4);
const seconds = (scene.durationInFrames / timing.fps).toFixed(4);
const size = (file: string) => `${Math.round(fs.statSync(file).size / 1024)} KB`;

const picture = path.join(MEDIA_SHARED, "outro", "outro.mp4");
fs.mkdirSync(path.dirname(picture), { recursive: true });
// Seek just before the first frame (Remotion's ffmpeg has no setpts) so it keeps pts 0, and
// fix the frame count, so the cut is exactly the scene's frames whatever the rounding.
ffmpeg([
  "-y", "-loglevel", "error", "-i", path.join(dir, "final.mp4"),
  "-ss", ((scene.from - 0.05) / timing.fps).toFixed(4), "-frames:v", String(scene.durationInFrames),
  "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", picture,
]);
console.log(`picture: ${seconds} s → ${path.relative(process.cwd(), picture)} (${size(picture)})`);

fs.mkdirSync(path.join(CONTENT_SHARED, "outro"), { recursive: true });
for (const lang of langs) {
  const output = path.join(CONTENT_SHARED, "outro", `outro.${lang}.mp3`);
  ffmpeg([
    "-y", "-loglevel", "error", "-i", path.join(generatedDir("dummy", lang), "voice.mp3"), "-ss", start, "-t", seconds,
    "-c:a", "libmp3lame", "-b:a", "128k", output,
  ]);
  console.log(`${lang}: ${seconds} s → ${path.relative(process.cwd(), output)} (${size(output)})`);
}

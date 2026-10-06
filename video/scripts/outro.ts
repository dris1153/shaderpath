import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";
import { CONTENT_SHARED } from "./lesson-assets";
import { buildOutroClip } from "./outro-clip";
import { audioSeconds, generatedDir, outDir, parseArgs } from "./remotion";

// pnpm outro [lang ...]   (default: en vi)
// Collects the `outro` fixture (pnpm tts outro <lang>, pnpm render outro) into content/shared/outro/,
// the committed clip every lesson with `outro: true` is joined with:
//   outro.mp4          the silent 2560x1440 picture, byte copy of the render (no re-encode)
//   outro.<lang>.mp3   the voice, copied as voiced (lessons re-encode only after the join)
//   outro.<lang>.vtt   the subtitles, times from 0
//   outro.json         frames, fps, cue frames: the source for outroAt, the chapter and the end screen
// English always goes along: outro.mp4 and outro.json are rewritten every time, so a stale English voice would desync.
const langs = [...new Set(["en", ...(process.argv.length > 2 ? parseArgs("pnpm outro [lang ...]", 0) : ["vi"])])];
const readTiming = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;

const pictureDir = outDir("outro", "en");
const clip = buildOutroClip(readTiming(pictureDir));
const generatedEn = readTiming(generatedDir("outro", "en"));
if (JSON.stringify(buildOutroClip(generatedEn)) !== JSON.stringify(clip)) {
  throw new Error("out/outro/en is older than the English voice: run pnpm render outro");
}
const seconds = clip.frames / clip.fps;
const picture = path.join(pictureDir, "video.mp4");
if (Math.abs(audioSeconds(picture) - seconds) > 0.05) {
  throw new Error("out/outro/en/video.mp4 does not match the timing: run pnpm render outro");
}

for (const lang of langs) {
  const dir = generatedDir("outro", lang);
  // Every language is fitted to the English picture, so one clip length serves them all.
  if (JSON.stringify(buildOutroClip(readTiming(dir))) !== JSON.stringify(clip)) {
    throw new Error(`outro/${lang} is not fitted to the English picture: run pnpm tts outro ${lang} --fit en --model <model>`);
  }
  if (Math.abs(audioSeconds(path.join(dir, "voice.mp3")) - seconds) > 0.06) {
    throw new Error(`outro/${lang}/voice.mp3 does not match the picture length: re-run pnpm tts outro ${lang}`);
  }
}

const target = path.join(CONTENT_SHARED, "outro");
fs.mkdirSync(target, { recursive: true });
const kb = (file: string) => `${Math.round(fs.statSync(file).size / 1024)} KB`;
const put = (from: string, name: string) => {
  const to = path.join(target, name);
  fs.copyFileSync(from, to);
  console.log(`${name} (${kb(to)})`);
};
put(picture, "outro.mp4");
for (const lang of langs) {
  put(path.join(generatedDir("outro", lang), "voice.mp3"), `outro.${lang}.mp3`);
  put(path.join(generatedDir("outro", lang), "subs.vtt"), `outro.${lang}.vtt`);
}
fs.writeFileSync(path.join(target, "outro.json"), `${JSON.stringify(clip, null, 2)}\n`);
console.log(`outro.json: ${clip.frames} frames at ${clip.fps} fps (${seconds.toFixed(2)} s)`);

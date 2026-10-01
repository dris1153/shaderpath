import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";
import { ffmpeg, generatedDir, lessonSource, outDir, parseArgs, ROOT } from "./remotion";
import { readYoutubeSource, renderMetadata, validateYoutube, type Loc } from "./youtube-meta";

// pnpm youtube <slug>
// out/<slug>/youtube/ — everything one YouTube upload needs:
//   upload.mp4        the English render (picture + English voice): upload this
//   subs.<lang>.vtt   every language: Studio → Languages → add subtitles
//   audio.<lang>.mp3  each fitted language, for channels with multi-language audio (Studio → Languages → Dub)
//   preview.<lang>.mp4  the same picture with that language's voice, to listen to.
//                     For a separate upload, render the language instead
//                     (pnpm render <slug> <lang>): Inko's mouth then follows its words.
//   metadata.md       titles, descriptions (chapters, links), tags and timed quizzes,
//                     from the lesson's video/youtube.json and the English timing
// It also writes each language's site dub to ../public/videos/<slug>/audio.<lang>.mp3.
const [slug] = parseArgs("pnpm youtube <slug>", 1) as [string];
const master = outDir(slug, "en");
const upload = path.join(master, "final.mp4");
if (!fs.existsSync(upload)) throw new Error(`no English render at ${upload}; run pnpm render ${slug} en`);
const readTiming = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;
const timing = readTiming(master);
const scenes = JSON.stringify(timing.scenes);

// Everything is checked, and the metadata rendered, before the old upload set is touched.
const generated = path.join(ROOT, "public", "generated", slug);
const langs = fs
  .readdirSync(generated)
  .filter((lang) => lang !== "en" && fs.existsSync(path.join(generatedDir(slug, lang), "voice.mp3")));
for (const lang of langs) {
  // A language voiced without --fit has its own scene lengths and cannot share the picture.
  if (JSON.stringify(readTiming(generatedDir(slug, lang)).scenes) !== scenes) {
    throw new Error(`${lang} is not fitted to the English picture; run pnpm tts ${slug} ${lang} --fit en --model <model>`);
  }
}
const sourceFile = path.join(lessonSource(slug), "youtube.json");
const source = fs.existsSync(sourceFile) ? validateYoutube(readYoutubeSource(sourceFile), timing) : null;
const metadata = source ? renderMetadata(source, timing, slug, langs as Loc[]) : null;

const dest = outDir(slug, "youtube");
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(upload, path.join(dest, "upload.mp4"));
fs.copyFileSync(path.join(master, "subs.vtt"), path.join(dest, "subs.en.vtt"));
for (const lang of langs) {
  const dir = generatedDir(slug, lang);
  fs.copyFileSync(path.join(dir, "voice.mp3"), path.join(dest, `audio.${lang}.mp3`));
  fs.copyFileSync(path.join(dir, "subs.vtt"), path.join(dest, `subs.${lang}.vtt`));
  ffmpeg([
    "-y", "-loglevel", "error", "-i", path.join(master, "video.mp4"), "-i", path.join(dir, "voice.mp3"),
    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    path.join(dest, `preview.${lang}.mp4`),
  ]);
  // The site plays this dub in sync with the YouTube embed (components/lesson/lesson-video.tsx);
  // speech needs no more than mono 64 kbps, which keeps the committed file near 2 MB.
  const web = path.join(ROOT, "..", "public", "videos", slug, `audio.${lang}.mp3`);
  fs.mkdirSync(path.dirname(web), { recursive: true });
  ffmpeg(["-y", "-loglevel", "error", "-i", path.join(dir, "voice.mp3"), "-ac", "1", "-b:a", "64k", "-ar", "44100", web]);
  console.log(`${lang}: audio, subtitles, preview, site dub (${Math.round(fs.statSync(web).size / 1024)} KB)`);
}
if (source && metadata) {
  fs.writeFileSync(path.join(dest, "metadata.md"), metadata);
  console.log(`metadata: titles, descriptions, ${timing.scenes.length} chapters, ${source.quizzes.length} quizzes`);
} else {
  console.warn(`no ${path.relative(process.cwd(), sourceFile)}: metadata.md skipped`);
}
console.log(`done → ${path.relative(process.cwd(), dest)}`);

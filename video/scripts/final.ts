import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { totalFrames, type Timing } from "../src/scene/timing";
import { finalsDir, mediaDir } from "./lesson-assets";
import { finalArgs, languageTag } from "./final-args";
import { assertJoinable, joinedFrames, joinPicture, lessonHasOutro, loadOutro, CLIP_DIR } from "./outro-join";
import { audioSeconds, outDir, parseArgs } from "./remotion";

// pnpm final <slug> [lang ...]   (default: en and every language in youtube/languages with a voice and subtitles)
// media/lessons/<track>/<slug>/youtube/final/video.<lang>.mp4: the English picture (out/<slug>/en/video.mp4)
// with that language's committed voice and subtitles, for sharing outside YouTube (a lesson with
// `outro: true` gets the shared outro clip joined after its picture first). Inko's mouth follows
// English in every file. It needs the system ffmpeg: Remotion's bundled build has no mov_text encoder.
const args = parseArgs("pnpm final <slug> [lang ...]", 1);
const slug = args[0]!;
const finals = finalsDir(slug);
const kit = mediaDir(slug);
if (!finals || !kit) throw new Error(`"${slug}" has no lesson folder (content/lessons/*/${slug}/)`);

const languages = path.join(finals, "languages");
const complete = (lang: string) =>
  ["audio.mp3", "subtitles.vtt"].every((file) => fs.existsSync(path.join(languages, lang, file)));
const found = fs.existsSync(languages) ? fs.readdirSync(languages).filter((l) => l !== "en" && complete(l)) : [];
const langs = [...new Set(args.length > 1 ? args.slice(1) : ["en", ...found])];

try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  throw new Error("pnpm final needs a full ffmpeg on PATH (see Setup in video/README.md)");
}

// Everything is checked before anything is written.
const lessonPicture = path.join(outDir(slug, "en"), "video.mp4");
if (!fs.existsSync(lessonPicture)) throw new Error(`no English picture at ${lessonPicture}; run pnpm render ${slug}`);
// The picture must be the take whose voice and subtitles are committed.
const readTiming = (file: string, hint: string) => {
  if (!fs.existsSync(file)) throw new Error(`no ${file}; ${hint}`);
  return fs.readFileSync(file);
};
const renderBytes = readTiming(path.join(outDir(slug, "en"), "timing.json"), `run pnpm render ${slug}`);
if (!renderBytes.equals(readTiming(path.join(languages, "en", "timing.json"), `run pnpm youtube ${slug}`))) {
  throw new Error(`the English render is older than its voice; run pnpm render ${slug}`);
}
const renderTiming = JSON.parse(renderBytes.toString("utf8")) as Timing;
const clip = lessonHasOutro(slug) ? loadOutro() : undefined;
if (clip) assertJoinable(slug, renderTiming, clip);
const pictureFrames = clip ? joinedFrames(renderTiming, clip) : totalFrames(renderTiming);
const pictureSeconds = pictureFrames / renderTiming.fps;

const jobs = langs.map((lang) => {
  languageTag(lang);
  const committed = path.join(languages, lang);
  if (!fs.existsSync(committed)) throw new Error(`no language folder ${committed}`);
  const audio = path.join(committed, "audio.mp3");
  if (!fs.existsSync(audio)) throw new Error(`no voice at ${audio}; run pnpm youtube ${slug}`);
  const subtitles = path.join(committed, "subtitles.vtt");
  if (!fs.existsSync(subtitles)) throw new Error(`no subtitles at ${subtitles}; run pnpm youtube ${slug}`);
  const voiceSeconds = audioSeconds(audio);
  if (Math.abs(voiceSeconds - pictureSeconds) > 0.1) {
    throw new Error(`the ${lang} voice is ${voiceSeconds.toFixed(2)} s but the picture is ${pictureSeconds.toFixed(2)} s; the voice must be fitted to the English picture (see docs/rule-render-video.md)`);
  }
  return { lang, audio, subtitles, output: path.join(kit, "final", `video.${lang}.mp4`) };
});

let picture = lessonPicture;
if (clip) {
  picture = path.join(outDir(slug, "en"), "video+outro.mp4");
  joinPicture(lessonPicture, path.join(CLIP_DIR, "outro.mp4"), picture, pictureFrames, renderTiming.fps);
}
fs.mkdirSync(path.join(kit, "final"), { recursive: true });
for (const { lang, audio, subtitles, output } of jobs) {
  execFileSync("ffmpeg", finalArgs(picture, audio, subtitles, output, lang), { stdio: "inherit" });
  console.log(`${lang}: ${path.relative(process.cwd(), output)} (${Math.round(fs.statSync(output).size / 1024 / 1024)} MB)`);
}

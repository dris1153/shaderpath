import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";
import { copyKit, finalsDir, mediaDir, mirrorLanguage, mirrorThumbnails } from "./lesson-assets";
import { ffmpeg, generatedDir, lessonSource, outDir, parseArgs, ROOT } from "./remotion";
import { outroAt, readYoutubeSource, renderMetadata, renderUploadNotes, validateYoutube, type Loc } from "./youtube-meta";

// pnpm youtube <slug>
// Writes everything one YouTube upload needs into the lesson's committed folder,
// content/lessons/<track>/<slug>/youtube/ (everything below except the video), then
// completes the gitignored upload kit media/lessons/<track>/<slug>/youtube/: the same
// tree plus
//   video.mp4                      the English render (picture + English voice): upload this
// Layout:
//   thumbnail.png                  chosen with `pnpm thumbnail <slug> --pick <n>`
//   thumbnail-src/                 the paid thumbnail backgrounds
//   upload-notes.md                language-neutral steps (end screen, outroAt); only with the shared outro
//   languages/<lang>/              metadata.md, subtitles.vtt, audio.mp3, timing.json, strings.json
//   languages/<lang>/site.mp3      each fitted language: mono 64 kbps, copied to public/videos/ at build
// Metadata comes from the lesson's video/youtube.json and the English timing.
// audio.mp3 also feeds Studio → Languages → Dub for channels with multi-language audio.
const [slug] = parseArgs("pnpm youtube <slug>", 1) as [string];
const finals = finalsDir(slug);
if (!finals) throw new Error(`"${slug}" has no lesson folder (content/lessons/*/${slug}/): fixtures cannot be packaged`);
const master = outDir(slug, "en");
const upload = path.join(master, "final.mp4");
if (!fs.existsSync(upload)) throw new Error(`no English render at ${upload}; run pnpm render ${slug} en`);
const readTiming = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;
const timing = readTiming(master);
const scenes = JSON.stringify(timing.scenes);
const stop = outroAt(timing);

// Everything is checked, and the metadata rendered, before any committed file is touched.
const generated = path.join(ROOT, "public", "generated", slug);
const langs = fs
  .readdirSync(generated)
  .filter((lang) => lang !== "en" && fs.existsSync(path.join(generatedDir(slug, lang), "voice.mp3")));
// The English files come from the cache but the upload and chapters from the render: they must be the same take.
if (!fs.readFileSync(path.join(generatedDir(slug, "en"), "timing.json")).equals(fs.readFileSync(path.join(master, "timing.json")))) {
  throw new Error(`English was re-voiced after the last render; run pnpm render ${slug} en`);
}
// A language that is committed but missing from the cache would be dropped from every description.
const committed = fs.existsSync(path.join(finals, "languages")) ? fs.readdirSync(path.join(finals, "languages")) : [];
const uncached = committed.filter((lang) => lang !== "en" && !langs.includes(lang));
if (uncached.length) throw new Error(`${uncached.join(", ")} is in ${path.relative(process.cwd(), finals)}/languages but not in the cache; run pnpm video:restore ${slug}`);
for (const lang of langs) {
  const fitted = readTiming(generatedDir(slug, lang));
  // A language voiced without --fit has its own scene lengths and cannot share the picture.
  if (JSON.stringify(fitted.scenes) !== scenes) {
    throw new Error(`${lang} is not fitted to the English picture; run pnpm tts ${slug} ${lang} --fit en --model <model>`);
  }
  // The site stops at the outro's first whole second, up to ~1 s early; a fit keeps only 0.5 s of tail.
  const cut = stop === undefined ? undefined : fitted.words.find((w) => w.scene !== "outro" && w.to > stop * fitted.fps);
  if (cut) console.warn(`${lang}: "${cut.text}" (${cut.scene}) runs past outroAt ${stop} s, so the site cuts it; shorten that scene's line`);
}
const sourceFile = path.join(lessonSource(slug), "youtube.json");
const source = fs.existsSync(sourceFile) ? validateYoutube(readYoutubeSource(sourceFile), timing) : null;
const metadata = source
  ? Object.fromEntries((["en", ...langs] as Loc[]).map((lang) => [lang, renderMetadata(source, timing, slug, lang, langs as Loc[])]))
  : null;
const notes = renderUploadNotes(timing, slug);

fs.mkdirSync(finals, { recursive: true });
const kit = mediaDir(slug)!;
fs.mkdirSync(kit, { recursive: true });
fs.copyFileSync(upload, path.join(kit, "video.mp4"));
mirrorThumbnails(generated, path.join(finals, "thumbnail-src"));
for (const lang of ["en", ...langs]) {
  const dir = path.join(finals, "languages", lang);
  mirrorLanguage(generatedDir(slug, lang), dir);
  if (metadata) fs.writeFileSync(path.join(dir, "metadata.md"), metadata[lang]!);
  if (lang === "en") continue;
  // Speech needs no more than mono 64 kbps, which keeps the committed file near 2.5 MB.
  ffmpeg(["-y", "-loglevel", "error", "-i", path.join(dir, "audio.mp3"), "-ac", "1", "-b:a", "64k", "-ar", "44100", path.join(dir, "site.mp3")]);
  console.log(`${lang}: audio, subtitles, site dub (${Math.round(fs.statSync(path.join(dir, "site.mp3")).size / 1024)} KB)`);
}
if (notes) fs.writeFileSync(path.join(finals, "upload-notes.md"), notes);
copyKit(finals, kit);
if (source) console.log(`metadata: ${["en", ...langs].length} languages, ${source.quizzes.length} quizzes`);
else console.warn(`no ${path.relative(process.cwd(), sourceFile)}: metadata.md skipped`);
if (stop !== undefined) console.log(`site: set outroAt: ${stop} in content/lesson-videos.ts (the embed stops before the outro)`);
console.log(`done → ${path.relative(process.cwd(), finals)} (committed) and ${path.relative(process.cwd(), kit)} (upload kit with video.mp4)`);

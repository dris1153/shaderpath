import fs from "node:fs";
import path from "node:path";
import { totalFrames, type Timing } from "../src/scene/timing";
import { copyKit, finalsDir, mediaDir, mirrorLanguage, mirrorThumbnails } from "./lesson-assets";
import { uploadArgs } from "./final-args";
import { assertJoinable, joinedFrames, joinPicture, joinVoice, joinVtt, lessonHasOutro, loadOutro, CLIP_DIR } from "./outro-join";
import { audioSeconds, ffmpeg, generatedDir, lessonSource, outDir, parseArgs, ROOT } from "./remotion";
import { outroAt, readYoutubeSource, renderMetadata, renderUploadNotes, validateYoutube, type Loc } from "./youtube-meta";

// pnpm youtube <slug>
// Writes everything one YouTube upload needs into the lesson's committed folder,
// content/lessons/<track>/<slug>/youtube/ (everything below except the video), then
// completes the gitignored upload kit media/lessons/<track>/<slug>/youtube/: the same
// tree plus
//   video.mp4                      the English picture + the mono English voice (languages/en/audio.mp3, AAC): upload this
// With `outro: true` in the script, content/shared/outro is joined after the lesson first: the picture
// by stream copy (out/<slug>/en/video+outro.mp4), each voice and subtitle file by the join in outro-join.ts,
// so languages/<lang>/audio.mp3 and subtitles.vtt are the joined files and timing.json stays lesson-only.
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
const picture = path.join(master, "video.mp4");
if (!fs.existsSync(picture)) throw new Error(`no English render at ${picture}; run pnpm render ${slug} en`);
const readTiming = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, "timing.json"), "utf8")) as Timing;
const timing = readTiming(master);
const scenes = JSON.stringify(timing.scenes);
const clip = lessonHasOutro(slug) ? loadOutro() : undefined;
if (clip) assertJoinable(slug, timing, clip);
const lessonFrames = totalFrames(timing);
const stop = clip ? outroAt(timing) : undefined;

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
  const cut = stop === undefined ? undefined : fitted.words.find((w) => w.to > stop * fitted.fps);
  if (cut) console.warn(`${lang}: "${cut.text}" (${cut.scene}) runs past outroAt ${stop} s, so the site cuts it; shorten that scene's line`);
}
const sourceFile = path.join(lessonSource(slug), "youtube.json");
const source = fs.existsSync(sourceFile) ? validateYoutube(readYoutubeSource(sourceFile), timing, clip) : null;
const metadata = source
  ? Object.fromEntries((["en", ...langs] as Loc[]).map((lang) => [lang, renderMetadata(source, timing, slug, lang, langs as Loc[], clip)]))
  : null;
const notes = renderUploadNotes(timing, slug, clip);

// The joined files, built in the scratch folder out/ before any committed file is touched.
const joined = new Map<string, { audio: string; subtitles: string }>();
let uploadPicture = picture;
if (clip) {
  for (const lang of ["en", ...langs]) {
    const clipVoice = path.join(CLIP_DIR, `outro.${lang}.mp3`);
    const clipSubs = path.join(CLIP_DIR, `outro.${lang}.vtt`);
    for (const file of [clipVoice, clipSubs]) if (!fs.existsSync(file)) throw new Error(`no ${path.relative(process.cwd(), file)}; run pnpm outro`);
    const lessonVoice = path.join(generatedDir(slug, lang), "voice.mp3");
    const voiceSeconds = audioSeconds(lessonVoice);
    if (Math.abs(voiceSeconds - lessonFrames / timing.fps) > 0.06) {
      throw new Error(`${lang} voice is ${voiceSeconds.toFixed(2)} s but the lesson is ${(lessonFrames / timing.fps).toFixed(2)} s; it must be the lesson alone, run pnpm tts ${slug} ${lang}`);
    }
    const dir = outDir(slug, lang);
    fs.mkdirSync(dir, { recursive: true });
    const audio = path.join(dir, "voice+outro.mp3");
    joinVoice(lessonVoice, lessonFrames, clipVoice, clip, audio);
    const subtitles = path.join(dir, "subs+outro.vtt");
    fs.writeFileSync(subtitles, joinVtt(fs.readFileSync(path.join(generatedDir(slug, lang), "subs.vtt"), "utf8"), fs.readFileSync(clipSubs, "utf8"), lessonFrames, timing.fps));
    joined.set(lang, { audio, subtitles });
  }
  uploadPicture = path.join(master, "video+outro.mp4");
  joinPicture(picture, path.join(CLIP_DIR, "outro.mp4"), uploadPicture, joinedFrames(timing, clip), timing.fps);
}

fs.mkdirSync(finals, { recursive: true });
const kit = mediaDir(slug)!;
fs.mkdirSync(kit, { recursive: true });
// Not Remotion's final.mp4: its 2-channel mix of the voice is about 3 LU quieter than the voice file the dubs use.
ffmpeg(uploadArgs(uploadPicture, joined.get("en")?.audio ?? path.join(generatedDir(slug, "en"), "voice.mp3"), path.join(kit, "video.mp4")));
mirrorThumbnails(generated, path.join(finals, "thumbnail-src"));
for (const lang of ["en", ...langs]) {
  const dir = path.join(finals, "languages", lang);
  mirrorLanguage(generatedDir(slug, lang), dir);
  const join = joined.get(lang);
  if (join) {
    fs.copyFileSync(join.audio, path.join(dir, "audio.mp3"));
    fs.copyFileSync(join.subtitles, path.join(dir, "subtitles.vtt"));
  }
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

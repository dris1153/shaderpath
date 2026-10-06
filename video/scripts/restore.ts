import fs from "node:fs";
import path from "node:path";
import { finalsDir, restoreLanguage, restoreThumbnails, type SyncResult } from "./lesson-assets";
import { lessonHasOutro, lessonVtt } from "./outro-join";
import { audioSeconds, ffmpeg, generatedDir, parseArgs, ROOT } from "./remotion";
import { totalFrames, type Timing } from "../src/scene/timing";

// pnpm video:restore <slug> [--force]
// Rebuilds the working cache (public/generated/<slug>/) from the lesson's committed
// youtube/ folder: voice, subtitles, timing, strings and thumbnail backgrounds.
// A cache file that already differs is reported and kept unless --force.
// A lesson with `outro: true` commits the joined voice and subtitles; the cache holds the lesson alone,
// so a restored voice is cut back to the lesson's length (mp3 stream copy, no re-encode) and its outro cues dropped.
const args = parseArgs("pnpm video:restore <slug> [--force]", 1);
const force = args.includes("--force");
const slug = args.find((a) => !a.startsWith("--"))!;
const finals = finalsDir(slug);
const languages = finals && path.join(finals, "languages");
if (!finals || !languages || !fs.existsSync(languages)) throw new Error(`nothing to restore: no ${finals ?? "youtube folder"}/languages for "${slug}"`);

const total: SyncResult = { copied: [], differs: [] };
const add = (r: SyncResult) => {
  total.copied.push(...r.copied);
  total.differs.push(...r.differs);
};
const outro = lessonHasOutro(slug);
for (const lang of fs.readdirSync(languages)) {
  const cache = generatedDir(slug, lang);
  const restored = restoreLanguage(path.join(languages, lang), cache, force);
  // The committed voice and subtitles are joined, the cache's are not: they differ by design.
  const ownFiles = new Set(outro ? [path.join(cache, "voice.mp3"), path.join(cache, "subs.vtt")] : []);
  add({ copied: restored.copied, differs: restored.differs.filter((file) => !ownFiles.has(file)) });
  if (!outro || !fs.existsSync(path.join(cache, "timing.json"))) continue;
  const timing = JSON.parse(fs.readFileSync(path.join(cache, "timing.json"), "utf8")) as Timing;
  const seconds = totalFrames(timing) / timing.fps;
  const voice = path.join(cache, "voice.mp3");
  if (restored.copied.includes(voice) && audioSeconds(voice) > seconds + 0.1) {
    const cut = `${voice}.cut.mp3`;
    ffmpeg(["-y", "-loglevel", "error", "-i", voice, "-t", seconds.toFixed(4), "-c", "copy", cut]);
    fs.renameSync(cut, voice);
  }
  const subs = path.join(cache, "subs.vtt");
  if (restored.copied.includes(subs)) {
    fs.writeFileSync(subs, lessonVtt(fs.readFileSync(subs, "utf8"), totalFrames(timing), timing.fps));
  }
}
add(restoreThumbnails(path.join(finals, "thumbnail-src"), path.join(ROOT, "public", "generated", slug), force));

for (const file of total.differs) console.warn(`kept (differs from youtube/): ${path.relative(process.cwd(), file)}`);
console.log(`restored ${total.copied.length} files into public/generated/${slug}${total.differs.length ? `; ${total.differs.length} kept (use --force)` : ""}`);

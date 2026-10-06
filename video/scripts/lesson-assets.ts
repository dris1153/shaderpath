import fs from "node:fs";
import path from "node:path";

// A lesson's paid and text outputs (voice, subtitles, metadata, thumbnails) live in
// the repo, next to its video/ source: content/lessons/<track>/<slug>/youtube/.
// video/out and video/public/generated are only working caches that these helpers
// keep in step with it (mirror after voicing/packaging, restore on a fresh clone).
const LESSONS = path.resolve(import.meta.dirname, "..", "..", "content", "lessons");

// Pipeline fixtures (dummy, outro, style) have no lesson folder, so no finals.
export function finalsDir(slug: string, lessons = LESSONS): string | undefined {
  for (const track of fs.readdirSync(lessons)) {
    if (fs.existsSync(path.join(lessons, track, slug, "video"))) return path.join(lessons, track, slug, "youtube");
  }
  return undefined;
}

// Videos never go to git. They, and a full copy of the upload kit, live in the
// gitignored media/ folder at the repo root, which mirrors content/'s structure.
const MEDIA = path.resolve(import.meta.dirname, "..", "..", "media");
export const MEDIA_SHARED = path.join(MEDIA, "shared");
// Shared voices (small, pushed) sit with the lessons' text outputs.
export const CONTENT_SHARED = path.resolve(import.meta.dirname, "..", "..", "content", "shared");

export function mediaDir(slug: string, lessons = LESSONS, media = MEDIA): string | undefined {
  for (const track of fs.readdirSync(lessons)) {
    if (fs.existsSync(path.join(lessons, track, slug, "video"))) return path.join(media, "lessons", track, slug, "youtube");
  }
  return undefined;
}

// Copies a folder tree, skipping files that already match; never deletes anything.
export function copyKit(from: string, to: string): string[] {
  const copied: string[] = [];
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyKit(source, target));
      continue;
    }
    if (fs.existsSync(target) && fs.readFileSync(source).equals(fs.readFileSync(target))) continue;
    fs.mkdirSync(to, { recursive: true });
    fs.copyFileSync(source, target);
    copied.push(target);
  }
  return copied;
}

// Name in public/generated/<slug>/<lang>/ → name in youtube/languages/<lang>/.
const LANGUAGE_FILES: [generated: string, final: string][] = [
  ["voice.mp3", "audio.mp3"],
  ["subs.vtt", "subtitles.vtt"],
  ["timing.json", "timing.json"],
  ["strings.json", "strings.json"],
];
const THUMBNAIL_BG = /^thumbnail-bg.*\.png$/;

// The next free thumbnail-bg-<n> across the cache and the committed folder, so a
// wiped cache can never hand out a number that already names a paid background.
export function nextThumbnailNumber(...dirs: (string | undefined)[]): number {
  const taken = dirs.flatMap((d) => (d && fs.existsSync(d) ? fs.readdirSync(d) : [])).map((f) => Number(/^thumbnail-bg-(\d+)\.png$/.exec(f)?.[1] ?? 0));
  return Math.max(0, ...taken) + 1;
}

type Pair = [from: string, to: string];
export type SyncResult = { copied: string[]; differs: string[] };

// Copies each existing source over its target. A target that already holds
// other bytes is replaced only when `overwrite` is set; otherwise it is reported.
function sync(pairs: Pair[], overwrite: boolean): SyncResult {
  const result: SyncResult = { copied: [], differs: [] };
  for (const [from, to] of pairs) {
    if (!fs.existsSync(from)) continue;
    if (fs.existsSync(to)) {
      if (fs.readFileSync(from).equals(fs.readFileSync(to))) continue;
      if (!overwrite) {
        result.differs.push(to);
        continue;
      }
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    result.copied.push(to);
  }
  return result;
}

const languagePairs = (generated: string, langDir: string, toFinals: boolean): Pair[] =>
  LANGUAGE_FILES.map(([g, f]) => (toFinals ? [path.join(generated, g), path.join(langDir, f)] : [path.join(langDir, f), path.join(generated, g)]));

const thumbnailPairs = (from: string, to: string): Pair[] =>
  fs.existsSync(from) ? fs.readdirSync(from).filter((f) => THUMBNAIL_BG.test(f)).map((f) => [path.join(from, f), path.join(to, f)]) : [];

// generated → youtube/languages/<lang>: the fresh output wins.
export function mirrorLanguage(generated: string, langDir: string): SyncResult {
  return sync(languagePairs(generated, langDir, true), true);
}

export function mirrorThumbnails(generated: string, thumbnailSrc: string): SyncResult {
  return sync(thumbnailPairs(generated, thumbnailSrc), true);
}

// youtube/ → the working cache, for a fresh clone or a wiped cache.
export function restoreLanguage(langDir: string, generated: string, force = false): SyncResult {
  return sync(languagePairs(generated, langDir, false), force);
}

export function restoreThumbnails(thumbnailSrc: string, generated: string, force = false): SyncResult {
  return sync(thumbnailPairs(thumbnailSrc, generated), force);
}

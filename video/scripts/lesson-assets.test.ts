import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { copyKit, finalsDir, mediaDir, mirrorLanguage, mirrorThumbnails, nextThumbnailNumber, restoreLanguage, restoreThumbnails } from "./lesson-assets";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "lesson-assets-"));
const write = (file: string, text: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
const read = (file: string) => fs.readFileSync(file, "utf8");

test("finalsDir sits next to the lesson's video folder; fixtures have none", () => {
  const lessons = tmp();
  write(path.join(lessons, "00-math", "vector-basics", "video", "script.en.md"), "x");
  assert.equal(finalsDir("vector-basics", lessons), path.join(lessons, "00-math", "vector-basics", "youtube"));
  assert.equal(finalsDir("dummy", lessons), undefined);
});

test("mirror renames the generated files, and restore round-trips them byte for byte", () => {
  const generated = tmp();
  const langDir = path.join(tmp(), "languages", "vi");
  write(path.join(generated, "voice.mp3"), "voice");
  write(path.join(generated, "subs.vtt"), "subs");
  write(path.join(generated, "timing.json"), "{}");
  write(path.join(generated, "strings.json"), "{}");

  assert.equal(mirrorLanguage(generated, langDir).copied.length, 4);
  assert.equal(read(path.join(langDir, "audio.mp3")), "voice");
  assert.equal(read(path.join(langDir, "subtitles.vtt")), "subs");
  // A second mirror of identical output changes nothing.
  assert.equal(mirrorLanguage(generated, langDir).copied.length, 0);

  const fresh = tmp();
  assert.equal(restoreLanguage(langDir, fresh).copied.length, 4);
  assert.equal(read(path.join(fresh, "voice.mp3")), "voice");
  assert.equal(read(path.join(fresh, "subs.vtt")), "subs");
});

test("restore reports a differing cache file and keeps it unless forced", () => {
  const langDir = tmp();
  const generated = tmp();
  write(path.join(langDir, "audio.mp3"), "committed");
  write(path.join(generated, "voice.mp3"), "newer");

  const kept = restoreLanguage(langDir, generated);
  assert.deepEqual(kept.differs, [path.join(generated, "voice.mp3")]);
  assert.equal(read(path.join(generated, "voice.mp3")), "newer");

  restoreLanguage(langDir, generated, true);
  assert.equal(read(path.join(generated, "voice.mp3")), "committed");
});

test("thumbnail backgrounds travel both ways; only thumbnail-bg files", () => {
  const generated = tmp();
  const src = path.join(tmp(), "thumbnail-src");
  write(path.join(generated, "thumbnail-bg-1.png"), "a");
  write(path.join(generated, "thumbnail-bg-raw-1.png"), "b");
  write(path.join(generated, "voice.mp3"), "not a thumbnail");

  assert.equal(mirrorThumbnails(generated, src).copied.length, 2);
  assert.deepEqual(fs.readdirSync(src).sort(), ["thumbnail-bg-1.png", "thumbnail-bg-raw-1.png"]);

  const fresh = tmp();
  assert.equal(restoreThumbnails(src, fresh).copied.length, 2);
  assert.equal(read(path.join(fresh, "thumbnail-bg-raw-1.png")), "b");
});

test("mirror replaces a differing committed file and skips a missing source", () => {
  const generated = tmp();
  const langDir = tmp();
  write(path.join(langDir, "audio.mp3"), "old take");
  write(path.join(langDir, "subtitles.vtt"), "kept: no source");
  write(path.join(generated, "voice.mp3"), "new take");

  const result = mirrorLanguage(generated, langDir);
  assert.deepEqual(result.copied, [path.join(langDir, "audio.mp3")]);
  assert.equal(read(path.join(langDir, "audio.mp3")), "new take");
  assert.equal(read(path.join(langDir, "subtitles.vtt")), "kept: no source");
});

test("a new background number never reuses one that is committed, even with an empty cache", () => {
  const cache = tmp();
  const committed = tmp();
  write(path.join(committed, "thumbnail-bg-1.png"), "a");
  write(path.join(committed, "thumbnail-bg-2.png"), "b");
  write(path.join(committed, "thumbnail-bg-raw-2.png"), "raw");
  assert.equal(nextThumbnailNumber(cache, committed), 3);
  write(path.join(cache, "thumbnail-bg-5.png"), "c");
  assert.equal(nextThumbnailNumber(cache, committed), 6);
  assert.equal(nextThumbnailNumber(path.join(cache, "missing"), undefined), 1);
});

test("mediaDir mirrors the lesson's place under media/", () => {
  const lessons = tmp();
  const media = path.join(tmp(), "media");
  write(path.join(lessons, "00-math", "vector-basics", "video", "script.en.md"), "x");
  assert.equal(mediaDir("vector-basics", lessons, media), path.join(media, "lessons", "00-math", "vector-basics", "youtube"));
  assert.equal(mediaDir("dummy", lessons, media), undefined);
});

test("copyKit copies a tree, skips identical files, refreshes changed ones and deletes nothing", () => {
  const from = tmp();
  const to = tmp();
  write(path.join(from, "languages", "vi", "audio.mp3"), "voice");
  write(path.join(from, "thumbnail.png"), "png");
  write(path.join(to, "video.mp4"), "kept: only in the kit");

  assert.equal(copyKit(from, to).length, 2);
  assert.equal(read(path.join(to, "languages", "vi", "audio.mp3")), "voice");
  assert.equal(copyKit(from, to).length, 0);
  write(path.join(from, "thumbnail.png"), "new png");
  assert.equal(copyKit(from, to).length, 1);
  assert.equal(read(path.join(to, "thumbnail.png")), "new png");
  assert.equal(read(path.join(to, "video.mp4")), "kept: only in the kit");
});

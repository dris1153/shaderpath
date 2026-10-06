import assert from "node:assert/strict";
import { test } from "node:test";
import type { Timing } from "../src/scene/timing";
import type { OutroClip } from "./outro-clip";
import {
  chapterTime,
  endScreen,
  outroAt,
  renderMetadata,
  renderUploadNotes,
  resolveAnchor,
  studioTime,
  tagsLength,
  validateYoutube,
  type YoutubeSource,
} from "./youtube-meta";

const timing: Timing = {
  fps: 30,
  width: 1280,
  height: 720,
  scenes: [
    { id: "hook", from: 0, durationInFrames: 660 },
    { id: "axes", from: 660, durationInFrames: 900 },
    { id: "recap", from: 1560, durationInFrames: 600 },
  ],
  words: [],
  cues: { "axes.walk": 1020 },
};

const both = (s: string) => ({ en: s, vi: `${s} (vi)` });
const source = (): YoutubeSource => ({
  title: both("Title"),
  summary: both("Summary."),
  bullets: { en: ["one"], vi: ["một"] },
  lessonLink: both("Full lesson:"),
  series: both("Series · lesson 2"),
  tags: ["webgl"],
  hashtags: ["webgl", "threejs"],
  chapters: { hook: both("Hook"), axes: both("Axes"), recap: both("Recap") },
  quizzes: [{ at: "axes.walk", question: "Is |v| long?", answers: ["a", "b"], correct: 1, explanation: "Because." }],
  thumbnail: { lines: ["A"] },
});
const errorsOf = (src: unknown, t = timing, c?: OutroClip) => {
  try {
    validateYoutube(src, t, c);
    return "";
  } catch (error) {
    return (error as Error).message;
  }
};

test("Studio and chapter times", () => {
  assert.equal(chapterTime(65.9), "1:05");
  assert.equal(studioTime(50), "0:50:00");
  assert.equal(studioTime(225), "3:45:00");
});

test("anchors resolve to a scene's last second or a cue's second", () => {
  assert.equal(resolveAnchor(timing, "hook:end"), 21); // the cut is at 22 s
  assert.equal(resolveAnchor(timing, "axes.walk"), 34);
  assert.throws(() => resolveAnchor(timing, "axes.nope"), /unknown anchor/);
  assert.throws(() => resolveAnchor(timing, "nope:end"), /unknown scene/);
  // Object.prototype keys are not cues.
  assert.throws(() => resolveAnchor(timing, "constructor"), /unknown anchor/);
});

test("validation reports every problem at once", () => {
  const bad = source();
  bad.quizzes = [{ at: "axes.nope", question: "Q?", answers: ["a", "b"], correct: 2 }];
  delete (bad.chapters as Record<string, unknown>).axes;
  const message = errorsOf(bad);
  assert.match(message, /chapters\.axes: needs en and vi titles/);
  assert.match(message, /unknown anchor "axes\.nope"/);
  assert.match(message, /correct is not an answer index/);
});

test("malformed quizzes are reported, not crashed on", () => {
  const missing = source() as Partial<YoutubeSource>;
  delete missing.quizzes;
  assert.match(errorsOf(missing), /quizzes: needs a list/);
  const odd = source() as unknown as { quizzes: unknown[] };
  odd.quizzes = [null, { at: "hook:end", question: 7, answers: ["a", 1], correct: 0 }];
  const message = errorsOf(odd);
  assert.match(message, /quizzes\[0\]: needs an object/);
  assert.match(message, /quizzes\[1\]: question must be/);
  assert.match(message, /quizzes\[1\]: needs 2–4 text answers/);
});

test("YouTube's limits and rejected characters", () => {
  const src = source();
  src.title.en = "x".repeat(101);
  src.bullets.en = ["compare a < b"];
  src.tags = Array.from({ length: 60 }, (_, i) => `tag number ${i}`);
  const message = errorsOf(src);
  assert.match(message, /title\.en: over YouTube's 100/);
  assert.match(message, /bullets\.en\[0\]: YouTube rejects < and >/);
  assert.match(message, /tags: over YouTube's 500/);
  assert.equal(tagsLength(["a b", "c"]), 7); // "a b" quoted (5) + comma (1) + c (1)
});

test("chapters: at least 3, each at least 10 s", () => {
  const two = { ...timing, scenes: timing.scenes.slice(0, 2) };
  assert.match(errorsOf({ ...source(), chapters: { hook: both("Hook"), axes: both("Axes") } }, two), /at least 3/);
  const short = { ...timing, scenes: [{ id: "hook", from: 0, durationInFrames: 200 }, ...timing.scenes.slice(1)] };
  assert.match(errorsOf(source(), short), /chapters\.hook: under YouTube's 10 s minimum/);
});

test("metadata carries chapters, per-locale links, dub notes and quiz blocks", () => {
  const checked = validateYoutube(source(), timing);
  const md = renderMetadata(checked, timing, "vector-basics", "en", ["vi"]);
  const vi = renderMetadata(checked, timing, "vector-basics", "vi", ["vi"]);
  assert.match(md, /0:00 Hook\n0:22 Axes\n0:52 Recap/);
  assert.match(md, /https:\/\/shaderpath\.drisdev\.io\/en\/lesson\/vector-basics/);
  assert.match(vi, /https:\/\/shaderpath\.drisdev\.io\/vi\/lesson\/vector-basics/);
  assert.match(md, /Subtitles: English, Tiếng Việt/);
  assert.match(vi, /Bản lồng tiếng Việt/);
  // Quizzes and tags belong to the original language only; each file holds one language.
  assert.doesNotMatch(vi, /Quiz 1|## Tags/);
  assert.doesNotMatch(md, /Bản lồng tiếng Việt/);
  assert.match(md, /### Quiz 1 · 0:34:00\n```\nQuestion: Is \|v\| long\?\n  Answer 1: a\n✓ Answer 2: b\nExplanation: Because\./);
  assert.match(md, /#webgl #threejs/);
});

test("without a dub, no Vietnamese subtitles or dub note are promised", () => {
  const checked = validateYoutube(source(), timing);
  assert.match(renderMetadata(checked, timing, "vector-basics", "en", []), /Subtitles: English\n/);
  assert.doesNotMatch(renderMetadata(checked, timing, "vector-basics", "vi", []), /Bản lồng tiếng Việt/);
});

// A lesson with the shared clip joined after it: 72 s of lesson, then a 14 s outro
// whose {next} cue (buttons gone) lands 4 s in.
const clip: OutroClip = { fps: 30, frames: 420, cues: { like: 0, sub: 40, next: 120 }, leaveFrames: 26 };

test("the outro brings its own chapter title, and a lesson may not override it", () => {
  assert.equal(errorsOf(source(), timing, clip), "");
  const checked = validateYoutube(source(), timing, clip);
  assert.match(renderMetadata(checked, timing, "x", "en", [], clip), /1:12 Thanks for watching/);
  assert.match(renderMetadata(checked, timing, "x", "vi", [], clip), /1:12 Cảm ơn bạn đã xem/);
  const own = { ...source(), chapters: { ...source().chapters, outro: both("Bye") } };
  assert.match(errorsOf(own, timing, clip), /chapters\.outro: built in/);
});

test("the outro counts as a chapter", () => {
  const two = { ...timing, scenes: timing.scenes.slice(0, 2) };
  assert.equal(errorsOf({ ...source(), chapters: { hook: both("Hook"), axes: both("Axes") } }, two, clip), "");
});

test("end screen covers the outro after its buttons leave; the site stops at the outro", () => {
  // {next} at 76.0 s, plus 26 frames of leaving → 77 s; the video ends at 86 s.
  assert.deepEqual(endScreen(timing, clip), { start: 77, seconds: 9 });
  assert.equal(outroAt(timing), 72);
  const notes = renderUploadNotes(timing, "x", clip)!;
  assert.match(notes, /Start at 1:17, the last 9 s/);
  assert.match(notes, /outroAt: 72/);
  // Language-neutral steps live in the notes, not in either language's metadata.
  const checked = validateYoutube(source(), timing, clip);
  for (const lang of ["en", "vi"] as const) {
    assert.doesNotMatch(renderMetadata(checked, timing, "x", lang, [], clip), /End screen|outroAt/);
  }
});

test("the end screen stays inside YouTube's 5–20 s window", () => {
  const long: OutroClip = { ...clip, cues: { ...clip.cues, next: -30 * 20 } };
  assert.deepEqual(endScreen(timing, long), { start: 66, seconds: 20 });
  // A fractional end never stretches the window past 20 s.
  const odd: OutroClip = { ...long, frames: 425 };
  assert.ok(86 + 5 / 30 - endScreen(timing, odd)!.start <= 20);
  const short: OutroClip = { ...clip, cues: { ...clip.cues, next: clip.frames - 30 } };
  assert.throws(() => endScreen(timing, short), /lengthen its # hold/);
});

test("lessons without the outro get no end-screen, outro chapter or site notes", () => {
  assert.equal(endScreen(timing), undefined);
  assert.equal(renderUploadNotes(timing, "x"), null);
  const checked = validateYoutube(source(), timing);
  assert.doesNotMatch(renderMetadata(checked, timing, "x", "en", []), /Thanks for watching/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import type { Timing } from "../src/scene/timing";
import {
  chapterTime,
  endScreen,
  outroAt,
  renderMetadata,
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
const errorsOf = (src: unknown, t = timing) => {
  try {
    validateYoutube(src, t);
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
  const md = renderMetadata(validateYoutube(source(), timing), timing, "vector-basics", ["vi"]);
  assert.match(md, /0:00 Hook\n0:22 Axes\n0:52 Recap/);
  assert.match(md, /https:\/\/shaderpath\.drisdev\.io\/en\/lesson\/vector-basics/);
  assert.match(md, /https:\/\/shaderpath\.drisdev\.io\/vi\/lesson\/vector-basics/);
  assert.match(md, /Subtitles: English, Tiếng Việt/);
  assert.match(md, /Bản lồng tiếng Việt/);
  assert.match(md, /### Quiz 1 · 0:34:00\n```\nQuestion: Is \|v\| long\?\n  Answer 1: a\n✓ Answer 2: b\nExplanation: Because\./);
  assert.match(md, /#webgl #threejs/);
});

test("without a dub, no Vietnamese subtitles or dub note are promised", () => {
  const md = renderMetadata(validateYoutube(source(), timing), timing, "vector-basics", []);
  assert.match(md, /Subtitles: English\n/);
  assert.doesNotMatch(md, /Bản lồng tiếng Việt/);
});

// A lesson with the shared outro appended: 72 s of lesson, then a 14 s outro
// whose {next} cue (buttons gone) lands 4 s in.
const withOutro: Timing = {
  ...timing,
  scenes: [...timing.scenes, { id: "outro", from: 2160, durationInFrames: 420 }],
  cues: { ...timing.cues, "outro.next": 2280 },
};

test("the outro brings its own chapter title, and a lesson may not override it", () => {
  assert.equal(errorsOf(source(), withOutro), "");
  const md = renderMetadata(validateYoutube(source(), withOutro), withOutro, "x", []);
  assert.match(md, /1:12 Thanks for watching/);
  assert.match(md, /1:12 Cảm ơn bạn đã xem/);
  const own = { ...source(), chapters: { ...source().chapters, outro: both("Bye") } };
  assert.match(errorsOf(own, withOutro), /chapters\.outro: built in/);
});

test("end screen covers the outro after its buttons leave; the site stops at the outro", () => {
  // {next} at 76.0 s, plus 26 frames of leaving → 77 s; the video ends at 86 s.
  assert.deepEqual(endScreen(withOutro), { start: 77, seconds: 9 });
  assert.equal(outroAt(withOutro), 72);
  const md = renderMetadata(validateYoutube(source(), withOutro), withOutro, "x", []);
  assert.match(md, /Start at 1:17, the last 9 s/);
  assert.match(md, /outroAt: 72/);
});

test("the end screen stays inside YouTube's 5–20 s window", () => {
  const long: Timing = { ...withOutro, cues: { ...withOutro.cues, "outro.next": 2160 - 30 * 20 } };
  assert.deepEqual(endScreen(long), { start: 66, seconds: 20 });
  // A fractional end never stretches the window past 20 s.
  const odd: Timing = { ...long, scenes: [...timing.scenes, { id: "outro", from: 2160, durationInFrames: 425 }] };
  assert.ok(86 + 5 / 30 - endScreen(odd)!.start <= 20);
  const short: Timing = { ...withOutro, cues: { ...withOutro.cues, "outro.next": 2160 + 420 - 30 } };
  assert.throws(() => endScreen(short), /lengthen its # hold/);
});

test("lessons without the outro get no end-screen or site notes", () => {
  assert.equal(outroAt(timing), undefined);
  assert.equal(endScreen(timing), undefined);
  const md = renderMetadata(validateYoutube(source(), timing), timing, "x", []);
  assert.doesNotMatch(md, /End screen|outroAt/);
});

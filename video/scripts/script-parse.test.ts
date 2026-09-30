import assert from "node:assert/strict";
import { test } from "node:test";
import { parseScript, spokenText } from "./script-parse";

const SOURCE = `---
slug: demo
title: Demo lesson
---

## scene: intro
{in}Every pixel has an address. | Read it with
[gl_FragCoord](G L frag coord).
# hold 12

## scene: axes
{x}The [x axis](ex axis) goes right,
{y}and y goes up.
# hold 6
# hold 4
`;

test("parses front matter, scenes and holds", () => {
  const script = parseScript(SOURCE);
  assert.deepEqual(script.meta, { slug: "demo", title: "Demo lesson" });
  assert.deepEqual(script.scenes.map((s) => [s.id, s.hold]), [["intro", 12], ["axes", 10]]);
});

test("a term with unequal word counts becomes one display word", () => {
  const [intro] = parseScript(SOURCE).scenes;
  const term = intro!.words.at(-1)!;
  assert.equal(term.display, "gl_FragCoord.");
  assert.equal(term.spoken, "G L frag coord.");
  assert.equal(spokenText(intro!), "Every pixel has an address. Read it with G L frag coord.");
});

test("a term with equal word counts maps word by word", () => {
  const axes = parseScript(SOURCE).scenes[1]!;
  assert.deepEqual(axes.words.slice(1, 3).map((w) => [w.display, w.spoken]), [["x", "ex"], ["axis", "axis"]]);
});

test("cues and breaks attach to the next word", () => {
  const [intro, axes] = parseScript(SOURCE).scenes;
  assert.deepEqual(intro!.words[0]!.cues, ["in"]);
  assert.equal(intro!.words.find((w) => w.breakBefore)?.display, "Read");
  assert.equal(axes!.words.find((w) => w.cues.includes("y"))?.display, "and");
});

test("breaks and cues may touch their words", () => {
  const words = parseScript("## scene: a\none|two{c}three").scenes[0]!.words;
  assert.deepEqual(words.map((w) => [w.display, w.breakBefore, w.cues]), [
    ["one", false, []],
    ["two", true, []],
    ["three", false, ["c"]],
  ]);
});

test("a lone punctuation token rides on the word before", () => {
  const words = parseScript("## scene: a\nwait {c}— what").scenes[0]!.words;
  assert.deepEqual(words.map((w) => [w.display, w.cues]), [["wait —", []], ["what", ["c"]]]);
});

test("a term may open with a quote or paren", () => {
  const words = parseScript('## scene: a\ncalled ("[uv](U V)")').scenes[0]!.words;
  assert.deepEqual(words.map((w) => [w.display, w.spoken]), [["called", "called"], ['("uv")', '("U V")']]);
});

test("decomposed accents are composed", () => {
  const word = parseScript("## scene: a\nviệt").scenes[0]!.words[0]!;
  assert.equal(word.spoken, "việt");
});

test("a scene may be silent", () => {
  const scene = parseScript("## scene: pause\n# hold 45").scenes[0]!;
  assert.deepEqual(scene, { id: "pause", hold: 45, words: [] });
});

test("rejects malformed scripts", () => {
  const bad: [string, RegExp][] = [
    ["text first", /before the first/],
    ["## scene: Bad_Id", /bad scene id/],
    ["## scene: a\n## scene: a", /duplicate scene/],
    ["## scene: a\nword {dangling}", /no word after it/],
    ["## scene: a\n{x}one {x}two", /repeats/],
    ["## scene: a\n{bad.cue}one", /bad cue name/],
    ["## scene: a\n[half open", /stray bracket/],
    ["## scene: a\nopen { brace", /stray bracket/],
    ["## scene: a\n[](spoken)", /empty half/],
    ["## scene: a\n# hold 1.5", /whole frame count/],
    ["## scene: a\n# pause 3", /unknown directive/],
    ["---\nslug: x\n## scene: a", /not closed/],
    ["", /no scenes/],
  ];
  for (const [source, error] of bad) assert.throws(() => parseScript(source), error, source);
});

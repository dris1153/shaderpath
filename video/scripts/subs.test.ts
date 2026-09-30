import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCues, toVtt, type SubWord } from "./subs";

const FPS = 30;

// Words 10 frames long with 2-frame gaps, all in one scene unless marked.
function words(text: string, opts: { gap?: number; scene?: (i: number) => string } = {}): SubWord[] {
  let at = 0;
  return text.split(" ").map((token, i) => {
    const breakBefore = token.startsWith("|");
    const w = { text: token.replace(/^\|/, ""), from: at, to: at + 10, scene: opts.scene?.(i) ?? "a", breakBefore };
    at += 10 + (opts.gap ?? 2);
    return w;
  });
}

test("a long sentence splits within the line and duration budgets", () => {
  const text =
    "The fragment shader runs once for every pixel on the screen and each run only knows " +
    "its own coordinate so every decision it makes has to start from that one pair of numbers";
  const { cues } = buildCues(words(text), FPS);
  assert.ok(cues.length > 1);
  for (const cue of cues) {
    assert.ok(cue.lines.length <= 2);
    for (const line of cue.lines) assert.ok(line.length <= 42, line);
    assert.ok(cue.end - cue.start <= 6);
  }
  assert.equal(cues.flatMap((c) => c.lines).join(" "), text);
});

test("a split prefers the last pause", () => {
  const text = "Every pixel has an address on the screen, and the shader reads it, then decides its colour";
  const { cues } = buildCues(words(text), FPS);
  assert.equal(cues[0]!.lines.join(" "), "Every pixel has an address on the screen, and the shader reads it,");
});

test("cues end at a forced break, a scene change and a sentence end", () => {
  const forced = buildCues(words("one two |three four"), FPS).cues;
  assert.deepEqual(forced.map((c) => c.lines.join(" ")), ["one two", "three four"]);
  const scenes = buildCues(words("one two three four", { scene: (i) => (i < 3 ? "a" : "b") }), FPS).cues;
  assert.deepEqual(scenes.map((c) => c.lines.join(" ")), ["one two three", "four"]);
  const sentences = buildCues(words("Hello there. How are you?", { gap: 20 }), FPS).cues;
  assert.deepEqual(sentences.map((c) => c.lines.join(" ")), ["Hello there.", "How are you?"]);
});

test("a sentence under a second runs on into the next", () => {
  const { cues } = buildCues(words("Hi! Welcome back."), FPS);
  assert.deepEqual(cues.map((c) => c.lines.join(" ")), ["Hi! Welcome back."]);
  // "back." ends at frame 34; the cue stays one more second.
  assert.equal(+cues[0]!.end.toFixed(6), +(34 / FPS + 1).toFixed(6));
});

test("cues linger without overlapping the next, and flag a flash", () => {
  const lingering = buildCues(words("One two three. Four five six.", { gap: 3 }), FPS).cues;
  assert.equal(lingering[0]!.end, lingering[1]!.start);
  const { warnings } = buildCues(words("Hi! |Welcome back."), FPS);
  assert.match(warnings[0]!, /under 1 s: "Hi!"/);
});

test("cue text is escaped for VTT", () => {
  const vtt = toVtt([{ start: 0, end: 1, lines: ["draw into a <canvas> & more"] }]);
  assert.match(vtt, /draw into a &lt;canvas&gt; &amp; more\n$/);
});

test("fast speech is flagged", () => {
  const fast = words("Extraordinarily complicated vocabulary", { gap: 0 }).map((w) => ({ ...w, to: w.from + 3 }));
  assert.equal(buildCues(fast, FPS).warnings.length, 1);
});

test("VTT output", () => {
  const vtt = toVtt([{ start: 61.5, end: 63, lines: ["Every pixel", "has an address."] }]);
  assert.equal(vtt, "WEBVTT\n\n1\n00:01:01.500 --> 00:01:03.000\nEvery pixel\nhas an address.\n");
});

test("an early pause beats orphaning the overflow word", () => {
  const text = "That's perfect for textures, but for directions we want a range centered on zero: |minus one to one.";
  const { cues } = buildCues(words(text), FPS);
  assert.deepEqual(cues.map((c) => c.lines.join(" ")), [
    "That's perfect for textures,",
    "but for directions we want a range centered on zero:",
    "minus one to one.",
  ]);
});

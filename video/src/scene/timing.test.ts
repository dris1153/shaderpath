import assert from "node:assert/strict";
import { test } from "node:test";
import { cueOffset, resolveCue, totalFrames, validateStrings, validateTiming, type Timing } from "./timing";

const base = (): Timing => ({
  fps: 30,
  width: 1280,
  height: 720,
  scenes: [
    { id: "a", from: 0, durationInFrames: 90 },
    { id: "b", from: 90, durationInFrames: 60 },
  ],
  words: [],
  cues: { "a.x": 10, "b.y": 100 },
});

test("cueOffset counts frames since the cue in scene-local time", () => {
  // scene b starts at 90, cue at absolute 100 → local frame 10 is the cue
  assert.equal(cueOffset(10, 90, 100), 0);
  assert.equal(cueOffset(4, 90, 100), -6);
  assert.equal(cueOffset(40, 90, 100), 30);
});

test("totalFrames sums the scene durations", () => {
  assert.equal(totalFrames(base()), 150);
});

test("validateTiming accepts contiguous scenes and in-scene cues", () => {
  assert.doesNotThrow(() => validateTiming(base()));
});

test("validateTiming rejects a gap between scenes", () => {
  const t = base();
  t.scenes[1]!.from = 95;
  assert.throws(() => validateTiming(t), /starts at 95, expected 90/);
});

test("validateTiming rejects a cue outside its scene", () => {
  const t = base();
  t.cues["a.x"] = 120;
  assert.throws(() => validateTiming(t), /outside its scene/);
});

test("validateTiming rejects a cue for an unknown scene", () => {
  const t = base();
  t.cues["zzz.x"] = 5;
  assert.throws(() => validateTiming(t), /unknown scene/);
});

test("validateTiming rejects duplicate, dotted and fractional scenes", () => {
  const dup = base();
  dup.scenes[1]!.id = "a";
  assert.throws(() => validateTiming(dup), /duplicate scene id "a"/);

  const dotted = base();
  dotted.scenes[0]!.id = "a.b";
  assert.throws(() => validateTiming(dotted), /bad scene id "a.b"/);

  const fractional = base();
  fractional.scenes[0]!.durationInFrames = 89.5;
  assert.throws(() => validateTiming(fractional), /must be an integer frame/);
});

test("validateTiming rejects a file without scenes", () => {
  assert.throws(() => validateTiming({} as Timing), /scenes and words must be arrays/);
});

test("resolveCue reads the scene's cue and throws on a missing one", () => {
  const t = base();
  assert.equal(resolveCue(t, { id: "b", from: 90 }, "y", 15), 5);
  assert.throws(() => resolveCue(t, { id: "b", from: 90 }, "nope", 0), /missing cue b.nope/);
});

test("validateTiming rejects words outside their scene or out of order", () => {
  const spill = base();
  spill.words = [{ text: "hi", from: 85, to: 95, scene: "a" }];
  assert.throws(() => validateTiming(spill), /spills out of its scene/);

  const overlap = base();
  overlap.words = [
    { text: "one", from: 10, to: 20, scene: "a" },
    { text: "two", from: 15, to: 25, scene: "a" },
  ];
  assert.throws(() => validateTiming(overlap), /overlaps the previous word/);
});

test("validateStrings accepts only text values", () => {
  assert.deepEqual(validateStrings({ a: "x" }), { a: "x" });
  assert.throws(() => validateStrings({ a: 3 }), /"a" is not a string/);
  assert.throws(() => validateStrings([]), /expected an object/);
});

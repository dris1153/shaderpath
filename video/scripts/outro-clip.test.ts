import assert from "node:assert/strict";
import { test } from "node:test";
import type { Timing } from "../src/scene/timing";
import { buildOutroClip, OUTRO_LEAVE_FRAMES } from "./outro-clip";

const timing = (over: Partial<Timing> = {}): Timing => ({
  fps: 30,
  width: 1280,
  height: 720,
  scenes: [{ id: "outro", from: 0, durationInFrames: 434 }],
  words: [],
  cues: { "outro.like": 0, "outro.sub": 47, "outro.next": 130 },
  ...over,
});

test("the clip takes its frames and cues from the fixture timing", () => {
  assert.deepEqual(buildOutroClip(timing()), {
    fps: 30,
    frames: 434,
    cues: { like: 0, sub: 47, next: 130 },
    leaveFrames: OUTRO_LEAVE_FRAMES,
  });
});

test("a fixture with another scene layout is rejected", () => {
  const two = [
    { id: "outro", from: 0, durationInFrames: 100 },
    { id: "extra", from: 100, durationInFrames: 10 },
  ];
  assert.throws(() => buildOutroClip(timing({ scenes: two })), /one scene "outro"/);
  assert.throws(() => buildOutroClip(timing({ scenes: [{ id: "hello", from: 0, durationInFrames: 9 }] })), /one scene "outro"/);
});

test("a missing cue is named", () => {
  assert.throws(() => buildOutroClip(timing({ cues: { "outro.like": 0, "outro.sub": 47 } })), /\{next\} cue/);
});

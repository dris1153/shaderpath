import assert from "node:assert/strict";
import { test } from "node:test";
import { blinkAmount, hash01, mouthOpen } from "./face";

test("hash01 is deterministic and in [0, 1)", () => {
  for (let i = 0; i < 200; i++) {
    const v = hash01(i);
    assert.equal(v, hash01(i));
    assert.ok(v >= 0 && v < 1);
  }
});

test("blinks are brief, fully close once, and never overlap the start", () => {
  const seed = 3;
  const frames = Array.from({ length: 900 }, (_, f) => blinkAmount(f, seed));
  assert.equal(frames.slice(0, 30).every((v) => v === 0), true);
  const closedPeaks = frames.filter((v) => v === 1).length;
  assert.ok(closedPeaks >= 5 && closedPeaks <= 13, `peaks ${closedPeaks}`);
  // Mostly open: a blink is 6 frames every 70–160.
  assert.ok(frames.filter((v) => v > 0).length < 900 * 0.1);
});

test("the mouth is closed between words and opens inside one", () => {
  const words = [
    { text: "Every", from: 10, to: 22 },
    { text: "pixel", from: 30, to: 44 },
  ];
  assert.equal(mouthOpen(5, words), 0);
  assert.equal(mouthOpen(25, words), 0);
  assert.ok(mouthOpen(16, words) > 0.9);
  assert.equal(mouthOpen(10, words), 0);
});

test("long words flap more than once", () => {
  const words = [{ text: "coordinates", from: 0, to: 30 }];
  const opens = Array.from({ length: 30 }, (_, f) => mouthOpen(f, words));
  const minima = opens.filter((v, i) => i > 0 && i < 29 && v < opens[i - 1]! && v < opens[i + 1]!).length;
  assert.ok(minima >= 1);
});

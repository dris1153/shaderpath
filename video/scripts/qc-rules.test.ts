import assert from "node:assert/strict";
import { test } from "node:test";
import { blankRuns, parseLoudness, restlessTails, stillRuns, subtitleIssues, type Scene } from "./qc-rules";

const IDLE = 0.4; // Inko's ambient motion
const scenes: Scene[] = [
  { id: "a", from: 0, durationInFrames: 200 },
  { id: "b", from: 200, durationInFrames: 200 },
];
const curve = (edit: (d: number[]) => void) => {
  const d = Array.from({ length: 400 }, () => IDLE);
  d[0] = 0;
  d[200] = 9; // the cut
  edit(d);
  return d;
};

test("a 4 s freeze is flagged, ambient motion is not", () => {
  assert.deepEqual(stillRuns(curve(() => {}), scenes), []);
  const frozen = curve((d) => d.fill(0, 20, 140));
  assert.deepEqual(stillRuns(frozen, scenes), [[20, 139]]);
});

test("a still hold at the end of a scene is fine", () => {
  assert.deepEqual(stillRuns(curve((d) => d.fill(0, 100, 200)), scenes), []);
});

test("a scene whose last second is still moving has no hold", () => {
  assert.deepEqual(restlessTails(curve(() => {}), scenes), []);
  assert.deepEqual(restlessTails(curve((d) => (d[390] = 3)), scenes), [{ id: "b", frame: 390 }]);
  assert.deepEqual(restlessTails(curve((d) => (d[160] = 3)), scenes), []);
});

test("Inko blinking in the tail is still a hold", () => {
  assert.deepEqual(restlessTails(curve((d) => d.fill(1.3, 185, 191)), scenes), []);
});

test("black frames and long empty stretches are flagged", () => {
  const mean = Array.from({ length: 100 }, () => 230);
  const std = Array.from({ length: 100 }, () => 40);
  mean[50] = 0;
  std.fill(0.7, 0, 5); // an entrance on bare paper: short, fine
  std.fill(0.7, 60, 90);
  assert.deepEqual(blankRuns(mean, std), { black: [[50, 50]], empty: [[60, 89]] });
});

test("subtitle budgets are re-checked from the file", () => {
  const vtt = [
    "WEBVTT",
    "1\n00:00:00.000 --> 00:00:02.000\nshort &amp; fine",
    `2\n00:00:02.000 --> 00:00:04.000\n${"x".repeat(60)}`,
    "3\n00:00:04.000 --> 00:00:11.000\none\ntwo\nthree",
  ].join("\n\n");
  const { errors } = subtitleIssues(vtt);
  assert.equal(errors.length, 3);
  assert.match(errors[0]!, /60-char line/);
  assert.match(errors[1]!, /3 lines/);
  assert.match(errors[2]!, /7 s on screen/);
  assert.deepEqual(subtitleIssues("WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.500\n&lt;canvas&gt;\n"), { errors: [], warnings: [] });
  // Exactly 6 s, where 8.3 - 2.3 in floats is 6.000000000000001.
  assert.deepEqual(subtitleIssues("WEBVTT\n\n1\n00:00:02.300 --> 00:00:08.300\nsix seconds\n").errors, []);
});

test("reads the ebur128 summary", () => {
  const log = "[Parsed_ebur128_0] Summary:\n\n  Integrated loudness:\n    I:         -16.3 LUFS\n  True peak:\n    Peak:       -1.4 dBFS\n";
  assert.deepEqual(parseLoudness(log), { lufs: -16.3, peak: -1.4 });
  assert.equal(parseLoudness("no audio"), null);
});

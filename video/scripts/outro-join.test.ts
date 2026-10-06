import assert from "node:assert/strict";
import { test } from "node:test";
import type { Timing } from "../src/scene/timing";
import type { OutroClip } from "./outro-clip";
import { concatList, joinedFrames, joinVtt, lessonVtt, videoSignature, voiceMixArgs } from "./outro-join";

const timing: Timing = {
  fps: 30,
  width: 1280,
  height: 720,
  scenes: [
    { id: "a", from: 0, durationInFrames: 5000 },
    { id: "b", from: 5000, durationInFrames: 4323 },
  ],
  words: [],
  cues: {},
};
const clip: OutroClip = { fps: 30, frames: 434, cues: { like: 0, sub: 47, next: 130 }, leaveFrames: 26 };

test("joined length is the lesson plus the clip", () => {
  assert.equal(joinedFrames(timing, clip), 9757);
});

test("the concat list quotes paths for ffmpeg", () => {
  assert.equal(concatList(["C:\\a b\\it's.mp4", "x.mp4"]), "file 'C:/a b/it'\\''s.mp4'\nfile 'x.mp4'\n");
});

test("the video signature ignores the bitrate and nothing else", () => {
  const line = (kbps: number, size: string) =>
    `  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuvj420p(pc, bt470bg/unknown/unknown, progressive), ${size} [SAR 1:1 DAR 16:9], ${kbps} kb/s, 30 fps, 30 tbr, 90k tbn (default)\n`;
  assert.equal(videoSignature(line(1628, "2560x1440")), videoSignature(line(1700, "2560x1440")));
  assert.notEqual(videoSignature(line(1628, "2560x1440")), videoSignature(line(1628, "1280x720")));
  assert.equal(videoSignature("  Stream #0:1: Audio: mp3, 48000 Hz\n"), null);
});

test("voice mix cuts each part to its exact sample count", () => {
  const args = voiceMixArgs([{ file: "l.mp3", frames: 9323 }, { file: "o.mp3", frames: 434 }], 30, "mix.wav");
  const graph = args[args.indexOf("-filter_complex") + 1]!;
  assert.match(graph, /atrim=end_sample=14916800/);
  assert.match(graph, /atrim=end_sample=694400/);
  assert.match(graph, /\[a0\]\[a1\]concat=n=2:v=0:a=1\[mix\]/);
  assert.throws(() => voiceMixArgs([{ file: "x", frames: 1 }], 29, "m.wav"), /whole samples/);
});

const cue = (n: number, a: string, b: string, text: string) => `${n}\n${a} --> ${b}\n${text}\n`;

test("subtitles: the outro cues shift by the lesson length and are renumbered", () => {
  const lesson = `WEBVTT\n\n${cue(1, "00:00:01.000", "00:00:03.000", "Hello")}\n${cue(2, "00:05:09.000", "00:05:13.000", "Bye")}`;
  const outro = `WEBVTT\n\n${cue(1, "00:00:00.000", "00:00:01.567", "Like it")}\n${cue(2, "00:00:01.567", "00:00:04.000", "two\nlines")}`;
  const out = joinVtt(lesson, outro, 9323, 30);
  assert.match(out, /^WEBVTT\n\n1\n00:00:01\.000 --> 00:00:03\.000\nHello\n\n2\n00:05:09\.000 --> 00:05:10\.767\nBye\n/);
  assert.match(out, /3\n00:05:10\.767 --> 00:05:12\.334\nLike it\n\n4\n00:05:12\.334 --> 00:05:14\.767\ntwo\nlines\n$/);
});

test("subtitles: the lesson's cues come back out of a joined file", () => {
  const lesson = `WEBVTT\n\n${cue(1, "00:00:01.000", "00:00:03.000", "Hello")}\n${cue(2, "00:05:09.000", "00:05:13.000", "Bye")}`;
  const outro = `WEBVTT\n\n${cue(1, "00:00:00.000", "00:00:01.567", "Like it")}`;
  const joined = joinVtt(lesson, outro, 9323, 30);
  assert.equal(lessonVtt(joined, 9323, 30), joinVtt(lesson, "WEBVTT\n\n", 9323, 30));
});

test("subtitles: CRLF input, cues without an index and a lesson cue past the lesson end", () => {
  const lesson = "WEBVTT\r\n\r\n00:05:09.000 --> 00:05:13.000\r\nBye\r\n";
  const outro = `WEBVTT\n\n${cue(1, "00:00:00.000", "00:00:01.000", "Like it")}`;
  const out = joinVtt(lesson, outro, 9323, 30);
  assert.match(out, /^WEBVTT\n\n1\n00:05:09\.000 --> 00:05:10\.767\nBye\n\n2\n00:05:10\.767 --> 00:05:11\.767\nLike it\n$/);
});

test("voice mix accepts every frame rate that divides 48 kHz", () => {
  for (const fps of [24, 25, 30]) assert.doesNotThrow(() => voiceMixArgs([{ file: "x", frames: 1 }], fps, "m.wav"));
});

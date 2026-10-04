import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SILENT_IN_WORDS, rmsBins, silentShareInWords, wavSamples } from "./voice-align";

const FPS = 30;
const RATE = 8000;

// Speech-like noise where `spans` (seconds) say so, silence elsewhere.
function track(totalSec: number, spans: [number, number][]): Float32Array {
  const out = new Float32Array(totalSec * RATE);
  for (const [a, b] of spans) for (let i = Math.floor(a * RATE); i < Math.floor(b * RATE); i++) out[i] = 0.2 * Math.sin(i * 0.3);
  return out;
}
const words = (spans: [number, number][]) => spans.map(([a, b]) => ({ from: Math.round(a * FPS), to: Math.round(b * FPS) }));
const share = (samples: Float32Array, spans: [number, number][]) => silentShareInWords(rmsBins(samples, RATE), words(spans), FPS);

const SPEECH: [number, number][] = [[0, 4.5], [5.1, 7.3], [10.1, 14.7]];

test("a voice that sits on its words passes", () => {
  assert.ok(share(track(24, SPEECH), SPEECH) < 0.05);
});

test("short natural pauses between words stay far under the limit", () => {
  const spoken: [number, number][] = [[0, 1], [1.2, 2.4], [2.6, 3.8]];
  const voiced: [number, number][] = [[0, 1], [1.3, 2.4], [2.7, 3.8]];
  assert.ok(share(track(5, voiced), spoken) < MAX_SILENT_IN_WORDS / 2);
});

test("the same words over a shifted and cut voice fail", () => {
  const scrambled: [number, number][] = [[0, 3.5], [6, 11.5]];
  assert.ok(share(track(24, scrambled), SPEECH) > MAX_SILENT_IN_WORDS);
});

test("no words means nothing to check", () => {
  assert.equal(silentShareInWords(rmsBins(track(2, []), RATE), [], FPS), 0);
});

test("wavSamples reads the data chunk past extra chunks", () => {
  const data = Buffer.alloc(8);
  data.writeInt16LE(16384, 0);
  data.writeInt16LE(-32768, 2);
  const header = (id: string, size: number) => {
    const h = Buffer.alloc(8);
    h.write(id, 0, "ascii");
    h.writeUInt32LE(size, 4);
    return h;
  };
  const wav = Buffer.concat([Buffer.from("RIFF\0\0\0\0WAVE", "ascii"), header("LIST", 3), Buffer.from([1, 2, 3, 0]), header("data", 4), data.subarray(0, 4)]);
  const samples = wavSamples(wav);
  assert.deepEqual([...samples], [0.5, -1]);
});

// A lesson-like track: 1.8 s of speech then a 0.5 s pause, repeated (22% silence), words inside the speech.
const DENSE_VOICE: [number, number][] = Array.from({ length: 25 }, (_, i) => [i * 2.3, i * 2.3 + 1.8]);
const DENSE_WORDS: [number, number][] = DENSE_VOICE.map(([a, b]) => [a + 0.05, b - 0.05]);

test("on a dense, lesson-like track the right voice passes and one moved by a second fails", () => {
  const voice = track(60, DENSE_VOICE);
  assert.ok(share(voice, DENSE_WORDS) < 0.1);
  const moved = DENSE_WORDS.map(([a, b]): [number, number] => [a + 1.15, b + 1.15]);
  assert.ok(share(voice, moved) > MAX_SILENT_IN_WORDS, `got ${share(voice, moved)}`);
});

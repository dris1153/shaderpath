import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { parseElevenlabs } from "./elevenlabs";
import { alignWords } from "./engine";
import { parseFish } from "./fish";

// elevenlabs.json: one real call (audio scrubbed). fish.sse: the three SSE
// events from Fish's API reference, verbatim.
// Git may check fixtures out with CRLF on Windows.
const fixture = (name: string) =>
  fs.readFileSync(path.join(import.meta.dirname, "fixtures", name), "utf8").replace(/\r\n/g, "\n");
const words = (text: string) => text.split(/\s+/).filter(Boolean);

test("ElevenLabs characters fold into timed words", () => {
  const { marks } = parseElevenlabs(fixture("elevenlabs.json"));
  const text = marks.map((m) => m.text).join("");
  assert.equal(text, "Every pixel on your screen has an address. Let's find it together, one tentacle at a time!");
  const times = alignWords(words(text), marks);
  assert.equal(times.length, 17);
  assert.equal(times[0]!.start, 0);
  // A word ends with its last letter; the "!" after it is not speech.
  assert.equal(times.at(-1)!.end, marks.at(-2)!.end);
  for (const [i, t] of times.entries()) {
    assert.ok(t.end > t.start, `word ${i} has length`);
    if (i) assert.ok(t.start >= times[i - 1]!.end, `word ${i} follows the one before`);
  }
});

test("Fish snapshots replace per chunk and offsets shift later chunks", () => {
  const { marks } = parseFish(fixture("fish.sse"));
  // Chunk 0 arrives twice (a snapshot, then its replacement): 50 + 36, not 136.
  assert.equal(marks.length, 86);
  assert.deepEqual(marks[50], { text: "Seeing", start: 16.24 + 0.4, end: marks[50]!.end });
  const content = fixture("fish.sse")
    .split("\n\n")
    .filter((b) => b.trim())
    .map((b) => JSON.parse(b.slice("data: ".length)).content as string);
  // The script says "it’s" and "I’ve"; Fish marks read "its" and "Ive".
  const times = alignWords(words(`${content[0]} ${content[2]}`), marks);
  assert.equal(times[3]!.start, 0.8);
  assert.equal(times.at(-1)!.end, marks.at(-1)!.end);
});

test("a phrase mark is split across its words by character share", () => {
  const times = alignWords(["Hello,", "there!"], [{ text: "hello there", start: 0, end: 1.1 }]);
  assert.deepEqual(times.map((t) => [+t.start.toFixed(3), +t.end.toFixed(3)]), [[0, 0.55], [0.55, 1.1]]);
});

test("a word without letters takes no time", () => {
  const times = alignWords(["one", "—", "two"], [
    { text: "one", start: 0, end: 0.3 },
    { text: "two", start: 0.5, end: 0.8 },
  ]);
  assert.deepEqual(times[1], { start: 0.3, end: 0.3 });
});

test("marks that disagree with the script fail loudly", () => {
  assert.throws(
    () => alignWords(["x", "is", "0.5"], [{ text: "x is zero point five", start: 0, end: 1 }]),
    /diverge from the script near/,
  );
  assert.throws(() => alignWords(["one", "two"], [{ text: "one", start: 0, end: 1 }]), /diverge/);
});

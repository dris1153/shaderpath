import assert from "node:assert/strict";
import { test } from "node:test";
import { finalArgs, languageTag } from "./final-args";

test("language tags are ISO 639-2; an unknown language is an error", () => {
  assert.equal(languageTag("en"), "eng");
  assert.equal(languageTag("vi"), "vie");
  assert.throws(() => languageTag("fr"), /no language tag for "fr"/);
});

test("the mux copies the picture, encodes the voice to AAC, adds the subtitles as a default soft track, and tags them", () => {
  const args = finalArgs("pic.mp4", "voice.mp3", "in.vtt", "out.mp4", "vi");
  const at = (flag: string) => args[args.indexOf(flag) + 1];
  const inputs = args.flatMap((a, i) => (a === "-i" ? [args[i + 1]] : []));
  assert.deepEqual(inputs, ["pic.mp4", "voice.mp3", "in.vtt"]);
  const maps = args.flatMap((a, i) => (a === "-map" ? [args[i + 1]] : []));
  assert.deepEqual(maps, ["0:v", "1:a", "2:0"]);
  assert.equal(at("-c:v"), "copy");
  assert.equal(at("-c:a"), "aac");
  assert.equal(at("-b:a"), "128k");
  assert.equal(at("-c:s"), "mov_text");
  assert.equal(at("-metadata:s:a:0"), "language=vie");
  assert.equal(at("-metadata:s:s:0"), "language=vie");
  assert.equal(at("-disposition:s:0"), "default");
  assert.ok(args.includes("+faststart"));
  assert.equal(args.at(-1), "out.mp4");
  assert.throws(() => finalArgs("a", "b", "c", "d", "xx"), /no language tag/);
});

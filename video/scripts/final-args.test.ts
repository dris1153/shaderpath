import assert from "node:assert/strict";
import { test } from "node:test";
import { finalArgs, languageTag } from "./final-args";

test("language tags are ISO 639-2; an unknown language is an error", () => {
  assert.equal(languageTag("en"), "eng");
  assert.equal(languageTag("vi"), "vie");
  assert.throws(() => languageTag("fr"), /no language tag for "fr"/);
});

test("the mux copies picture and voice, adds the subtitles as a default soft track, and tags them", () => {
  const args = finalArgs("in.mp4", "in.vtt", "out.mp4", "vi");
  const at = (flag: string) => args[args.indexOf(flag) + 1];
  assert.deepEqual(args.slice(args.indexOf("-i"), args.indexOf("-i") + 4), ["-i", "in.mp4", "-i", "in.vtt"]);
  assert.equal(at("-c:v"), "copy");
  assert.equal(at("-c:a"), "copy");
  assert.equal(at("-c:s"), "mov_text");
  assert.equal(at("-metadata:s:a:0"), "language=vie");
  assert.equal(at("-metadata:s:s:0"), "language=vie");
  assert.equal(at("-disposition:s:0"), "default");
  assert.equal(args.at(-1), "out.mp4");
  assert.throws(() => finalArgs("a", "b", "c", "xx"), /no language tag/);
});

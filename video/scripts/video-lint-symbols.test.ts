import assert from "node:assert/strict";
import { test } from "node:test";
import { symbolWarnings } from "./video-lint-symbols";

const flagged = (strings: Record<string, string>) => symbolWarnings(strings).map((w) => /"(\w+)"/.exec(w)![1]);

test("dot and cross between vectors are fine", () => {
  assert.deepEqual(flagged({ a: "a · b", b: "a × b", c: "max(0, N · L)", d: "b × a = −(a × b)", e: "f · d =", f: "a · b = |a| |b| cos θ" }), []);
});

test("numbers multiplied with · or × are flagged, * is not", () => {
  assert.deepEqual(flagged({ a: "3 · 2 = 6", b: "(4, −2) × −1.5", c: "3 * 2 = 6", d: "2v" }), ["a", "b"]);
});

test("a dot or cross beside a member access is flagged", () => {
  assert.deepEqual(flagged({ a: "a.x·b.x", b: "a.x * b.x + a.y * b.y", c: "three.js · glTF", d: "dot(a, b) = a.x * b.x" }), ["a", "c"]);
});

test("decorative separators are not flagged, even beside a number", () => {
  assert.deepEqual(flagged({ a: "top-left · squares", b: "DirectX · Unity", c: "0 → 1 · pixel centers" }), []);
});

test("vector markers are fine on math, flagged on code and when malformed", () => {
  assert.deepEqual(flagged({ a: "{a} · {b}", b: "{a} · {b} = a.x * b.x + a.y * b.y", c: "|{v}| = √(x² + y²)", d: "2{v}" }), []);
  assert.deepEqual(flagged({ a: "{a}.x * {b}.x", b: "{a · {b}", c: "a}" }), ["a", "b", "c"]);
});

test("a marked string with a leading, trailing or doubled space is flagged", () => {
  assert.deepEqual(flagged({ a: "{a} ·", b: " {a}", c: "{a}  {b}", d: "{a} {b}", e: "a  b" }), ["b", "c"]);
});

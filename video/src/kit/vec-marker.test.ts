import assert from "node:assert/strict";
import { test } from "node:test";
import { hasVecMarker, parseVec, vecPlain } from "./vec-marker";

test("a string without braces is one plain run", () => {
  assert.deepEqual(parseVec("a.x * b.x"), [{ text: "a.x * b.x", arrow: false }]);
  assert.equal(hasVecMarker("a.x * b.x"), false);
});

test("braced letters become arrow runs between plain runs", () => {
  assert.equal(hasVecMarker("{a}"), true);
  assert.deepEqual(parseVec("{a} · {b} = |{a}|"), [
    { text: "a", arrow: true },
    { text: " · ", arrow: false },
    { text: "b", arrow: true },
    { text: " = |", arrow: false },
    { text: "a", arrow: true },
    { text: "|", arrow: false },
  ]);
});

test("adjacent markers and multi-letter markers", () => {
  assert.deepEqual(parseVec("{a}{b}"), [
    { text: "a", arrow: true },
    { text: "b", arrow: true },
  ]);
  assert.deepEqual(parseVec("{AB}"), [{ text: "AB", arrow: true }]);
});

test("plain text on either side of a code member access stays untouched", () => {
  assert.deepEqual(parseVec("{a} · {b} = a.x * b.x"), [
    { text: "a", arrow: true },
    { text: " · ", arrow: false },
    { text: "b", arrow: true },
    { text: " = a.x * b.x", arrow: false },
  ]);
});

test("malformed markers throw and name the string", () => {
  assert.throws(() => parseVec("{a"), /unclosed.*"\{a"|"\{a".*unclosed/);
  assert.throws(() => parseVec("a}"), /unmatched/);
  assert.throws(() => parseVec("{}"), /empty/);
  assert.throws(() => parseVec("{{a}}"), /nested/);
});

test("vecPlain drops the markers and keeps everything else", () => {
  assert.equal(vecPlain("{a} · {b} = a.x * b.x"), "a · b = a.x * b.x");
  assert.equal(vecPlain("dot(a, b)"), "dot(a, b)");
});

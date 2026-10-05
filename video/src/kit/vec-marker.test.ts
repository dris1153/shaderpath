import assert from "node:assert/strict";
import { test } from "node:test";
import { hasVecMarker, parseVec, vecPlain } from "./vec-marker";

const plain = (text: string) => ({ text, kind: "plain" });
const arrow = (text: string) => ({ text, kind: "arrow" });
const root = (text: string) => ({ text, kind: "root" });

test("a string without braces is one plain run", () => {
  assert.deepEqual(parseVec("a.x * b.x"), [plain("a.x * b.x")]);
  assert.equal(hasVecMarker("a.x * b.x"), false);
});

test("braced letters become arrow runs between plain runs", () => {
  assert.equal(hasVecMarker("{a}"), true);
  assert.deepEqual(parseVec("{a} · {b} = |{a}|"), [
    arrow("a"),
    plain(" · "),
    arrow("b"),
    plain(" = |"),
    arrow("a"),
    plain("|"),
  ]);
});

test("adjacent markers and multi-letter markers", () => {
  assert.deepEqual(parseVec("{a}{b}"), [arrow("a"), arrow("b")]);
  assert.deepEqual(parseVec("{AB}"), [arrow("AB")]);
});

test("plain text on either side of a code member access stays untouched", () => {
  assert.deepEqual(parseVec("{a} · {b} = a.x * b.x"), [arrow("a"), plain(" · "), arrow("b"), plain(" = a.x * b.x")]);
});

test("braces right after a radical sign are the radicand", () => {
  assert.deepEqual(parseVec("√{x}"), [plain("√"), root("x")]);
  assert.deepEqual(parseVec("√{x² + y²}"), [plain("√"), root("x² + y²")]);
  assert.deepEqual(parseVec("= √{25} = 5"), [plain("= √"), root("25"), plain(" = 5")]);
});

test("a radicand and arrows can share a string", () => {
  assert.deepEqual(parseVec("|{v}| = √{x² + y²}"), [plain("|"), arrow("v"), plain("| = √"), root("x² + y²")]);
});

test("several radicands and arrows in one string", () => {
  assert.deepEqual(parseVec("√{a} + √{b}"), [plain("√"), root("a"), plain(" + √"), root("b")]);
  assert.deepEqual(parseVec("{a}√{x}"), [arrow("a"), plain("√"), root("x")]);
});

test("a space between the radical sign and the braces makes an arrow, not a radicand", () => {
  assert.deepEqual(parseVec("√ {a}"), [plain("√ "), arrow("a")]);
});

test("a radical sign without braces stays plain", () => {
  assert.deepEqual(parseVec("√"), [plain("√")]);
  assert.deepEqual(parseVec("√2 ≈ 1.41"), [plain("√2 ≈ 1.41")]);
  assert.equal(hasVecMarker("√2 ≈ 1.41"), false);
});

test("malformed markers throw and name the string", () => {
  assert.throws(() => parseVec("{a"), /unclosed.*"\{a"|"\{a".*unclosed/);
  assert.throws(() => parseVec("a}"), /unmatched/);
  assert.throws(() => parseVec("{}"), /empty/);
  assert.throws(() => parseVec("√{}"), /empty/);
  assert.throws(() => parseVec("{{a}}"), /nested/);
  assert.throws(() => parseVec("√{{a} · {a}}"), /nested/);
});

test("vecPlain drops the markers and keeps everything else, the radical sign included", () => {
  assert.equal(vecPlain("{a} · {b} = a.x * b.x"), "a · b = a.x * b.x");
  assert.equal(vecPlain("dot(a, b)"), "dot(a, b)");
  assert.equal(vecPlain("√{9 + 16}"), "√9 + 16");
  assert.equal(vecPlain("|{v}| = √{x² + y²}"), "|v| = √x² + y²");
});

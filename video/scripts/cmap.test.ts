import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { codePoints, uncovered } from "./cmap";

const FONTS = path.resolve(import.meta.dirname, "..", "public", "fonts");
const baloo = codePoints(path.join(FONTS, "Baloo2.ttf"));
const nunito = codePoints(path.join(FONTS, "Nunito.ttf"));
const mono = codePoints(path.join(FONTS, "JetBrainsMono.ttf"));

const VIETNAMESE =
  "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ" +
  "ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";
const LATIN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;!?()[]{}+-*/=<>'\"&%#@_";
// Symbols lessons put on screen: arrows, Greek, comparison, multiplication.
const SYMBOLS = "→←↑↓θαβπ≤≥≈×·°";

test("the display face covers English and Vietnamese on its own", () => {
  assert.deepEqual(uncovered(LATIN + VIETNAMESE, [baloo]), []);
});

test("the body face covers English and Vietnamese on its own", () => {
  assert.deepEqual(uncovered(LATIN + VIETNAMESE, [nunito]), []);
});

test("every stack reaches the lesson symbols through a bundled fallback", () => {
  assert.deepEqual(uncovered(SYMBOLS, [baloo, nunito, mono]), []);
  assert.deepEqual(uncovered(SYMBOLS, [nunito, mono]), []);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { MONO, matrixLayout, parseMatrix } from "./mat";

const near = (actual: number, expected: number, size: number) =>
  assert.ok(Math.abs(actual - expected) <= 1e-9 * size, `expected ${expected}, got ${actual}`);

const CARD_4X4_A = "a, b, c, tx; d, e, f, ty; g, h, i, tz; 0, 0, 0, 1";
const CARD_4X4_B = "1, 0, 0, 5; 0, 1, 0, −2; 0, 0, 1, 3; 0, 0, 0, 1";

test("MONO is the JetBrains Mono advance per font size", () => {
  assert.equal(MONO, 0.6);
});

test("matrixLayout parses rows and entries via parseMatrix", () => {
  const { rows } = matrixLayout("1, 0, tx; 0, 1, ty; 0, 0, 1", 30);
  assert.deepEqual(rows, parseMatrix("1, 0, tx; 0, 1, ty; 0, 0, 1"));
  assert.deepEqual(rows[0], ["1", "0", "tx"]);
  assert.equal(rows.length, 3);
});

test("colW is longest entry per column * MONO * size + 0.9 * size", () => {
  const size = 30;
  const { colW } = matrixLayout("a, b; c, d", size);
  assert.equal(colW.length, 2);
  near(colW[0]!, 1 * MONO * size + 0.9 * size, size);
  near(colW[1]!, 1 * MONO * size + 0.9 * size, size);
});

test("colW follows the longest entry in each column, not the first row", () => {
  const size = 30;
  const { colW } = matrixLayout("1, 0, tx; 0, 1, ty; 0, 0, 1", size);
  near(colW[0]!, 1 * MONO * size + 0.9 * size, size);
  near(colW[1]!, 1 * MONO * size + 0.9 * size, size);
  near(colW[2]!, 2 * MONO * size + 0.9 * size, size);
});

test("w is the sum of colW plus 0.9 * size", () => {
  const size = 30;
  const { colW, w } = matrixLayout(CARD_4X4_A, size);
  assert.equal(colW.length, 4);
  near(w, colW.reduce((a, b) => a + b, 0) + 0.9 * size, size);
});

test("a 2-row card is exactly 2.9 * size tall", () => {
  const size = 30;
  const { h } = matrixLayout("a, b; c, d", size);
  near(h, 2.9 * size, size);
});

test("each extra row adds 1.4 * size to h", () => {
  const size = 30;
  near(matrixLayout("a, b; c, d; e, f", size).h, 2.9 * size + 1.4 * size, size);
  near(matrixLayout(CARD_4X4_A, size).h, 2.9 * size + 2 * 1.4 * size, size);
});

test("2-row baselines sit at -0.45 * size and +0.95 * size from the centre", () => {
  const size = 30;
  const { rowY } = matrixLayout("a, b; c, d", size);
  near(rowY[0]!, -0.45 * size, size);
  near(rowY[1]!, 0.95 * size, size);
});

test("each row baseline sits 1.4 * size below the previous one", () => {
  const size = 17;
  const { rowY, h } = matrixLayout(CARD_4X4_A, size);
  assert.equal(rowY.length, 4);
  near(rowY[0]!, -h / 2 + size, size);
  for (let r = 1; r < rowY.length; r++) near(rowY[r]! - rowY[r - 1]!, 1.4 * size, size);
});

test("centres are strictly increasing", () => {
  const { centres } = matrixLayout(CARD_4X4_A, 30);
  for (let c = 1; c < centres.length; c++) assert.ok(centres[c]! > centres[c - 1]!);
});

test("first centre is -w/2 + 0.45 * size + colW[0]/2", () => {
  const size = 30;
  const { colW, w, centres } = matrixLayout("1, 0, tx; 0, 1, ty; 0, 0, 1", size);
  near(centres[0]!, -w / 2 + 0.45 * size + colW[0]! / 2, size);
});

test("consecutive centres are (colW[c] + colW[c+1]) / 2 apart", () => {
  const size = 30;
  const { colW, centres } = matrixLayout(CARD_4X4_A, size);
  for (let c = 0; c < centres.length - 1; c++) {
    near(centres[c + 1]! - centres[c]!, (colW[c]! + colW[c + 1]!) / 2, size);
  }
});

test("outer column edges are 0.45 * size inside the card on both sides", () => {
  const size = 30;
  const { colW, w, centres } = matrixLayout(CARD_4X4_A, size);
  const last = centres.length - 1;
  near(centres[0]! - colW[0]! / 2, -w / 2 + 0.45 * size, size);
  near(centres[last]! + colW[last]! / 2, w / 2 - 0.45 * size, size);
});

test("cards with equal column widths produce identical colW and centres", () => {
  const size = 30;
  const a = matrixLayout(CARD_4X4_A, size);
  const b = matrixLayout(CARD_4X4_B, size);
  assert.equal(a.colW.length, b.colW.length);
  for (let c = 0; c < a.colW.length; c++) {
    near(a.colW[c]!, b.colW[c]!, size);
    near(a.centres[c]!, b.centres[c]!, size);
  }
  near(a.w, b.w, size);
  near(a.h, b.h, size);
});

test("all dimensions scale linearly with size", () => {
  const small = matrixLayout(CARD_4X4_A, 10);
  const big = matrixLayout(CARD_4X4_A, 20);
  for (let c = 0; c < small.colW.length; c++) {
    near(big.colW[c]!, 2 * small.colW[c]!, 20);
    near(big.centres[c]!, 2 * small.centres[c]!, 20);
  }
  near(big.w, 2 * small.w, 20);
  near(big.h, 2 * small.h, 20);
  for (let r = 0; r < small.rowY.length; r++) near(big.rowY[r]!, 2 * small.rowY[r]!, 20);
});

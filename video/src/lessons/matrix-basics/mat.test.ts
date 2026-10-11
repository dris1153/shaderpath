import assert from "node:assert/strict";
import { test } from "node:test";
import { IDENTITY, apply, mix, mul, parseMatrix, rotation, scaling, svgMatrix } from "./mat";

const eps = 1e-10;

const approxEqual = (a: number, b: number) => Math.abs(a - b) < eps;

test("IDENTITY is the identity matrix", () => {
  assert.deepEqual(IDENTITY, { a: 1, b: 0, c: 0, d: 1 });
});

test("apply reads matrix by columns: (1,0) maps to column 1 (a,c), (0,1) maps to column 2 (b,d)", () => {
  const m = { a: 2, b: 3, c: 4, d: 5 };
  const v1 = apply(m, { x: 1, y: 0 });
  assert.deepEqual(v1, { x: 2, y: 4 });

  const v2 = apply(m, { x: 0, y: 1 });
  assert.deepEqual(v2, { x: 3, y: 5 });
});

test("apply identity returns the same vector", () => {
  const v = { x: 3, y: 7 };
  const result = apply(IDENTITY, v);
  assert.deepEqual(result, v);
});

test("apply does matrix-vector multiplication", () => {
  const m = { a: 2, b: 3, c: 4, d: 5 };
  const v = { x: 1, y: 2 };
  const result = apply(m, v);
  assert.deepEqual(result, { x: 2 * 1 + 3 * 2, y: 4 * 1 + 5 * 2 });
  assert.deepEqual(result, { x: 8, y: 14 });
});

test("mul(m, n) means apply n first, then m: apply(mul(m, n), v) === apply(m, apply(n, v))", () => {
  const m = { a: 2, b: 1, c: 3, d: 4 };
  const n = { a: 1, b: 2, c: 3, d: 1 };
  const v = { x: 5, y: 6 };

  const composed = mul(m, n);
  const result1 = apply(composed, v);
  const nv = apply(n, v);
  const result2 = apply(m, nv);

  assert.deepEqual(result1, result2);
  assert.deepEqual(result1, { x: 55, y: 135 });
});

test("mul(IDENTITY, m) returns m", () => {
  const m = { a: 2, b: 3, c: 4, d: 5 };
  const result = mul(IDENTITY, m);
  assert.deepEqual(result, m);
});

test("mul(m, IDENTITY) returns m", () => {
  const m = { a: 2, b: 3, c: 4, d: 5 };
  const result = mul(m, IDENTITY);
  assert.deepEqual(result, m);
});

test("rotation(90 deg) ≈ {a: 0, b: -1, c: 1, d: 0} (90° counter-clockwise)", () => {
  const r90 = rotation(90);
  assert(approxEqual(r90.a, 0), `a should be ~0, got ${r90.a}`);
  assert(approxEqual(r90.b, -1), `b should be ~-1, got ${r90.b}`);
  assert(approxEqual(r90.c, 1), `c should be ~1, got ${r90.c}`);
  assert(approxEqual(r90.d, 0), `d should be ~0, got ${r90.d}`);
});

test("rotation(0) is IDENTITY", () => {
  const r0 = rotation(0);
  assert(approxEqual(r0.a, 1));
  assert(approxEqual(r0.b, 0));
  assert(approxEqual(r0.c, 0));
  assert(approxEqual(r0.d, 1));
});

test("rotation(180) ≈ {a: -1, b: 0, c: 0, d: -1}", () => {
  const r180 = rotation(180);
  assert(approxEqual(r180.a, -1));
  assert(approxEqual(r180.b, 0));
  assert(approxEqual(r180.c, 0));
  assert(approxEqual(r180.d, -1));
});

test("rotation(-90) ≈ {a: 0, b: 1, c: -1, d: 0} (90° clockwise)", () => {
  const r_90 = rotation(-90);
  assert(approxEqual(r_90.a, 0));
  assert(approxEqual(r_90.b, 1));
  assert(approxEqual(r_90.c, -1));
  assert(approxEqual(r_90.d, 0));
});

test("rotation matrices keep both columns at unit length and perpendicular", () => {
  const r = rotation(37);
  const col1 = { x: r.a, y: r.c };
  const col2 = { x: r.b, y: r.d };
  const len1 = Math.sqrt(col1.x * col1.x + col1.y * col1.y);
  const len2 = Math.sqrt(col2.x * col2.x + col2.y * col2.y);
  const dot = col1.x * col2.x + col1.y * col2.y;

  assert(approxEqual(len1, 1), `col1 length should be 1, got ${len1}`);
  assert(approxEqual(len2, 1), `col2 length should be 1, got ${len2}`);
  assert(approxEqual(dot, 0), `columns should be perpendicular, dot product is ${dot}`);
});

test("lesson example: rotation(90), scaling(2, 1), v = (1, 0)", () => {
  const R = rotation(90);
  const S = scaling(2, 1);
  const v = { x: 1, y: 0 };

  const RS = mul(R, S);
  const vRS = apply(RS, v);
  assert(approxEqual(vRS.x, 0), `mul(R, S) * (1, 0) x should be ~0, got ${vRS.x}`);
  assert(approxEqual(vRS.y, 2), `mul(R, S) * (1, 0) y should be ~2, got ${vRS.y}`);

  const SR = mul(S, R);
  const vSR = apply(SR, v);
  assert(approxEqual(vSR.x, 0), `mul(S, R) * (1, 0) x should be ~0, got ${vSR.x}`);
  assert(approxEqual(vSR.y, 1), `mul(S, R) * (1, 0) y should be ~1, got ${vSR.y}`);
});

test("scaling(sx, sy) scales components independently", () => {
  const s = scaling(2, 3);
  const v = { x: 4, y: 5 };
  const result = apply(s, v);
  assert.deepEqual(result, { x: 8, y: 15 });
});

test("scaling theory example: scaling(2, 1) * (3, 4) = (6, 4)", () => {
  const s = scaling(2, 1);
  const v = { x: 3, y: 4 };
  const result = apply(s, v);
  assert.deepEqual(result, { x: 6, y: 4 });
});

test("mix(m, n, 0) returns m", () => {
  const m = { a: 1, b: 2, c: 3, d: 4 };
  const n = { a: 5, b: 6, c: 7, d: 8 };
  const result = mix(m, n, 0);
  assert.deepEqual(result, m);
});

test("mix(m, n, 1) returns n", () => {
  const m = { a: 1, b: 2, c: 3, d: 4 };
  const n = { a: 5, b: 6, c: 7, d: 8 };
  const result = mix(m, n, 1);
  assert.deepEqual(result, n);
});

test("mix(m, n, 0.5) returns the midpoint", () => {
  const m = { a: 0, b: 0, c: 0, d: 0 };
  const n = { a: 2, b: 4, c: 6, d: 8 };
  const result = mix(m, n, 0.5);
  assert.deepEqual(result, { a: 1, b: 2, c: 3, d: 4 });
});

test("svgMatrix parses the SVG matrix string format", () => {
  const m = { a: 2, b: 3, c: 4, d: 5, e: 6, f: 7 };
  const svg = svgMatrix(m, { x: 0, y: 0 });
  assert(svg.startsWith("matrix("));
  assert(svg.endsWith(")"));
  const content = svg.slice(7, -1);
  const parts = content.split(" ");
  assert.equal(parts.length, 6);
});

test("svgMatrix pivot: the pivot point maps to itself", () => {
  const m = { a: 2, b: 0, c: 0, d: 3 };
  const pivot = { x: 10, y: 20 };
  const svg = svgMatrix(m, pivot);
  const content = svg.slice(7, -1);
  const nums = content.split(" ").map(Number);
  const A = nums[0]!;
  const B = nums[1]!;
  const C = nums[2]!;
  const D = nums[3]!;
  const E = nums[4]!;
  const F = nums[5]!;

  const x_new = A * pivot.x + C * pivot.y + E;
  const y_new = B * pivot.x + D * pivot.y + F;

  assert(approxEqual(x_new, pivot.x), `pivot.x mapped to ${x_new}, expected ${pivot.x}`);
  assert(approxEqual(y_new, pivot.y), `pivot.y mapped to ${y_new}, expected ${pivot.y}`);
});

test("svgMatrix coordinate system: y down (SVG) transforms y-up matrices correctly", () => {
  const R = rotation(90);
  const pivot = { x: 100, y: 100 };
  const svg = svgMatrix(R, pivot);
  const content = svg.slice(7, -1);
  const nums = content.split(" ").map(Number);
  const A = nums[0]!;
  const B = nums[1]!;
  const C = nums[2]!;
  const D = nums[3]!;
  const E = nums[4]!;
  const F = nums[5]!;

  const point = { x: 110, y: 100 };
  const x_new = A * point.x + C * point.y + E;
  const y_new = B * point.x + D * point.y + F;

  assert(approxEqual(x_new, pivot.x), `point 10px right should stay at x=${pivot.x}, got ${x_new}`);
  assert(approxEqual(y_new, 90), `point 10px right of pivot should map 10px above (y smaller), got ${y_new}`);
});

test("svgMatrix scaling(2, 1): point 10px right maps to 20px right", () => {
  const S = scaling(2, 1);
  const pivot = { x: 100, y: 100 };
  const svg = svgMatrix(S, pivot);
  const content = svg.slice(7, -1);
  const nums = content.split(" ").map(Number);
  const A = nums[0]!;
  const B = nums[1]!;
  const C = nums[2]!;
  const D = nums[3]!;
  const E = nums[4]!;
  const F = nums[5]!;

  const point = { x: 110, y: 100 };
  const x_new = A * point.x + C * point.y + E;
  const y_new = B * point.x + D * point.y + F;

  assert(approxEqual(x_new, 120), `point 10px right should map to 120 (10*2 + 100), got ${x_new}`);
  assert(approxEqual(y_new, 100), `point at pivot.y should stay at 100, got ${y_new}`);
});

test("parseMatrix parses row format 'a, b; c, d'", () => {
  const result = parseMatrix("1, 2; 3, 4");
  assert.deepEqual(result, [["1", "2"], ["3", "4"]]);
});

test("parseMatrix trims whitespace from entries", () => {
  const result = parseMatrix("  1  ,  2  ;  3  ,  4  ");
  assert.deepEqual(result, [["1", "2"], ["3", "4"]]);
});

test("parseMatrix preserves mathematical symbols like U+2212 minus", () => {
  const result = parseMatrix("cos θ, −sin θ; sin θ, cos θ");
  assert.deepEqual(result, [["cos θ", "−sin θ"], ["sin θ", "cos θ"]]);
});

test("parseMatrix handles single row", () => {
  const result = parseMatrix("a, b, c");
  assert.deepEqual(result, [["a", "b", "c"]]);
});

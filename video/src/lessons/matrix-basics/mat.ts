import type { Vec } from "../../kit/grid";

// A 2×2 matrix as the theory writes it, [[a, b], [c, d]]: column 1 (a, c) is where
// î lands, column 2 (b, d) is where ĵ lands.
export type Mat = { a: number; b: number; c: number; d: number };
export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1 };

export function apply(m: Mat, v: Vec): Vec {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}

// m after n: (m * n) v = m (n v).
export function mul(m: Mat, n: Mat): Mat {
  return { a: m.a * n.a + m.b * n.c, b: m.a * n.b + m.b * n.d, c: m.c * n.a + m.d * n.c, d: m.c * n.b + m.d * n.d };
}

export function mix(m: Mat, n: Mat, p: number): Mat {
  return { a: m.a + (n.a - m.a) * p, b: m.b + (n.b - m.b) * p, c: m.c + (n.c - m.c) * p, d: m.d + (n.d - m.d) * p };
}

export function rotation(deg: number): Mat {
  const r = (deg * Math.PI) / 180;
  return { a: Math.cos(r), b: -Math.sin(r), c: Math.sin(r), d: Math.cos(r) };
}

export function scaling(sx: number, sy: number): Mat {
  return { a: sx, b: 0, c: 0, d: sy };
}

// SVG transform applying a y-up matrix to stage drawings (y down) around `pivot` (stage px).
export function svgMatrix(m: Mat, pivot: Vec): string {
  const A = m.a;
  const B = -m.c;
  const C = -m.b;
  const D = m.d;
  const E = pivot.x - (A * pivot.x + C * pivot.y);
  const F = pivot.y - (B * pivot.x + D * pivot.y);
  return `matrix(${A} ${B} ${C} ${D} ${E} ${F})`;
}

// "a, b; c, d" → rows of entries.
export function parseMatrix(text: string): string[][] {
  return text.split(";").map((row) => row.split(",").map((e) => e.trim()));
}

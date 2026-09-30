// Inko's tentacles are procedural: a chain of segments whose angles are a rest
// pose + a curl toward the tip + a travelling sine wave, optionally blended
// toward a target point. Pure geometry, so it is unit-tested without React.

export type Vec = { x: number; y: number };

export type TentacleSpec = {
  base: Vec; // attach point, Inko-local
  angle: number; // rest direction of the first segment (0 = right, π/2 = down)
  length: number;
  curl: number; // extra bend reached at the tip, radians
  phase: number;
  width: [base: number, tip: number];
};

export type TentacleDrive = {
  time: number; // radians of the idle wave
  amp: number; // idle wave amplitude, radians
  target?: Vec; // Inko-local point to reach for
  reach?: number; // 0 = idle, 1 = fully aimed at the target
};

export const SEGMENTS = 16;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number) {
  const d = ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * t;
}

export function centerline(spec: TentacleSpec, drive: TentacleDrive): Vec[] {
  const pts: Vec[] = [spec.base];
  const reach = drive.target ? Math.max(0, Math.min(1, drive.reach ?? 1)) : 0;
  let aim = 0;
  let stretch = 1;
  if (drive.target) {
    const dx = drive.target.x - spec.base.x;
    const dy = drive.target.y - spec.base.y;
    aim = Math.atan2(dy, dx);
    // Cartoon rubber: an aimed tentacle may stretch well past its rest length.
    stretch = Math.max(0.6, Math.min(3.2, Math.hypot(dx, dy) / spec.length));
  }
  const seg = (spec.length / SEGMENTS) * lerp(1, stretch, reach);
  let p = spec.base;
  for (let i = 0; i < SEGMENTS; i++) {
    const u = (i + 1) / SEGMENTS;
    const wave = drive.amp * Math.sin(drive.time + spec.phase + i * 0.5) * u;
    const idle = spec.angle + spec.curl * u * u + wave;
    // Aimed tentacles stay nearly straight, with a small living wave and a
    // curl in the last fifth so the tip still reads as a tentacle.
    const aimed = aim + wave * 0.35 + Math.sign(spec.curl || 1) * 0.9 * Math.max(0, u - 0.8);
    const a = reach > 0 ? lerpAngle(idle, aimed, reach) : idle;
    p = { x: p.x + Math.cos(a) * seg, y: p.y + Math.sin(a) * seg };
    pts.push(p);
  }
  return pts;
}

export function widthAt(spec: TentacleSpec, i: number, count: number) {
  return lerp(spec.width[0], spec.width[1], i / (count - 1));
}

function smooth(points: Vec[]): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// Closed outline around the centerline: tapering sides, round tip.
export function outlinePath(spec: TentacleSpec, pts: Vec[]): string {
  const n = pts.length;
  const left: Vec[] = [];
  const right: Vec[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(n - 1, i + 1)]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const w = widthAt(spec, i, n) / 2;
    const p = pts[i]!;
    left.push({ x: p.x + nx * w, y: p.y + ny * w });
    right.push({ x: p.x - nx * w, y: p.y - ny * w });
  }
  const tipR = spec.width[1] / 2;
  const l0 = left[0]!;
  const rTip = right[n - 1]!;
  const back = [...right].reverse();
  return [
    `M ${l0.x.toFixed(2)} ${l0.y.toFixed(2)}`,
    smooth(left),
    // sweep 0: in y-down space this bulges forward, past the tip.
    `A ${tipR} ${tipR} 0 0 0 ${rTip.x.toFixed(2)} ${rTip.y.toFixed(2)}`,
    smooth(back),
    "Z",
  ].join(" ");
}

// Pairs tentacle roots with targets so the tentacles fan out instead of
// crossing: both sides are ordered by angle around a pivot below the roots.
// With fewer targets than roots, the roots used are spread evenly.
export function assignTargets(roots: Vec[], targets: Vec[]): (Vec | undefined)[] {
  const pivot = { x: 0, y: Math.max(...roots.map((r) => r.y)) + 200 };
  const angle = (p: Vec) => Math.atan2(p.x - pivot.x, pivot.y - p.y);
  const rootOrder = roots.map((r, i) => ({ i, a: angle(r) })).sort((a, b) => a.a - b.a);
  const sorted = [...targets].sort((a, b) => angle(a) - angle(b));
  const out: (Vec | undefined)[] = Array(roots.length).fill(undefined);
  const n = Math.min(sorted.length, roots.length);
  sorted.slice(0, n).forEach((target, k) => {
    const slot = n === 1 ? Math.floor(roots.length / 2) : Math.round((k * (roots.length - 1)) / (n - 1));
    out[rootOrder[slot]!.i] = target;
  });
  return out;
}

// Sucker positions along one side of the tentacle (the outside of its curl).
export function suckers(spec: TentacleSpec, pts: Vec[]): { x: number; y: number; r: number }[] {
  const side = spec.curl >= 0 ? -1 : 1;
  const n = pts.length;
  return [5, 8, 11, 13].map((i) => {
    const a = pts[i - 1]!;
    const b = pts[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = (-(b.y - a.y) / len) * side;
    const ny = ((b.x - a.x) / len) * side;
    const w = widthAt(spec, i, n);
    const p = pts[i]!;
    return { x: p.x + nx * w * 0.18, y: p.y + ny * w * 0.18, r: w * 0.2 };
  });
}

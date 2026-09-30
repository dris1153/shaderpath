import assert from "node:assert/strict";
import { test } from "node:test";
import { SEGMENTS, assignTargets, centerline, outlinePath, suckers, type TentacleSpec } from "./tentacles";

const spec: TentacleSpec = {
  base: { x: 0, y: 0 },
  angle: Math.PI / 2,
  length: 160,
  curl: 0,
  phase: 0,
  width: [30, 8],
};

test("a straight, still tentacle hangs down its full length", () => {
  const pts = centerline(spec, { time: 0, amp: 0 });
  assert.equal(pts.length, SEGMENTS + 1);
  const tip = pts[SEGMENTS]!;
  assert.ok(Math.abs(tip.x) < 1e-9);
  assert.ok(Math.abs(tip.y - 160) < 1e-9);
});

test("the idle wave bends the tentacle but keeps its length", () => {
  const pts = centerline(spec, { time: 1.3, amp: 0.4 });
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  }
  assert.ok(Math.abs(len - 160) < 1e-6);
  assert.ok(Math.abs(pts[SEGMENTS]!.x) > 1);
});

test("a fully aimed tentacle ends near its target", () => {
  const target = { x: 120, y: -40 };
  const pts = centerline({ ...spec, curl: 1.2 }, { time: 0, amp: 0, target, reach: 1 });
  const tip = pts[SEGMENTS]!;
  // The last fifth curls on purpose, so "near", not exact.
  assert.ok(Math.hypot(tip.x - target.x, tip.y - target.y) < 15);
});

test("the outline is a closed path and suckers sit along the body", () => {
  const pts = centerline(spec, { time: 0, amp: 0.2 });
  const d = outlinePath(spec, pts);
  assert.match(d, /^M /);
  assert.match(d, / Z$/);
  assert.ok(!d.includes("NaN"));
  const s = suckers(spec, pts);
  assert.equal(s.length, 4);
  for (const c of s) assert.ok(c.r > 0 && Number.isFinite(c.x) && Number.isFinite(c.y));
});

function crosses(a1: { x: number; y: number }, a2: { x: number; y: number }, b1: { x: number; y: number }, b2: { x: number; y: number }) {
  const d = (p: typeof a1, q: typeof a1, r: typeof a1) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return d(a1, a2, b1) * d(a1, a2, b2) < 0 && d(b1, b2, a1) * d(b1, b2, a2) < 0;
}

test("assignTargets fans 8 tentacles over a grid above without crossings", () => {
  const roots = [-84, -44, 44, 84, -62, -22, 22, 62].map((x, i) => ({ x, y: i < 4 ? 30 : 40 }));
  const targets = Array.from({ length: 8 }, (_, i) => ({ x: -250 + (i % 4) * 160, y: -380 + Math.floor(i / 4) * 130 }));
  const out = assignTargets(roots, targets);
  assert.equal(out.filter(Boolean).length, 8);
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      assert.equal(crosses(roots[i]!, out[i]!, roots[j]!, out[j]!), false, `roots ${i} and ${j} cross`);
    }
  }
});

test("assignTargets spreads fewer targets across the roots", () => {
  const roots = [-60, -20, 20, 60].map((x) => ({ x, y: 40 }));
  const out = assignTargets(roots, [{ x: -200, y: -100 }, { x: 200, y: -100 }]);
  assert.deepEqual(out.map((t) => (t ? t.x : null)), [-200, null, null, 200]);
});

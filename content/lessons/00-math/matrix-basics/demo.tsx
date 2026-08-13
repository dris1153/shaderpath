"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Html, Line } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Ma trận 2×2: đọc theo cột",
    a: "a (î.x)",
    b: "b (ĵ.x)",
    c: "c (î.y)",
    d: "d (ĵ.y)",
  },
  en: {
    title: "2×2 Matrix: Reading by Columns",
    a: "a (î.x)",
    b: "b (ĵ.x)",
    c: "c (î.y)",
    d: "d (ĵ.y)",
  },
} as const;

const HALF_RANGE = 130;
const UNIT = 30; // px per math unit
const GRID_N = 3; // reference grid spans [-GRID_N, GRID_N] math units
type Pt = [number, number];

// Line shaft + a small two-segment chevron head — same pattern as the other
// Track 0 vector demos (no shader needed for flat 2D arrows).
function Arrow({ from, to, color }: { from: Pt; to: Pt; color: string }) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const headLen = 8;
  const spread = 0.5;
  const left: Pt = [
    to[0] - Math.cos(angle - spread) * headLen,
    to[1] - Math.sin(angle - spread) * headLen,
  ];
  const right: Pt = [
    to[0] - Math.cos(angle + spread) * headLen,
    to[1] - Math.sin(angle + spread) * headLen,
  ];

  return (
    <>
      <Line
        points={[
          [from[0], from[1], 0],
          [to[0], to[1], 0],
        ]}
        color={color}
        lineWidth={2}
      />
      <Line
        points={[
          [left[0], left[1], 0],
          [to[0], to[1], 0],
          [right[0], right[1], 0],
        ]}
        color={color}
        lineWidth={2}
      />
    </>
  );
}

function Basis2DScene() {
  const { values } = useDemoContext();
  const a = numberOf(values, "a", 1);
  const b = numberOf(values, "b", 0);
  const c = numberOf(values, "c", 0);
  const d = numberOf(values, "d", 1);

  // Columns of M = [[a,b],[c,d]] are exactly where î and ĵ land.
  const col1: Pt = [a * UNIT, c * UNIT];
  const col2: Pt = [b * UNIT, d * UNIT];

  // Transformed unit square: each corner is x*col1 + y*col2 (linear combination).
  const unitSquare: Pt[] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ];
  const squareCorners: [number, number, number][] = unitSquare.map(([x, y]) => [
    (x * a + y * b) * UNIT,
    (x * c + y * d) * UNIT,
    0,
  ]);

  // Static reference grid — undistorted, shows the "before" space.
  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let i = -GRID_N; i <= GRID_N; i++) {
      lines.push([
        [i * UNIT, -GRID_N * UNIT, 0],
        [i * UNIT, GRID_N * UNIT, 0],
      ]);
      lines.push([
        [-GRID_N * UNIT, i * UNIT, 0],
        [GRID_N * UNIT, i * UNIT, 0],
      ]);
    }
    return lines;
  }, []);

  return (
    <>
      {gridLines.map((pts, i) => (
        <Line key={i} points={pts} color="#3a3a44" lineWidth={1} />
      ))}
      <Line points={squareCorners} color="#e5e7eb" lineWidth={1.5} />
      <Arrow from={[0, 0]} to={col1} color="#ef4444" />
      <Arrow from={[0, 0]} to={col2} color="#3b82f6" />
      <Html position={[-HALF_RANGE * 0.94, HALF_RANGE * 0.86, 0]} occlude={false}>
        <div className="bg-background/85 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap shadow-sm">
          î → ({a.toFixed(2)}, {c.toFixed(2)})
          <br />
          ĵ → ({b.toFixed(2)}, {d.toFixed(2)})
        </div>
      </Html>
    </>
  );
}

export default function MatrixBasicsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "a", label: L.a, min: -2, max: 2, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "b", label: L.b, min: -2, max: 2, step: 0.1, defaultValue: 0 },
        { kind: "number", key: "c", label: L.c, min: -2, max: 2, step: 0.1, defaultValue: 0 },
        { kind: "number", key: "d", label: L.d, min: -2, max: 2, step: 0.1, defaultValue: 1 },
      ]}
    >
      <DemoCanvas
        orthographic
        camera={{
          position: [0, 0, 1],
          left: -HALF_RANGE,
          right: HALF_RANGE,
          top: HALF_RANGE,
          bottom: -HALF_RANGE,
          near: 0.1,
          far: 10,
          manual: true,
        }}
      >
        <Basis2DScene />
      </DemoCanvas>
    </Demo>
  );
}

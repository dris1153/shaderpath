"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Html, Line } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Dot product & phép chiếu",
    angleA: "Góc a (°)",
    lenA: "Độ dài a",
    angleB: "Góc b (°)",
    lenB: "Độ dài b",
    showPerp: "Hiện thành phần vuông góc",
    projOnB: "chiếu lên b",
  },
  en: {
    title: "Dot Product & Projection",
    angleA: "a angle (°)",
    lenA: "a length",
    angleB: "b angle (°)",
    lenB: "b length",
    showPerp: "Show perpendicular component",
    projOnB: "proj on b",
  },
} as const;

const HALF_RANGE = 130;
const DEG = Math.PI / 180;
type Pt = [number, number];

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

function DotScene() {
  const { values } = useDemoContext();
  const angleA = numberOf(values, "angleA", 40) * DEG;
  const lenA = numberOf(values, "lenA", 90);
  const angleB = numberOf(values, "angleB", -10) * DEG;
  const lenB = numberOf(values, "lenB", 100);
  const showPerp = booleanOf(values, "showPerp", true);

  const a: Pt = [Math.cos(angleA) * lenA, Math.sin(angleA) * lenA];
  const b: Pt = [Math.cos(angleB) * lenB, Math.sin(angleB) * lenB];
  const dot = a[0] * b[0] + a[1] * b[1];
  const bLenSq = b[0] * b[0] + b[1] * b[1];
  // Scalar projection of a onto b: t = (a·b)/|b|^2, projected vector = t*b.
  const t = bLenSq > 1e-6 ? dot / bLenSq : 0;
  const proj: Pt = [t * b[0], t * b[1]];
  const projScalar = t * lenB; // == (a·b)/|b|, the signed length along b

  const axes = useMemo(
    () => ({
      x: [
        [-HALF_RANGE, 0, 0],
        [HALF_RANGE, 0, 0],
      ] as [number, number, number][],
      y: [
        [0, -HALF_RANGE, 0],
        [0, HALF_RANGE, 0],
      ] as [number, number, number][],
    }),
    [],
  );

  return (
    <>
      <Line points={axes.x} color="#888888" lineWidth={1} />
      <Line points={axes.y} color="#888888" lineWidth={1} />
      <Arrow from={[0, 0]} to={a} color="#ef4444" />
      <Arrow from={[0, 0]} to={b} color="#3b82f6" />
      <Arrow from={[0, 0]} to={proj} color="#f59e0b" />
      {showPerp && (
        <Line
          points={[
            [proj[0], proj[1], 0],
            [a[0], a[1], 0],
          ]}
          color="#22c55e"
          dashed
          dashSize={4}
          gapSize={3}
          lineWidth={1.5}
        />
      )}
      <Html position={[-HALF_RANGE * 0.94, HALF_RANGE * 0.86, 0]} occlude={false}>
        <div className="bg-background/85 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap shadow-sm">
          a·b = {dot.toFixed(1)}
          <br />
          {L.projOnB} = {projScalar.toFixed(1)}
        </div>
      </Html>
    </>
  );
}

export default function DotCrossDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "angleA", label: L.angleA, min: -180, max: 180, step: 1, defaultValue: 40 },
        { kind: "number", key: "lenA", label: L.lenA, min: 20, max: 120, step: 1, defaultValue: 90 },
        { kind: "number", key: "angleB", label: L.angleB, min: -180, max: 180, step: 1, defaultValue: -10 },
        { kind: "number", key: "lenB", label: L.lenB, min: 20, max: 120, step: 1, defaultValue: 100 },
        { kind: "boolean", key: "showPerp", label: L.showPerp, defaultValue: true },
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
        <DotScene />
      </DemoCanvas>
    </Demo>
  );
}

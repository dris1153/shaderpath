"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Line } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Cộng vector: tip-to-tail",
    ax: "a.x",
    ay: "a.y",
    bx: "b.x",
    by: "b.y",
    tipToTail: "Vẽ tip-to-tail",
  },
  en: {
    title: "Vector Addition: Tip-to-Tail",
    ax: "a.x",
    ay: "a.y",
    bx: "b.x",
    by: "b.y",
    tipToTail: "Show tip-to-tail",
  },
} as const;

// World units shown on each side of the origin (matches the orthographic camera bounds).
const HALF_RANGE = 110;
type Pt = [number, number];

// Line shaft + a small two-segment chevron head — no shader needed for flat 2D arrows.
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

function VectorScene() {
  const { values } = useDemoContext();
  const ax = numberOf(values, "ax", 80);
  const ay = numberOf(values, "ay", 40);
  const bx = numberOf(values, "bx", -30);
  const by = numberOf(values, "by", 70);
  const tipToTail = booleanOf(values, "tipToTail", true);

  const sum: Pt = [ax + bx, ay + by];
  // Tip-to-tail: b's tail sits at a's tip, visualizing a + b as one continuous path.
  const bFrom: Pt = tipToTail ? [ax, ay] : [0, 0];
  const bTo: Pt = tipToTail ? sum : [bx, by];

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
      <Arrow from={[0, 0]} to={[ax, ay]} color="#ef4444" />
      <Arrow from={bFrom} to={bTo} color="#3b82f6" />
      <Arrow from={[0, 0]} to={sum} color="#22c55e" />
    </>
  );
}

export default function VectorBasicsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "ax", label: L.ax, min: -100, max: 100, step: 1, defaultValue: 80 },
        { kind: "number", key: "ay", label: L.ay, min: -100, max: 100, step: 1, defaultValue: 40 },
        { kind: "number", key: "bx", label: L.bx, min: -100, max: 100, step: 1, defaultValue: -30 },
        { kind: "number", key: "by", label: L.by, min: -100, max: 100, step: 1, defaultValue: 70 },
        { kind: "boolean", key: "tipToTail", label: L.tipToTail, defaultValue: true },
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
        <VectorScene />
      </DemoCanvas>
    </Demo>
  );
}

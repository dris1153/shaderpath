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
    title: "w=1 là điểm, w=0 là hướng",
    tx: "tx (dịch ngang)",
    ty: "ty (dịch dọc)",
    pointsLegend: "● Điểm (w=1) — bị dịch chuyển",
    dirLegend: "→ Hướng (w=0) — không đổi",
  },
  en: {
    title: "w=1 Is a Point, w=0 Is a Direction",
    tx: "tx (horizontal shift)",
    ty: "ty (vertical shift)",
    pointsLegend: "● Point (w=1) — gets translated",
    dirLegend: "→ Direction (w=0) — stays fixed",
  },
} as const;

const HALF_RANGE = 130;
type Pt = [number, number];
// x, y, w — the 2D analogue of the lesson's 3x3/4x4 homogeneous vectors.
type Vec3h = readonly [number, number, number];

// The 3x3 homogeneous translate applied directly: the tx/ty column only
// contributes scaled by w — w=1 (point) gets the full shift, w=0
// (direction) gets zero added, no matter how large tx/ty are.
function applyTranslation(tx: number, ty: number, v: Vec3h): Pt {
  return [v[0] + tx * v[2], v[1] + ty * v[2]];
}

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

function PointMarker({ at, color }: { at: Pt; color: string }) {
  return (
    <mesh position={[at[0], at[1], 0]}>
      <circleGeometry args={[5, 24]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Two points (w=1, get translated) and two directions (w=0, stay fixed).
const POINTS: Vec3h[] = [
  [-60, 30, 1],
  [50, -40, 1],
];
const DIRECTIONS: Vec3h[] = [
  [55, 15, 0],
  [-30, 45, 0],
];

function PointsVsDirectionsScene({
  pointsLegend,
  dirLegend,
}: {
  pointsLegend: string;
  dirLegend: string;
}) {
  const { values } = useDemoContext();
  const tx = numberOf(values, "tx", 0);
  const ty = numberOf(values, "ty", 0);

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
      {DIRECTIONS.map((d, i) => (
        <Arrow key={i} from={[0, 0]} to={applyTranslation(tx, ty, d)} color="#3b82f6" />
      ))}
      {POINTS.map((p, i) => (
        <PointMarker key={i} at={applyTranslation(tx, ty, p)} color="#ef4444" />
      ))}
      <Html position={[-HALF_RANGE * 0.94, HALF_RANGE * 0.86, 0]} occlude={false}>
        <div className="bg-background/85 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap shadow-sm">
          {pointsLegend}
          <br />
          {dirLegend}
        </div>
      </Html>
    </>
  );
}

export default function HomogeneousCoordsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "tx", label: L.tx, min: -70, max: 70, step: 1, defaultValue: 0 },
        { kind: "number", key: "ty", label: L.ty, min: -70, max: 70, step: 1, defaultValue: 0 },
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
        <PointsVsDirectionsScene pointsLegend={L.pointsLegend} dirLegend={L.dirLegend} />
      </DemoCanvas>
    </Demo>
  );
}

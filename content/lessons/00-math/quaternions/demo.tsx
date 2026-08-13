"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Euler lerp vs quaternion slerp",
    t: "t (nội suy)",
    euler: "Lerp Euler (từng góc)",
    quat: "Slerp quaternion",
  },
  en: {
    title: "Euler Lerp vs Quaternion Slerp",
    t: "t (interpolation)",
    euler: "Euler lerp (per angle)",
    quat: "Quaternion slerp",
  },
} as const;

// Start/end poses chosen so the hard case is visible: yaw travels 150° while
// pitch travels 80°, close enough to the euler lesson's 90° lock zone that
// independently lerping the two angles visibly detours from the slerp path.
const START_EULER = new THREE.Euler(0, 0, 0, "XYZ");
const END_EULER = new THREE.Euler(
  THREE.MathUtils.degToRad(80),
  THREE.MathUtils.degToRad(150),
  0,
  "XYZ",
);

// Three arrows along local X/Y/Z (red/green/blue) so the full 3D orientation
// — not just one axis — is readable at a glance, on both objects.
function AxisArrow({ axis, color, length }: { axis: "x" | "y" | "z"; color: string; length: number }) {
  const end: [number, number, number] =
    axis === "x" ? [length, 0, 0] : axis === "y" ? [0, length, 0] : [0, 0, length];
  const coneRotation: [number, number, number] =
    axis === "x" ? [0, 0, -Math.PI / 2] : axis === "y" ? [0, 0, 0] : [Math.PI / 2, 0, 0];
  return (
    <>
      <Line points={[[0, 0, 0], end]} color={color} lineWidth={2} />
      <mesh position={end} rotation={coneRotation}>
        <coneGeometry args={[0.09, 0.24, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function AxisTriad({ length }: { length: number }) {
  return (
    <>
      <AxisArrow axis="x" color="#ef4444" length={length} />
      <AxisArrow axis="y" color="#22c55e" length={length} />
      <AxisArrow axis="z" color="#3b82f6" length={length} />
    </>
  );
}

function ComparisonScene() {
  const { values } = useDemoContext();
  const t = numberOf(values, "t", 0);

  // Naive per-component lerp: three independent numbers, no shared geometry.
  const lerpRotation: [number, number, number] = [
    THREE.MathUtils.lerp(START_EULER.x, END_EULER.x, t),
    THREE.MathUtils.lerp(START_EULER.y, END_EULER.y, t),
    THREE.MathUtils.lerp(START_EULER.z, END_EULER.z, t),
  ];

  // Quaternion slerp: one constant-angular-velocity arc on S^3.
  const slerpQuat = useMemo(() => {
    const qStart = new THREE.Quaternion().setFromEuler(START_EULER);
    const qEnd = new THREE.Quaternion().setFromEuler(END_EULER);
    return new THREE.Quaternion().slerpQuaternions(qStart, qEnd, t);
  }, [t]);

  return (
    <>
      <group position={[-1.5, 0, 0]} rotation={lerpRotation}>
        <AxisTriad length={1} />
      </group>
      <group position={[1.5, 0, 0]} quaternion={slerpQuat}>
        <AxisTriad length={1} />
      </group>
    </>
  );
}

export default function QuaternionsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "number", key: "t", label: L.t, min: 0, max: 1, step: 0.01, defaultValue: 0 },
      ]}
    >
      <div className="relative size-full">
        <DemoCanvas camera={{ position: [0, 1.4, 5.6], fov: 42 }}>
          <ComparisonScene />
        </DemoCanvas>
        <div className="text-muted-foreground pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium">
          {L.euler}
        </div>
        <div className="text-muted-foreground pointer-events-none absolute right-2 bottom-2 rounded bg-background/80 px-2 py-1 text-xs font-medium">
          {L.quat}
        </div>
      </div>
    </Demo>
  );
}

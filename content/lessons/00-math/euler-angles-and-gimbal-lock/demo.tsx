"use client";

import { useLocale } from "next-intl";
import { Line } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Gimbal 3 vòng: khoá khi pitch chạm 90°",
    yaw: "Yaw (Z)",
    pitch: "Pitch (Y)",
    roll: "Roll (X)",
    locked: "Khoá! (gimbal lock)",
  },
  en: {
    title: "3-Ring Gimbal: Locks When Pitch Hits 90°",
    yaw: "Yaw (Z)",
    pitch: "Pitch (Y)",
    roll: "Roll (X)",
    locked: "Locked! (gimbal lock)",
  },
} as const;

// Within this many degrees of ±90° pitch, the demo flags the lock visually.
const LOCK_EPSILON_DEG = 5;

// Default torus lies in the XY plane (normal = Z); rotate it to expose the
// requested axis as its normal so the ring visually represents "rotation
// around that axis" (physical gimbal convention).
function GimbalRing({ axis, color, radius }: { axis: "x" | "y" | "z"; color: string; radius: number }) {
  const rotation: [number, number, number] =
    axis === "y" ? [Math.PI / 2, 0, 0] : axis === "x" ? [0, Math.PI / 2, 0] : [0, 0, 0];
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, radius * 0.025, 8, 64]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Arrow along local +Y, standing in for the payload rigidly attached to the
// innermost ring — the thing whose motion "locks" when yaw and roll spin the
// same visual axis. It lies along the pitch axis, so pitch alone never swings
// it; yaw and roll both do, which is what makes the collapse readable.
function PayloadArrow({ length, color }: { length: number; color: string }) {
  const tip: [number, number, number] = [0, length, 0];
  return (
    <>
      <Line points={[[0, 0, 0], tip]} color={color} lineWidth={2} />
      <mesh position={tip}>
        <coneGeometry args={[0.1, 0.28, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

// Nested groups intrinsically compose rotations exactly like a physical
// gimbal: outer ring (yaw) carries the middle ring (pitch), which carries
// the inner ring (roll) and payload. At pitch = ±90° the roll axis (local X
// of the innermost group) becomes parallel to the yaw axis (world Z) — the
// theory's R(alpha, 90°, gamma) degenerate case, made visible. The axis per
// ring follows the theory's composition R = Rz(yaw) Ry(pitch) Rx(roll).
function GimbalRings() {
  const { values } = useDemoContext();
  const yaw = (numberOf(values, "yaw", 0) * Math.PI) / 180;
  const pitch = (numberOf(values, "pitch", 0) * Math.PI) / 180;
  const roll = (numberOf(values, "roll", 0) * Math.PI) / 180;

  return (
    <group rotation-z={yaw}>
      <GimbalRing axis="z" color="#22c55e" radius={2.2} />
      <group rotation-y={pitch}>
        <GimbalRing axis="y" color="#ef4444" radius={1.7} />
        <group rotation-x={roll}>
          <GimbalRing axis="x" color="#3b82f6" radius={1.2} />
          <PayloadArrow length={1.5} color="#f59e0b" />
        </group>
      </group>
    </group>
  );
}

function GimbalDemoBody({ locked, lockedLabel }: { locked: boolean; lockedLabel: string }) {
  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [3.2, 2.4, 4.4], fov: 45 }}>
        <GimbalRings />
      </DemoCanvas>
      {locked && (
        <div className="bg-destructive text-destructive-foreground pointer-events-none absolute top-2 left-2 rounded px-2 py-1 text-xs font-medium">
          {lockedLabel}
        </div>
      )}
    </div>
  );
}

function GimbalDemoRoot({ lockedLabel }: { lockedLabel: string }) {
  const { values } = useDemoContext();
  const pitchDeg = numberOf(values, "pitch", 0);
  // pitch is only meaningful mod 180° for detecting proximity to the ±90° lock point
  const distanceFromLock = Math.abs((Math.abs(pitchDeg) % 180) - 90);
  const locked = distanceFromLock < LOCK_EPSILON_DEG;

  return <GimbalDemoBody locked={locked} lockedLabel={lockedLabel} />;
}

export default function EulerGimbalLockDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "yaw", label: L.yaw, min: -180, max: 180, step: 1, defaultValue: 0 },
        { kind: "number", key: "pitch", label: L.pitch, min: -180, max: 180, step: 1, defaultValue: 0 },
        { kind: "number", key: "roll", label: L.roll, min: -180, max: 180, step: 1, defaultValue: 0 },
      ]}
    >
      <GimbalDemoRoot lockedLabel={L.locked} />
    </Demo>
  );
}

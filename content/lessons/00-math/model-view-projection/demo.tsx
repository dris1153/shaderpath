"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { Line, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "MVP: camera thật & mặt cắt frustum nhìn từ trên",
    fov: "Field of view (°)",
    distance: "Khoảng cách camera",
    near: "Near plane",
  },
  en: {
    title: "MVP: Real Camera & Top-down Frustum Cross-section",
    fov: "Field of view (°)",
    distance: "Camera distance",
    near: "Near plane",
  },
} as const;

const DEG = Math.PI / 180;
// Fixed far plane so the real PerspectiveCamera and the schematic map agree
// on exactly what "outside the frustum" means.
const FAR = 6;

// Shared world (x, z) positions: an object clipped on the top-down map is
// the exact same object that vanishes from the perspective view.
const OBJECTS: { pos: [number, number]; color: string }[] = [
  { pos: [0, 1.2], color: "#ef4444" },
  { pos: [-1.3, -0.3], color: "#3b82f6" },
  { pos: [1.3, -0.3], color: "#22c55e" },
  { pos: [-1.6, -2.0], color: "#f59e0b" },
  { pos: [1.6, -2.0], color: "#a855f7" },
];

function PerspectiveScene() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const fov = numberOf(values, "fov", 50);
  const distance = numberOf(values, "distance", 4);
  const near = numberOf(values, "near", 0.3);

  useEffect(() => {
    invalidate();
  }, [values, invalidate]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={fov}
        near={near}
        far={FAR}
        position={[0, 0.6, distance]}
        onUpdate={(cam) => cam.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1} />
      <gridHelper args={[16, 16, "#52525b", "#3f3f46"]} position={[0, -0.5, 0]} />
      {OBJECTS.map(({ pos: [x, z], color }, i) => (
        <mesh key={i} position={[x, 0, z]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}

// Small diamond marker, reusing the codebase's Line-based 2D schematic style.
function Marker({ x, y, color }: { x: number; y: number; color: string }) {
  const s = 0.22;
  return (
    <Line
      points={[
        [x - s, y, 0],
        [x, y - s, 0],
        [x + s, y, 0],
        [x, y + s, 0],
        [x - s, y, 0],
      ]}
      color={color}
      lineWidth={2}
    />
  );
}

// Flat top-down schematic: camera apex fixed at the map origin, objects
// plotted at (worldX, distance - worldZ) so dollying the camera visibly
// slides everything toward/away from the apex, exactly like the real scene.
function FrustumMap() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const fov = numberOf(values, "fov", 50);
  const distance = numberOf(values, "distance", 4);
  const near = numberOf(values, "near", 0.3);

  useEffect(() => {
    invalidate();
  }, [values, invalidate]);

  const half = Math.tan((fov * DEG) / 2);
  const farL: [number, number] = [-FAR * half, FAR];
  const farR: [number, number] = [FAR * half, FAR];
  const nearL: [number, number] = [-near * half, near];
  const nearR: [number, number] = [near * half, near];

  return (
    <>
      <Line points={[[0, 0, 0], [farL[0], farL[1], 0]]} color="#94a3b8" lineWidth={1.5} />
      <Line points={[[0, 0, 0], [farR[0], farR[1], 0]]} color="#94a3b8" lineWidth={1.5} />
      <Line
        points={[[nearL[0], nearL[1], 0], [nearR[0], nearR[1], 0]]}
        color="#e2e8f0"
        lineWidth={2}
      />
      <Line
        points={[[farL[0], farL[1], 0], [farR[0], farR[1], 0]]}
        color="#475569"
        dashed
        dashSize={0.15}
        gapSize={0.1}
        lineWidth={1}
      />
      <Line points={[[-0.15, 0, 0], [0.15, 0, 0]]} color="#facc15" lineWidth={2} />
      <Line points={[[0, -0.15, 0], [0, 0.15, 0]]} color="#facc15" lineWidth={2} />

      {OBJECTS.map(({ pos: [x, z], color }, i) => {
        const depth = distance - z;
        const halfW = depth * half;
        const inside = depth >= near && depth <= FAR && Math.abs(x) <= halfW;
        return <Marker key={i} x={x} y={depth} color={inside ? color : "#475569"} />;
      })}
    </>
  );
}

export default function ModelViewProjectionDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        { kind: "number", key: "fov", label: L.fov, min: 20, max: 70, step: 1, defaultValue: 50 },
        { kind: "number", key: "distance", label: L.distance, min: 1.5, max: 7, step: 0.1, defaultValue: 4 },
        { kind: "number", key: "near", label: L.near, min: 0.05, max: 3, step: 0.05, defaultValue: 0.3 },
      ]}
    >
      <div className="flex size-full">
        <div className="h-full w-1/2 border-r">
          <DemoCanvas>
            <PerspectiveScene />
          </DemoCanvas>
        </div>
        <div className="h-full w-1/2">
          <DemoCanvas
            orthographic
            camera={{
              position: [0, 0, 1],
              left: -4,
              right: 4,
              top: 7,
              bottom: -1,
              near: 0.1,
              far: 10,
              manual: true,
            }}
          >
            <FrustumMap />
          </DemoCanvas>
        </div>
      </div>
    </Demo>
  );
}

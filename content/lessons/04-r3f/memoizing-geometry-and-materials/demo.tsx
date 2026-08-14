"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "200 mesh: material dùng chung vs material riêng",
    shared: "Material dùng chung (module scope)",
    meshes: "mesh",
    programs: "programs",
    geometries: "geometries",
    buildCost: "chi phí cấp phát",
    sharedNote: "0.00 ms — không cấp phát gì, dùng lại 2 object có sẵn",
  },
  en: {
    title: "200 Meshes: Shared vs Per-Mesh Material",
    shared: "Shared material (module scope)",
    meshes: "meshes",
    programs: "programs",
    geometries: "geometries",
    buildCost: "allocation cost",
    sharedNote: "0.00 ms — nothing allocated, reusing 2 existing objects",
  },
} as const;

type DemoLabels = Record<keyof typeof LABELS.vi, string>;

const CELL_SIZE = 0.4;
const COLS = 20;
const ROWS = 10;
const COUNT = COLS * ROWS;
const SPACING = 0.52;
const CELL_COLOR = "#6ea8fe";

// Module scope: constructed exactly once when this file is imported — the
// "one material, a hundred meshes" pattern from the theory.
const SHARED_GEOMETRY = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
const SHARED_MATERIAL = new THREE.MeshStandardMaterial({
  color: CELL_COLOR,
  roughness: 0.45,
  metalness: 0.1,
});

// Real, deterministic allocation cost for 200 unique geometry+material
// pairs — decoupled from React/render timing so the number is reproducible.
function benchmarkUniqueConstruction(): number {
  const start = performance.now();
  for (let i = 0; i < COUNT; i++) {
    const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
    const material = new THREE.MeshStandardMaterial({
      color: CELL_COLOR,
      roughness: 0.45,
      metalness: 0.1,
    });
    geometry.dispose();
    material.dispose();
  }
  return performance.now() - start;
}

function gridPositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const offsetX = ((COLS - 1) * SPACING) / 2;
  const offsetY = ((ROWS - 1) * SPACING) / 2;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      positions.push([col * SPACING - offsetX, offsetY - row * SPACING, 0]);
    }
  }
  return positions;
}

function Cells({ shared }: { shared: boolean }) {
  const positions = useMemo(() => gridPositions(), []);

  if (shared) {
    // Assigned via the geometry/material PROP — R3F never owns or disposes
    // these instances, so sharing them across 200 meshes is safe.
    return (
      <>
        {positions.map((position, i) => (
          <mesh key={i} position={position} geometry={SHARED_GEOMETRY} material={SHARED_MATERIAL} />
        ))}
      </>
    );
  }

  // Identical args at every element, but 200 different JSX positions in the
  // tree — args-diff never compares across siblings, so this is genuinely
  // 200 separate geometry + material instances.
  return (
    <>
      {positions.map((position, i) => (
        <mesh key={i} position={position}>
          <boxGeometry args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} />
          <meshStandardMaterial color={CELL_COLOR} roughness={0.45} metalness={0.1} />
        </mesh>
      ))}
    </>
  );
}

function StatsOverlay({
  shared,
  buildMs,
  L,
}: {
  shared: boolean;
  buildMs: number | null;
  L: DemoLabels;
}) {
  const gl = useThree((s) => s.gl);
  const [stats, setStats] = useState({ programs: 0, geometries: 0 });

  useFrame(() => {
    const programs = gl.info.programs?.length ?? 0;
    const geometries = gl.info.memory.geometries;
    setStats((prev) =>
      prev.programs === programs && prev.geometries === geometries
        ? prev
        : { programs, geometries },
    );
  });

  return (
    <Html fullscreen occlude={false}>
      <div className="pointer-events-none absolute top-3 left-3 space-y-0.5 rounded border bg-background/85 px-3 py-2 font-mono text-xs shadow-sm">
        <div>{COUNT} {L.meshes}</div>
        <div>{L.programs}: {stats.programs}</div>
        <div>{L.geometries}: {stats.geometries}</div>
        <div>
          {L.buildCost}: {shared ? L.sharedNote : `${buildMs?.toFixed(2) ?? "…"} ms`}
        </div>
      </div>
    </Html>
  );
}

function GridScene({ L }: { L: DemoLabels }) {
  const { values } = useDemoContext();
  const shared = booleanOf(values, "shared", true);
  // Pure computation, cached per toggle — no state/effect needed
  const buildMs = useMemo(
    () => (shared ? null : benchmarkUniqueConstruction()),
    [shared],
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <Cells shared={shared} />
      <StatsOverlay shared={shared} buildMs={buildMs} L={L} />
    </>
  );
}

export default function MemoizingGeometryDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const halfHeight = 3.2;
  const halfWidth = (halfHeight * 16) / 9;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "shared", label: L.shared, defaultValue: true },
      ]}
    >
      <DemoCanvas
        orthographic
        camera={{
          position: [0, 0, 5],
          left: -halfWidth,
          right: halfWidth,
          top: halfHeight,
          bottom: -halfHeight,
          near: 0.1,
          far: 20,
          manual: true,
        }}
      >
        <GridScene L={L} />
      </DemoCanvas>
    </Demo>
  );
}

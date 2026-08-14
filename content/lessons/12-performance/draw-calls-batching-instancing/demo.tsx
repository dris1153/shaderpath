"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Cùng một cảnh, 3 cách vẽ: individual / merged / instanced",
    mode: "Cách vẽ",
    modeOptions: [
      { value: "individual", label: "Individual (N mesh)" },
      { value: "merged", label: "Merged (mergeGeometries)" },
      { value: "instanced", label: "Instanced (InstancedMesh)" },
    ],
    count: "Số object",
    calls: "render.calls",
    triangles: "render.triangles",
    frameMs: "frame time (EMA)",
    fps: "fps",
  },
  en: {
    title: "Same Scene, 3 Ways: Individual / Merged / Instanced",
    mode: "Draw mode",
    modeOptions: [
      { value: "individual", label: "Individual (N meshes)" },
      { value: "merged", label: "Merged (mergeGeometries)" },
      { value: "instanced", label: "Instanced (InstancedMesh)" },
    ],
    count: "Object count",
    calls: "render.calls",
    triangles: "render.triangles",
    frameMs: "frame time (EMA)",
    fps: "fps",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type Mode = "individual" | "merged" | "instanced";

// Module scope: one geometry/material shared by ALL three modes and every
// slider value — the thing that changes is how many DRAW CALLS it takes to
// put `count` boxes on screen, never how many GPU resources exist.
const BOX_GEOMETRY = new THREE.BoxGeometry(0.55, 0.55, 0.55);
const BOX_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f0a848",
  roughness: 0.5,
  metalness: 0.1,
});

// Deterministic cube grid — pure function of count, no randomness, so the
// same slider value always produces the same layout across mode switches.
function gridPositions(count: number): [number, number, number][] {
  const side = Math.max(1, Math.ceil(Math.cbrt(count)));
  const spacing = 0.85;
  const offset = ((side - 1) * spacing) / 2;
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = i % side;
    const y = Math.floor(i / side) % side;
    const z = Math.floor(i / (side * side));
    positions.push([x * spacing - offset, y * spacing - offset, z * spacing - offset]);
  }
  return positions;
}

// Mode 1: N plain <mesh> elements — shared geometry/material via PROPS, so
// R3F never owns or disposes them (same rule as Track 4's memoizing demo).
// One gl.drawElements per box: render.calls scales 1:1 with count.
function IndividualBoxes({ positions }: { positions: [number, number, number][] }) {
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p} geometry={BOX_GEOMETRY} material={BOX_MATERIAL} />
      ))}
    </>
  );
}

// Mode 2: bake every box's transform into its own geometry copy, merge all
// of them into ONE BufferGeometry, wrap in ONE Mesh. Built imperatively (not
// JSX) so R3F never sees it as a tree it owns — the effect cleanup below is
// the only thing that will ever dispose the merged geometry.
function MergedBoxes({ positions }: { positions: [number, number, number][] }) {
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const parts = positions.map(([x, y, z]) => {
      const g = BOX_GEOMETRY.clone();
      g.translate(x, y, z);
      return g;
    });
    const merged = mergeGeometries(parts, false);
    for (const g of parts) g.dispose();
    if (!merged) return;

    const mesh = new THREE.Mesh(merged, BOX_MATERIAL);
    group.add(mesh);
    invalidate();

    return () => {
      group.remove(mesh);
      merged.dispose();
    };
  }, [positions, invalidate]);

  return <group ref={groupRef} />;
}

// Mode 3: shared geometry/material passed as constructor ARGS (not JSX
// children), so — same rule as IndividualBoxes — R3F never disposes them.
// `key={positions.length}` forces a clean remount when count changes, since
// InstancedMesh's instance buffer is sized once at construction time.
function InstancedBoxes({ positions }: { positions: [number, number, number][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(...p);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [positions, invalidate]);

  return (
    <instancedMesh
      key={positions.length}
      ref={meshRef}
      args={[BOX_GEOMETRY, BOX_MATERIAL, positions.length]}
    />
  );
}

interface DrawStats {
  calls: number;
  triangles: number;
  frameMs: number;
  fps: number;
}

const FRAME_BUDGET_MS = 1000 / 60;

function StatsProbe({ onSample }: { onSample: (stats: DrawStats) => void }) {
  const gl = useThree((s) => s.gl);
  const emaRef = useRef(FRAME_BUDGET_MS);
  const sinceReport = useRef(0);

  useFrame((_state, delta) => {
    emaRef.current += (delta * 1000 - emaRef.current) * 0.12;
    sinceReport.current += delta;
    if (sinceReport.current < 0.15) return;
    sinceReport.current = 0;

    onSample({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      frameMs: emaRef.current,
      fps: 1000 / Math.max(emaRef.current, 0.01),
    });
  });

  return null;
}

function DrawScene({ mode, positions }: { mode: Mode; positions: [number, number, number][] }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} />
      <group ref={groupRef}>
        {mode === "individual" && <IndividualBoxes positions={positions} />}
        {mode === "merged" && <MergedBoxes positions={positions} />}
        {mode === "instanced" && <InstancedBoxes positions={positions} />}
      </group>
    </>
  );
}

function StatsPanel({ stats, L }: { stats: DrawStats; L: Labels }) {
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap gap-x-4 gap-y-0.5 rounded border bg-background/90 p-2 font-mono text-[11px]">
      <div>{L.calls}: {stats.calls}</div>
      <div>{L.triangles}: {stats.triangles.toLocaleString()}</div>
      <div>{L.frameMs}: {stats.frameMs.toFixed(2)}ms</div>
      <div>{L.fps}: {stats.fps.toFixed(0)}</div>
    </div>
  );
}

function DrawCallsDemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const mode = stringOf(values, "mode", "individual") as Mode;
  const count = numberOf(values, "count", 500);
  const positions = useMemo(() => gridPositions(count), [count]);
  const [stats, setStats] = useState<DrawStats>({
    calls: 0,
    triangles: 0,
    frameMs: FRAME_BUDGET_MS,
    fps: 60,
  });

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [10, 9, 13], fov: 50 }}>
        <DrawScene mode={mode} positions={positions} />
        <StatsProbe onSample={setStats} />
      </DemoCanvas>
      <StatsPanel stats={stats} L={L} />
    </div>
  );
}

export default function DrawCallsBatchingInstancingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "individual",
          options: [...L.modeOptions],
        },
        { kind: "number", key: "count", label: L.count, min: 100, max: 2000, step: 100, defaultValue: 500 },
      ]}
    >
      <DrawCallsDemoBody L={L} />
    </Demo>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { Button } from "@/components/ui/button";
import { useDisposable } from "@/lib/hooks/use-disposable";

const LABELS = {
  vi: {
    title: "Mount/unmount stress test: leak vs không leak",
    leakyTitle: "Leaky — new THREE.X(), không dispose",
    cleanTitle: "Clean — JSX auto-dispose + useDisposable",
    mount: "Mount",
    unmount: "Unmount",
    geo: "geo",
    tex: "tex",
    cycles: "chu kỳ",
  },
  en: {
    title: "Mount/Unmount Stress Test: Leaky vs Clean",
    leakyTitle: "Leaky — new THREE.X(), never disposed",
    cleanTitle: "Clean — JSX auto-dispose + useDisposable",
    mount: "Mount",
    unmount: "Unmount",
    geo: "geo",
    tex: "tex",
    cycles: "cycles",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const BOX_COUNT = 10;
const RING_RADIUS = 1.6;
const POSITIONS: [number, number, number][] = Array.from(
  { length: BOX_COUNT },
  (_, i) => {
    const a = (i / BOX_COUNT) * Math.PI * 2;
    return [Math.cos(a) * RING_RADIUS, Math.sin(a) * RING_RADIUS, 0];
  },
);

// 1x1 solid-color DataTexture — no binary asset, matches the platform's
// procedural-texture convention (Track 3 brief). Only box #0 gets a map so
// the "textures" counter also demonstrates the leak, not just "geometries".
function makeSolidTexture(rgb: [number, number, number]) {
  const texture = new THREE.DataTexture(
    new Uint8Array([...rgb, 255]),
    1,
    1,
    THREE.RGBAFormat,
  );
  texture.needsUpdate = true;
  return texture;
}

// Leaky: every box is a hand-built THREE.Mesh (geometry + material created
// with `new`, outside JSX) wrapped in <primitive>. R3F's docs are explicit —
// "Primitives will not dispose of the object they carry on unmount, you are
// responsible for disposing of it!" — and nothing here ever does. Every
// mount leaks BOX_COUNT geometries + 1 texture, permanently.
function LeakyBoxes() {
  const meshes = useMemo(() => {
    return POSITIONS.map((pos, i) => {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({ color: "#ef4444" });
      if (i === 0) material.map = makeSolidTexture([255, 200, 200]);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      return mesh;
    });
  }, []);

  return (
    <>
      {meshes.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
}

// Clean: 9 boxes are plain JSX — R3F itself instantiated that geometry and
// material from the <boxGeometry>/<meshStandardMaterial> tags, so its
// auto-dispose pass frees them on unmount. Box #0 is built imperatively on
// purpose (same shape as the leak above) but registered with this
// platform's useDisposable hook, whose own unmount effect disposes it —
// proving the fix is "register cleanup", not "avoid new THREE.X()".
function CleanBoxes() {
  const disposables = useDisposable();

  const manualMesh = useMemo(() => {
    const geometry = disposables.register(new THREE.BoxGeometry(0.5, 0.5, 0.5));
    const material = disposables.register(
      new THREE.MeshStandardMaterial({ color: "#22c55e" }),
    );
    material.map = disposables.register(makeSolidTexture([200, 255, 220]));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...POSITIONS[0]!);
    return mesh;
  }, [disposables]);

  return (
    <>
      <primitive object={manualMesh} />
      {POSITIONS.slice(1).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      ))}
    </>
  );
}

// Reads the ground truth for GPU-resident resource counts every rendered
// frame; only calls back when a number actually changes (mount/unmount),
// so this doesn't spam parent re-renders while idle.
function MemoryProbe({
  onChange,
}: {
  onChange: (mem: { geometries: number; textures: number }) => void;
}) {
  const gl = useThree((s) => s.gl);
  const last = useRef({ geometries: -1, textures: -1 });

  useFrame(() => {
    const { geometries, textures } = gl.info.memory;
    if (geometries !== last.current.geometries || textures !== last.current.textures) {
      last.current = { geometries, textures };
      onChange({ geometries, textures });
    }
  });

  return null;
}

function MemorySide({ variant, L }: { variant: "leaky" | "clean"; L: Labels }) {
  const [mounted, setMounted] = useState(false);
  const [mem, setMem] = useState({ geometries: 0, textures: 0 });
  const [cycles, setCycles] = useState(0);

  return (
    <div className="relative min-w-0 flex-1">
      <DemoCanvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 4, 5]} intensity={60} />
        <MemoryProbe onChange={setMem} />
        {mounted &&
          (variant === "leaky" ? <LeakyBoxes /> : <CleanBoxes />)}
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2">
        <span className="bg-background/85 rounded px-2 py-1 text-xs font-medium">
          {variant === "leaky" ? L.leakyTitle : L.cleanTitle}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2">
        <Button
          size="sm"
          variant={variant === "leaky" ? "destructive" : "default"}
          onClick={() =>
            setMounted((prev) => {
              if (prev) setCycles((c) => c + 1);
              return !prev;
            })
          }
        >
          {mounted ? L.unmount : L.mount}
        </Button>
        <span className="bg-background/85 rounded px-2 py-1 font-mono text-[11px] whitespace-nowrap">
          {L.geo} {mem.geometries} · {L.tex} {mem.textures} · {L.cycles}{" "}
          {cycles}
        </span>
      </div>
    </div>
  );
}

export default function DisposalMemoryLeaksDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo title={L.title} ratio={2}>
      <div className="divide-border flex size-full divide-x">
        <MemorySide variant="leaky" L={L} />
        <MemorySide variant="clean" L={L} />
      </div>
    </Demo>
  );
}

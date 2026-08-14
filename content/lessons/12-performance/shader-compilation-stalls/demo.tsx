"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";
import { useDisposable, type DisposableRegistry } from "@/lib/hooks/use-disposable";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";
import { createVariantMaterial } from "./variant-material";

const LABELS = {
  vi: {
    title: "Stall Theater — thêm biến thể shader chưa từng compile",
    poolSize: "Kích thước pool biến thể",
    prewarm: "Pre-warm trước (renderer.compile)",
    addMesh: "Thêm mesh (biến thể mới)",
    lastHitch: "Hitch gần nhất",
    programs: "renderer.info.programs",
  },
  en: {
    title: "Stall Theater — Adding a Never-Before-Compiled Shader Variant",
    poolSize: "Variant pool size",
    prewarm: "Pre-warm ahead (renderer.compile)",
    addMesh: "Add mesh (new variant)",
    lastHitch: "Last hitch",
    programs: "renderer.info.programs",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];
type MaterialPool = Map<number, THREE.MeshBasicMaterial>;

const MAX_MESHES = 12;
const GRID_COLS = 4;
const GRAPH_SAMPLES = 90;
// Absolute margin above the rolling baseline before a frame counts as a
// "hitch" — comfortably above normal frame-time jitter for this light scene.
const HITCH_THRESHOLD_MS = 8;

function gridPosition(i: number): [number, number, number] {
  const rows = MAX_MESHES / GRID_COLS;
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  return [(col - (GRID_COLS - 1) / 2) * 1.1, ((rows - 1) / 2 - row) * 1.1, 0];
}

// Takes over rendering (priority 1 suppresses R3F's default render) so
// gl.render() can be timed directly — the actual synchronous cost of a
// lazy first-use shader compile shows up right inside that call.
function FrameProbe({
  samplesRef,
  baselineRef,
  onHitch,
  onProgramCount,
}: {
  samplesRef: MutableRefObject<number[]>;
  baselineRef: MutableRefObject<number>;
  onHitch: (ms: number) => void;
  onProgramCount: (n: number) => void;
}) {
  const lastProgramCount = useRef(-1);

  useFrame(({ gl, scene, camera }) => {
    const t0 = performance.now();
    gl.render(scene, camera);
    const dt = performance.now() - t0;

    const samples = samplesRef.current;
    samples.push(dt);
    if (samples.length > GRAPH_SAMPLES) samples.shift();

    const baseline = baselineRef.current;
    if (baseline === 0) {
      baselineRef.current = dt;
    } else if (dt > baseline + HITCH_THRESHOLD_MS) {
      onHitch(dt);
    } else {
      baselineRef.current = baseline * 0.9 + dt * 0.1;
    }

    const programCount = gl.info.programs?.length ?? 0;
    if (programCount !== lastProgramCount.current) {
      lastProgramCount.current = programCount;
      onProgramCount(programCount);
    }
  }, 1);

  return null;
}

// renderer.compile(scene, camera) forces every material in a throwaway
// scene to compile NOW, synchronously — the platform's actual "loading
// screen" pre-warm technique, verified against WebGLRenderer.js.
function PrewarmController({
  materialsRef,
  disposables,
}: {
  materialsRef: MutableRefObject<MaterialPool>;
  disposables: DisposableRegistry;
}) {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  const prewarm = booleanOf(values, "prewarm", false);
  const poolSize = Number(stringOf(values, "poolSize", "8"));

  useEffect(() => {
    if (!prewarm) return;
    const warmScene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    for (let i = 0; i < poolSize; i++) {
      let material = materialsRef.current.get(i);
      if (!material) {
        material = disposables.register(createVariantMaterial(i));
        materialsRef.current.set(i, material);
      }
      warmScene.add(new THREE.Mesh(geometry, material));
    }
    gl.compile(warmScene, camera);
    geometry.dispose();
  }, [prewarm, poolSize, gl, camera, materialsRef, disposables]);

  return null;
}

function VariantMeshes({
  slots,
  materialsRef,
}: {
  slots: (number | null)[];
  materialsRef: MutableRefObject<MaterialPool>;
}) {
  return (
    <>
      {slots.map((variantIndex, i) =>
        variantIndex === null ? null : (
          <mesh key={i} position={gridPosition(i)} material={materialsRef.current.get(variantIndex)}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
          </mesh>
        ),
      )}
    </>
  );
}

// Plain 2D canvas overlay, redrawn via the platform's raw useVisibleRaf loop
// (independent of R3F) — reads the same samplesRef the R3F-side FrameProbe
// writes to, so drawing never touches React state.
function FrameTimeGraph({ samplesRef }: { samplesRef: MutableRefObject<number[]> }) {
  const { containerRef } = useDemoContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useVisibleRaf(containerRef, () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const samples = samplesRef.current;
    const barW = w / GRAPH_SAMPLES;
    for (let i = 0; i < samples.length; i++) {
      const ms = samples[i] ?? 0;
      const barH = Math.min(ms / 50, 1) * h;
      ctx.fillStyle = ms > 24 ? "#ef4444" : ms > 18 ? "#f59e0b" : "#22c55e";
      ctx.fillRect(i * barW, h - barH, Math.max(barW - 1, 1), barH);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={44}
      className="border-border/50 w-full rounded border bg-black/20"
    />
  );
}

function StallTheater({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const disposables = useDisposable();
  const materialsRef = useRef<MaterialPool>(new Map());
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(MAX_MESHES).fill(null));
  const [addCount, setAddCount] = useState(0);
  const samplesRef = useRef<number[]>([]);
  const baselineRef = useRef(0);
  const [lastHitchMs, setLastHitchMs] = useState<number | null>(null);
  const [programCount, setProgramCount] = useState(0);

  const addMesh = () => {
    const poolSize = Number(stringOf(values, "poolSize", "8"));
    const variantIndex = addCount % poolSize;
    const slotIndex = addCount % MAX_MESHES;

    if (!materialsRef.current.has(variantIndex)) {
      materialsRef.current.set(variantIndex, disposables.register(createVariantMaterial(variantIndex)));
    }
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = variantIndex;
      return next;
    });
    setAddCount((c) => c + 1);
  };

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 0, 6.5], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <PrewarmController materialsRef={materialsRef} disposables={disposables} />
        <FrameProbe
          samplesRef={samplesRef}
          baselineRef={baselineRef}
          onHitch={setLastHitchMs}
          onProgramCount={setProgramCount}
        />
        <VariantMeshes slots={slots} materialsRef={materialsRef} />
      </DemoCanvas>

      <div className="absolute inset-x-3 top-3 space-y-1.5 rounded-lg border bg-background/90 p-2 font-mono text-[11px] backdrop-blur-sm">
        <FrameTimeGraph samplesRef={samplesRef} />
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">{L.lastHitch}</span>
          <span>{lastHitchMs === null ? "–" : `${lastHitchMs.toFixed(1)} ms`}</span>
        </div>
        <div className="text-muted-foreground flex items-baseline justify-between">
          <span>{L.programs}</span>
          <span>{programCount}</span>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3">
        <Button size="sm" onClick={addMesh}>
          {L.addMesh} ({addCount})
        </Button>
      </div>
    </div>
  );
}

export default function ShaderCompilationStallsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "select",
          key: "poolSize",
          label: L.poolSize,
          defaultValue: "8",
          options: [
            { value: "4", label: "4" },
            { value: "8", label: "8" },
            { value: "16", label: "16" },
          ],
        },
        { kind: "boolean", key: "prewarm", label: L.prewarm, defaultValue: false },
      ]}
    >
      <StallTheater L={L} />
    </Demo>
  );
}

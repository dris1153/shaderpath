"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { Button } from "@/components/ui/button";

const LABELS = {
  vi: {
    title: "Bảng điều khiển profiling: renderer.info + frame-time meter",
    count: "Số vật thể",
    dpr: "Device Pixel Ratio",
    dprOptions: [
      { value: "0.5", label: "0.5× (test GPU-bound)" },
      { value: "1", label: "1×" },
      { value: "2", label: "2×" },
    ],
    spike: "Gây spike 150ms",
    fps: "fps (EMA)",
    frameMs: "frame time (EMA)",
    maxMs: "đỉnh gần nhất",
    calls: "render.calls",
    triangles: "render.triangles",
    geometries: "mem.geometries",
    textures: "mem.textures",
    programs: "programs",
    budgetHint: "vạch trắng = ngân sách 16.67ms",
  },
  en: {
    title: "Profiling dashboard: renderer.info + frame-time meter",
    count: "Object count",
    dpr: "Device Pixel Ratio",
    dprOptions: [
      { value: "0.5", label: "0.5× (GPU-bound test)" },
      { value: "1", label: "1×" },
      { value: "2", label: "2×" },
    ],
    spike: "Inject 150ms spike",
    fps: "fps (EMA)",
    frameMs: "frame time (EMA)",
    maxMs: "recent peak",
    calls: "render.calls",
    triangles: "render.triangles",
    geometries: "mem.geometries",
    textures: "mem.textures",
    programs: "programs",
    budgetHint: "white line = 16.67ms budget",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

const FRAME_BUDGET_MS = 1000 / 60;
const HISTORY_LEN = 90;
const GRAPH_MAX_MS = 40; // bars clip above this so a 150ms spike still fits

// Module scope: one geometry/material reused for every sphere regardless of
// slider value — draw-call count is what the slider changes here, not the
// number of GPU resources (renderer.info.memory stays flat on purpose).
const SPHERE_GEOMETRY = new THREE.SphereGeometry(0.24, 10, 10);
const SPHERE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#7aa2f7",
  roughness: 0.5,
  metalness: 0.15,
});

interface Stats {
  fps: number;
  frameMs: number;
  maxMs: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  history: number[];
}

const INITIAL_STATS: Stats = {
  fps: 60,
  frameMs: FRAME_BUDGET_MS,
  maxMs: FRAME_BUDGET_MS,
  calls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
  history: new Array(HISTORY_LEN).fill(0),
};

// Fixed volume: as `count` grows, spheres pack tighter — more overlap means
// more fragment work per screen pixel (overdraw), which is exactly what the
// DPR 0.5 test below is meant to expose.
function spherePositions(count: number): [number, number, number][] {
  const radius = 2.2;
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ]);
  }
  return positions;
}

function LoadScene({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => spherePositions(count), [count]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (group) group.rotation.y += delta * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 5, 4]} intensity={40} />
      <pointLight position={[-4, -3, 3]} intensity={20} color="#f0abfc" />
      <pointLight position={[0, -4, -4]} intensity={18} color="#5eead4" />
      <group ref={groupRef}>
        {positions.map((p, i) => (
          <mesh key={i} position={p} geometry={SPHERE_GEOMETRY} material={SPHERE_MATERIAL} />
        ))}
      </group>
    </>
  );
}

// The "reduce resolution test" from the theory: halving DPR halves the pixel
// count the fragment shader runs for, with zero effect on draw-call count or
// JS work — if that alone fixes the jank, the bottleneck was the GPU/fill-rate.
function DprController({ dpr }: { dpr: number }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    gl.setPixelRatio(dpr);
    invalidate();
    return () => {
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
  }, [dpr, gl, invalidate]);

  return null;
}

// Reads the same counters a real profiling session would: gl.info (reset
// every frame for render.calls/triangles, persistent for memory) plus a
// hand-rolled EMA frame-time meter — the "inline stats.js" the theory
// describes. State updates are throttled; the ring buffer itself is not, so
// the sparkline never misses a frame even between throttled repaints.
function StatsProbe({ onSample }: { onSample: (stats: Stats) => void }) {
  const gl = useThree((s) => s.gl);
  const emaRef = useRef(FRAME_BUDGET_MS);
  const historyRef = useRef<number[]>(new Array(HISTORY_LEN).fill(0));
  const sinceReport = useRef(0);

  useFrame((_state, delta) => {
    const ms = delta * 1000;
    emaRef.current += (ms - emaRef.current) * 0.12;

    const history = historyRef.current;
    history.push(ms);
    if (history.length > HISTORY_LEN) history.shift();

    sinceReport.current += delta;
    if (sinceReport.current < 0.1) return;
    sinceReport.current = 0;

    const info = gl.info;
    onSample({
      fps: 1000 / Math.max(emaRef.current, 0.01),
      frameMs: emaRef.current,
      maxMs: Math.max(...history),
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length ?? 0,
      history: [...history],
    });
  });

  return null;
}

function Sparkline({ history }: { history: number[] }) {
  const budgetPct = Math.min((FRAME_BUDGET_MS / GRAPH_MAX_MS) * 100, 100);
  return (
    <div className="relative h-12 w-full overflow-hidden rounded border bg-black/40">
      <div
        className="absolute inset-x-0 border-t border-white/50"
        style={{ bottom: `${budgetPct}%` }}
      />
      <div className="flex h-full items-end gap-px px-1">
        {history.map((ms, i) => {
          const pct = Math.min((ms / GRAPH_MAX_MS) * 100, 100);
          const over = ms > FRAME_BUDGET_MS;
          return (
            <div
              key={i}
              className={`w-1 flex-none ${over ? "bg-red-500" : "bg-emerald-400"}`}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatsPanel({ stats, L }: { stats: Stats; L: Labels }) {
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 space-y-1 rounded border bg-background/90 p-2 font-mono text-[11px]">
      <Sparkline history={stats.history} />
      <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 pt-1">
        <div>{L.fps}: {stats.fps.toFixed(0)}</div>
        <div>{L.frameMs}: {stats.frameMs.toFixed(2)}ms</div>
        <div>{L.maxMs}: {stats.maxMs.toFixed(1)}ms</div>
        <div>{L.calls}: {stats.calls}</div>
        <div>{L.triangles}: {stats.triangles.toLocaleString()}</div>
        <div>{L.programs}: {stats.programs}</div>
        <div>{L.geometries}: {stats.geometries}</div>
        <div>{L.textures}: {stats.textures}</div>
        <div className="opacity-60">{L.budgetHint}</div>
      </div>
    </div>
  );
}

// Synchronous busy-wait on purpose: a real long task blocks the main thread,
// so simulating one honestly means blocking it too, not scheduling async work.
function busyWaitMs(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // intentional spin — DevTools flags any task over 50ms as "Long Task"
  }
}

function ProfilingDemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const count = numberOf(values, "count", 300);
  const dpr = Number(stringOf(values, "dpr", "1"));
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <DprController dpr={dpr} />
        <LoadScene count={count} />
        <StatsProbe onSample={setStats} />
      </DemoCanvas>
      <StatsPanel stats={stats} L={L} />
      <div className="absolute top-2 right-2">
        <Button size="sm" variant="destructive" onClick={() => busyWaitMs(150)}>
          {L.spike}
        </Button>
      </div>
    </div>
  );
}

export default function ProfilingWebglToolsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        { kind: "number", key: "count", label: L.count, min: 50, max: 2000, step: 50, defaultValue: 300 },
        {
          kind: "select",
          key: "dpr",
          label: L.dpr,
          defaultValue: "1",
          options: [...L.dprOptions],
        },
      ]}
    >
      <ProfilingDemoBody L={L} />
    </Demo>
  );
}

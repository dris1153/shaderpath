"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./particle-common.frag";
import cpuVertexShader from "./cpu-particles.vert";
import gpuVertexShader from "./gpu-particles.vert";
import {
  AMPLITUDE,
  SPEED,
  SPREAD,
  buildSeeds,
  updateCpuPositions,
} from "./motion-params";

const LABELS = {
  vi: {
    title: "CPU chạm tay mỗi frame, so với GPU không chạm tay",
    count: "Số particle",
    cpu: "CPU — vòng lặp JS + needsUpdate",
    gpu: "GPU — vị trí tính trong vertex shader",
    jsTime: "JS/frame",
  },
  en: {
    title: "CPU Touches Every Frame, vs. GPU Touches Never",
    count: "Particle count",
    cpu: "CPU — JS loop + needsUpdate",
    gpu: "GPU — position computed in the vertex shader",
    jsTime: "JS/frame",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

// The CPU panel: `position` is a real attribute, rewritten by the JS loop
// (motion-params.ts) and re-uploaded via needsUpdate — every frame, every
// particle. This is the exact anatomy the lesson's first section describes.
function CpuParticles({
  count,
  onMs,
}: {
  count: number;
  onMs: (ms: number) => void;
}) {
  const seeds = useMemo(() => buildSeeds(count), [count]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const frameCount = useRef(0);
  const uniforms = useMemo(() => ({ uPointSize: { value: 2.2 } }), []);

  useFrame((state) => {
    const start = performance.now();
    updateCpuPositions(positions, seeds, state.clock.elapsedTime, count);
    const attr = geometryRef.current?.attributes.position as
      | THREE.BufferAttribute
      | undefined;
    if (attr) attr.needsUpdate = true;
    const ms = performance.now() - start;

    frameCount.current += 1;
    if (frameCount.current % 10 === 0) onMs(ms);
  });

  return (
    <points>
      <bufferGeometry ref={geometryRef} key={count}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={cpuVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

// The GPU panel: `position` is written ONCE (it only ever carries a constant
// seed) — the JS side of this loop is a single uniform assignment. All the
// motion math this frame runs inside gpu-particles.vert, on the GPU.
function GpuParticles({
  count,
  onMs,
}: {
  count: number;
  onMs: (ms: number) => void;
}) {
  const seeds = useMemo(() => buildSeeds(count), [count]);
  const placeholderPositions = useMemo(() => new Float32Array(count * 3), [count]);
  const frameCount = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpread: { value: SPREAD },
      uAmplitude: { value: AMPLITUDE },
      uSpeed: { value: SPEED },
      uPointSize: { value: 2.2 },
    }),
    [],
  );

  useFrame((state) => {
    const start = performance.now();
    uniforms.uTime.value = state.clock.elapsedTime;
    const ms = performance.now() - start;

    frameCount.current += 1;
    if (frameCount.current % 10 === 0) onMs(ms);
  });

  return (
    <points>
      <bufferGeometry key={count}>
        {/* Required by the vertex pipeline but never read in the shader — only
            its buffer length (particle count) matters here. */}
        <bufferAttribute
          attach="attributes-position"
          args={[placeholderPositions, 3]}
        />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={gpuVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Panel({
  variant,
  count,
  L,
}: {
  variant: "cpu" | "gpu";
  count: number;
  L: Labels;
}) {
  const [ms, setMs] = useState(0);

  return (
    <div className="relative min-w-0 flex-1">
      <DemoCanvas camera={{ position: [0, 0, 4], fov: 45 }}>
        {variant === "cpu" ? (
          <CpuParticles count={count} onMs={setMs} />
        ) : (
          <GpuParticles count={count} onMs={setMs} />
        )}
      </DemoCanvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2">
        <span className="bg-background/85 rounded px-2 py-1 text-xs font-medium">
          {variant === "cpu" ? L.cpu : L.gpu}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-right">
        <span className="bg-background/85 rounded px-2 py-1 font-mono text-[11px]">
          {L.jsTime}: {ms.toFixed(3)} ms
        </span>
      </div>
    </div>
  );
}

function DemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const count = numberOf(values, "count", 8000);

  return (
    <div className="divide-border flex size-full divide-x">
      <Panel variant="cpu" count={count} L={L} />
      <Panel variant="gpu" count={count} L={L} />
    </div>
  );
}

export default function WhyParticlesLiveOnGpuDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        {
          kind: "number",
          key: "count",
          label: L.count,
          min: 1000,
          max: 30000,
          step: 1000,
          defaultValue: 8000,
        },
      ]}
    >
      <DemoBody L={L} />
    </Demo>
  );
}

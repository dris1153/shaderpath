"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useFrame } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./branch-cost.frag";
import vertexShader from "./branch-cost.vert";

const LABELS = {
  vi: {
    title: "Branchy vs branchless: đo frame-time thật",
    branchless: "Branchless (mix/step)",
    iterations: "Số vòng lặp / pixel",
    readout: (ms: number) =>
      `${ms.toFixed(2)} ms/frame (~${Math.round(1000 / Math.max(ms, 0.01))} fps)`,
  },
  en: {
    title: "Branchy vs Branchless: Real Frame-Time Readout",
    branchless: "Branchless (mix/step)",
    iterations: "Iterations / pixel",
    readout: (ms: number) =>
      `${ms.toFixed(2)} ms/frame (~${Math.round(1000 / Math.max(ms, 0.01))} fps)`,
  },
} as const;

function BranchCostPlane({
  onSample,
}: {
  onSample: (ms: number) => void;
}) {
  const { values } = useDemoContext();

  // FrameloopGate (inside DemoCanvas) already pumps invalidate() every RAF
  // while visible — this component just needs to read delta each frame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBranchless: { value: 0 },
      uIter: { value: 96 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uBranchless.value = booleanOf(values, "branchless", false) ? 1 : 0;
    uniforms.uIter.value = numberOf(values, "iterations", 96);
  }, [values, uniforms]);

  const avgMs = useRef(16.7);
  const sinceReport = useRef(0);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;

    const ms = delta * 1000;
    avgMs.current += (ms - avgMs.current) * 0.1; // rolling average (EMA)
    sinceReport.current += delta;
    if (sinceReport.current > 0.2) {
      sinceReport.current = 0;
      onSample(avgMs.current);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function BranchingCostOnGpuDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [frameMs, setFrameMs] = useState(16.7);

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "boolean",
          key: "branchless",
          label: L.branchless,
          defaultValue: false,
        },
        {
          kind: "number",
          key: "iterations",
          label: L.iterations,
          min: 8,
          max: 200,
          step: 4,
          defaultValue: 96,
        },
      ]}
    >
      <DemoCanvas
        orthographic
        camera={{
          position: [0, 0, 1],
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
          near: 0.1,
          far: 10,
          manual: true,
        }}
      >
        <BranchCostPlane onSample={setFrameMs} />
      </DemoCanvas>
      <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.readout(frameMs)}
      </div>
    </Demo>
  );
}

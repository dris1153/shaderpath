"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./raymarch-optimize.frag";
import vertexShader from "./raymarch-optimize.vert";

const LABELS = {
  vi: {
    title: "Bounding volume, relaxation & epsilon: đo chi phí thật",
    bounding: "Bounding volume (ray-box early-out)",
    relax: "Hệ số over-relaxation",
    distEps: "Epsilon co giãn theo khoảng cách",
    heatmap: "Heatmap số bước",
    readout: (avg: number | null, fps: number) =>
      avg === null
        ? `${fps.toFixed(0)} fps`
        : `~${avg.toFixed(1)} bước/pixel (ước lượng) · ${fps.toFixed(0)} fps`,
  },
  en: {
    title: "Bounding Volumes, Relaxation & Epsilon: Real Cost",
    bounding: "Bounding volume (ray-box early-out)",
    relax: "Over-relaxation factor",
    distEps: "Distance-scaled epsilon",
    heatmap: "Step-count heatmap",
    readout: (avg: number | null, fps: number) =>
      avg === null
        ? `${fps.toFixed(0)} fps`
        : `~${avg.toFixed(1)} steps/pixel (estimate) · ${fps.toFixed(0)} fps`,
  },
} as const;

// Mirrors the shader's `const int MAX_STEPS` — decode target for the alpha
// channel's encoded step count during the measurement readback below.
const MAX_STEPS = 96;
const MEASURE_SIZE = 24;

function OptimizationPlane({
  onSample,
}: {
  onSample: (avg: number | null, fps: number) => void;
}) {
  const { values } = useDemoContext();
  const paramsRef = useRef({
    bounding: true,
    relax: 1.0,
    distEps: true,
    heatmap: false,
  });

  useEffect(() => {
    paramsRef.current.bounding = booleanOf(values, "bounding", true);
    paramsRef.current.relax = numberOf(values, "relax", 1.0);
    paramsRef.current.distEps = booleanOf(values, "distEps", true);
    paramsRef.current.heatmap = booleanOf(values, "heatmap", false);
  }, [values]);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uBoundingVolume: { value: 1 },
      uRelax: { value: 1 },
      uDistScaledEps: { value: 1 },
      uHeatmap: { value: 0 },
    }),
    [],
  );

  const measureTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(MEASURE_SIZE, MEASURE_SIZE, {
        type: THREE.UnsignedByteType,
      }),
    [],
  );
  useEffect(() => () => measureTarget.dispose(), [measureTarget]);
  const measureBuffer = useMemo(
    () => new Uint8Array(MEASURE_SIZE * MEASURE_SIZE * 4),
    [],
  );
  const readingRef = useRef(false);
  const frameRef = useRef(0);
  const avgMsRef = useRef(16.7);
  const lastAvgRef = useRef<number | null>(null);
  const sinceReportRef = useRef(0);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uBoundingVolume.value = paramsRef.current.bounding ? 1 : 0;
    uniforms.uRelax.value = paramsRef.current.relax;
    uniforms.uDistScaledEps.value = paramsRef.current.distEps ? 1 : 0;
    uniforms.uHeatmap.value = paramsRef.current.heatmap ? 1 : 0;

    avgMsRef.current += (delta * 1000 - avgMsRef.current) * 0.1;
    const fps = 1000 / Math.max(avgMsRef.current, 0.01);

    const w = state.size.width * state.viewport.dpr;
    const h = state.size.height * state.viewport.dpr;
    uniforms.uResolution.value.set(w, h);
    state.gl.setRenderTarget(null);
    state.gl.render(state.scene, state.camera);

    if (!paramsRef.current.heatmap) {
      lastAvgRef.current = null;
    } else {
      frameRef.current++;
      if (frameRef.current % 15 === 0 && !readingRef.current) {
        // Real (not fabricated) measurement: re-render the SAME scene into a
        // tiny offscreen target, read its alpha channel (steps/MAX_STEPS, §
        // shader), average on the CPU. Only paid while heatmap is on.
        uniforms.uResolution.value.set(MEASURE_SIZE, MEASURE_SIZE);
        state.gl.setRenderTarget(measureTarget);
        state.gl.render(state.scene, state.camera);
        state.gl.setRenderTarget(null);
        uniforms.uResolution.value.set(w, h);

        readingRef.current = true;
        state.gl
          .readRenderTargetPixelsAsync(
            measureTarget,
            0,
            0,
            MEASURE_SIZE,
            MEASURE_SIZE,
            measureBuffer,
          )
          .then((buf) => {
            let sum = 0;
            const count = buf.length / 4;
            for (let i = 0; i < buf.length; i += 4) sum += buf[i + 3] ?? 0;
            lastAvgRef.current = (sum / count / 255) * MAX_STEPS;
          })
          .finally(() => {
            readingRef.current = false;
          });
      }
    }

    // Throttle React state updates to 5/s — matches the branch-cost-on-gpu
    // demo's convention, avoids re-rendering the wrapper every pumped frame.
    sinceReportRef.current += delta;
    if (sinceReportRef.current > 0.2) {
      sinceReportRef.current = 0;
      onSample(lastAvgRef.current, fps);
    }
  }, 1);


  const bindUniforms = useSharedUniforms(uniforms);
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        ref={bindUniforms}
      />
    </mesh>
  );
}

export default function RaymarchingOptimizationDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const [avgSteps, setAvgSteps] = useState<number | null>(null);
  const [fps, setFps] = useState(60);

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "bounding", label: L.bounding, defaultValue: true },
        { kind: "number", key: "relax", label: L.relax, min: 1, max: 2.2, step: 0.05, defaultValue: 1 },
        { kind: "boolean", key: "distEps", label: L.distEps, defaultValue: true },
        { kind: "boolean", key: "heatmap", label: L.heatmap, defaultValue: false },
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
        <OptimizationPlane
          onSample={(avg, f) => {
            setAvgSteps(avg);
            setFps(f);
          }}
        />
      </DemoCanvas>
      <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.readout(avgSteps, fps)}
      </div>
    </Demo>
  );
}

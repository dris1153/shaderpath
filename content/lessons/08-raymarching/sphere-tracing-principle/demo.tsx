"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./sphere-tracing.frag";
import vertexShader from "./sphere-tracing.vert";

const LABELS = {
  vi: {
    title: "Vòng lặp sphere tracing",
    maxSteps: "Số bước tối đa (maxSteps)",
    epsilon: "Ngưỡng dừng (epsilon)",
    heatmap: "Heatmap số bước",
    orbit: "Góc camera quanh cảnh",
  },
  en: {
    title: "The Sphere Tracing Loop",
    maxSteps: "Max steps",
    epsilon: "Stopping threshold (epsilon)",
    heatmap: "Step-count heatmap",
    orbit: "Camera orbit angle",
  },
} as const;

function SphereTracePlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uMaxSteps: { value: 48 },
      uEpsilon: { value: 0.002 },
      uHeatmap: { value: 0 },
      uOrbitAngle: { value: 35 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uMaxSteps.value = numberOf(values, "maxSteps", 48);
    uniforms.uEpsilon.value = numberOf(values, "epsilon", 0.002);
    uniforms.uHeatmap.value = booleanOf(values, "heatmap", false) ? 1 : 0;
    uniforms.uOrbitAngle.value = numberOf(values, "orbit", 35);
    invalidate();
  }, [values, uniforms, invalidate]);

  // Geometry/material created as JSX — R3F auto-disposes them on unmount (§8.2)
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

export default function SphereTracingPrincipleDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "maxSteps",
          label: L.maxSteps,
          min: 4,
          max: 128,
          step: 1,
          defaultValue: 48,
        },
        {
          kind: "number",
          key: "epsilon",
          label: L.epsilon,
          min: 0.0005,
          max: 0.05,
          step: 0.0005,
          defaultValue: 0.002,
        },
        { kind: "boolean", key: "heatmap", label: L.heatmap, defaultValue: false },
        {
          kind: "number",
          key: "orbit",
          label: L.orbit,
          min: -180,
          max: 180,
          step: 1,
          defaultValue: 35,
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
        <SphereTracePlane />
      </DemoCanvas>
    </Demo>
  );
}

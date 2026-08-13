"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./sdf-circle.frag";
import vertexShader from "./sdf-circle.vert";

const LABELS = {
  vi: {
    title: "smoothstep & SDF hình tròn",
    edge0: "edge0",
    edge1: "edge1",
    radius: "Bán kính",
    pulse: "Nhịp đập theo thời gian",
  },
  en: {
    title: "smoothstep & Circle SDF",
    edge0: "edge0",
    edge1: "edge1",
    radius: "Radius",
    pulse: "Pulse over time",
  },
} as const;

function SdfPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uEdge0: { value: -0.02 },
      uEdge1: { value: 0.02 },
      uRadius: { value: 0.25 },
      uTime: { value: 0 },
      uPulse: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uEdge0.value = numberOf(values, "edge0", -0.02);
    uniforms.uEdge1.value = numberOf(values, "edge1", 0.02);
    uniforms.uRadius.value = numberOf(values, "radius", 0.25);
    uniforms.uPulse.value = booleanOf(values, "pulse", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
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

export default function SdfCircleDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "edge0", label: L.edge0, min: -0.2, max: 0.2, step: 0.005, defaultValue: -0.02 },
        { kind: "number", key: "edge1", label: L.edge1, min: -0.2, max: 0.2, step: 0.005, defaultValue: 0.02 },
        { kind: "number", key: "radius", label: L.radius, min: 0.05, max: 0.45, step: 0.01, defaultValue: 0.25 },
        { kind: "boolean", key: "pulse", label: L.pulse, defaultValue: true },
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
        <SdfPlane />
      </DemoCanvas>
    </Demo>
  );
}

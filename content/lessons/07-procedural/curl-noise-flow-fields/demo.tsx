"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./curl-flow.frag";
import vertexShader from "./curl-flow.vert";

const MODE_INDEX: Record<string, number> = {
  potential: 0,
  flow: 1,
  divergence: 2,
};

const LABELS = {
  vi: {
    title: "Curl noise & flow field",
    mode: "Chế độ",
    potential: "Trường tiềm năng (FBM)",
    flow: "Vector curl (vệt chuyển động)",
    divergence: "So sánh phân kỳ",
    strength: "Cường độ dòng chảy",
    scale: "Tần số noise",
    animate: "Chuyển động theo thời gian",
  },
  en: {
    title: "Curl Noise & Flow Field",
    mode: "Mode",
    potential: "Potential field (FBM)",
    flow: "Curl vectors (flow streaks)",
    divergence: "Divergence comparison",
    strength: "Flow strength",
    scale: "Noise frequency",
    animate: "Animate over time",
  },
} as const;

function CurlFlowPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMode: { value: 0 },
      uStrength: { value: 1 },
      uScale: { value: 3 },
      uAnimate: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uMode.value = MODE_INDEX[stringOf(values, "mode", "potential")] ?? 0;
    uniforms.uStrength.value = numberOf(values, "strength", 1);
    uniforms.uScale.value = numberOf(values, "scale", 3);
    uniforms.uAnimate.value = booleanOf(values, "animate", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  // Geometry/material created as JSX — R3F auto-disposes them on unmount (§8.2)

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

export default function CurlNoiseFlowFieldsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "flow",
          options: [
            { value: "potential", label: L.potential },
            { value: "flow", label: L.flow },
            { value: "divergence", label: L.divergence },
          ],
        },
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0.1,
          max: 3,
          step: 0.05,
          defaultValue: 1,
        },
        {
          kind: "number",
          key: "scale",
          label: L.scale,
          min: 1,
          max: 8,
          step: 0.25,
          defaultValue: 3,
        },
        { kind: "boolean", key: "animate", label: L.animate, defaultValue: true },
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
        <CurlFlowPlane />
      </DemoCanvas>
    </Demo>
  );
}

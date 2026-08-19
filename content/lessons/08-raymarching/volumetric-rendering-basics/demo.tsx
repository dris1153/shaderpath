"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./cloud-volume.frag";
import vertexShader from "./cloud-volume.vert";

const LABELS = {
  vi: {
    title: "Cơ bản render thể tích",
    steps: "Số bước march",
    densityMul: "Mật độ mây",
    sunAzimuth: "Góc phương vị mặt trời",
    jitter: "Jitter chống banding",
  },
  en: {
    title: "Volumetric Rendering Basics",
    steps: "Step count",
    densityMul: "Cloud density",
    sunAzimuth: "Sun azimuth",
    jitter: "Anti-banding jitter",
  },
} as const;

function CloudVolume() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSteps: { value: 48 },
      uDensityMul: { value: 2.5 },
      uSunAzimuth: { value: 200 },
      uJitter: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uSteps.value = numberOf(values, "steps", 48);
    uniforms.uDensityMul.value = numberOf(values, "densityMul", 2.5);
    uniforms.uSunAzimuth.value = numberOf(values, "sunAzimuth", 200);
    uniforms.uJitter.value = booleanOf(values, "jitter", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });


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

export default function VolumetricRenderingBasicsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "steps",
          label: L.steps,
          min: 4,
          max: 96,
          step: 4,
          defaultValue: 48,
        },
        {
          kind: "number",
          key: "densityMul",
          label: L.densityMul,
          min: 0.5,
          max: 6,
          step: 0.25,
          defaultValue: 2.5,
        },
        {
          kind: "number",
          key: "sunAzimuth",
          label: L.sunAzimuth,
          min: 0,
          max: 360,
          step: 1,
          defaultValue: 200,
        },
        {
          kind: "boolean",
          key: "jitter",
          label: L.jitter,
          defaultValue: true,
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
        <CloudVolume />
      </DemoCanvas>
    </Demo>
  );
}

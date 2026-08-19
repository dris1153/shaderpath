"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./precision-banding.frag";
import vertexShader from "./precision-banding.vert";

const LABELS = {
  vi: {
    title: "Precision (mô phỏng): banding khi hạ mediump giả lập",
    bits: "Số bit mô phỏng (N = 2^bits)",
  },
  en: {
    title: "Precision (simulated): Banding as Simulated mediump Drops",
    bits: "Simulated bits (N = 2^bits)",
  },
} as const;

function PrecisionBandingPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uLevels: { value: 16 },
      uTime: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const bits = numberOf(values, "bits", 4);
    uniforms.uLevels.value = Math.pow(2, bits);
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
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

export default function PrecisionBandingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "bits", label: L.bits, min: 1, max: 8, step: 1, defaultValue: 4 },
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
        <PrecisionBandingPlane />
      </DemoCanvas>
    </Demo>
  );
}

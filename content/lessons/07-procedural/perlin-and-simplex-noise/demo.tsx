"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import {
  booleanOf,
  numberOf,
  stringOf,
} from "@/components/viz/control-schema";
import fragmentShader from "./perlin-simplex.frag";
import vertexShader from "./perlin-simplex.vert";

const LABELS = {
  vi: {
    title: "Perlin vs Simplex noise",
    variant: "Thuật toán",
    perlin: "Perlin",
    simplex: "Simplex",
    scale: "Tỉ lệ (feature size)",
    animate: "Chuyển động theo thời gian",
  },
  en: {
    title: "Perlin vs Simplex Noise",
    variant: "Algorithm",
    perlin: "Perlin",
    simplex: "Simplex",
    scale: "Scale (feature size)",
    animate: "Animate over time",
  },
} as const;

function NoisePlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uScale: { value: 4 },
      uVariant: { value: 0 },
      uTime: { value: 0 },
      uAnimate: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uScale.value = numberOf(values, "scale", 4);
    uniforms.uVariant.value =
      stringOf(values, "variant", "perlin") === "simplex" ? 1 : 0;
    uniforms.uAnimate.value = booleanOf(values, "animate", false) ? 1 : 0;
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

export default function PerlinSimplexNoiseDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "variant",
          label: L.variant,
          options: [
            { value: "perlin", label: L.perlin },
            { value: "simplex", label: L.simplex },
          ],
          defaultValue: "perlin",
        },
        {
          kind: "number",
          key: "scale",
          label: L.scale,
          min: 1,
          max: 16,
          step: 0.5,
          defaultValue: 4,
        },
        { kind: "boolean", key: "animate", label: L.animate, defaultValue: false },
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
        <NoisePlane />
      </DemoCanvas>
    </Demo>
  );
}

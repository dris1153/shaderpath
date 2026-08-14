"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import {
  booleanOf,
  numberOf,
  stringOf,
} from "@/components/viz/control-schema";
import fragmentShader from "./fbm.frag";
import vertexShader from "./fbm.vert";

const LABELS = {
  vi: {
    title: "FBM explorer",
    octaves: "Số octave",
    lacunarity: "Lacunarity",
    gain: "Gain",
    variant: "Kiểu uốn",
    standard: "Chuẩn",
    ridged: "Ridged",
    turbulence: "Turbulence",
    animate: "Chuyển động theo thời gian",
  },
  en: {
    title: "FBM Explorer",
    octaves: "Octaves",
    lacunarity: "Lacunarity",
    gain: "Gain",
    variant: "Shaping",
    standard: "Standard",
    ridged: "Ridged",
    turbulence: "Turbulence",
    animate: "Animate over time",
  },
} as const;

function FbmPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uOctaves: { value: 5 },
      uLacunarity: { value: 2.0 },
      uGain: { value: 0.5 },
      uVariant: { value: 0 },
      uTime: { value: 0 },
      uAnimate: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uOctaves.value = numberOf(values, "octaves", 5);
    uniforms.uLacunarity.value = numberOf(values, "lacunarity", 2.0);
    uniforms.uGain.value = numberOf(values, "gain", 0.5);
    const variant = stringOf(values, "variant", "standard");
    uniforms.uVariant.value =
      variant === "turbulence" ? 2 : variant === "ridged" ? 1 : 0;
    uniforms.uAnimate.value = booleanOf(values, "animate", false) ? 1 : 0;
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

export default function FbmDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "octaves",
          label: L.octaves,
          min: 1,
          max: 8,
          step: 1,
          defaultValue: 5,
        },
        {
          kind: "number",
          key: "lacunarity",
          label: L.lacunarity,
          min: 1.5,
          max: 3.5,
          step: 0.1,
          defaultValue: 2.0,
        },
        {
          kind: "number",
          key: "gain",
          label: L.gain,
          min: 0.2,
          max: 0.8,
          step: 0.05,
          defaultValue: 0.5,
        },
        {
          kind: "select",
          key: "variant",
          label: L.variant,
          options: [
            { value: "standard", label: L.standard },
            { value: "ridged", label: L.ridged },
            { value: "turbulence", label: L.turbulence },
          ],
          defaultValue: "standard",
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
        <FbmPlane />
      </DemoCanvas>
    </Demo>
  );
}

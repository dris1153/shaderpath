"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./value-gradient-noise.frag";
import vertexShader from "./value-gradient-noise.vert";

const FIELD_INDEX: Record<string, number> = {
  value: 0,
  gradient: 1,
};

const FADE_INDEX: Record<string, number> = {
  linear: 0,
  smoothstep: 1,
  quintic: 2,
};

const LABELS = {
  vi: {
    title: "Value noise vs Gradient noise",
    field: "Loại noise",
    value: "Value noise",
    gradient: "Gradient noise",
    fade: "Hàm fade",
    linear: "Tuyến tính",
    smoothstep: "Smoothstep",
    quintic: "Quintic",
    scale: "Tần số lưới",
    gridLines: "Hiện đường lưới",
  },
  en: {
    title: "Value Noise vs Gradient Noise",
    field: "Noise type",
    value: "Value noise",
    gradient: "Gradient noise",
    fade: "Fade function",
    linear: "Linear",
    smoothstep: "Smoothstep",
    quintic: "Quintic",
    scale: "Grid frequency",
    gridLines: "Show grid lines",
  },
} as const;

function NoisePlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uField: { value: 0 },
      uFade: { value: 0 },
      uScale: { value: 8 },
      uGridLines: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uField.value = FIELD_INDEX[stringOf(values, "field", "value")] ?? 0;
    uniforms.uFade.value = FADE_INDEX[stringOf(values, "fade", "linear")] ?? 0;
    uniforms.uScale.value = numberOf(values, "scale", 8);
    uniforms.uGridLines.value = booleanOf(values, "gridLines", true) ? 1 : 0;
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

export default function ValueAndGradientNoiseDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "field",
          label: L.field,
          defaultValue: "value",
          options: [
            { value: "value", label: L.value },
            { value: "gradient", label: L.gradient },
          ],
        },
        {
          kind: "select",
          key: "fade",
          label: L.fade,
          defaultValue: "linear",
          options: [
            { value: "linear", label: L.linear },
            { value: "smoothstep", label: L.smoothstep },
            { value: "quintic", label: L.quintic },
          ],
        },
        { kind: "number", key: "scale", label: L.scale, min: 2, max: 20, step: 1, defaultValue: 8 },
        { kind: "boolean", key: "gridLines", label: L.gridLines, defaultValue: true },
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

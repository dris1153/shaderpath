"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./hash-compare.frag";
import vertexShader from "./hash-compare.vert";

const HASH_TYPE_INDEX: Record<string, number> = {
  sin: 0,
  "no-sin": 1,
};

const LABELS = {
  vi: {
    title: "So sánh hash: sin/fract vs không dùng sin",
    hashType: "Kiểu hash",
    sin: "sin/fract (kinh điển)",
    noSin: "Không dùng sin",
    zoom: "Phóng toạ độ (10^n)",
    seed: "Seed",
  },
  en: {
    title: "Hash Comparison: sin/fract vs Sine-Free",
    hashType: "Hash type",
    sin: "sin/fract (classic)",
    noSin: "Sine-free",
    zoom: "Coordinate zoom (10^n)",
    seed: "Seed",
  },
} as const;

function HashPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uHashType: { value: 0 },
      uZoomExp: { value: 0 },
      uSeed: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uHashType.value =
      HASH_TYPE_INDEX[stringOf(values, "hashType", "sin")] ?? 0;
    uniforms.uZoomExp.value = numberOf(values, "zoom", 0);
    uniforms.uSeed.value = numberOf(values, "seed", 0);
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

export default function HashFunctionsOnGpuDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "hashType",
          label: L.hashType,
          defaultValue: "sin",
          options: [
            { value: "sin", label: L.sin },
            { value: "no-sin", label: L.noSin },
          ],
        },
        { kind: "number", key: "zoom", label: L.zoom, min: 0, max: 5, step: 0.25, defaultValue: 0 },
        { kind: "number", key: "seed", label: L.seed, min: 0, max: 10, step: 1, defaultValue: 0 },
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
        <HashPlane />
      </DemoCanvas>
    </Demo>
  );
}

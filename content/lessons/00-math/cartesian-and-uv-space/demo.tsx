"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./uv-explorer.frag";
import vertexShader from "./uv-explorer.vert";

const LABELS = {
  vi: {
    title: "Khám phá UV space",
    u: "u (ngang)",
    v: "v (dọc)",
    flip: "Đảo trục v (ảnh ↔ WebGL)",
  },
  en: {
    title: "UV Space Explorer",
    u: "u (horizontal)",
    v: "v (vertical)",
    flip: "Flip v axis (image ↔ WebGL)",
  },
} as const;

function UvPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uPoint: { value: new THREE.Vector2(0.3, 0.6) },
      uFlipY: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uPoint.value.set(
      numberOf(values, "u", 0.3),
      numberOf(values, "v", 0.6),
    );
    uniforms.uFlipY.value = booleanOf(values, "flip") ? 1 : 0;
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

export default function CartesianUvDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "u",
          label: L.u,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.3,
        },
        {
          kind: "number",
          key: "v",
          label: L.v,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.6,
        },
        { kind: "boolean", key: "flip", label: L.flip, defaultValue: false },
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
        <UvPlane />
      </DemoCanvas>
    </Demo>
  );
}

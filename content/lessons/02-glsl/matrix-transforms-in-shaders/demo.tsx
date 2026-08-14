"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import fragmentShader from "./matrix-transform.frag";
import vertexShader from "./matrix-transform.vert";

const LABELS = {
  vi: {
    title: "Xoay & scale UV bằng ma trận",
    rotation: "Góc xoay (độ)",
    scale: "Tỉ lệ",
    pivot: "Pivot ở tâm (0.5, 0.5)",
    invert: "Xoay pattern (đảo ma trận)",
    spin: "Tự xoay theo thời gian",
  },
  en: {
    title: "Rotating & Scaling UV with a Matrix",
    rotation: "Rotation (deg)",
    scale: "Scale",
    pivot: "Pivot at center (0.5, 0.5)",
    invert: "Rotate the pattern (invert matrix)",
    spin: "Auto-spin over time",
  },
} as const;

function MatrixPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uAngle: { value: 0 },
      uScale: { value: 1 },
      uPivotCenter: { value: 1 },
      uInvert: { value: 0 },
      uSpin: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uAngle.value = (numberOf(values, "rotation", 0) * Math.PI) / 180;
    uniforms.uScale.value = numberOf(values, "scale", 1);
    uniforms.uPivotCenter.value = booleanOf(values, "pivot", true) ? 1 : 0;
    uniforms.uInvert.value = booleanOf(values, "invert", false) ? 1 : 0;
    uniforms.uSpin.value = booleanOf(values, "spin", false) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

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

export default function MatrixTransformsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        { kind: "number", key: "rotation", label: L.rotation, min: -180, max: 180, step: 5, defaultValue: 0 },
        { kind: "number", key: "scale", label: L.scale, min: 0.4, max: 2.5, step: 0.05, defaultValue: 1 },
        { kind: "boolean", key: "pivot", label: L.pivot, defaultValue: true },
        { kind: "boolean", key: "invert", label: L.invert, defaultValue: false },
        { kind: "boolean", key: "spin", label: L.spin, defaultValue: false },
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
        <MatrixPlane />
      </DemoCanvas>
    </Demo>
  );
}

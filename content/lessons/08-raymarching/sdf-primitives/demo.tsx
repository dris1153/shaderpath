"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./sdf-primitives.frag";
import vertexShader from "./sdf-primitives.vert";

const PRIMITIVE_INDEX: Record<string, number> = {
  sphere: 0,
  box: 1,
  torus: 2,
  capsule: 3,
};

const LABELS = {
  vi: {
    title: "SDF nguyên thuỷ & phép biến đổi",
    primitive: "Hình nguyên thuỷ",
    sphere: "Sphere",
    box: "Box",
    torus: "Torus",
    capsule: "Capsule",
    contour: "Contour mặt cắt (hiện distance field)",
    offset: "Dịch chuyển theo X",
    rotation: "Xoay quanh trục Y",
  },
  en: {
    title: "SDF Primitives & Transforms",
    primitive: "Primitive",
    sphere: "Sphere",
    box: "Box",
    torus: "Torus",
    capsule: "Capsule",
    contour: "Slice-plane contour (show distance field)",
    offset: "Offset along X",
    rotation: "Rotate around Y",
  },
} as const;

function SdfPrimitivesPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uPrimitive: { value: 0 },
      uContour: { value: 0 },
      uOffsetX: { value: 0 },
      uRotY: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uPrimitive.value =
      PRIMITIVE_INDEX[stringOf(values, "primitive", "sphere")] ?? 0;
    uniforms.uContour.value = booleanOf(values, "contour", false) ? 1 : 0;
    uniforms.uOffsetX.value = numberOf(values, "offset", 0);
    uniforms.uRotY.value = numberOf(values, "rotation", 0);
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

export default function SdfPrimitivesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "primitive",
          label: L.primitive,
          defaultValue: "sphere",
          options: [
            { value: "sphere", label: L.sphere },
            { value: "box", label: L.box },
            { value: "torus", label: L.torus },
            { value: "capsule", label: L.capsule },
          ],
        },
        { kind: "boolean", key: "contour", label: L.contour, defaultValue: false },
        {
          kind: "number",
          key: "offset",
          label: L.offset,
          min: -1,
          max: 1,
          step: 0.05,
          defaultValue: 0,
        },
        {
          kind: "number",
          key: "rotation",
          label: L.rotation,
          min: -180,
          max: 180,
          step: 1,
          defaultValue: 0,
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
        <SdfPrimitivesPlane />
      </DemoCanvas>
    </Demo>
  );
}

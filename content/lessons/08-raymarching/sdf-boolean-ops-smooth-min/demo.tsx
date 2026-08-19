"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./boolean-ops.frag";
import vertexShader from "./boolean-ops.vert";

const OP_INDEX: Record<string, number> = {
  union: 0,
  subtract: 1,
  intersect: 2,
  "smooth-union": 3,
};

const LABELS = {
  vi: {
    title: "Boolean ops trên SDF: union, subtract, intersect, smooth min",
    op: "Phép toán",
    union: "Union (min)",
    subtract: "Subtract (max(a,-b))",
    intersect: "Intersect (max)",
    smoothUnion: "Smooth union",
    k: "k (bán kính pha trộn)",
    offset: "Độ lệch hình B",
    showSeparately: "Hiện riêng từng hình (bỏ qua phép toán)",
  },
  en: {
    title: "SDF Boolean Ops: Union, Subtract, Intersect, Smooth Min",
    op: "Operation",
    union: "Union (min)",
    subtract: "Subtract (max(a,-b))",
    intersect: "Intersect (max)",
    smoothUnion: "Smooth union",
    k: "k (blend radius)",
    offset: "Shape B offset",
    showSeparately: "Show shapes separately (ignore operation)",
  },
} as const;

function BooleanOpsPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOp: { value: 0 },
      uK: { value: 0.35 },
      uOffset: { value: 0.55 },
      uShowSeparately: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uOp.value = OP_INDEX[stringOf(values, "op", "union")] ?? 0;
    uniforms.uK.value = numberOf(values, "k", 0.35);
    uniforms.uOffset.value = numberOf(values, "offset", 0.55);
    uniforms.uShowSeparately.value = booleanOf(values, "showSeparately", false)
      ? 1
      : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Camera orbit always advances while the canvas is pumped (§8.3 visible-raf).
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

export default function SdfBooleanOpsSmoothMinDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "op",
          label: L.op,
          defaultValue: "union",
          options: [
            { value: "union", label: L.union },
            { value: "subtract", label: L.subtract },
            { value: "intersect", label: L.intersect },
            { value: "smooth-union", label: L.smoothUnion },
          ],
        },
        { kind: "number", key: "k", label: L.k, min: 0.05, max: 0.8, step: 0.01, defaultValue: 0.35 },
        {
          kind: "number",
          key: "offset",
          label: L.offset,
          min: -1.5,
          max: 1.5,
          step: 0.05,
          defaultValue: 0.55,
        },
        {
          kind: "boolean",
          key: "showSeparately",
          label: L.showSeparately,
          defaultValue: false,
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
        <BooleanOpsPlane />
      </DemoCanvas>
    </Demo>
  );
}

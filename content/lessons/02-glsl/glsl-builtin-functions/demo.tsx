"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./function-grapher.frag";
import vertexShader from "./function-grapher.vert";

const FUNC_IDS = [
  "stepStripes",
  "smoothstepPulse",
  "fractSawtooth",
  "distanceRings",
] as const;
type FuncId = (typeof FUNC_IDS)[number];

const LABELS = {
  vi: {
    title: "Function grapher: bộ hàm dựng sẵn",
    func: "Hàm",
    count: "Tần suất N",
    detail: "Ngưỡng / độ mượt",
    options: {
      stepStripes: "Sọc bằng step",
      smoothstepPulse: "Xung bằng smoothstep",
      fractSawtooth: "Răng cưa bằng fract",
      distanceRings: "Vòng tròn bằng distance",
    },
  },
  en: {
    title: "Function Grapher: The Built-in Toolkit",
    func: "Function",
    count: "Frequency N",
    detail: "Threshold / smoothness",
    options: {
      stepStripes: "Step stripes",
      smoothstepPulse: "Smoothstep pulse",
      fractSawtooth: "Fract sawtooth",
      distanceRings: "Distance rings",
    },
  },
} as const;

function GrapherPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uMode: { value: 0 },
      uCount: { value: 8 },
      uDetail: { value: 0.5 },
    }),
    [],
  );

  useEffect(() => {
    const func = stringOf(values, "func", "stepStripes") as FuncId;
    const idx = FUNC_IDS.indexOf(func);
    uniforms.uMode.value = idx >= 0 ? idx : 0;
    uniforms.uCount.value = numberOf(values, "count", 8);
    uniforms.uDetail.value = numberOf(values, "detail", 0.5);
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

export default function GlslBuiltinFunctionsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "func",
          label: L.func,
          options: FUNC_IDS.map((id) => ({ value: id, label: L.options[id] })),
          defaultValue: "stepStripes",
        },
        {
          kind: "number",
          key: "count",
          label: L.count,
          min: 1,
          max: 24,
          step: 1,
          defaultValue: 8,
        },
        {
          kind: "number",
          key: "detail",
          label: L.detail,
          min: 0.01,
          max: 0.99,
          step: 0.01,
          defaultValue: 0.5,
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
        <GrapherPlane />
      </DemoCanvas>
    </Demo>
  );
}

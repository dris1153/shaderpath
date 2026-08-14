"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./debug-probes.frag";
import vertexShader from "./debug-probes.vert";

const MODES = ["final", "probeA", "probeB", "probeC", "fixed"] as const;

const LABELS = {
  vi: {
    title: "Debug bằng màu: ca \"vòng tròn đen\"",
    mode: "Chế độ xem",
    radius: "Bán kính vòng",
    lightAngle: "Góc nguồn sáng",
    modeOptions: {
      final: "Kết quả lỗi (vòng đen)",
      probeA: "Probe A: N thô",
      probeB: "Probe B: N đã remap",
      probeC: "Probe C: ngưỡng step",
      fixed: "Đã sửa (normalize)",
    },
  },
  en: {
    title: 'Debugging by Color: the "black ring" case',
    mode: "Debug view",
    radius: "Ring radius",
    lightAngle: "Light angle",
    modeOptions: {
      final: "Buggy output (black ring)",
      probeA: "Probe A: raw N",
      probeB: "Probe B: remapped N",
      probeC: "Probe C: step threshold",
      fixed: "Fixed (normalized)",
    },
  },
} as const;

function DebugPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uMode: { value: 0 },
      uRadius: { value: 0.28 },
      uLightAngle: { value: Math.PI / 4 },
    }),
    [],
  );

  useEffect(() => {
    const mode = stringOf(values, "mode", "final");
    const index = MODES.indexOf(mode as (typeof MODES)[number]);
    uniforms.uMode.value = index >= 0 ? index : 0;
    uniforms.uRadius.value = numberOf(values, "radius", 0.28);
    uniforms.uLightAngle.value = (numberOf(values, "lightAngle", 45) * Math.PI) / 180;
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

export default function ShaderDebuggingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          options: MODES.map((m) => ({ value: m, label: L.modeOptions[m] })),
          defaultValue: "final",
        },
        { kind: "number", key: "radius", label: L.radius, min: 0.15, max: 0.4, step: 0.01, defaultValue: 0.28 },
        { kind: "number", key: "lightAngle", label: L.lightAngle, min: 0, max: 360, step: 5, defaultValue: 45 },
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
        <DebugPlane />
      </DemoCanvas>
    </Demo>
  );
}

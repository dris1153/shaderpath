"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./shadows-ao.frag";
import vertexShader from "./shadows-ao.vert";

const SHADOW_MODE_INDEX: Record<string, number> = {
  none: 0,
  hard: 1,
  soft: 2,
};

const LABELS = {
  vi: {
    title: "Bóng mềm & AO trong raymarch",
    shadowMode: "Kiểu bóng",
    none: "Không bóng",
    hard: "Bóng cứng",
    soft: "Bóng mềm",
    softK: "Độ mềm bóng (k)",
    aoEnabled: "Bật AO",
    aoStrength: "Cường độ AO",
    lightAngle: "Góc mặt trời",
  },
  en: {
    title: "Raymarched Soft Shadows & AO",
    shadowMode: "Shadow mode",
    none: "None",
    hard: "Hard",
    soft: "Soft",
    softK: "Shadow softness (k)",
    aoEnabled: "Enable AO",
    aoStrength: "AO strength",
    lightAngle: "Sun angle",
  },
} as const;

function ShadowsAoPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShadowMode: { value: 2 },
      uSoftK: { value: 8 },
      uAoEnabled: { value: 1 },
      uAoStrength: { value: 0.8 },
      uLightAngle: { value: 40 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uShadowMode.value =
      SHADOW_MODE_INDEX[stringOf(values, "shadowMode", "soft")] ?? 2;
    uniforms.uSoftK.value = numberOf(values, "softK", 8);
    uniforms.uAoEnabled.value = booleanOf(values, "aoEnabled", true) ? 1 : 0;
    uniforms.uAoStrength.value = numberOf(values, "aoStrength", 0.8);
    uniforms.uLightAngle.value = numberOf(values, "lightAngle", 40);
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

export default function RaymarchedShadowsAndAoDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "shadowMode",
          label: L.shadowMode,
          defaultValue: "soft",
          options: [
            { value: "none", label: L.none },
            { value: "hard", label: L.hard },
            { value: "soft", label: L.soft },
          ],
        },
        { kind: "number", key: "softK", label: L.softK, min: 2, max: 32, step: 1, defaultValue: 8 },
        { kind: "boolean", key: "aoEnabled", label: L.aoEnabled, defaultValue: true },
        { kind: "number", key: "aoStrength", label: L.aoStrength, min: 0, max: 1, step: 0.05, defaultValue: 0.8 },
        { kind: "number", key: "lightAngle", label: L.lightAngle, min: 10, max: 80, step: 1, defaultValue: 40 },
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
        <ShadowsAoPlane />
      </DemoCanvas>
    </Demo>
  );
}

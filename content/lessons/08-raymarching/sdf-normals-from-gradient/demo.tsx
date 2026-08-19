"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./sdf-normals.frag";
import vertexShader from "./sdf-normals.vert";

const TECHNIQUE_INDEX: Record<string, number> = {
  central: 0,
  tetrahedron: 1,
};

const SHADING_INDEX: Record<string, number> = {
  normal: 0,
  lambert: 1,
  full: 2,
};

const LABELS = {
  vi: {
    title: "Normal từ gradient SDF",
    technique: "Kỹ thuật tính normal",
    central: "Central diff (6 mẫu)",
    tetrahedron: "Tetrahedron (4 mẫu)",
    epsilon: "Epsilon (ε)",
    shading: "Kiểu shading",
    normal: "Normal làm màu",
    lambert: "Lambert diffuse",
    full: "Rig 3 đèn (Lambert + Blinn-Phong + fill)",
  },
  en: {
    title: "SDF Normals from the Gradient",
    technique: "Normal technique",
    central: "Central diff (6 taps)",
    tetrahedron: "Tetrahedron (4 taps)",
    epsilon: "Epsilon (ε)",
    shading: "Shading mode",
    normal: "Normal as color",
    lambert: "Lambert diffuse",
    full: "Full 3-light rig (Lambert + Blinn-Phong + fill)",
  },
} as const;

function RaymarchedNormalsPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEpsilon: { value: 0.02 },
      uTechnique: { value: 0 },
      uShading: { value: 2 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uEpsilon.value = numberOf(values, "epsilon", 0.02);
    uniforms.uTechnique.value =
      TECHNIQUE_INDEX[stringOf(values, "technique", "central")] ?? 0;
    uniforms.uShading.value = SHADING_INDEX[stringOf(values, "shading", "full")] ?? 2;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
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

export default function SdfNormalsFromGradientDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "technique",
          label: L.technique,
          defaultValue: "central",
          options: [
            { value: "central", label: L.central },
            { value: "tetrahedron", label: L.tetrahedron },
          ],
        },
        { kind: "number", key: "epsilon", label: L.epsilon, min: 0.01, max: 0.35, step: 0.01, defaultValue: 0.02 },
        {
          kind: "select",
          key: "shading",
          label: L.shading,
          defaultValue: "full",
          options: [
            { value: "normal", label: L.normal },
            { value: "lambert", label: L.lambert },
            { value: "full", label: L.full },
          ],
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
        <RaymarchedNormalsPlane />
      </DemoCanvas>
    </Demo>
  );
}

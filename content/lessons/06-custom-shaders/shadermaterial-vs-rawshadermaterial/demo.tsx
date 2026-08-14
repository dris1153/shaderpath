"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./torus-knot-visualizer.frag";
import vertexShader from "./torus-knot-visualizer.vert";

const VIS_MODES = ["uv", "normal", "mix"] as const;
type VisMode = (typeof VIS_MODES)[number];

const LABELS = {
  vi: {
    title: "ShaderMaterial trên torus knot: tô theo uv / normal / mix",
    mode: "Chế độ hiển thị",
    modeUv: "uv (vUv làm r, g)",
    modeNormal: "normal (vNormal * 0.5 + 0.5)",
    modeMix: "mix (uv + normal + ánh sáng giả)",
  },
  en: {
    title: "ShaderMaterial on a Torus Knot: Coloring by uv / normal / mix",
    mode: "Visualization mode",
    modeUv: "uv (vUv as r, g)",
    modeNormal: "normal (vNormal * 0.5 + 0.5)",
    modeMix: "mix (uv + normal + fake light)",
  },
} as const;

// Only normalMatrix/projectionMatrix/modelViewMatrix and the position/normal/uv
// attributes are used below — none of them declared in the .vert/.frag files,
// all free from ShaderMaterial's prelude (spec §10: exact claim, verified in theory).
function ShaderKnot() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uMode: { value: 0 },
      uLightDir: { value: [0.4, 0.8, 0.5] },
    }),
    [],
  );

  useEffect(() => {
    const mode = stringOf(values, "mode", "uv") as VisMode;
    uniforms.uMode.value = VIS_MODES.indexOf(mode);
    invalidate();
  }, [values, uniforms, invalidate]);

  // FrameloopGate (DemoCanvas) already pumps invalidate() while visible —
  // no need to call it again here, matching the sdf-circle.frag demo idiom.
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y += delta * 0.4;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.32, 180, 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ShaderMaterialVsRawDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "uv",
          options: [
            { value: "uv", label: L.modeUv },
            { value: "normal", label: L.modeNormal },
            { value: "mix", label: L.modeMix },
          ],
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <ShaderKnot />
      </DemoCanvas>
    </Demo>
  );
}

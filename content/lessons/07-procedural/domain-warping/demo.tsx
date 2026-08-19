"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./domain-warp.frag";
import vertexShader from "./domain-warp.vert";

const LAYERS_INDEX: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
};

const LABELS = {
  vi: {
    title: "Domain warping: méo toạ độ trước khi lấy mẫu",
    warpStrength: "Cường độ warp",
    layers: "Số lớp warp",
    layers0: "0 (fbm thô, chưa warp)",
    layers1: "1 (q rồi fbm(p + strength·q))",
    layers2: "2 (lồng r từ q)",
    colorByIntermediate: "Tô màu theo giá trị trung gian (q, r)",
    animate: "Animate (drift theo thời gian)",
  },
  en: {
    title: "Domain Warping: Distort Coordinates Before Sampling",
    warpStrength: "Warp strength",
    layers: "Warp layers",
    layers0: "0 (raw fbm, unwarped)",
    layers1: "1 (q, then fbm(p + strength·q))",
    layers2: "2 (nest r from q)",
    colorByIntermediate: "Color by intermediate values (q, r)",
    animate: "Animate (drift over time)",
  },
} as const;

function WarpPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAnimate: { value: 1 },
      uWarpStrength: { value: 3 },
      uLayers: { value: 2 },
      uColorByIntermediate: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uAnimate.value = booleanOf(values, "animate", true) ? 1 : 0;
    uniforms.uWarpStrength.value = numberOf(values, "warpStrength", 3);
    uniforms.uLayers.value = LAYERS_INDEX[stringOf(values, "layers", "2")] ?? 2;
    uniforms.uColorByIntermediate.value = booleanOf(values, "colorByIntermediate", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  const bindUniforms = useSharedUniforms(uniforms);

  // Time always advances while the canvas is pumped (§8.3 visible-raf) —
  // uAnimate gates the visible drift inside the shader instead of freezing this call.
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={bindUniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function DomainWarpingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "warpStrength",
          label: L.warpStrength,
          min: 0,
          max: 8,
          step: 0.1,
          defaultValue: 3,
        },
        {
          kind: "select",
          key: "layers",
          label: L.layers,
          defaultValue: "2",
          options: [
            { value: "0", label: L.layers0 },
            { value: "1", label: L.layers1 },
            { value: "2", label: L.layers2 },
          ],
        },
        {
          kind: "boolean",
          key: "colorByIntermediate",
          label: L.colorByIntermediate,
          defaultValue: true,
        },
        { kind: "boolean", key: "animate", label: L.animate, defaultValue: true },
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
        <WarpPlane />
      </DemoCanvas>
    </Demo>
  );
}

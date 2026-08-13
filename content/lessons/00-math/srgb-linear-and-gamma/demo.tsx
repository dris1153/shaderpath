"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./srgb-blend.frag";
import vertexShader from "./srgb-blend.vert";

const LABELS = {
  vi: {
    title: "So sánh trộn màu: sRGB vs Linear",
    pair: "Cặp màu",
    swap: "Đảo nửa trên/dưới",
    pairRedGreen: "Đỏ ↔ Lục",
    pairRedBlue: "Đỏ ↔ Lam",
    pairGreenBlue: "Lục ↔ Lam",
    pairMagentaYellow: "Cánh sen ↔ Vàng",
  },
  en: {
    title: "Color Blend Comparison: sRGB vs Linear",
    pair: "Color pair",
    swap: "Swap top/bottom",
    pairRedGreen: "Red ↔ Green",
    pairRedBlue: "Red ↔ Blue",
    pairGreenBlue: "Green ↔ Blue",
    pairMagentaYellow: "Magenta ↔ Yellow",
  },
} as const;

// sRGB-encoded (0..1) triples — exactly the numbers a color picker/hex code gives you.
// Kept as plain Vector3 (not THREE.Color) so no automatic color-management
// conversion happens before the shader — the demo does decode/encode by hand.
const PRESETS: Record<string, [THREE.Vector3, THREE.Vector3]> = {
  "red-green": [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
  "red-blue": [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)],
  "green-blue": [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)],
  "magenta-yellow": [new THREE.Vector3(1, 0, 1), new THREE.Vector3(1, 1, 0)],
};

function BlendPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uColorA: { value: new THREE.Vector3(1, 0, 0) },
      uColorB: { value: new THREE.Vector3(0, 1, 0) },
      uSwapHalves: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const pair = stringOf(values, "pair", "red-green");
    const [a, b] = PRESETS[pair] ?? PRESETS["red-green"]!;
    uniforms.uColorA.value.copy(a);
    uniforms.uColorB.value.copy(b);
    uniforms.uSwapHalves.value = booleanOf(values, "swap") ? 1 : 0;
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

export default function SrgbLinearGammaDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={2}
      controls={[
        {
          kind: "select",
          key: "pair",
          label: L.pair,
          defaultValue: "red-green",
          options: [
            { value: "red-green", label: L.pairRedGreen },
            { value: "red-blue", label: L.pairRedBlue },
            { value: "green-blue", label: L.pairGreenBlue },
            { value: "magenta-yellow", label: L.pairMagentaYellow },
          ],
        },
        { kind: "boolean", key: "swap", label: L.swap, defaultValue: false },
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
        <BlendPlane />
      </DemoCanvas>
    </Demo>
  );
}

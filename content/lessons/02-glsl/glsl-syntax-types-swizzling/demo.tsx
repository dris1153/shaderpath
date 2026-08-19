"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import fragmentShader from "./swizzle-explorer.frag";
import vertexShader from "./swizzle-explorer.vert";

const SWIZZLE_MODES = ["xyz", "xyx", "yxy", "bgr"] as const;
type SwizzleMode = (typeof SWIZZLE_MODES)[number];

const LABELS = {
  vi: {
    title: "Swizzle explorer: cùng một base color, đổi kênh",
    pattern: "Kiểu swizzle",
    options: {
      xyz: "base.xyz (gốc, không đổi)",
      xyx: "base.xyx (lặp x vào slot z)",
      yxy: "base.yxy (hoán đổi + lặp)",
      bgr: "base.bgr (đảo thứ tự kênh)",
    },
  },
  en: {
    title: "Swizzle Explorer: Same Base Color, Re-channeled",
    pattern: "Swizzle pattern",
    options: {
      xyz: "base.xyz (identity)",
      xyx: "base.xyx (repeat x into z)",
      yxy: "base.yxy (permute + repeat)",
      bgr: "base.bgr (reversed channel order)",
    },
  },
} as const;

function SwizzlePlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uMode: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const pattern = stringOf(values, "pattern", "xyz") as SwizzleMode;
    const idx = SWIZZLE_MODES.indexOf(pattern);
    uniforms.uMode.value = idx >= 0 ? idx : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Geometry/material created as JSX — R3F auto-disposes them on unmount (§8.2)
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

export default function SwizzleExplorerDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "pattern",
          label: L.pattern,
          options: SWIZZLE_MODES.map((m) => ({ value: m, label: L.options[m] })),
          defaultValue: "xyz",
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
        <SwizzlePlane />
      </DemoCanvas>
    </Demo>
  );
}

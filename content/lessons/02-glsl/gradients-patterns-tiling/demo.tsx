"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import fragmentShader from "./pattern-tile.frag";
import vertexShader from "./pattern-tile.vert";

const MOTIF_INDEX: Record<string, number> = {
  checker: 0,
  dots: 1,
  stripes: 2,
  rings: 3,
};

const LABELS = {
  vi: {
    title: "Pattern builder: tiling & xoay theo ô",
    motif: "Hoạ tiết",
    checker: "Caro",
    dots: "Chấm tròn",
    stripes: "Sọc",
    rings: "Vòng tròn đồng tâm",
    tileCount: "Số ô (N)",
    rotation: "Xoay mỗi ô (độ)",
    rowOffset: "Lệch hàng (brick offset)",
  },
  en: {
    title: "Pattern Builder: Per-Cell Tiling & Rotation",
    motif: "Motif",
    checker: "Checker",
    dots: "Dots",
    stripes: "Stripes",
    rings: "Concentric rings",
    tileCount: "Tile count (N)",
    rotation: "Per-cell rotation (deg)",
    rowOffset: "Row offset (brick)",
  },
} as const;

function PatternPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTileCount: { value: 6 },
      uRotation: { value: 0 },
      uRowOffset: { value: 0 },
      uMotif: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uTileCount.value = numberOf(values, "tileCount", 6);
    uniforms.uRotation.value = (numberOf(values, "rotation", 0) * Math.PI) / 180;
    uniforms.uRowOffset.value = booleanOf(values, "rowOffset", false) ? 1 : 0;
    uniforms.uMotif.value = MOTIF_INDEX[stringOf(values, "motif", "checker")] ?? 0;
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

export default function GradientsPatternsTilingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "motif",
          label: L.motif,
          defaultValue: "checker",
          options: [
            { value: "checker", label: L.checker },
            { value: "dots", label: L.dots },
            { value: "stripes", label: L.stripes },
            { value: "rings", label: L.rings },
          ],
        },
        { kind: "number", key: "tileCount", label: L.tileCount, min: 2, max: 16, step: 1, defaultValue: 6 },
        { kind: "number", key: "rotation", label: L.rotation, min: -180, max: 180, step: 1, defaultValue: 0 },
        { kind: "boolean", key: "rowOffset", label: L.rowOffset, defaultValue: false },
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
        <PatternPlane />
      </DemoCanvas>
    </Demo>
  );
}

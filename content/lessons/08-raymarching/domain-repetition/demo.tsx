"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./domain-repetition.frag";
import vertexShader from "./domain-repetition.vert";

const MODE_INDEX: Record<string, number> = {
  infinite: 0,
  finite: 1,
};

const AXIS_INDEX: Record<string, number> = {
  xz: 0,
  xyz: 1,
};

const LABELS = {
  vi: {
    title: "Lặp không gian (domain repetition)",
    mode: "Chế độ lặp",
    infinite: "Vô hạn (mod)",
    finite: "Hữu hạn (clamp)",
    cellSize: "Kích thước ô",
    clampRadius: "Bán kính giới hạn (chỉ dùng ở chế độ Hữu hạn)",
    variation: "Biến thể theo từng ô (hash)",
    axis: "Trục lặp",
    xz: "Chỉ xz (sàn vô hạn)",
    xyz: "Toàn bộ xyz (khối)",
  },
  en: {
    title: "Domain Repetition",
    mode: "Repeat mode",
    infinite: "Infinite (mod)",
    finite: "Finite (clamped)",
    cellSize: "Cell size",
    clampRadius: "Clamp radius (finite mode only)",
    variation: "Per-cell variation (hash)",
    axis: "Repeat axes",
    xz: "xz only (infinite floor)",
    xyz: "Full xyz (volume)",
  },
} as const;

function DomainRepetitionPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCellSize: { value: 1.6 },
      uMode: { value: 0 },
      uClampN: { value: 3 },
      uVariation: { value: 1 },
      uAxisMode: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uCellSize.value = numberOf(values, "cellSize", 1.6);
    uniforms.uMode.value = MODE_INDEX[stringOf(values, "mode", "infinite")] ?? 0;
    uniforms.uClampN.value = numberOf(values, "clampRadius", 3);
    uniforms.uVariation.value = booleanOf(values, "variation", true) ? 1 : 0;
    uniforms.uAxisMode.value = AXIS_INDEX[stringOf(values, "axis", "xz")] ?? 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // The camera orbits on its own regardless of frameloop demand-pumping —
  // runs once per pumped frame, time freezes off-screen along with the loop.
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

export default function DomainRepetitionDemo() {
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
          defaultValue: "infinite",
          options: [
            { value: "infinite", label: L.infinite },
            { value: "finite", label: L.finite },
          ],
        },
        {
          kind: "number",
          key: "cellSize",
          label: L.cellSize,
          min: 0.6,
          max: 3.0,
          step: 0.1,
          defaultValue: 1.6,
        },
        {
          kind: "number",
          key: "clampRadius",
          label: L.clampRadius,
          min: 1,
          max: 6,
          step: 1,
          defaultValue: 3,
        },
        { kind: "boolean", key: "variation", label: L.variation, defaultValue: true },
        {
          kind: "select",
          key: "axis",
          label: L.axis,
          defaultValue: "xz",
          options: [
            { value: "xz", label: L.xz },
            { value: "xyz", label: L.xyz },
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
        <DomainRepetitionPlane />
      </DemoCanvas>
    </Demo>
  );
}

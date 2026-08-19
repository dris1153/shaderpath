"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { useSharedUniforms } from "@/lib/hooks/use-shared-uniforms";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./voronoi.frag";
import vertexShader from "./voronoi.vert";

const MODE_INDEX: Record<string, number> = {
  f1: 0,
  f2f1: 1,
  cellid: 2,
  smooth: 3,
};

const METRIC_INDEX: Record<string, number> = {
  euclidean: 0,
  manhattan: 1,
  chebyshev: 2,
};

const LABELS = {
  vi: {
    title: "Voronoi & Worley noise",
    mode: "Chế độ",
    f1: "F1 (gần nhất)",
    f2f1: "F2 − F1 (viền ô)",
    cellid: "Màu theo ô (cell-ID)",
    smooth: "Voronoi mượt",
    jitter: "Độ ngẫu nhiên (jitter)",
    metric: "Độ đo khoảng cách",
    euclidean: "Euclid",
    manhattan: "Manhattan",
    chebyshev: "Chebyshev",
    animate: "Điểm chuyển động theo thời gian",
  },
  en: {
    title: "Voronoi & Worley Noise",
    mode: "Mode",
    f1: "F1 (nearest)",
    f2f1: "F2 − F1 (cell border)",
    cellid: "Cell-ID colors",
    smooth: "Smooth voronoi",
    jitter: "Jitter amount",
    metric: "Distance metric",
    euclidean: "Euclidean",
    manhattan: "Manhattan",
    chebyshev: "Chebyshev",
    animate: "Animate points over time",
  },
} as const;

function VoronoiPlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uJitter: { value: 1 },
      uMode: { value: 0 },
      uMetric: { value: 0 },
      uAnimate: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uJitter.value = numberOf(values, "jitter", 1);
    uniforms.uMode.value = MODE_INDEX[stringOf(values, "mode", "f1")] ?? 0;
    uniforms.uMetric.value =
      METRIC_INDEX[stringOf(values, "metric", "euclidean")] ?? 0;
    uniforms.uAnimate.value = booleanOf(values, "animate", true) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Runs once per pumped frame — time freezes off-screen along with the loop
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

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

export default function VoronoiAndWorleyDemo() {
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
          defaultValue: "f1",
          options: [
            { value: "f1", label: L.f1 },
            { value: "f2f1", label: L.f2f1 },
            { value: "cellid", label: L.cellid },
            { value: "smooth", label: L.smooth },
          ],
        },
        {
          kind: "number",
          key: "jitter",
          label: L.jitter,
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 1,
        },
        {
          kind: "select",
          key: "metric",
          label: L.metric,
          defaultValue: "euclidean",
          options: [
            { value: "euclidean", label: L.euclidean },
            { value: "manhattan", label: L.manhattan },
            { value: "chebyshev", label: L.chebyshev },
          ],
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
        <VoronoiPlane />
      </DemoCanvas>
    </Demo>
  );
}

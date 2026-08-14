"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./fog-terrain.frag";
import vertexShader from "./fog-terrain.vert";

const LABELS = {
  vi: {
    title: "Fog & tán xạ khí quyển",
    density: "Mật độ fog",
    heightFalloff: "Độ giảm theo độ cao (height fog)",
    sunAzimuth: "Góc phương vị mặt trời",
    fogType: "Kiểu fog",
    uniform: "Đều (uniform)",
    height: "Theo độ cao",
  },
  en: {
    title: "Fog & Atmospheric Scattering",
    density: "Fog density",
    heightFalloff: "Height falloff (height fog)",
    sunAzimuth: "Sun azimuth",
    fogType: "Fog type",
    uniform: "Uniform",
    height: "Height-based",
  },
} as const;

function FogScene() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDensity: { value: 0.06 },
      uHeightFalloff: { value: 0.5 },
      uSunAzimuth: { value: 45 },
      uFogType: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uDensity.value = numberOf(values, "density", 0.06);
    uniforms.uHeightFalloff.value = numberOf(values, "heightFalloff", 0.5);
    uniforms.uSunAzimuth.value = numberOf(values, "sunAzimuth", 45);
    uniforms.uFogType.value =
      stringOf(values, "fogType", "uniform") === "height" ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Slow forward drift keeps the fog boundary visibly moving through the pillar field
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

export default function FogAndAtmosphericScatteringDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "density",
          label: L.density,
          min: 0,
          max: 0.3,
          step: 0.005,
          defaultValue: 0.06,
        },
        {
          kind: "number",
          key: "heightFalloff",
          label: L.heightFalloff,
          min: 0.05,
          max: 2,
          step: 0.05,
          defaultValue: 0.5,
        },
        {
          kind: "number",
          key: "sunAzimuth",
          label: L.sunAzimuth,
          min: 0,
          max: 360,
          step: 1,
          defaultValue: 45,
        },
        {
          kind: "select",
          key: "fogType",
          label: L.fogType,
          options: [
            { value: "uniform", label: L.uniform },
            { value: "height", label: L.height },
          ],
          defaultValue: "uniform",
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
        <FogScene />
      </DemoCanvas>
    </Demo>
  );
}

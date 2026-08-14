"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./cook-torrance-explorer.frag";
import vertexShader from "./cook-torrance-explorer.vert";

const LABELS = {
  vi: {
    title: "BRDF explorer: Cook-Torrance từ đầu",
    roughness: "Roughness",
    metalness: "Metalness",
    mode: "Xem thành phần",
    optCombined: "Kết hợp (fr đầy đủ)",
    optD: "D — phân bố GGX",
    optG: "G — Smith shadow/mask",
    optF: "F — Fresnel (Schlick)",
    lightAngle: "Hướng đèn (độ, quay quanh)",
  },
  en: {
    title: "BRDF Explorer: Cook-Torrance from Scratch",
    roughness: "Roughness",
    metalness: "Metalness",
    mode: "View term",
    optCombined: "Combined (full fr)",
    optD: "D — GGX distribution",
    optG: "G — Smith shadow/mask",
    optF: "F — Fresnel (Schlick)",
    lightAngle: "Light direction (deg, orbit)",
  },
} as const;

const MODE_INDEX: Record<string, number> = { combined: 0, D: 1, G: 2, F: 3 };
const LIGHT_ELEVATION = THREE.MathUtils.degToRad(35);
const SPHERE_COLOR = new THREE.Color("#c65a3c");

function lightDirFromAngle(angleDeg: number): THREE.Vector3 {
  const rad = THREE.MathUtils.degToRad(angleDeg);
  return new THREE.Vector3(
    Math.cos(rad) * Math.cos(LIGHT_ELEVATION),
    Math.sin(LIGHT_ELEVATION),
    Math.sin(rad) * Math.cos(LIGHT_ELEVATION),
  ).normalize();
}

function CookTorranceSphere() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uRoughness: { value: 0.5 },
      uMetalness: { value: 0.0 },
      uBaseColor: { value: SPHERE_COLOR.clone() },
      uLightDir: { value: lightDirFromAngle(45) },
      uLightColor: { value: new THREE.Color(3.0, 3.0, 3.0) },
      uMode: { value: MODE_INDEX.combined },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uRoughness.value = numberOf(values, "roughness", 0.5);
    uniforms.uMetalness.value = numberOf(values, "metalness", 0.0);
    uniforms.uLightDir.value = lightDirFromAngle(numberOf(values, "lightAngle", 45));
    uniforms.uMode.value = MODE_INDEX[stringOf(values, "mode", "combined")] ?? 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // Idle spin so the D/G grazing-angle falloff sweeps across the whole
  // silhouette -- the container's own RAF pump keeps this rendering while
  // visible (useVisibleFrameloop), no manual invalidate needed here.
  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 96, 96]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function BrdfAndMicrofacetsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "number",
          key: "roughness",
          label: L.roughness,
          min: 0.04,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
        },
        {
          kind: "number",
          key: "metalness",
          label: L.metalness,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0,
        },
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "combined",
          options: [
            { value: "combined", label: L.optCombined },
            { value: "D", label: L.optD },
            { value: "G", label: L.optG },
            { value: "F", label: L.optF },
          ],
        },
        {
          kind: "number",
          key: "lightAngle",
          label: L.lightAngle,
          min: 0,
          max: 360,
          step: 1,
          defaultValue: 45,
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 3.4], fov: 45 }}>
        <CookTorranceSphere />
      </DemoCanvas>
    </Demo>
  );
}

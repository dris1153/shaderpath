"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { GradingPipeline } from "./grading-pipeline";
import type { LutKind } from "./lut-generator";

const LABELS = {
  vi: {
    title: "Tone mapping + LUT color grading",
    toneMapping: "Tone mapping",
    exposure: "Exposure",
    lut: "LUT",
    intensity: "Cường độ LUT",
    split: "So sánh trước/sau",
    toneNone: "None (clip cứng)",
    toneReinhard: "Reinhard",
    toneAces: "ACES Filmic",
    toneAgx: "AgX",
    lutNeutral: "Neutral (identity)",
    lutTeal: "Teal & Orange",
    lutBleach: "Bleach bypass",
  },
  en: {
    title: "Tone Mapping + LUT Color Grading",
    toneMapping: "Tone mapping",
    exposure: "Exposure",
    lut: "LUT",
    intensity: "LUT intensity",
    split: "Before/after split",
    toneNone: "None (hard clip)",
    toneReinhard: "Reinhard",
    toneAces: "ACES Filmic",
    toneAgx: "AgX",
    lutNeutral: "Neutral (identity)",
    lutTeal: "Teal & Orange",
    lutBleach: "Bleach bypass",
  },
} as const;

// A few meshes with real HDR range: an emissive "sun" plus bright point lights
// push specular highlights well past 1.0 in linear light, so the tone-mapping
// select actually has clipped-vs-rolled-off highlights to compare.
function HdrScene() {
  return (
    <>
      <ambientLight intensity={0.06} />
      <pointLight position={[2.4, 2.6, 3]} intensity={38} color="#ffd7a3" />
      <pointLight position={[-3, -0.6, 1.8]} intensity={16} color="#8fd0ff" />

      <mesh position={[1.3, 0.6, -0.6]}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive="#ff9d3d"
          emissiveIntensity={5.5}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[-0.9, -0.2, 0.2]}>
        <sphereGeometry args={[0.85, 48, 32]} />
        <meshStandardMaterial color="#8a8f9c" metalness={0.9} roughness={0.18} />
      </mesh>

      <mesh position={[0.2, -1.1, 0.6]} rotation={[0.3, 0.4, 0]}>
        <torusKnotGeometry args={[0.45, 0.14, 128, 24]} />
        <meshStandardMaterial color="#c94f4f" metalness={0.15} roughness={0.5} />
      </mesh>

      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#12141a" roughness={0.9} />
      </mesh>
    </>
  );
}

function GradedRenderer() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();

  const pipeline = useMemo(
    () => disposables.register(new GradingPipeline(gl, scene, camera)),
    [gl, scene, camera, disposables],
  );

  useEffect(() => {
    pipeline.setSize(size.width, size.height);
  }, [pipeline, size]);

  useEffect(() => {
    pipeline.setToneMapping(stringOf(values, "toneMapping", "aces"));
    pipeline.setExposure(numberOf(values, "exposure", 1));
    pipeline.setLut(stringOf(values, "lut", "neutral") as LutKind);
    pipeline.setIntensity(numberOf(values, "intensity", 1));
    pipeline.setSplit(booleanOf(values, "split", false));
  }, [values, pipeline]);

  // Priority 1 tells R3F to skip its own render call this frame — the
  // composer takes over as the sole thing drawing to the screen.
  useFrame(() => {
    pipeline.render();
  }, 1);

  return <HdrScene />;
}

export default function ColorGradingLutTonemappingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "select",
          key: "toneMapping",
          label: L.toneMapping,
          defaultValue: "aces",
          options: [
            { value: "none", label: L.toneNone },
            { value: "reinhard", label: L.toneReinhard },
            { value: "aces", label: L.toneAces },
            { value: "agx", label: L.toneAgx },
          ],
        },
        {
          kind: "number",
          key: "exposure",
          label: L.exposure,
          min: 0.2,
          max: 2.5,
          step: 0.05,
          defaultValue: 1,
        },
        {
          kind: "select",
          key: "lut",
          label: L.lut,
          defaultValue: "neutral",
          options: [
            { value: "neutral", label: L.lutNeutral },
            { value: "teal-orange", label: L.lutTeal },
            { value: "bleach-bypass", label: L.lutBleach },
          ],
        },
        {
          kind: "number",
          key: "intensity",
          label: L.intensity,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 1,
        },
        { kind: "boolean", key: "split", label: L.split, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0.4, 4.2], fov: 45 }}>
        <GradedRenderer />
      </DemoCanvas>
    </Demo>
  );
}

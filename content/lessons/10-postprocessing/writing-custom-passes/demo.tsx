"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { HeatShimmerPass } from "./heat-shimmer-pass";

const LABELS = {
  vi: {
    title: "Custom Pass: Heat Shimmer",
    enabled: "Bật pass",
    strength: "Cường độ (uStrength)",
    scale: "Tần số sóng (uScale)",
    speed: "Tốc độ thời gian (uSpeed)",
  },
  en: {
    title: "Custom Pass: Heat Shimmer",
    enabled: "Pass enabled",
    strength: "Strength (uStrength)",
    scale: "Wave frequency (uScale)",
    speed: "Time speed (uSpeed)",
  },
} as const;

function DesertScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.5} color="#fff3d6" />

      <mesh position={[-1.1, -0.35, 0]}>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="#d99a5b" roughness={0.85} />
      </mesh>

      <mesh position={[1, -0.05, -0.5]}>
        <coneGeometry args={[0.6, 1.7, 5]} />
        <meshStandardMaterial color="#b5713a" roughness={0.75} />
      </mesh>

      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#e8c98f" roughness={1} />
      </mesh>
    </>
  );
}

function ShimmerRenderer() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();

  // The pass under test — registered on its own so its dispose() (material
  // only, see the class comment) runs regardless of how the composer is wired.
  const shimmerPass = useMemo(
    () => disposables.register(new HeatShimmerPass()),
    [disposables],
  );

  const composer = useMemo(() => {
    const instance = new EffectComposer(gl);
    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(shimmerPass);

    const outputPass = new OutputPass();
    // Registering the material, not outputPass itself — outputPass.dispose()
    // would additionally touch Pass.js's shared FullScreenQuad geometry for
    // no reason beyond what composer.dispose() already does once (see theory).
    disposables.register(outputPass.material);
    instance.addPass(outputPass);

    return disposables.register(instance);
  }, [gl, scene, camera, shimmerPass, disposables]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useEffect(() => {
    shimmerPass.enabled = booleanOf(values, "enabled", true);
    shimmerPass.uniforms.uStrength.value = numberOf(values, "strength", 1);
    shimmerPass.uniforms.uScale.value = numberOf(values, "scale", 12);
    shimmerPass.uniforms.uSpeed.value = numberOf(values, "speed", 1);
  }, [values, shimmerPass]);

  // Priority 1: this composer's render() replaces R3F's default render call.
  useFrame(() => {
    composer.render();
  }, 1);

  return <DesertScene />;
}

export default function WritingCustomPassesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "enabled", label: L.enabled, defaultValue: true },
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0,
          max: 3,
          step: 0.05,
          defaultValue: 1,
        },
        {
          kind: "number",
          key: "scale",
          label: L.scale,
          min: 2,
          max: 30,
          step: 0.5,
          defaultValue: 12,
        },
        {
          kind: "number",
          key: "speed",
          label: L.speed,
          min: 0,
          max: 4,
          step: 0.1,
          defaultValue: 1,
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0.3, 4], fov: 45 }}>
        <ShimmerRenderer />
      </DemoCanvas>
    </Demo>
  );
}

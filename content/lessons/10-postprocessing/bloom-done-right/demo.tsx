"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";

const LABELS = {
  vi: {
    title: "Bloom đúng cách: HDR, threshold, và bloom bị lạm dụng",
    threshold: "Threshold (ngưỡng đủ sáng)",
    strength: "Strength (cường độ)",
    radius: "Radius (độ lan)",
    hdr: "Buffer HDR (half-float) — tắt để xem bị clip",
  },
  en: {
    title: "Bloom Done Right: HDR, Threshold, and Overused Glow",
    threshold: "Threshold (bright-enough cutoff)",
    strength: "Strength (intensity)",
    radius: "Radius (spread)",
    hdr: "HDR buffer (half-float) — off to see it clip",
  },
} as const;

interface ComposerState {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
}

// Emitters keep toneMapped=false permanently, independent of the HDR
// toggle below — without it, R3F's default ACESFilmicToneMapping clamps
// their output to [0,1] inside RenderPass before bloom ever reads it
// (see theory: "the trap: tonemapping clamps before bloom sees it").
function EmitterMesh({
  children,
  color,
  intensity,
}: {
  children: React.ReactNode;
  color: string;
  intensity: number;
}) {
  return (
    <mesh>
      {children}
      <meshStandardMaterial
        color="#000000"
        emissive={color}
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </mesh>
  );
}

// A dark scene on purpose (spec: bloom taste rule — always preview on a
// dark scene) with a few plain surfaces plus a handful of true emitters.
function DarkScene() {
  return (
    <group>
      <ambientLight intensity={0.06} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.9} />
      </mesh>
      <mesh position={[-1.7, -0.4, 0]}>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color="#7a8092" roughness={0.6} />
      </mesh>
      <mesh position={[1.7, -0.55, 0.6]}>
        <sphereGeometry args={[0.65, 32, 24]} />
        <meshStandardMaterial color="#8891a3" roughness={0.7} />
      </mesh>

      <group position={[0, 0.25, -0.6]}>
        <EmitterMesh color="#ffb066" intensity={4}>
          <sphereGeometry args={[0.35, 32, 24]} />
        </EmitterMesh>
      </group>
      <group position={[-2.6, 0.55, -1.4]}>
        <EmitterMesh color="#66d9ff" intensity={3.2}>
          <sphereGeometry args={[0.28, 32, 24]} />
        </EmitterMesh>
      </group>
      <group position={[1.9, 0.9, -1.8]} rotation={[0, 0.4, 0]}>
        <EmitterMesh color="#ff5577" intensity={3.6}>
          <boxGeometry args={[2.2, 0.08, 0.08]} />
        </EmitterMesh>
      </group>
    </group>
  );
}

// Manual composer rig: RenderPass -> UnrealBloomPass -> OutputPass, the
// same three-pass skeleton effectcomposer-and-passes builds, with the
// middle ShaderPass swapped for UnrealBloomPass.
function BloomRig() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();
  const stateRef = useRef<ComposerState | null>(null);

  const paramsRef = useRef({ threshold: 0.15, strength: 1.2, radius: 0.4 });
  useEffect(() => {
    paramsRef.current.threshold = numberOf(values, "threshold", 0.15);
    paramsRef.current.strength = numberOf(values, "strength", 1.2);
    paramsRef.current.radius = numberOf(values, "radius", 0.4);
  }, [values]);

  useEffect(() => {
    // Placeholder resolution — the resize effect below runs right after mount
    // and sets the real size via composer.setSize().
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      paramsRef.current.strength,
      paramsRef.current.radius,
      paramsRef.current.threshold,
    );
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    stateRef.current = { composer, bloomPass };

    // composer.dispose() only frees its own two render targets + copyPass —
    // UnrealBloomPass owns a whole chain of mip render targets of its own
    // and needs its own dispose() call (same rule as lesson 1's ShaderPass).
    disposables.registerFn(() => {
      stateRef.current = null;
      bloomPass.dispose();
      composer.dispose();
    });
  }, [gl, scene, camera, disposables]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    // composer.setSize() forwards to every pass's own setSize(), including
    // UnrealBloomPass's internal mip chain — no separate resize call needed.
    st.composer.setSize(size.width, size.height);
  }, [size]);

  const hdr = booleanOf(values, "hdr", true);
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    // composer.reset() swaps in a fresh readBuffer/writeBuffer pair without
    // touching the pass chain — same ping-pong buffers as lesson 1, just
    // rebuilt at a different bit depth to make the clipping difference real.
    const dpr = gl.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(
      Math.max(1, Math.round(size.width * dpr)),
      Math.max(1, Math.round(size.height * dpr)),
      { type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType },
    );
    st.composer.reset(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hdr, gl]);

  useFrame(() => {
    const st = stateRef.current;
    if (!st) return;
    st.bloomPass.threshold = paramsRef.current.threshold;
    st.bloomPass.strength = paramsRef.current.strength;
    st.bloomPass.radius = paramsRef.current.radius;
    st.composer.render();
  }, 1);

  return null;
}

export default function BloomDoneRightDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "threshold",
          label: L.threshold,
          min: 0,
          max: 3,
          step: 0.05,
          defaultValue: 0.15,
        },
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0,
          max: 3,
          step: 0.05,
          defaultValue: 1.2,
        },
        {
          kind: "number",
          key: "radius",
          label: L.radius,
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.4,
        },
        { kind: "boolean", key: "hdr", label: L.hdr, defaultValue: true },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 1.4, 5], fov: 50 }}>
        <DarkScene />
        <BloomRig />
      </DemoCanvas>
    </Demo>
  );
}

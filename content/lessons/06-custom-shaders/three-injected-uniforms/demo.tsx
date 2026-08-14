"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import fragmentShader from "./injected-uniforms-orb.frag";
import vertexShader from "./injected-uniforms-orb.vert";

const LABELS = {
  vi: {
    title: "Ba nguồn màu trên một orb: rim + pulse + texture",
    rim: "Rim (cameraPosition, built-in)",
    pulse: "Pulse (uTime, tự khai báo)",
    tex: "Texture (uNoiseMap, tự khai báo)",
  },
  en: {
    title: "Three Color Sources on One Orb: Rim + Pulse + Texture",
    rim: "Rim (cameraPosition, built-in)",
    pulse: "Pulse (uTime, custom)",
    tex: "Texture (uNoiseMap, custom)",
  },
} as const;

const NOISE_SIZE = 64;

// Deterministic hash pattern — no Math.random(), no binary asset (Track 3
// convention), just enough visual variation to prove uNoiseMap is live.
function makeNoiseTexture(): THREE.DataTexture {
  const data = new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4);
  for (let y = 0; y < NOISE_SIZE; y++) {
    for (let x = 0; x < NOISE_SIZE; x++) {
      const i = (y * NOISE_SIZE + x) * 4;
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const v = Math.floor((n - Math.floor(n)) * 255);
      data[i] = v;
      data[i + 1] = Math.floor(0.6 * v);
      data[i + 2] = 255 - v;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, NOISE_SIZE, NOISE_SIZE, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// House pattern (spec: memoized once, mutated in place — see theory).
function InjectedUniformsOrb() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseMap: { value: disposables.register(makeNoiseTexture()) },
      uRim: { value: 1 },
      uPulse: { value: 1 },
      uTex: { value: 1 },
    }),
    [disposables],
  );

  useEffect(() => {
    uniforms.uRim.value = numberOf(values, "rim", 1);
    uniforms.uPulse.value = numberOf(values, "pulse", 1);
    uniforms.uTex.value = numberOf(values, "tex", 1);
    invalidate();
  }, [values, uniforms, invalidate]);

  // Rotating the mesh makes modelMatrix change every frame — the exact
  // per-object-per-frame uniform this lesson's first section is about.
  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.1, 4]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ThreeInjectedUniformsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "rim", label: L.rim, min: 0, max: 2, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "pulse", label: L.pulse, min: 0, max: 2, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "tex", label: L.tex, min: 0, max: 2, step: 0.1, defaultValue: 1 },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 3.4], fov: 45 }}>
        <InjectedUniformsOrb />
      </DemoCanvas>
    </Demo>
  );
}

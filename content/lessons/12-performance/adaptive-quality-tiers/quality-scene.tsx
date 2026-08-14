"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { QualityConfig } from "./quality-config";
import loadVert from "./synthetic-load.vert";
import loadFrag from "./synthetic-load.frag";

// A stand-in cost, not a real EffectComposer chain (Track 10 owns that) —
// each simulated postfx pass is one more fullscreen fragment-shader sweep.
const POSTFX_ITERATIONS = 24;

// Instance count is fixed at InstancedMesh construction time in Three.js —
// remounting via `key={config.particleCount}` (below) is the correct way to
// change it, R3F auto-disposes the old geometry/material.
function ParticleField({ config }: { config: QualityConfig }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < config.particleCount; i++) {
      m.setPosition(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3.6,
        (Math.random() - 0.5) * 4,
      );
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [config.particleCount]);

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, config.particleCount]} frustumCulled={false}>
      <icosahedronGeometry args={[0.035, 0]} />
      {config.material === "lit" ? (
        <meshStandardMaterial color="#7dd3fc" roughness={0.5} metalness={0.1} flatShading />
      ) : (
        <meshBasicMaterial color="#7dd3fc" />
      )}
    </instancedMesh>
  );
}

// colorWrite/depthTest/depthWrite off: invisible and side-effect-free, but
// the fragment shader still runs for every covered pixel — the GPU can't
// know to skip it ahead of time, the same "shader cost isn't avoided by
// hiding the output" fact the overdraw lesson teaches with discard.
function LoadQuad({ iterations }: { iterations: number }) {
  // A fresh uniforms object per iterations change (not a mutated one) —
  // React Compiler's lint rules forbid both mutating a useMemo value and
  // reading a ref during render, so "recompute, don't mutate" is the
  // pattern that satisfies both.
  const uniforms = useMemo(() => ({ uIterations: { value: iterations } }), [iterations]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={loadVert}
        fragmentShader={loadFrag}
        uniforms={uniforms}
        colorWrite={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ~15 lines, no dependency: EMA of the real rAF-driven frame delta.
function StatsProbe({ onSample }: { onSample: (ms: number) => void }) {
  const ema = useRef(0);
  const since = useRef(0);
  useFrame((_state, delta) => {
    const ms = delta * 1000;
    ema.current = ema.current === 0 ? ms : ema.current * 0.9 + ms * 0.1;
    since.current += delta;
    if (since.current > 0.25) {
      since.current = 0;
      onSample(ema.current);
    }
  });
  return null;
}

export function QualityScene({
  config,
  syntheticLoad,
  onSample,
}: {
  config: QualityConfig;
  syntheticLoad: number;
  onSample: (ms: number) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <ParticleField key={config.particleCount} config={config} />
      {Array.from({ length: config.postfxPasses }, (_, i) => (
        <LoadQuad key={`postfx-${i}`} iterations={POSTFX_ITERATIONS} />
      ))}
      {syntheticLoad > 0 && <LoadQuad key="synthetic-load" iterations={Math.round(syntheticLoad * 5)} />}
      <StatsProbe onSample={onSample} />
    </>
  );
}

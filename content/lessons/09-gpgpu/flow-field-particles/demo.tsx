"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GPUComputationRenderer, type Variable } from "three/addons/misc/GPUComputationRenderer.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import velocityShader from "./flow-field-velocity.glsl";
import positionShader from "./flow-field-position.glsl";
import pointsVertexShader from "./flow-field-points.vert";
import pointsFragmentShader from "./flow-field-points.frag";

const SIZE = 256; // 256 * 256 = 65,536 particles
const SPAWN_EXTENT = 2.2; // particles spawn/respawn inside [-EXTENT, EXTENT]^3
const LIFETIME = 4.5; // seconds

const LABELS = {
  vi: {
    title: "Flow field particles: curl noise trong compute shader",
    fieldScale: "Field scale",
    strength: "Cường độ",
    damping: "Damping",
    respawn: "Tái sinh khi hết tuổi thọ",
    colorBy: "Tô màu theo",
    colorSpeed: "Tốc độ",
    colorAge: "Tuổi",
  },
  en: {
    title: "Flow Field Particles: Curl Noise Inside the Compute Shader",
    fieldScale: "Field scale",
    strength: "Strength",
    damping: "Damping",
    respawn: "Respawn on expiry",
    colorBy: "Color by",
    colorSpeed: "Speed",
    colorAge: "Age",
  },
} as const;

function buildParticleGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(SIZE * SIZE * 3); // overwritten via texture in the vertex shader
  const reference = new Float32Array(SIZE * SIZE * 2);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      reference[i * 2 + 0] = (x + 0.5) / SIZE;
      reference[i * 2 + 1] = (y + 0.5) / SIZE;
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aReference", new THREE.BufferAttribute(reference, 2));
  return geometry;
}

function makePositionTexture(): THREE.DataTexture {
  const data = new Float32Array(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    data[i * 4 + 0] = (Math.random() * 2 - 1) * SPAWN_EXTENT;
    data[i * 4 + 1] = (Math.random() * 2 - 1) * SPAWN_EXTENT;
    data[i * 4 + 2] = (Math.random() * 2 - 1) * SPAWN_EXTENT;
    data[i * 4 + 3] = Math.random() * LIFETIME; // staggered starting age — see theory
  }
  return new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
}

function makeVelocityTexture(): THREE.DataTexture {
  const data = new Float32Array(SIZE * SIZE * 4); // zeroed: particles accelerate into the field
  return new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
}

interface GpuState {
  compute: GPUComputationRenderer;
  positionVar: Variable;
  velocityVar: Variable;
  velocityUniforms: {
    uDelta: { value: number };
    uTime: { value: number };
    uFieldScale: { value: number };
    uStrength: { value: number };
    uDamping: { value: number };
  };
  positionUniforms: {
    uDelta: { value: number };
    uTime: { value: number };
    uRespawnEnabled: { value: number };
  };
}

function FlowFieldParticles() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const gpuRef = useRef<GpuState | null>(null);
  const paramsRef = useRef({ fieldScale: 0.5, strength: 1.4, damping: 0.97, respawn: true });

  useEffect(() => {
    paramsRef.current = {
      fieldScale: numberOf(values, "fieldScale", 0.5),
      strength: numberOf(values, "strength", 1.4),
      damping: numberOf(values, "damping", 0.97),
      respawn: booleanOf(values, "respawn", true),
    };
  }, [values]);

  const geometry = useMemo(() => disposables.register(buildParticleGeometry()), [disposables]);

  const pointsUniforms = useMemo(
    () => ({
      uTexturePosition: { value: null as THREE.Texture | null },
      uTextureVelocity: { value: null as THREE.Texture | null },
      uColorBy: { value: 0 },
      uMaxSpeed: { value: 1.4 },
      uLifetime: { value: LIFETIME },
    }),
    [],
  );

  useEffect(() => {
    pointsUniforms.uColorBy.value = stringOf(values, "colorBy", "speed") === "age" ? 1 : 0;
    invalidate();
  }, [values, pointsUniforms, invalidate]);

  // Sets up the GPGPU pipeline once per mount — disposed on cleanup so
  // React Strict Mode's double-invoke (and real remounts) never leak an FBO.
  useEffect(() => {
    const compute = new GPUComputationRenderer(SIZE, SIZE, gl);
    // WebGL2 needs EXT_color_buffer_float to RENDER INTO float textures;
    // half-float is the broadly-supported safe default for state textures.
    compute.setDataType(THREE.HalfFloatType);

    const velocityVar = compute.addVariable("textureVelocity", velocityShader, makeVelocityTexture());
    const positionVar = compute.addVariable("texturePosition", positionShader, makePositionTexture());
    compute.setVariableDependencies(velocityVar, [velocityVar, positionVar]);
    compute.setVariableDependencies(positionVar, [velocityVar, positionVar]);

    const velocityUniforms = {
      uDelta: { value: 0 },
      uTime: { value: 0 },
      uFieldScale: { value: paramsRef.current.fieldScale },
      uStrength: { value: paramsRef.current.strength },
      uDamping: { value: paramsRef.current.damping },
    };
    Object.assign(velocityVar.material.uniforms, velocityUniforms);

    const positionUniforms = {
      uDelta: { value: 0 },
      uTime: { value: 0 },
      uRespawnEnabled: { value: 1 },
    };
    Object.assign(positionVar.material.uniforms, positionUniforms, {
      uLifetime: { value: LIFETIME },
      uSpawnExtent: { value: SPAWN_EXTENT },
    });

    const error = compute.init();
    if (error) throw new Error(error);

    gpuRef.current = { compute, positionVar, velocityVar, velocityUniforms, positionUniforms };
    invalidate();

    return () => {
      gpuRef.current = null;
      compute.dispose();
    };
  }, [gl, invalidate]);

  useFrame((state, rawDelta) => {
    const gpu = gpuRef.current;
    if (!gpu) return;
    const delta = Math.min(rawDelta, 1 / 30); // clamp so a stall doesn't fire a huge integration step
    const { fieldScale, strength, damping, respawn } = paramsRef.current;

    gpu.velocityUniforms.uDelta.value = delta;
    gpu.velocityUniforms.uTime.value = state.clock.elapsedTime;
    gpu.velocityUniforms.uFieldScale.value = fieldScale;
    gpu.velocityUniforms.uStrength.value = strength;
    gpu.velocityUniforms.uDamping.value = damping;

    gpu.positionUniforms.uDelta.value = delta;
    gpu.positionUniforms.uTime.value = state.clock.elapsedTime;
    gpu.positionUniforms.uRespawnEnabled.value = respawn ? 1 : 0;

    gpu.compute.compute();

    pointsUniforms.uTexturePosition.value = gpu.compute.getCurrentRenderTarget(gpu.positionVar).texture;
    pointsUniforms.uTextureVelocity.value = gpu.compute.getCurrentRenderTarget(gpu.velocityVar).texture;
    pointsUniforms.uMaxSpeed.value = strength * 1.2;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        vertexShader={pointsVertexShader}
        fragmentShader={pointsFragmentShader}
        uniforms={pointsUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function FlowFieldParticlesDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "fieldScale",
          label: L.fieldScale,
          min: 0.15,
          max: 1.5,
          step: 0.05,
          defaultValue: 0.5,
        },
        {
          kind: "number",
          key: "strength",
          label: L.strength,
          min: 0.2,
          max: 3,
          step: 0.1,
          defaultValue: 1.4,
        },
        {
          kind: "number",
          key: "damping",
          label: L.damping,
          min: 0.85,
          max: 1,
          step: 0.01,
          defaultValue: 0.97,
        },
        { kind: "boolean", key: "respawn", label: L.respawn, defaultValue: true },
        {
          kind: "select",
          key: "colorBy",
          label: L.colorBy,
          defaultValue: "speed",
          options: [
            { value: "speed", label: L.colorSpeed },
            { value: "age", label: L.colorAge },
          ],
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <OrbitControls enableDamping />
        <FlowFieldParticles />
      </DemoCanvas>
    </Demo>
  );
}

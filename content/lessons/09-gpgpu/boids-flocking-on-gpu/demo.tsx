"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/addons/misc/GPUComputationRenderer.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf } from "@/components/viz/control-schema";
import velocityShader from "./boid-velocity.frag";
import positionShader from "./boid-position.frag";
import pointsVertexShader from "./boid-points.vert";
import pointsFragmentShader from "./boid-points.frag";

// 64x64 = 4096 boids — a full O(N^2) neighbor scan stays interactive at
// this size (see theory); it would not at the 256x256 scale used one lesson
// over in instancing-a-million-objects.
const GRID = 64;
const BOID_COUNT = GRID * GRID;
const BOUNDS = 5;

const LABELS = {
  vi: {
    title: "Boids flocking trên GPU (4.096 boid)",
    separation: "Trọng số separation",
    alignment: "Trọng số alignment",
    cohesion: "Trọng số cohesion",
    radius: "Bán kính cảm nhận",
    speed: "Giới hạn tốc độ",
  },
  en: {
    title: "GPU Boids Flocking (4,096 Boids)",
    separation: "Separation weight",
    alignment: "Alignment weight",
    cohesion: "Cohesion weight",
    radius: "Perception radius",
    speed: "Speed clamp",
  },
} as const;

function fillPositionTexture(texture: THREE.DataTexture) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 1] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 2] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 3] = 1;
  }
}

function fillVelocityTexture(texture: THREE.DataTexture) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < data.length; i += 4) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    data[i] = Math.sin(phi) * Math.cos(theta);
    data[i + 1] = Math.sin(phi) * Math.sin(theta);
    data[i + 2] = Math.cos(phi);
    data[i + 3] = 1;
  }
}

interface BoidSimState {
  compute: GPUComputationRenderer;
  positionVar: Variable;
  velocityVar: Variable;
  velocityUniforms: {
    uSeparationWeight: { value: number };
    uAlignmentWeight: { value: number };
    uCohesionWeight: { value: number };
    uPerceptionRadius: { value: number };
    uMaxSpeed: { value: number };
    uBounds: { value: number };
  };
  positionUniforms: {
    uDelta: { value: number };
  };
  pointsUniforms: {
    texturePosition: { value: THREE.Texture | null };
    textureVelocity: { value: THREE.Texture | null };
    uMaxSpeed: { value: number };
  };
}

function BoidSwarm() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const groupRef = useRef<THREE.Group>(null);
  const stateRef = useRef<BoidSimState | null>(null);

  // Imperative on purpose: GPUComputationRenderer owns raw WebGLRenderTargets
  // that R3F's JSX reconciler has no disposal hooks for — built and torn
  // down by hand here, mirroring the spec's disposal-in-effect-cleanup rule.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const compute = new GPUComputationRenderer(GRID, GRID, gl);
    // HalfFloat renders more broadly than the FloatType default (which needs
    // EXT_color_buffer_float on some devices) — see theory for the tradeoff.
    compute.setDataType(THREE.HalfFloatType);

    const dtPosition = compute.createTexture();
    const dtVelocity = compute.createTexture();
    fillPositionTexture(dtPosition);
    fillVelocityTexture(dtVelocity);

    const velocityVar = compute.addVariable("textureVelocity", velocityShader, dtVelocity);
    const positionVar = compute.addVariable("texturePosition", positionShader, dtPosition);
    // Each variable depends on itself (last frame's own state) AND the
    // other — omit the self-dependency and see mistake #3.
    compute.setVariableDependencies(velocityVar, [velocityVar, positionVar]);
    compute.setVariableDependencies(positionVar, [velocityVar, positionVar]);

    const velocityUniforms = {
      uSeparationWeight: { value: 1.5 },
      uAlignmentWeight: { value: 1.0 },
      uCohesionWeight: { value: 1.0 },
      uPerceptionRadius: { value: 1.2 },
      uMaxSpeed: { value: 2.0 },
      uBounds: { value: BOUNDS },
    };
    const positionUniforms = {
      uDelta: { value: 0.016 },
    };
    Object.assign(velocityVar.material.uniforms, velocityUniforms);
    Object.assign(positionVar.material.uniforms, positionUniforms);

    const error = compute.init();
    if (error) {
      console.error("GPUComputationRenderer init failed:", error);
    }

    // One point per boid; aRef is its UV into the state textures (see
    // instancing-a-million-objects for the same idea applied to real geometry).
    const refs = new Float32Array(BOID_COUNT * 2);
    for (let i = 0; i < BOID_COUNT; i++) {
      const ix = i % GRID;
      const iy = Math.floor(i / GRID);
      refs[i * 2] = (ix + 0.5) / GRID;
      refs[i * 2 + 1] = (iy + 0.5) / GRID;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("aRef", new THREE.BufferAttribute(refs, 2));
    // Points requires a `position` attribute even though the vertex shader
    // ignores it and reads texturePosition/aRef instead.
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BOID_COUNT * 3), 3));

    const pointsUniforms = {
      texturePosition: { value: null as THREE.Texture | null },
      textureVelocity: { value: null as THREE.Texture | null },
      uMaxSpeed: { value: 2.0 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: pointsVertexShader,
      fragmentShader: pointsFragmentShader,
      uniforms: pointsUniforms,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    // The `position` attribute is all zeros, so the auto-computed bounding
    // sphere sits at the origin with radius 0 — skip frustum culling instead
    // of fighting it, since real positions live entirely in the GPU texture.
    points.frustumCulled = false;
    group.add(points);

    stateRef.current = {
      compute,
      positionVar,
      velocityVar,
      velocityUniforms,
      positionUniforms,
      pointsUniforms,
    };
    invalidate();

    return () => {
      group.remove(points);
      geometry.dispose();
      material.dispose();
      compute.dispose();
      stateRef.current = null;
    };
  }, [gl, invalidate]);

  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const vUniforms = s.velocityUniforms;
    const separation = numberOf(values, "separation", 1.5);
    const alignment = numberOf(values, "alignment", 1.0);
    const cohesion = numberOf(values, "cohesion", 1.0);
    const radius = numberOf(values, "radius", 1.2);
    const speed = numberOf(values, "speed", 2.0);
    vUniforms.uSeparationWeight.value = separation;
    vUniforms.uAlignmentWeight.value = alignment;
    vUniforms.uCohesionWeight.value = cohesion;
    vUniforms.uPerceptionRadius.value = radius;
    vUniforms.uMaxSpeed.value = speed;
    s.pointsUniforms.uMaxSpeed.value = speed;
    invalidate();
  }, [values, invalidate]);

  useFrame((_frameState, delta) => {
    const s = stateRef.current;
    if (!s) return;
    s.positionUniforms.uDelta.value = Math.min(delta, 1 / 30);
    s.compute.compute();
    s.pointsUniforms.texturePosition.value = s.compute.getCurrentRenderTarget(s.positionVar).texture;
    s.pointsUniforms.textureVelocity.value = s.compute.getCurrentRenderTarget(s.velocityVar).texture;
  });

  return <group ref={groupRef} />;
}

export default function BoidsFlockingOnGpuDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "number",
          key: "separation",
          label: L.separation,
          min: 0,
          max: 4,
          step: 0.1,
          defaultValue: 1.5,
        },
        {
          kind: "number",
          key: "alignment",
          label: L.alignment,
          min: 0,
          max: 4,
          step: 0.1,
          defaultValue: 1.0,
        },
        {
          kind: "number",
          key: "cohesion",
          label: L.cohesion,
          min: 0,
          max: 4,
          step: 0.1,
          defaultValue: 1.0,
        },
        {
          kind: "number",
          key: "radius",
          label: L.radius,
          min: 0.3,
          max: 3,
          step: 0.1,
          defaultValue: 1.2,
        },
        {
          kind: "number",
          key: "speed",
          label: L.speed,
          min: 0.5,
          max: 5,
          step: 0.1,
          defaultValue: 2.0,
        },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 4, 12], fov: 50 }}>
        <OrbitControls enablePan={false} />
        <BoidSwarm />
      </DemoCanvas>
    </Demo>
  );
}

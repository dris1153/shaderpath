"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/addons/misc/GPUComputationRenderer.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import velocityShader from "./flow-velocity.frag";
import positionShader from "./flow-position.frag";
import instanceDeclarations from "./instance-declarations.glsl";
import instanceSample from "./instance-sample.glsl";
import instanceApplyNormal from "./instance-apply-normal.glsl";
import instanceApplyPosition from "./instance-apply-position.glsl";

const BOUNDS = 6;
// Fixed and low on purpose (Track 6's InstancedField demo capped its
// individual-mesh mode the same way): it exists to make the CPU cost
// visible, not to survive being pushed to 65k instances.
const CPU_COMPARE_COUNT = 4096;

const LABELS = {
  vi: {
    title: "Instancing GPGPU: đọc texture trạng thái ngay trong vertex shader",
    count: "Số instance (đường GPU)",
    orient: "Xoay theo hướng vận tốc",
    cpuCompare: `So sánh cập nhật CPU (cố định ${CPU_COMPARE_COUNT.toLocaleString("vi-VN")} instance)`,
    countOptions: [
      { value: "16384", label: "16.384 (128²)" },
      { value: "65536", label: "65.536 (256²)" },
    ],
    stats: (n: number, fps: number, cpuMs: number) =>
      `${n.toLocaleString("vi-VN")} instance · ${Math.round(fps)} fps · CPU update: ${cpuMs.toFixed(2)} ms/frame`,
  },
  en: {
    title: "GPGPU Instancing: Reading the State Texture Right in the Vertex Shader",
    count: "Instance count (GPU path)",
    orient: "Orient along velocity",
    cpuCompare: `Compare CPU updates (fixed ${CPU_COMPARE_COUNT.toLocaleString("en-US")} instances)`,
    countOptions: [
      { value: "16384", label: "16,384 (128²)" },
      { value: "65536", label: "65,536 (256²)" },
    ],
    stats: (n: number, fps: number, cpuMs: number) =>
      `${n.toLocaleString("en-US")} instances · ${Math.round(fps)} fps · CPU update: ${cpuMs.toFixed(2)} ms/frame`,
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

function fillPositionTexture(texture: THREE.DataTexture) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 1] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 2] = (Math.random() - 0.5) * BOUNDS * 1.6;
    data[i + 3] = 1;
  }
}

interface FlowSimState {
  compute: GPUComputationRenderer;
  positionVar: Variable;
  velocityVar: Variable;
  orientUniform: { value: number };
  velocityUniforms: {
    uStrength: { value: number };
    uScale: { value: number };
    uTime: { value: number };
  };
  positionUniforms: {
    uDelta: { value: number };
    uBounds: { value: number };
  };
  textureUniforms: {
    texturePosition: { value: THREE.Texture | null };
    textureVelocity: { value: THREE.Texture | null };
  };
}

// GPU path: compute -> render never leaves the GPU. The CPU issues one
// compute pass and one draw call per frame, regardless of instance count.
function GpuInstancedField({ grid, orient }: { grid: number; orient: boolean }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const groupRef = useRef<THREE.Group>(null);
  const stateRef = useRef<FlowSimState | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const compute = new GPUComputationRenderer(grid, grid, gl);
    // HalfFloat renders more broadly than the FloatType default (which
    // needs EXT_color_buffer_float on some devices) — see theory.
    compute.setDataType(THREE.HalfFloatType);

    const dtPosition = compute.createTexture();
    const dtVelocity = compute.createTexture();
    fillPositionTexture(dtPosition);

    const velocityVar = compute.addVariable("textureVelocity", velocityShader, dtVelocity);
    const positionVar = compute.addVariable("texturePosition", positionShader, dtPosition);
    compute.setVariableDependencies(velocityVar, [velocityVar, positionVar]);
    compute.setVariableDependencies(positionVar, [velocityVar, positionVar]);

    const velocityUniforms = {
      uStrength: { value: 1.2 },
      uScale: { value: 0.35 },
      uTime: { value: 0 },
    };
    const positionUniforms = {
      uDelta: { value: 0.016 },
      uBounds: { value: BOUNDS },
    };
    Object.assign(velocityVar.material.uniforms, velocityUniforms);
    Object.assign(positionVar.material.uniforms, positionUniforms);

    const error = compute.init();
    if (error) {
      console.error("GPUComputationRenderer init failed:", error);
    }

    const count = grid * grid;
    const refs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const ix = i % grid;
      const iy = Math.floor(i / grid);
      refs[i * 2] = (ix + 0.5) / grid;
      refs[i * 2 + 1] = (iy + 0.5) / grid;
    }

    const geometry = new THREE.TetrahedronGeometry(0.05);
    geometry.setAttribute("aInstanceUv", new THREE.InstancedBufferAttribute(refs, 2));

    // Starts at 1 regardless of the current `orient` prop — the sync effect
    // below (which does depend on `orient`) corrects it immediately after
    // mount, before any frame renders. Keeps `orient` out of THIS effect's
    // deps, so toggling it never rebuilds the whole compute+mesh pipeline.
    const orientUniform = { value: 1 };
    const textureUniforms = {
      texturePosition: { value: null as THREE.Texture | null },
      textureVelocity: { value: null as THREE.Texture | null },
    };

    const material = new THREE.MeshStandardMaterial({
      color: "#7dd3fc",
      roughness: 0.45,
      metalness: 0.05,
      flatShading: true,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.texturePosition = textureUniforms.texturePosition;
      shader.uniforms.textureVelocity = textureUniforms.textureVelocity;
      shader.uniforms.uOrient = orientUniform;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${instanceDeclarations}`)
        .replace("#include <uv_vertex>", `#include <uv_vertex>\n${instanceSample}`)
        .replace(
          "#include <beginnormal_vertex>",
          `#include <beginnormal_vertex>\n${instanceApplyNormal}`,
        )
        .replace("#include <begin_vertex>", `#include <begin_vertex>\n${instanceApplyPosition}`);
    };
    // uOrient is a plain uniform, not a #define — the injected code's SHAPE
    // never changes across recompiles, so a constant cache key is enough.
    material.customProgramCacheKey = () => "gpgpu-instancing-v1";

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    // instanceMatrix starts as an all-zero buffer, NOT identity — every
    // instance needs an explicit identity matrix or the (meant-to-be-a-
    // no-op) instanceMatrix multiply in #include <project_vertex> zeroes
    // the position out (see mistake #1).
    const identity = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;
    // Bounding sphere is computed from the base geometry near the origin;
    // real positions live entirely in the compute texture, so culling
    // against that sphere would hide instances that are actually on screen.
    mesh.frustumCulled = false;

    group.add(mesh);
    stateRef.current = {
      compute,
      positionVar,
      velocityVar,
      orientUniform,
      velocityUniforms,
      positionUniforms,
      textureUniforms,
    };
    invalidate();

    return () => {
      group.remove(mesh);
      geometry.dispose();
      material.dispose();
      compute.dispose();
      stateRef.current = null;
    };
  }, [gl, grid, invalidate]);

  useEffect(() => {
    const s = stateRef.current;
    if (s) s.orientUniform.value = orient ? 1 : 0;
    invalidate();
  }, [orient, invalidate]);

  useFrame((_frameState, delta) => {
    const s = stateRef.current;
    if (!s) return;
    const dt = Math.min(delta, 1 / 30);
    s.velocityUniforms.uTime.value += dt;
    s.positionUniforms.uDelta.value = dt;
    s.compute.compute();
    s.textureUniforms.texturePosition.value = s.compute.getCurrentRenderTarget(s.positionVar).texture;
    s.textureUniforms.textureVelocity.value = s.compute.getCurrentRenderTarget(s.velocityVar).texture;
  });

  return <group ref={groupRef} />;
}

// Module-level helper (not inlined in useMemo) so Math.random stays outside
// what the react-hooks/purity rule analyzes as "the render calculation".
function buildPhases(count: number): Float32Array {
  const arr = new Float32Array(count);
  for (let i = 0; i < count; i++) arr[i] = Math.random() * Math.PI * 2;
  return arr;
}

// CPU path: the exact per-instance update the Track 6 InstancedMesh lesson
// taught — a JS loop composing a matrix and uploading it, every instance,
// every frame — timed directly to make its cost visible.
function CpuInstancedField({ cpuMsRef }: { cpuMsRef: { current: number } }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(() => buildPhases(CPU_COMPARE_COUNT), []);

  useFrame((frameState) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t0 = performance.now();
    const time = frameState.clock.elapsedTime;
    for (let i = 0; i < CPU_COMPARE_COUNT; i++) {
      const phase = phases[i] ?? 0;
      const radius = 1.5 + (i % 23) * 0.18;
      dummy.position.set(
        Math.cos(time * 0.4 + phase) * radius,
        Math.sin(time * 0.9 + phase * 1.3) * 1.8,
        Math.sin(time * 0.4 + phase) * radius,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    cpuMsRef.current = performance.now() - t0;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CPU_COMPARE_COUNT]} frustumCulled={false}>
      <tetrahedronGeometry args={[0.06]} />
      <meshStandardMaterial color="#fca5a5" roughness={0.5} flatShading />
    </instancedMesh>
  );
}

function StatsProbe({
  cpuMsRef,
  onSample,
}: {
  cpuMsRef: { current: number };
  onSample: (fps: number, cpuMs: number) => void;
}) {
  const avgMs = useRef(16.7);
  const sinceReport = useRef(0);

  useFrame((_state, delta) => {
    avgMs.current += (delta * 1000 - avgMs.current) * 0.1;
    sinceReport.current += delta;
    if (sinceReport.current > 0.2) {
      sinceReport.current = 0;
      onSample(1000 / Math.max(avgMs.current, 0.01), cpuMsRef.current);
    }
  });

  return null;
}

function InstancingDemoBody({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const countStr = stringOf(values, "count", "16384");
  const grid = Math.round(Math.sqrt(Number(countStr)));
  const count = grid * grid;
  const orient = booleanOf(values, "orient", true);
  const cpuCompare = booleanOf(values, "cpuCompare", false);
  const cpuMsRef = useRef(0);
  const [stats, setStats] = useState({ fps: 60, cpuMs: 0 });

  const activeCount = cpuCompare ? CPU_COMPARE_COUNT : count;
  // Derived, not stored: once the CPU path unmounts, cpuMsRef stops
  // updating and would otherwise keep showing its last measured value —
  // force the readout to 0 instead of syncing state from an effect.
  const displayCpuMs = cpuCompare ? stats.cpuMs : 0;

  return (
    <div className="relative size-full">
      <DemoCanvas camera={{ position: [0, 3, 11], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        {cpuCompare ? (
          <CpuInstancedField cpuMsRef={cpuMsRef} />
        ) : (
          <GpuInstancedField grid={grid} orient={orient} />
        )}
        <StatsProbe cpuMsRef={cpuMsRef} onSample={(fps, cpuMs) => setStats({ fps, cpuMs })} />
      </DemoCanvas>
      <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.stats(activeCount, stats.fps, displayCpuMs)}
      </div>
    </div>
  );
}

export default function InstancingAMillionObjectsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "select",
          key: "count",
          label: L.count,
          defaultValue: "16384",
          options: [...L.countOptions],
        },
        { kind: "boolean", key: "orient", label: L.orient, defaultValue: true },
        { kind: "boolean", key: "cpuCompare", label: L.cpuCompare, defaultValue: false },
      ]}
    >
      <InstancingDemoBody L={L} />
    </Demo>
  );
}

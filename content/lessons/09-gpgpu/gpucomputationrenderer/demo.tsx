"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/addons/misc/GPUComputationRenderer.js";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import velocityShader from "./velocity.frag";
import positionShader from "./position.frag";
import pointsVertexShader from "./points.vert";
import pointsFragmentShader from "./points.frag";

// 128*128 = 16 384 particles — one 256²-budget sim per demo (spec), kept
// smaller here since this lesson is about the API, not raw particle count.
const SIZE = 128;

const LABELS = {
  vi: {
    title: "GPUComputationRenderer: xoáy particle qua cặp biến compute",
    force: "Lực xoáy",
    damping: "Damping",
    reset: "Reset",
  },
  en: {
    title: "GPUComputationRenderer: a Swirling Pair of Compute Variables",
    force: "Swirl force",
    damping: "Damping",
    reset: "Reset",
  },
} as const;

function fillPositionTexture(texture: THREE.DataTexture) {
  const data = texture.image.data;
  if (!data) return;
  for (let i = 0; i < data.length; i += 4) {
    const radius = 0.4 + Math.random() * 1.1;
    const angle = Math.random() * Math.PI * 2;
    data[i] = Math.cos(angle) * radius;
    data[i + 1] = (Math.random() - 0.5) * 0.6;
    data[i + 2] = Math.sin(angle) * radius;
    data[i + 3] = 1;
  }
}

function fillVelocityTexture(texture: THREE.DataTexture) {
  const data = texture.image.data;
  if (!data) return;
  data.fill(0);
}

function buildReferenceGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const count = SIZE * SIZE;
  // "position" is unused by the vertex shader (the real position comes from
  // texturePosition) but Three still needs it to know the vertex count.
  const positions = new Float32Array(count * 3);
  const reference = new Float32Array(count * 2);
  let p = 0;
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      reference[p * 2] = (i + 0.5) / SIZE;
      reference[p * 2 + 1] = (j + 0.5) / SIZE;
      p++;
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aReference", new THREE.BufferAttribute(reference, 2));
  return geometry;
}

interface SimState {
  gpuCompute: GPUComputationRenderer;
  positionVariable: Variable;
  velocityVariable: Variable;
  uForce: { value: number };
  uDamping: { value: number };
  uVelDelta: { value: number };
  uPosDelta: { value: number };
}

function SwirlPoints() {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const disposables = useDisposable();
  const stateRef = useRef<SimState | null>(null);
  const paramsRef = useRef({ force: 1.2, damping: 0.985 });

  useEffect(() => {
    paramsRef.current.force = numberOf(values, "force", 1.2);
    paramsRef.current.damping = numberOf(values, "damping", 0.985);
  }, [values]);

  const geometry = useMemo(
    () => disposables.register(buildReferenceGeometry()),
    [disposables],
  );

  const renderUniforms = useMemo(
    () => ({
      texturePosition: { value: null as THREE.Texture | null },
      textureVelocity: { value: null as THREE.Texture | null },
      uPointSize: { value: 3.5 },
    }),
    [],
  );

  const material = useMemo(
    () =>
      disposables.register(
        new THREE.ShaderMaterial({
          vertexShader: pointsVertexShader,
          fragmentShader: pointsFragmentShader,
          uniforms: renderUniforms,
        }),
      ),
    [disposables, renderUniforms],
  );

  // Builds the GPUComputationRenderer pair once: textureVelocity depends on
  // itself + texturePosition, texturePosition depends on itself + textureVelocity
  // — the classic two-variable structure (see theory).
  useEffect(() => {
    const gpuCompute = new GPUComputationRenderer(SIZE, SIZE, gl);

    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();
    fillPositionTexture(dtPosition);
    fillVelocityTexture(dtVelocity);

    const velocityVariable = gpuCompute.addVariable(
      "textureVelocity",
      velocityShader,
      dtVelocity,
    );
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      positionShader,
      dtPosition,
    );
    gpuCompute.setVariableDependencies(velocityVariable, [
      velocityVariable,
      positionVariable,
    ]);
    gpuCompute.setVariableDependencies(positionVariable, [
      velocityVariable,
      positionVariable,
    ]);

    const uForce = { value: paramsRef.current.force };
    const uDamping = { value: paramsRef.current.damping };
    const uVelDelta = { value: 0 };
    const uPosDelta = { value: 0 };
    velocityVariable.material.uniforms.uForce = uForce;
    velocityVariable.material.uniforms.uDamping = uDamping;
    velocityVariable.material.uniforms.uDelta = uVelDelta;
    positionVariable.material.uniforms.uDelta = uPosDelta;

    // init() reports failure as a returned string, never a thrown exception —
    // the demo can't run without it, so surface it the same way a throw would.
    const error = gpuCompute.init();
    if (error !== null) throw new Error(error);

    stateRef.current = {
      gpuCompute,
      positionVariable,
      velocityVariable,
      uForce,
      uDamping,
      uVelDelta,
      uPosDelta,
    };

    disposables.registerFn(() => {
      stateRef.current = null;
      gpuCompute.dispose();
    });
  }, [gl, disposables]);

  // Any change of the reset toggle re-seeds both ping-pong buffers of both
  // variables — including on mount, which just re-applies a fresh seed.
  const resetFlag = booleanOf(values, "reset", false);
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const posTex = st.gpuCompute.createTexture();
    const velTex = st.gpuCompute.createTexture();
    fillPositionTexture(posTex);
    fillVelocityTexture(velTex);
    st.gpuCompute.renderTexture(
      posTex,
      st.gpuCompute.getCurrentRenderTarget(st.positionVariable),
    );
    st.gpuCompute.renderTexture(
      posTex,
      st.gpuCompute.getAlternateRenderTarget(st.positionVariable),
    );
    st.gpuCompute.renderTexture(
      velTex,
      st.gpuCompute.getCurrentRenderTarget(st.velocityVariable),
    );
    st.gpuCompute.renderTexture(
      velTex,
      st.gpuCompute.getAlternateRenderTarget(st.velocityVariable),
    );
    posTex.dispose();
    velTex.dispose();
    invalidate();
  }, [resetFlag, invalidate]);

  useFrame((_state, delta) => {
    const st = stateRef.current;
    if (!st) return;
    const dt = Math.min(delta, 0.05);
    st.uForce.value = paramsRef.current.force;
    st.uDamping.value = paramsRef.current.damping;
    st.uVelDelta.value = dt;
    st.uPosDelta.value = dt;
    st.gpuCompute.compute();
    renderUniforms.texturePosition.value = st.gpuCompute.getCurrentRenderTarget(
      st.positionVariable,
    ).texture;
    renderUniforms.textureVelocity.value = st.gpuCompute.getCurrentRenderTarget(
      st.velocityVariable,
    ).texture;
  });

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
}

export default function GpuComputationRendererDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        {
          kind: "number",
          key: "force",
          label: L.force,
          min: 0,
          max: 3,
          step: 0.05,
          defaultValue: 1.2,
        },
        {
          kind: "number",
          key: "damping",
          label: L.damping,
          min: 0.9,
          max: 0.999,
          step: 0.001,
          defaultValue: 0.985,
        },
        { kind: "boolean", key: "reset", label: L.reset, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 1.6, 3.2], fov: 50 }}>
        <SwirlPoints />
      </DemoCanvas>
    </Demo>
  );
}

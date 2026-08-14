"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import integrateShader from "./cloth-integrate.frag";
import prevShader from "./cloth-prev.frag";
import relaxShader from "./cloth-relax.frag";
import renderVertex from "./cloth-render.vert";
import renderFragment from "./cloth-render.frag";

const GRID = 64; // 64 * 64 = 4096 mass points
const WORLD_SIZE = 3.2;

type PinPattern = "top" | "corners";

const LABELS = {
  vi: {
    title: "Vải GPU: mass-spring + Verlet, ghim mép trên",
    wind: "Cường độ gió",
    iterations: "Số vòng constraint",
    pinPattern: "Kiểu ghim",
    top: "Mép trên",
    corners: "Hai góc trên",
    reset: "Đặt lại mô phỏng",
  },
  en: {
    title: "GPU Cloth: Mass-Spring + Verlet, Top-Pinned",
    wind: "Wind strength",
    iterations: "Constraint iterations",
    pinPattern: "Pin pattern",
    top: "Top edge",
    corners: "Two top corners",
    reset: "Reset simulation",
  },
} as const;

// Fills a fresh GPUComputationRenderer texture with a flat rest grid (xyz)
// and a pin mask (w) — shared by both the integrate and relax shaders as a
// static uniform, never ping-ponged.
function buildInitialTexture(
  gpu: GPUComputationRenderer,
  pinPattern: PinPattern,
): THREE.DataTexture {
  const texture = gpu.createTexture();
  const data = texture.image.data as Float32Array;
  const half = WORLD_SIZE / 2;

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const i = row * GRID + col;
      const x = (col / (GRID - 1)) * WORLD_SIZE - half;
      const y = (row / (GRID - 1)) * WORLD_SIZE - half;
      data[i * 4 + 0] = x;
      data[i * 4 + 1] = y;
      data[i * 4 + 2] = 0;

      const topRow = row === GRID - 1; // uv.y = 1 (PlaneGeometry convention)
      const pinned =
        pinPattern === "top" ? topRow : topRow && (col === 0 || col === GRID - 1);
      data[i * 4 + 3] = pinned ? 1 : 0;
    }
  }

  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

interface IntegrateUniforms {
  uTime: { value: number };
  uWindStrength: { value: number };
}

interface ClothSim {
  integrateUniforms: IntegrateUniforms;
  step: (iterations: number) => THREE.Texture;
  dispose: () => void;
}

// GPUComputationRenderer + its two ping-ponged position variables stay
// local to this function — see cloth-integrate.frag / cloth-prev.frag for
// exactly how "texturePosition" (self-dependency) and "texturePositionPrev"
// (auto-wired dependency) differ.
function createClothSim(gl: THREE.WebGLRenderer, pinPattern: PinPattern): ClothSim {
  const gpu = new GPUComputationRenderer(GRID, GRID, gl);
  gpu.setDataType(THREE.HalfFloatType);

  const initialTexture = buildInitialTexture(gpu, pinPattern);
  const texel = new THREE.Vector2(1 / GRID, 1 / GRID);

  const positionVar = gpu.addVariable("texturePosition", integrateShader, initialTexture);
  const prevVar = gpu.addVariable("texturePositionPrev", prevShader, initialTexture);
  gpu.setVariableDependencies(positionVar, [positionVar, prevVar]);
  gpu.setVariableDependencies(prevVar, [positionVar]);

  const integrateUniforms: IntegrateUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 1.2 },
  };
  // Self-dependency: GPUComputationRenderer only auto-wires a variable's
  // OTHER dependencies — this key must exist before compute() assigns
  // .value to it every frame (see cloth-integrate.frag's header comment).
  Object.assign(positionVar.material.uniforms, {
    texturePosition: { value: null },
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uDt: { value: 1 / 60 },
    uDamping: { value: 0.99 },
    uGravity: { value: new THREE.Vector3(0, -2.2, 0) },
    ...integrateUniforms,
  });

  const error = gpu.init();
  if (error) console.error(error);

  // Manual multi-pass Jacobi relaxation — NOT a GPUComputationRenderer
  // "variable" (those run their shader exactly once per compute() call);
  // constraint solving needs 1-8 full-grid passes per frame instead.
  const restStructural = WORLD_SIZE / (GRID - 1);
  const relaxUniforms = {
    uPosition: { value: null as THREE.Texture | null },
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uRestStructural: { value: restStructural },
    uRestShear: { value: restStructural * Math.SQRT2 },
  };
  const relaxMaterial = gpu.createShaderMaterial(relaxShader, relaxUniforms);
  const makeScratchTarget = () =>
    gpu.createRenderTarget(
      GRID,
      GRID,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter,
    );
  const scratchA = makeScratchTarget();
  const scratchB = makeScratchTarget();

  return {
    integrateUniforms,
    step: (iterations: number) => {
      gpu.compute();

      let source = gpu.getCurrentRenderTarget(positionVar).texture;
      for (let i = 0; i < iterations; i++) {
        const target = i % 2 === 0 ? scratchA : scratchB;
        relaxUniforms.uPosition.value = source;
        gpu.doRenderTarget(relaxMaterial, target);
        source = target.texture;
      }

      // Feed the fully relaxed result back as next frame's "current"
      // position so Verlet's implicit velocity (pos - prev) is measured
      // against the constraint-satisfied shape, not the raw pre-relax
      // integration candidate. `source` always lives in a scratch target
      // here (iterations >= 1), never the same target being written to.
      gpu.renderTexture(source, gpu.getCurrentRenderTarget(positionVar));
      return gpu.getCurrentRenderTarget(positionVar).texture;
    },
    dispose: () => {
      scratchA.dispose();
      scratchB.dispose();
      relaxMaterial.dispose();
      gpu.dispose();
    },
  };
}

function ClothScene() {
  const { values } = useDemoContext();
  const { gl } = useThree();
  const paramsRef = useRef({ wind: 1.2, iterations: 4 });
  const simRef = useRef<ClothSim | null>(null);

  const pinPattern = stringOf(values, "pinPattern", "top") as PinPattern;
  const resetToggle = booleanOf(values, "reset", false);

  const texel = useMemo(() => new THREE.Vector2(1 / GRID, 1 / GRID), []);
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, GRID - 1, GRID - 1),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const renderUniforms = useMemo(
    () => ({
      texturePosition: { value: null as THREE.Texture | null },
      uTexel: { value: texel },
      uLightDir: { value: new THREE.Vector3(0.4, 0.6, 0.7) },
      uColor: { value: new THREE.Color(0.85, 0.3, 0.32) },
    }),
    [texel],
  );

  useEffect(() => {
    paramsRef.current.wind = numberOf(values, "wind", 1.2);
    paramsRef.current.iterations = Math.round(numberOf(values, "iterations", 4));
  }, [values]);

  // pinPattern rebuilds the rest grid (different pin mask); resetToggle has
  // no "correct" direction — flipping the switch either way re-seeds the
  // sim, since a momentary reset button isn't part of the control schema.
  useEffect(() => {
    const sim = createClothSim(gl, pinPattern);
    simRef.current = sim;
    return () => {
      sim.dispose();
      simRef.current = null;
    };
  }, [gl, pinPattern, resetToggle]);

  useFrame((state) => {
    const sim = simRef.current;
    if (!sim) return;

    sim.integrateUniforms.uTime.value = state.clock.elapsedTime;
    sim.integrateUniforms.uWindStrength.value = paramsRef.current.wind;

    renderUniforms.texturePosition.value = sim.step(paramsRef.current.iterations);

    state.gl.setRenderTarget(null);
    state.gl.render(state.scene, state.camera);
  }, 1);

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={renderVertex}
        fragmentShader={renderFragment}
        uniforms={renderUniforms}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  );
}

export default function ClothSimulationBasicsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "wind", label: L.wind, min: 0, max: 4, step: 0.1, defaultValue: 1.2 },
        { kind: "number", key: "iterations", label: L.iterations, min: 1, max: 8, step: 1, defaultValue: 4 },
        {
          kind: "select",
          key: "pinPattern",
          label: L.pinPattern,
          defaultValue: "top",
          options: [
            { value: "top", label: L.top },
            { value: "corners", label: L.corners },
          ],
        },
        { kind: "boolean", key: "reset", label: L.reset, defaultValue: false },
      ]}
    >
      <DemoCanvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} />
        <ClothScene />
      </DemoCanvas>
    </Demo>
  );
}

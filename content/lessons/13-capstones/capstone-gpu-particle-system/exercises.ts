import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-gpu-particle-system",
    kind: "build",
    prompt: {
      vi: `Dựng một hệ particle GPU tương tác quy mô lớn: một triệu particle mô phỏng hoàn toàn trên GPU qua \`GPUComputationRenderer\`, chuyển động theo một flow field dựng từ curl noise, mang một tuổi thọ hữu hạn khiến chúng chết và hồi sinh, phản hồi ba chế độ lực chuột — hút, đẩy, xoáy (vortex) — và render bằng \`THREE.Points\` với additive glow, tô màu theo tuổi thọ từng particle.

Bám theo sáu mốc gợi ý: (1) dựng pipeline state-texture ở lưới $256 \\times 256$ (~65k particle) với mô phỏng nhìn thấy được; (2) thêm curl-noise flow field và lifecycle tuổi thọ — particle chết và hồi sinh ở vị trí ngẫu nhiên khi vượt tuổi tối đa; (3) thêm lực tương tác chuột ba chế độ, chế độ xoáy cần một lực TIẾP TUYẾN quanh con trỏ chứ không chỉ xuyên tâm; (4) scale lên lưới $1024 \\times 1024$ (~1 triệu particle) và hoàn thiện render — glow cộng dồn, color ramp theo tuổi; (5) thêm tier fallback ($1024^2 \\to 512^2 \\to 256^2$) cùng bằng chứng \`renderer.info.render.calls\` không đổi theo grid size, texture kiểu \`HalfFloatType\`, DPR giới hạn theo tier; (6) tinh chỉnh cảm giác tương tác — falloff, cường độ, damping giữa ba chế độ lực.

\`starterCode\` bên dưới dựng sẵn khung sườn — hằng số tier, chữ ký hàm, hook lấy vị trí con trỏ trên mặt phẳng — với một TODO cho mỗi mốc; việc của bạn là lấp đầy compute shader, logic lực ba chế độ, lifecycle, và component render theo đúng khung đó. Kiến trúc trong \`solutionCode\` là MỘT cách hợp lệ, không phải cách duy nhất — miễn luật zero-CPU-per-frame và disposal được tôn trọng.`,
      en: `Build a large-scale interactive GPU particle system: one million particles simulated entirely on the GPU through \`GPUComputationRenderer\`, moving along a curl-noise flow field, carrying a finite lifespan that makes them die and respawn, responding to three mouse force modes — attract, repel, vortex — and rendered with \`THREE.Points\` under additive glow, colored by each particle's age.

Follow six suggested milestones: (1) build the state-texture pipeline at a $256 \\times 256$ grid (~65k particles) with a visible simulation; (2) add the curl-noise flow field and an age-based lifecycle — particles die and respawn at a random position once past a maximum age; (3) add the three-mode mouse force, the vortex mode needs a TANGENTIAL force around the pointer, not just radial; (4) scale up to a $1024 \\times 1024$ grid (~1 million particles) and finish the render — additive glow, an age color ramp; (5) add tier fallback ($1024^2 \\to 512^2 \\to 256^2$) with proof that \`renderer.info.render.calls\` stays constant regardless of grid size, \`HalfFloatType\` textures, DPR capped per tier; (6) tune interaction feel — falloff, strength, damping across the three force modes.

The \`starterCode\` below scaffolds the shell — tier constants, function signatures, the pointer-on-plane hook — with one TODO per milestone; your job is to fill in the compute shader, the three-mode force logic, the lifecycle, and the render component inside that shape. The architecture in \`solutionCode\` is ONE valid approach, not the only one — as long as the zero-CPU-per-frame law and disposal are respected.`,
    },
    starterCode: `"use client";
// Capstone scaffold — six milestones, one TODO block each. Architecture:
// ONE GPUComputationRenderer variable (texturePosition: xyz = position,
// w = age) driving a THREE.Points cloud that reads the state texture
// directly in its vertex shader. Mirrors checkpoint-interactive-particle-field,
// extended with lifecycle + a 3-mode force + tiering.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { useDisposable } from "@/lib/hooks/use-disposable";

type Tier = "low" | "mid" | "high";
type Mode = "attract" | "repel" | "vortex";

const MODE_INDEX: Record<Mode, number> = { attract: 0, repel: 1, vortex: 2 };

// TODO Milestone 5: fill in the three real grid sizes (256/512/1024) and a
// DPR cap per tier.
const TIERS: Record<Tier, { grid: number; dpr: [number, number] }> = {
  low: { grid: 0, dpr: [1, 1] },
  mid: { grid: 0, dpr: [1, 1] },
  high: { grid: 0, dpr: [1, 1] },
};

const BOUNDS = 3.0;

const positionShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uTime;
  uniform float uDelta;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uMode; // 0 = attract, 1 = repel, 2 = vortex
  uniform float uRadius;
  uniform float uStrength;
  uniform float uMaxAge;

  const float BOUNDS = 3.0;

  // --- given: hash + value noise + curl-noise potential (all working) ---
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }

  vec3 potential(vec3 p) {
    return vec3(
      noise3(p + vec3(37.2, 91.1, 12.3)),
      noise3(p + vec3(19.4, 3.7, 88.0)),
      noise3(p + vec3(71.9, 42.1, 5.6))
    );
  }

  vec3 curlNoise(vec3 p) {
    float e = 0.09;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 pxA = potential(p - dx), pxB = potential(p + dx);
    vec3 pyA = potential(p - dy), pyB = potential(p + dy);
    vec3 pzA = potential(p - dz), pzB = potential(p + dz);

    float x = (pyB.z - pyA.z) - (pzB.y - pzA.y);
    float y = (pzB.x - pzA.x) - (pxB.z - pxA.z);
    float z = (pxB.y - pxA.y) - (pyB.x - pyA.x);

    return vec3(x, y, z) / (2.0 * e);
  }
  // --- end given library ---

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec3 pos = data.xyz;
    float age = data.w + uDelta;

    // TODO Milestone 2: if age > uMaxAge, respawn — assign pos a fresh
    // random point (seed with uv + uTime via rand()), reset age to 0, and
    // gl_FragColor + return BEFORE running the integration below (a
    // respawned particle must not also get a mouse-force displacement
    // applied to its old position in the same frame).

    vec3 flow = curlNoise(pos * 0.5 + vec3(0.0, 0.0, uTime * 0.05)) * 0.6;

    // TODO Milestone 3: build mouseForce from uMode.
    //   dir = normalize(pos.xy - uPointer); falloff = smoothstep-shaped,
    //   1 at the pointer, 0 at uRadius.
    //   attract: -dir * falloff * uStrength
    //   repel:    dir * falloff * uStrength
    //   vortex:  vec2(-dir.y, dir.x) * falloff * uStrength  (tangential!)
    //   gate everything by uPointerActive.
    vec2 mouseForce = vec2(0.0);

    // TODO Milestone 6: vel = flow + mouseForce (blend, don't replace),
    // clamp length(vel) to a sane max speed before integrating.
    vec3 vel = flow;

    pos += vel * uDelta;
    pos.xy = mod(pos.xy + BOUNDS, BOUNDS * 2.0) - BOUNDS;
    pos.z = mod(pos.z + BOUNDS * 0.3, BOUNDS * 0.6) - BOUNDS * 0.3;

    gl_FragColor = vec4(pos, age);
  }
\`;

// TODO Milestone 4: vertex shader reading texturePosition via an aUv
// attribute — compute gl_PointSize, pass an age fraction (data.w / uMaxAge)
// to a varying for the fragment shader's color ramp.
const particleVertex = /* glsl */ \`
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

// TODO Milestone 4: round soft-edged sprite (discard outside the circle),
// additive-friendly color ramp from age (young = bright/warm, old = dim).
const particleFragment = /* glsl */ \`
  void main() {
    gl_FragColor = vec4(1.0);
  }
\`;

interface ComputeUniforms {
  uTime: { value: number };
  uDelta: { value: number };
  uMaxAge: { value: number };
  uPointer: { value: THREE.Vector2 };
  uPointerActive: { value: number };
  uMode: { value: number };
  uRadius: { value: number };
  uStrength: { value: number };
}

interface ParticleCompute {
  uniforms: ComputeUniforms;
  step: () => THREE.Texture;
  dispose: () => void;
}

// TODO Milestone 1: new GPUComputationRenderer(grid, grid, gl),
// setDataType(THREE.HalfFloatType), createTexture() + fill random
// pos/age, addVariable + setVariableDependencies (self-referencing),
// assign custom uniforms BEFORE init(). Return { uniforms, step, dispose }.
function createParticleCompute(
  gl: THREE.WebGLRenderer,
  grid: number,
): ParticleCompute {
  throw new Error("TODO Milestone 1: implement createParticleCompute");
}

// Pointer position in the same XY plane the particles live in — identical
// wiring to checkpoint-interactive-particle-field, kept as-is.
function usePointerOnPlane() {
  const { camera, gl } = useThree();
  const stateRef = useRef({ point: new THREE.Vector2(), active: false });

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const toNdc = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const onMove = (e: PointerEvent) => {
      toNdc(e);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) stateRef.current.point.set(hit.x, hit.y);
      stateRef.current.active = true;
    };
    const onLeave = () => { stateRef.current.active = false; };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [camera, gl]);

  return stateRef;
}

function GpuParticleSystem({ tier, mode }: { tier: Tier; mode: Mode }) {
  const { gl } = useThree();
  const disposables = useDisposable();
  const grid = TIERS[tier].grid;
  const pointerRef = usePointerOnPlane();
  const computeRef = useRef<ParticleCompute | null>(null);

  // TODO Milestone 1: geometry (position attribute required by Three, plus
  // an aUv BufferAttribute mapping vertex index -> texel UV) and a
  // ShaderMaterial uniforms object (texturePosition, uMaxAge, uPixelRatio),
  // both registered through \`disposables\` and keyed on \`grid\`.

  useEffect(() => {
    // TODO Milestone 1 + 5: create compute here, keyed on [gl, grid] — a
    // tier switch must fully dispose the OLD compute before the new one is
    // built (the #1 leak in this capstone).
  }, [gl, grid]);

  useFrame((state, delta) => {
    const compute = computeRef.current;
    if (!compute) return;
    const u = compute.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDelta.value = Math.min(delta, 1 / 30);
    u.uPointer.value.copy(pointerRef.current.point);
    u.uPointerActive.value = pointerRef.current.active ? 1 : 0;
    u.uMode.value = MODE_INDEX[mode];
    // TODO: compute.step() -> assign result texture to the render material.
  });

  return null; // TODO: return <points geometry={...} material={...} />
}

function detectStartingTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 4) return "low";
  if (cores <= 8) return "mid";
  return "high";
}

export function InteractiveParticleCloud() {
  const [tier, setTier] = useState<Tier>(detectStartingTier);
  const [mode] = useState<Mode>("attract");

  return (
    <>
      {/* TODO Milestone 5: PerformanceMonitor with flipflops for hysteresis */}
      <GpuParticleSystem tier={tier} mode={mode} />
    </>
  );
}`,
    solutionCode: `"use client";
// One GPUComputationRenderer variable (texturePosition: xyz = position,
// w = age) drives a THREE.Points cloud that reads the state texture
// directly in its vertex shader. Extends checkpoint-interactive-particle-field
// with an age-based lifecycle, a 3-mode mouse force (attract/repel/vortex),
// and a tier system that steps the grid 1024\xb2 -> 512\xb2 -> 256\xb2.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { useDisposable } from "@/lib/hooks/use-disposable";

type Tier = "low" | "mid" | "high";
type Mode = "attract" | "repel" | "vortex";

const MODE_INDEX: Record<Mode, number> = { attract: 0, repel: 1, vortex: 2 };

interface TierConfig {
  grid: number;
  dpr: [number, number];
}

// Grid resolution IS the particle budget: 256\xb2 = 65,536; 512\xb2 = 262,144;
// 1024\xb2 = 1,048,576. Caller's <Canvas dpr={TIERS[tier].dpr}> applies the cap.
const TIERS: Record<Tier, TierConfig> = {
  low: { grid: 256, dpr: [1, 1] },
  mid: { grid: 512, dpr: [1, 1.5] },
  high: { grid: 1024, dpr: [1, 2] },
};

const BOUNDS = 3.0;
const MAX_AGE = 4.0;

const positionShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uTime;
  uniform float uDelta;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uMode; // 0 = attract, 1 = repel, 2 = vortex
  uniform float uRadius;
  uniform float uStrength;
  uniform float uMaxAge;

  const float BOUNDS = 3.0;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }

  vec3 potential(vec3 p) {
    return vec3(
      noise3(p + vec3(37.2, 91.1, 12.3)),
      noise3(p + vec3(19.4, 3.7, 88.0)),
      noise3(p + vec3(71.9, 42.1, 5.6))
    );
  }

  vec3 curlNoise(vec3 p) {
    float e = 0.09;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 pxA = potential(p - dx), pxB = potential(p + dx);
    vec3 pyA = potential(p - dy), pyB = potential(p + dy);
    vec3 pzA = potential(p - dz), pzB = potential(p + dz);

    float x = (pyB.z - pyA.z) - (pzB.y - pzA.y);
    float y = (pzB.x - pzA.x) - (pxB.z - pxA.z);
    float z = (pxB.y - pxA.y) - (pyB.x - pyA.x);

    return vec3(x, y, z) / (2.0 * e);
  }

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec3 pos = data.xyz;
    float age = data.w + uDelta;

    // Lifecycle: respawn BEFORE integration runs, and return early — a
    // freshly respawned particle must not also receive this frame's
    // mouse-force displacement on its stale position (that reads as a
    // one-frame teleport streak across the field).
    if (age > uMaxAge) {
      vec3 fresh = vec3(
        (rand(uv + uTime) * 2.0 - 1.0) * BOUNDS,
        (rand(uv + uTime + 11.0) * 2.0 - 1.0) * BOUNDS,
        (rand(uv + uTime + 23.0) * 2.0 - 1.0) * BOUNDS * 0.3
      );
      gl_FragColor = vec4(fresh, 0.0);
      return;
    }

    // Ambient drift: always on, guarantees the field keeps moving even with
    // zero mouse input.
    vec3 flow = curlNoise(pos * 0.5 + vec3(0.0, 0.0, uTime * 0.05)) * 0.6;

    // Radial vector from pointer to particle, and its falloff — shared by
    // all three modes. Rotating \`dir\` by 90\xb0 turns a radial force into a
    // tangential one: that single line is what makes vortex mode different
    // from attract/repel, not a separate force model.
    vec2 toParticle = pos.xy - uPointer;
    float dist = length(toParticle);
    vec2 dir = dist > 1e-4 ? toParticle / dist : vec2(0.0);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
    vec2 radial = dir * falloff * uStrength;
    vec2 tangent = vec2(-dir.y, dir.x) * falloff * uStrength;
    vec2 mouseForce =
      uMode < 0.5 ? -radial :          // attract: toward the pointer
      uMode < 1.5 ?  radial : tangent; // repel : vortex (circulate)
    mouseForce *= uPointerActive;

    // Blend, don't replace — the curl flow keeps shaping motion even under
    // a strong mouse force instead of being overridden by it.
    vec3 vel = flow + vec3(mouseForce, 0.0);

    // Clamp speed before integrating — unclamped force right next to the
    // pointer flings particles into a jittery blur instead of motion.
    float speed = length(vel);
    float maxSpeed = 4.0;
    if (speed > maxSpeed) vel *= maxSpeed / speed;

    pos += vel * uDelta;

    // Toroidal wrap keeps density stable between natural respawns too.
    pos.xy = mod(pos.xy + BOUNDS, BOUNDS * 2.0) - BOUNDS;
    pos.z = mod(pos.z + BOUNDS * 0.3, BOUNDS * 0.6) - BOUNDS * 0.3;

    gl_FragColor = vec4(pos, age);
  }
\`;

const particleVertex = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uMaxAge;
  uniform float uPixelRatio;
  attribute vec2 aUv;
  varying float vAgeT;

  void main() {
    vec4 data = texture2D(texturePosition, aUv);
    vAgeT = clamp(data.w / uMaxAge, 0.0, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(data.xyz, 1.0);
    // Size attenuation by hand (no built-in sizeAttenuation on a raw
    // ShaderMaterial): bigger/brighter when freshly spawned.
    gl_PointSize = uPixelRatio * mix(6.0, 2.5, vAgeT) * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
\`;

const particleFragment = /* glsl */ \`
  precision highp float;
  varying float vAgeT;

  void main() {
    // Round soft-edged sprite — a flat quad reads as a hard-edged square
    // once additive blending piles thousands of them on top of each other.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = 1.0 - smoothstep(0.3, 0.5, d);

    vec3 young = vec3(1.0, 0.85, 0.4); // freshly spawned: warm/bright
    vec3 old = vec3(0.15, 0.35, 0.9);  // about to respawn: cool/dim
    vec3 color = mix(young, old, vAgeT);
    float fade = 1.0 - vAgeT * 0.7; // never fully fades -> no hard pop at respawn
    gl_FragColor = vec4(color * fade, edge * fade);
  }
\`;

interface ComputeUniforms {
  uTime: { value: number };
  uDelta: { value: number };
  uMaxAge: { value: number };
  uPointer: { value: THREE.Vector2 };
  uPointerActive: { value: number };
  uMode: { value: number };
  uRadius: { value: number };
  uStrength: { value: number };
}

interface ParticleCompute {
  uniforms: ComputeUniforms;
  step: () => THREE.Texture;
  dispose: () => void;
}

function createParticleCompute(
  gl: THREE.WebGLRenderer,
  grid: number,
): ParticleCompute {
  const gpu = new GPUComputationRenderer(grid, grid, gl);
  gpu.setDataType(THREE.HalfFloatType); // EXT_color_buffer_float — safe default, see references

  const initial = gpu.createTexture();
  const data = initial.image.data as Float32Array;
  const count = grid * grid;
  for (let i = 0; i < count; i++) {
    data[i * 4 + 0] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 1] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 2] = (Math.random() * 2 - 1) * BOUNDS * 0.3;
    data[i * 4 + 3] = Math.random() * MAX_AGE; // stagger initial age: respawns don't sync into one pulse
  }

  const positionVar = gpu.addVariable("texturePosition", positionShader, initial);
  gpu.setVariableDependencies(positionVar, [positionVar]);

  const uniforms: ComputeUniforms = {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uMaxAge: { value: MAX_AGE },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uMode: { value: 0 },
    uRadius: { value: 1.1 },
    uStrength: { value: 3.5 },
  };
  Object.assign(positionVar.material.uniforms, { texturePosition: { value: null } }, uniforms);

  const error = gpu.init();
  if (error) console.error(error);

  return {
    uniforms,
    step: () => {
      gpu.compute();
      return gpu.getCurrentRenderTarget(positionVar).texture;
    },
    dispose: () => gpu.dispose(),
  };
}

// Pointer position in the same XY plane the particles live in — raycasts
// against z=0 instead of tracking raw pixels, same pattern as
// checkpoint-interactive-particle-field.
function usePointerOnPlane() {
  const { camera, gl } = useThree();
  const stateRef = useRef({ point: new THREE.Vector2(), active: false });

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const toNdc = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const onMove = (e: PointerEvent) => {
      toNdc(e);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) stateRef.current.point.set(hit.x, hit.y);
      stateRef.current.active = true;
    };
    const onLeave = () => { stateRef.current.active = false; };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [camera, gl]);

  return stateRef;
}

function GpuParticleSystem({ tier, mode }: { tier: Tier; mode: Mode }) {
  const { gl } = useThree();
  const disposables = useDisposable();
  const grid = TIERS[tier].grid;
  const pointerRef = usePointerOnPlane();
  const computeRef = useRef<ParticleCompute | null>(null);

  const uniforms = useMemo(
    () => ({
      texturePosition: { value: null as THREE.Texture | null },
      uMaxAge: { value: MAX_AGE },
      uPixelRatio: { value: gl.getPixelRatio() },
    }),
    [gl],
  );

  // Keyed on \`grid\`: a tier switch means a different particle count, which
  // means a different vertex count — this geometry must be torn down and
  // rebuilt, not resized in place.
  const geometry = useMemo(() => {
    const count = grid * grid;
    const positions = new Float32Array(count * 3); // required by Three; values unused
    const uvs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      uvs[i * 2] = ((i % grid) + 0.5) / grid;
      uvs[i * 2 + 1] = (Math.floor(i / grid) + 0.5) / grid;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
    return disposables.register(geo);
  }, [grid, disposables]);

  const material = useMemo(
    () =>
      disposables.register(
        new THREE.ShaderMaterial({
          vertexShader: particleVertex,
          fragmentShader: particleFragment,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    [uniforms, disposables],
  );

  // Grid size determines the GPUComputationRenderer's internal render
  // targets AND the geometry's vertex count. This is the #1 leak in this
  // capstone: every tier switch (or remount) must fully dispose() the OLD
  // compute before the new one is built.
  useEffect(() => {
    const compute = createParticleCompute(gl, grid);
    computeRef.current = compute;
    return () => {
      compute.dispose();
      computeRef.current = null;
    };
  }, [gl, grid]);

  useFrame((state, delta) => {
    const compute = computeRef.current;
    if (!compute) return;

    const u = compute.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDelta.value = Math.min(delta, 1 / 30);
    u.uPointer.value.copy(pointerRef.current.point);
    u.uPointerActive.value = pointerRef.current.active ? 1 : 0;
    u.uMode.value = MODE_INDEX[mode];

    uniforms.texturePosition.value = compute.step();

    // Zero-CPU-per-frame proof: this callback never touches a per-particle
    // array. One compute() pass + one points draw call, both fixed cost
    // regardless of \`grid\` — verify by reading renderer.info.render.calls
    // right after mount at each tier: the delta is identical at 256, 512
    // and 1024.
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

function detectStartingTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || mem <= 4) return "low";
  if (cores <= 8 || mem <= 8) return "mid";
  return "high";
}

export function InteractiveParticleCloud({ mode = "attract" }: { mode?: Mode }) {
  const [tier, setTier] = useState<Tier>(detectStartingTier);

  return (
    <>
      {/* flipflops absorbs short frame-time noise so tier doesn't
          flip-flop every time the grid resizes mid-transition. */}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setTier((t) => (t === "high" ? "mid" : "low"))}
        onIncline={() => setTier((t) => (t === "low" ? "mid" : "high"))}
      />
      <GpuParticleSystem tier={tier} mode={mode} />
    </>
  );
}

// VERIFICATION (part of this build, not optional):
// 1. Mount at each tier manually (force detectStartingTier's return value)
//    and read renderer.info.render.calls right after the first frame — the
//    delta from baseline must be the SAME number at grid=256, 512 and 1024.
// 2. Mount/unmount InteractiveParticleCloud 10 times, and separately switch
//    tier 10 times while mounted; renderer.info.memory.geometries/.textures
//    must return to the exact same baseline after every cycle.
// 3. With the pointer idle off-canvas, confirm the field keeps drifting
//    (curl noise never stalls). Then test all three modes: attract pulls
//    particles in, repel scatters them, vortex visibly circulates them
//    around the pointer instead of moving radially.`,
    hints: [
      {
        vi: "Chế độ vortex chỉ khác attract/repel đúng một dòng: xoay vector xuyên tâm `dir` đi 90° thành `vec2(-dir.y, dir.x)` biến một lực xuyên tâm thành lực tiếp tuyến. Đừng viết một hệ lực hoàn toàn khác cho vortex — tái sử dụng `dir`/`falloff` đã tính, chỉ đổi hướng.",
        en: "Vortex mode differs from attract/repel by exactly one line: rotating the radial vector `dir` by 90° into `vec2(-dir.y, dir.x)` turns a radial force into a tangential one. Don't write a separate force system for vortex — reuse the same `dir`/`falloff`, just change its direction.",
      },
      {
        vi: "RGBA của texture trạng thái chỉ có 4 số — position (xyz) + age (w) đã lấp đầy, không còn chỗ cho một giá trị tốc độ riêng. Đó là lý do color ramp của bài này dùng tuổi thọ, không phải tốc độ. Và khi age vượt uMaxAge, phải `gl_FragColor` + `return` NGAY trong nhánh respawn — để code chạy tiếp xuống phần tích phân lực chuột sẽ cộng vận tốc vào một vị trí sắp bị ghi đè, gây giật hình một frame.",
        en: "The state texture's RGBA only holds 4 numbers — position (xyz) + age (w) already fills it, leaving no room for a separate speed value. That's why this build's color ramp uses age, not speed. And once age exceeds uMaxAge, `gl_FragColor` + `return` immediately inside the respawn branch — falling through to the mouse-force integration below would add a velocity to a position that's about to be overwritten, causing a one-frame stutter.",
      },
      {
        vi: "Đổi tier nghĩa là đổi `grid`, và `grid` quyết định cả kích thước render target bên trong GPUComputationRenderer lẫn số vertex của geometry. `useEffect` dựng compute phải có `grid` trong dependency array VÀ dispose compute cũ trước khi tạo compute mới — thiếu bước này, mỗi lần đổi tier để lại một bộ FBO cũ không ai dọn, đúng lỗi #1 của mọi bài GPGPU trên nền tảng này.",
        en: "Switching tier means switching `grid`, and `grid` determines both GPUComputationRenderer's internal render target size AND the geometry's vertex count. The `useEffect` that builds the compute must have `grid` in its dependency array AND dispose the old compute before creating the new one — skip this and every tier switch leaves behind an orphaned set of FBOs, exactly the #1 failure mode called out across this platform's GPGPU lessons.",
      },
    ],
    checklist: [
      {
        vi: "1 triệu particle (tier high, lưới 1024²) render ổn định trên máy dev",
        en: "1 million particles (high tier, 1024² grid) render stably on the dev machine",
      },
      {
        vi: "renderer.info.render.calls không đổi bất kể lưới là 256², 512² hay 1024² — bằng chứng CPU không chạm vị trí từng particle",
        en: "renderer.info.render.calls stays the same regardless of whether the grid is 256², 512², or 1024² — proof the CPU never touches individual particle positions",
      },
      {
        vi: "Flow field giữ chuyển động organic liên tục kể cả khi con trỏ đứng ngoài canvas",
        en: "The flow field keeps motion organic and continuous even with the pointer off the canvas",
      },
      {
        vi: "Cả ba chế độ lực hoạt động phân biệt rõ ràng — vortex thực sự xoáy quanh con trỏ, không lẫn với đẩy hay hút",
        en: "All three force modes are visibly distinct — vortex genuinely circulates around the pointer, not confused with push or pull",
      },
      {
        vi: "Particle không bao giờ đứng yên vĩnh viễn hay biến mất — lifecycle respawn giữ mật độ trường ổn định vô thời hạn",
        en: "Particles never freeze permanently or vanish for good — lifecycle respawn keeps field density stable indefinitely",
      },
      {
        vi: "Màu particle phản ánh đúng tuổi thọ — particle mới sinh sáng/ấm rõ rệt hơn particle sắp respawn",
        en: "Particle color reflects age correctly — freshly spawned particles are visibly brighter/warmer than ones about to respawn",
      },
      {
        vi: "Texture trạng thái dùng HalfFloatType, không phải FloatType mặc định",
        en: "The state texture uses HalfFloatType, not the default FloatType",
      },
      {
        vi: "Tier tự động hạ xuống 512²/256² khi mô phỏng thiết bị yếu, có hysteresis — không dao động qua lại liên tục",
        en: "Tier automatically drops to 512²/256² when simulating a weak device, with hysteresis — no continuous flip-flopping",
      },
      {
        vi: "Đổi tier lúc runtime không leak — renderer.info.memory quay về đúng baseline sau mỗi lần đổi",
        en: "Switching tier at runtime doesn't leak — renderer.info.memory returns to the exact baseline after every switch",
      },
      {
        vi: "Sau 10 chu kỳ mount/unmount, không có FBO hay geometry nào sót lại — renderer.info.memory quay về đúng baseline mỗi lần",
        en: "After 10 mount/unmount cycles, no FBO or geometry is left behind — renderer.info.memory returns to the exact baseline every time",
      },
    ],
  },
];

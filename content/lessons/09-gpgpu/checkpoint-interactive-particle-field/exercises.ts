import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-interactive-particle-field",
    kind: "build",
    prompt: {
      vi: `Dựng một component \`InteractiveParticleField\` bằng React Three Fiber + \`GPUComputationRenderer\`: một compute shader cập nhật vị trí 65536 particle (lưới texture 256×256) mỗi frame, kết hợp curl noise làm dòng chảy nền với một lực xuyên tâm điều khiển bởi con trỏ — đẩy ra khi hover, hút vào khi giữ chuột, cường độ giảm mượt theo khoảng cách bằng \`smoothstep\`. Render bằng \`InstancedMesh\` (quad nhỏ mỗi particle), tô màu theo tốc độ \`length(vel)\` lưu ở kênh alpha của texture vị trí.

Phần lấy vị trí con trỏ trong không gian mặt phẳng (raycasting vào plane \`z = 0\`) và phần dựng \`GPUComputationRenderer\` + \`InstancedMesh\` đã đầy đủ trong starter — việc của bạn là hoàn thành đúng 3 TODO bên trong compute shader.`,
      en: `Build an \`InteractiveParticleField\` component with React Three Fiber + \`GPUComputationRenderer\`: a compute shader updates 65536 particle positions (a 256×256 texture grid) every frame, combining curl noise as the ambient flow with a radial force driven by the pointer — push away on hover, pull in while the mouse is held, strength fading smoothly with distance via \`smoothstep\`. Render with \`InstancedMesh\` (a small quad per particle), colored by speed \`length(vel)\` stored in the position texture's alpha channel.

The part that gets the pointer's position in plane space (raycasting onto the \`z = 0\` plane) and the \`GPUComputationRenderer\` + \`InstancedMesh\` scaffolding are already complete in the starter — your job is to finish exactly 3 TODOs inside the compute shader.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const GRID = 256; // 256 * 256 = 65536 particles
const COUNT = GRID * GRID;
const BOUNDS = 3.0; // particles wrap inside [-BOUNDS, BOUNDS] on x/y

const computeShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uTime;
  uniform float uDelta;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uPointerDown;
  uniform float uRadius;
  uniform float uStrength;

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

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec3 pos = data.xyz;

    // Ambient drift: slow curl-noise flow, always on — guarantees the
    // field keeps moving even with zero mouse input.
    vec3 flow = curlNoise(pos * 0.5 + vec3(0.0, 0.0, uTime * 0.05)) * 0.5;

    // TODO 1: radial mouse force. direction = normalize(pos.xy - uPointer)
    // for repel (negate it for attract); magnitude = uStrength * a
    // smoothstep falloff that is 1 at the pointer and 0 at uRadius; gate
    // the whole thing by uPointerActive. uPointerDown flips repel<->attract.
    vec2 mouseForce = vec2(0.0);

    // TODO 2: blend, don't replace — final velocity is flow PLUS
    // mouseForce, so curl noise keeps shaping motion under a mouse pull
    // instead of being overridden by it.
    vec3 vel = flow;

    // TODO 3: clamp length(vel) to a sane maximum before integrating — an
    // unclamped force right next to the pointer flings particles into a
    // jittery blur.
    pos += vel * uDelta;

    // Toroidal wrap so the field never thins out or runs dry.
    pos.xy = mod(pos.xy + BOUNDS, BOUNDS * 2.0) - BOUNDS;
    pos.z = mod(pos.z + BOUNDS * 0.3, BOUNDS * 0.6) - BOUNDS * 0.3;

    gl_FragColor = vec4(pos, length(vel));
  }
\`;

const particleVertex = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uMaxSpeed;
  attribute vec2 aUv;
  varying float vSpeedT;

  void main() {
    vec4 data = texture2D(texturePosition, aUv);
    vSpeedT = clamp(data.w / uMaxSpeed, 0.0, 1.0);
    vec3 worldPos = position + data.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
\`;

const particleFragment = /* glsl */ \`
  precision highp float;
  varying float vSpeedT;

  void main() {
    vec3 slow = vec3(0.15, 0.35, 0.9);
    vec3 fast = vec3(1.0, 0.55, 0.15);
    gl_FragColor = vec4(mix(slow, fast, vSpeedT), 1.0);
  }
\`;

interface ComputeUniforms {
  uTime: { value: number };
  uDelta: { value: number };
  uPointer: { value: THREE.Vector2 };
  uPointerActive: { value: number };
  uPointerDown: { value: number };
  uRadius: { value: number };
  uStrength: { value: number };
}

interface ParticleCompute {
  uniforms: ComputeUniforms;
  step: () => THREE.Texture;
  dispose: () => void;
}

// GPUComputationRenderer + the one self-referencing variable stay local to
// this function — the caller only ever sees the small ParticleCompute
// surface below, so nothing outside here depends on the library's internal
// "variable" shape.
function createParticleCompute(gl: THREE.WebGLRenderer): ParticleCompute {
  const gpu = new GPUComputationRenderer(GRID, GRID, gl);
  gpu.setDataType(THREE.HalfFloatType);

  const initial = gpu.createTexture();
  const data = initial.image.data as Float32Array;
  for (let i = 0; i < COUNT; i++) {
    data[i * 4 + 0] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 1] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 2] = (Math.random() * 2 - 1) * BOUNDS * 0.3;
    data[i * 4 + 3] = 0;
  }

  const positionVar = gpu.addVariable("texturePosition", computeShader, initial);
  gpu.setVariableDependencies(positionVar, [positionVar]);

  const uniforms: ComputeUniforms = {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uPointerDown: { value: 0 },
    uRadius: { value: 1.1 },
    uStrength: { value: 3.5 },
  };
  // Self-dependency is the one case GPUComputationRenderer does NOT wire
  // automatically (it only auto-declares/auto-fills the uniform for a
  // variable's OTHER dependencies) — this key must exist before compute()
  // assigns .value to it every frame.
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
// the mouse against the z=0 plane instead of tracking raw pixels, so the
// compute shader can compare positions directly with no extra conversion.
function usePointerOnPlane() {
  const { camera, gl } = useThree();
  const stateRef = useRef({ point: new THREE.Vector2(), active: false, down: false });

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
    const onDown = () => { stateRef.current.down = true; };
    const onUp = () => { stateRef.current.down = false; };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [camera, gl]);

  return stateRef;
}

export function InteractiveParticleField() {
  const { gl } = useThree();
  const pointerRef = usePointerOnPlane();
  const computeRef = useRef<ParticleCompute | null>(null);

  const uniforms = useMemo(
    () => ({ texturePosition: { value: null as THREE.Texture | null }, uMaxSpeed: { value: 4.0 } }),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.025, 0.025);
    const uvs = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      uvs[i * 2] = ((i % GRID) + 0.5) / GRID;
      uvs[i * 2 + 1] = (Math.floor(i / GRID) + 0.5) / GRID;
    }
    geo.setAttribute("aUv", new THREE.InstancedBufferAttribute(uvs, 2));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const compute = createParticleCompute(gl);
    computeRef.current = compute;
    return () => {
      compute.dispose();
      computeRef.current = null;
    };
  }, [gl]);

  useFrame((state, delta) => {
    const compute = computeRef.current;
    if (!compute) return;

    const u = compute.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDelta.value = Math.min(delta, 1 / 30);
    u.uPointer.value.copy(pointerRef.current.point);
    u.uPointerActive.value = pointerRef.current.active ? 1 : 0;
    u.uPointerDown.value = pointerRef.current.down ? 1 : 0;

    uniforms.texturePosition.value = compute.step();
  });

  return (
    <instancedMesh args={[geometry, undefined, COUNT]} frustumCulled={false}>
      <shaderMaterial vertexShader={particleVertex} fragmentShader={particleFragment} uniforms={uniforms} />
    </instancedMesh>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const GRID = 256; // 256 * 256 = 65536 particles
const COUNT = GRID * GRID;
const BOUNDS = 3.0; // particles wrap inside [-BOUNDS, BOUNDS] on x/y

const computeShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uTime;
  uniform float uDelta;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uPointerDown;
  uniform float uRadius;
  uniform float uStrength;

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

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec3 pos = data.xyz;

    vec3 flow = curlNoise(pos * 0.5 + vec3(0.0, 0.0, uTime * 0.05)) * 0.5;

    // Radial mouse force: direction away from the pointer (repel) or
    // toward it (attract), magnitude fading smoothly to 0 at uRadius.
    vec2 toParticle = pos.xy - uPointer;
    float dist = length(toParticle);
    vec2 dir = dist > 1e-4 ? toParticle / dist : vec2(0.0);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
    float pushPull = uPointerDown > 0.5 ? -1.0 : 1.0; // pressed = attract, hover = repel
    vec2 mouseForce = dir * pushPull * uStrength * falloff * uPointerActive;

    // Blend, don't replace — the curl flow keeps shaping motion even
    // under a strong mouse pull instead of being overridden by it.
    vec3 vel = flow + vec3(mouseForce, 0.0);

    // Clamp speed before integrating — an unclamped force right next to
    // the pointer would fling particles into a jittery blur.
    float speed = length(vel);
    float maxSpeed = 4.0;
    if (speed > maxSpeed) vel = vel * (maxSpeed / speed);

    pos += vel * uDelta;

    pos.xy = mod(pos.xy + BOUNDS, BOUNDS * 2.0) - BOUNDS;
    pos.z = mod(pos.z + BOUNDS * 0.3, BOUNDS * 0.6) - BOUNDS * 0.3;

    gl_FragColor = vec4(pos, length(vel));
  }
\`;

const particleVertex = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform float uMaxSpeed;
  attribute vec2 aUv;
  varying float vSpeedT;

  void main() {
    vec4 data = texture2D(texturePosition, aUv);
    vSpeedT = clamp(data.w / uMaxSpeed, 0.0, 1.0);
    vec3 worldPos = position + data.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
\`;

const particleFragment = /* glsl */ \`
  precision highp float;
  varying float vSpeedT;

  void main() {
    vec3 slow = vec3(0.15, 0.35, 0.9);
    vec3 fast = vec3(1.0, 0.55, 0.15);
    gl_FragColor = vec4(mix(slow, fast, vSpeedT), 1.0);
  }
\`;

interface ComputeUniforms {
  uTime: { value: number };
  uDelta: { value: number };
  uPointer: { value: THREE.Vector2 };
  uPointerActive: { value: number };
  uPointerDown: { value: number };
  uRadius: { value: number };
  uStrength: { value: number };
}

interface ParticleCompute {
  uniforms: ComputeUniforms;
  step: () => THREE.Texture;
  dispose: () => void;
}

function createParticleCompute(gl: THREE.WebGLRenderer): ParticleCompute {
  const gpu = new GPUComputationRenderer(GRID, GRID, gl);
  gpu.setDataType(THREE.HalfFloatType);

  const initial = gpu.createTexture();
  const data = initial.image.data as Float32Array;
  for (let i = 0; i < COUNT; i++) {
    data[i * 4 + 0] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 1] = (Math.random() * 2 - 1) * BOUNDS;
    data[i * 4 + 2] = (Math.random() * 2 - 1) * BOUNDS * 0.3;
    data[i * 4 + 3] = 0;
  }

  const positionVar = gpu.addVariable("texturePosition", computeShader, initial);
  gpu.setVariableDependencies(positionVar, [positionVar]);

  const uniforms: ComputeUniforms = {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uPointerDown: { value: 0 },
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

function usePointerOnPlane() {
  const { camera, gl } = useThree();
  const stateRef = useRef({ point: new THREE.Vector2(), active: false, down: false });

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
    const onDown = () => { stateRef.current.down = true; };
    const onUp = () => { stateRef.current.down = false; };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [camera, gl]);

  return stateRef;
}

export function InteractiveParticleField() {
  const { gl } = useThree();
  const pointerRef = usePointerOnPlane();
  const computeRef = useRef<ParticleCompute | null>(null);

  const uniforms = useMemo(
    () => ({ texturePosition: { value: null as THREE.Texture | null }, uMaxSpeed: { value: 4.0 } }),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.025, 0.025);
    const uvs = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      uvs[i * 2] = ((i % GRID) + 0.5) / GRID;
      uvs[i * 2 + 1] = (Math.floor(i / GRID) + 0.5) / GRID;
    }
    geo.setAttribute("aUv", new THREE.InstancedBufferAttribute(uvs, 2));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const compute = createParticleCompute(gl);
    computeRef.current = compute;
    return () => {
      compute.dispose();
      computeRef.current = null;
    };
  }, [gl]);

  useFrame((state, delta) => {
    const compute = computeRef.current;
    if (!compute) return;

    const u = compute.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDelta.value = Math.min(delta, 1 / 30);
    u.uPointer.value.copy(pointerRef.current.point);
    u.uPointerActive.value = pointerRef.current.active ? 1 : 0;
    u.uPointerDown.value = pointerRef.current.down ? 1 : 0;

    uniforms.texturePosition.value = compute.step();
  });

  return (
    <instancedMesh args={[geometry, undefined, COUNT]} frustumCulled={false}>
      <shaderMaterial vertexShader={particleVertex} fragmentShader={particleFragment} uniforms={uniforms} />
    </instancedMesh>
  );
}`,
    hints: [
      {
        vi: "Lực chuột là một vector xuyên tâm: \`dir = normalize(pos.xy - uPointer)\` cho hướng đẩy ra (repel); nhân với \`uStrength\` và một hệ số falloff dạng \`smoothstep\` bằng 1 sát con trỏ, bằng 0 tại \`uRadius\` — không cắt cụt đột ngột ở rìa vùng ảnh hưởng.",
        en: "The mouse force is a radial vector: \`dir = normalize(pos.xy - uPointer)\` gives the repel direction; multiply by \`uStrength\` and a \`smoothstep\`-shaped falloff that is 1 right at the pointer and 0 at \`uRadius\` — no hard cutoff at the influence edge.",
      },
      {
        vi: "\`vel\` phải là \`flow + mouseForce\`, không phải chỉ \`mouseForce\` — thay hẳn \`vel\` bằng lực chuột sẽ làm dòng chảy nền biến mất bất cứ khi nào con trỏ hoạt động, phá luôn yêu cầu \"trở lại trôi nền khi bỏ chuột ra\".",
        en: "\`vel\` must be \`flow + mouseForce\`, not just \`mouseForce\` — replacing \`vel\` outright with the mouse force makes the ambient flow vanish whenever the pointer is active, breaking the \"settles back into ambient drift\" requirement.",
      },
      {
        vi: "Sau khi cộng lực, kiểm tra \`length(vel)\` và scale \`vel\` xuống nếu vượt một ngưỡng tốc độ tối đa TRƯỚC khi cộng vào \`pos\` — thiếu bước này, particle sát con trỏ (dist gần 0, falloff gần 1) sẽ bị bắn đi với tốc độ cực lớn mỗi frame, nhìn như nhiễu chứ không phải chuyển động.",
        en: "After summing the forces, check \`length(vel)\` and scale \`vel\` down if it exceeds some maximum speed BEFORE adding it to \`pos\` — skip this and a particle right next to the pointer (dist near 0, falloff near 1) gets flung at enormous speed every frame, reading as noise instead of motion.",
      },
    ],
    checklist: [
      {
        vi: "Di chuột qua trường particle thực sự \"nặn\" được hình dạng — particle dạt ra rõ ràng quanh vị trí con trỏ",
        en: "Moving the mouse over the field genuinely sculpts its shape — particles visibly scatter away around the pointer position",
      },
      {
        vi: "Giữ chuột (pointerdown) đổi lực từ đẩy sang hút — particle tụ lại quanh con trỏ thay vì dạt ra",
        en: "Holding the mouse down (pointerdown) flips the force from push to pull — particles gather around the pointer instead of scattering",
      },
      {
        vi: "Chuyển động organic, mượt — không giật cục hay nhiễu loạn ngay cả khi con trỏ đứng yên sát một particle",
        en: "Motion reads as organic and smooth — no jitter or noise even when the pointer sits still right next to a particle",
      },
      {
        vi: "Bỏ chuột ra khỏi canvas: field quay lại trạng thái trôi theo curl noise nền, không đứng yên",
        en: "Moving the mouse off the canvas: the field settles back into ambient curl-noise drift, never freezes",
      },
      {
        vi: "65536 particle giữ khung hình ổn định quanh 60fps trên máy tầm trung",
        en: "65536 particles hold a stable frame rate around 60fps on a mid-range machine",
      },
      {
        vi: "Unmount component không để lại render target/texture nào sống sót — gpu.dispose() và geometry.dispose() đều được gọi",
        en: "Unmounting the component leaves no render target/texture alive — both gpu.dispose() and geometry.dispose() get called",
      },
      {
        vi: "Màu particle phản ánh đúng tốc độ — particle bị lực chuột đẩy mạnh sáng/nóng màu hơn hẳn particle đang trôi nền",
        en: "Particle color reflects speed correctly — particles pushed hard by the mouse force are visibly brighter/warmer than ones just drifting ambiently",
      },
      {
        vi: "Không có particle nào biến mất vĩnh viễn — wrap toroidal giữ mật độ trường ổn định dù con trỏ đẩy particle ra rìa liên tục",
        en: "No particle ever permanently disappears — the toroidal wrap keeps field density stable even as the pointer repeatedly pushes particles toward the edges",
      },
    ],
  },
];

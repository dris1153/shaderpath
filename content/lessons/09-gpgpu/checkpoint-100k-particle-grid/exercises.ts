import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-100k-particle-grid",
    kind: "build",
    prompt: {
      vi: `Dựng một component React Three Fiber \`ParticleGrid100k\`: một lưới 320×320 (~102.400) particle sắp phẳng trong mặt phẳng XY, vị trí và vận tốc cập nhật hoàn toàn trên GPU qua \`GPUComputationRenderer\` — không có vòng lặp CPU nào chạy mỗi frame.

Compute variable \`textureVelocity\`: lực lò xo kéo particle về "nhà" (vị trí nghỉ), suy thẳng từ toạ độ UV của chính texture trạng thái (không cần texture riêng lưu home); cộng một nhiễu ngẫu nhiên nhỏ; nhân với damping mỗi frame để hệ tắt dần. Mỗi \`BURST_PERIOD\` giây, bơm thêm một xung lực một-frame đẩy particle theo hướng ngẫu nhiên.

Compute variable \`texturePosition\`: tích phân Euler đơn giản \`pos += vel * dt\`.

Render bằng \`<points>\`: geometry dựng tay với hai attribute — \`position\` (placeholder, giá trị thật lấy từ texture) và \`aReference\` (uv trỏ vào đúng texel trạng thái của particle đó). Tô màu theo tốc độ tức thời (độ lớn vận tốc → dải màu hue). Dispose sạch \`GPUComputationRenderer\` và geometry khi component unmount.`,
      en: `Build a React Three Fiber component \`ParticleGrid100k\`: a flat 320×320 (~102,400) particle grid in the XY plane, with position and velocity updating entirely on the GPU through \`GPUComputationRenderer\` — no CPU loop running per frame.

The \`textureVelocity\` compute variable: a spring force pulling each particle back to its "home" (rest position), derived directly from the state texture's own UV coordinate (no separate texture needed to store it); plus a small random perturbation; multiplied by damping every frame so the system settles. Every \`BURST_PERIOD\` seconds, inject a one-frame impulse scattering particles in a random direction.

The \`texturePosition\` compute variable: plain Euler integration, \`pos += vel * dt\`.

Render with \`<points>\`: a hand-built geometry with two attributes — \`position\` (a placeholder; the real value comes from the texture) and \`aReference\` (the uv pointing at that particle's exact state texel). Color by instantaneous speed (velocity magnitude mapped through a hue ramp). Cleanly dispose the \`GPUComputationRenderer\` and geometry on unmount.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer, type Variable } from "three/addons/misc/GPUComputationRenderer.js";

const SIZE = 320; // 320 * 320 = 102,400 particles
const SPACING = 0.03; // world units between adjacent grid particles
const BURST_STRENGTH = 3.5;

const velocityShader = /* glsl */ \`
  uniform float uDelta;
  uniform float uTime;
  uniform float uSpring;
  uniform float uDamping;
  uniform float uNoiseStrength;
  uniform float uSpacing;
  uniform float uBurstStrength;

  const float BURST_PERIOD = 5.0;

  float hash11(float n) { return fract(sin(n) * 43758.5453123); }
  vec3 hash3(vec2 p) {
    float n = dot(p, vec2(41.3, 289.1));
    return vec3(hash11(n), hash11(n + 17.0), hash11(n + 53.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // TODO 1: "home" is this texel's own uv, centered and scaled by uSpacing
    // — no separate texture needed. z stays 0 (a flat grid).
    vec3 home = vec3(0.0);

    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;

    // TODO 2: spring force = (home - pos) * uSpring, plus a small noise
    // perturbation from hash3(uv * 37.0 + vec2(uTime * 0.1)) - 0.5, scaled
    // by uNoiseStrength, so particles don't move in perfect lockstep.
    vec3 force = vec3(0.0);

    // TODO 3: a one-frame outward impulse right when uTime wraps past
    // BURST_PERIOD (tSinceBurst < uDelta) — direction from
    // normalize(hash3(uv * 91.7) - 0.5 + 1e-5), scaled by uBurstStrength.
    vec3 impulse = vec3(0.0);

    vel += force * uDelta + impulse;

    // TODO 4: damp vel (multiply by uDamping, which is < 1) so the spring
    // settles instead of ringing forever.

    gl_FragColor = vec4(vel, 0.0);
  }
\`;

const positionShader = /* glsl */ \`
  uniform float uDelta;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;

    // TODO: plain Euler integration, pos += vel * uDelta

    gl_FragColor = vec4(pos, 0.0);
  }
\`;

const pointsVertexShader = /* glsl */ \`
  precision highp float;

  attribute vec2 aReference;

  uniform sampler2D uTexturePosition;
  uniform sampler2D uTextureVelocity;

  varying float vSpeed;

  void main() {
    vec3 pos = texture2D(uTexturePosition, aReference).xyz;
    vec3 vel = texture2D(uTextureVelocity, aReference).xyz;
    vSpeed = length(vel);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.2 * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
\`;

const pointsFragmentShader = /* glsl */ \`
  precision highp float;

  uniform float uMaxSpeed;
  varying float vSpeed;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;

    float t = clamp(vSpeed / max(uMaxSpeed, 1e-4), 0.0, 1.0);
    float hue = mix(0.62, 0.0, t); // blue (slow) -> red (fast)
    gl_FragColor = vec4(hsv2rgb(vec3(hue, 0.85, 1.0)), 1.0);
  }
\`;

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
    const x = i % SIZE;
    const y = Math.floor(i / SIZE);
    data[i * 4 + 0] = (x + 0.5 - SIZE / 2) * SPACING;
    data[i * 4 + 1] = (y + 0.5 - SIZE / 2) * SPACING;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 0;
  }
  return new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
}

function makeZeroVelocityTexture(): THREE.DataTexture {
  // TODO 5: seed the velocity texture with zeros — a fresh Float32Array is
  // already zero-filled, just wrap it in a DataTexture of the right shape.
  const data = new Float32Array(0);
  return new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat, THREE.FloatType);
}

interface GpuState {
  compute: GPUComputationRenderer;
  positionVar: Variable;
  velocityVar: Variable;
  velocityUniforms: { uDelta: { value: number }; uTime: { value: number } };
  positionUniforms: { uDelta: { value: number } };
}

export function ParticleGrid100k() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const gpuRef = useRef<GpuState | null>(null);

  const geometry = useMemo(() => buildParticleGeometry(), []);
  const uniforms = useMemo(
    () => ({
      uTexturePosition: { value: null as THREE.Texture | null },
      uTextureVelocity: { value: null as THREE.Texture | null },
      uMaxSpeed: { value: BURST_STRENGTH },
    }),
    [],
  );

  useEffect(() => {
    // TODO 6: wire up the GPUComputationRenderer —
    //   1. new GPUComputationRenderer(SIZE, SIZE, gl)
    //   2. compute.setDataType(THREE.HalfFloatType) — float RENDER TARGETS
    //      need EXT_color_buffer_float; half-float is the safe default.
    //   3. addVariable("textureVelocity", velocityShader, makeZeroVelocityTexture())
    //      addVariable("texturePosition", positionShader, makePositionTexture())
    //   4. setVariableDependencies on BOTH variables: [velocityVar, positionVar]
    //   5. attach uSpring/uDamping/uNoiseStrength/uSpacing/uBurstStrength/uDelta/
    //      uTime to velocityVar.material.uniforms, and uDelta to positionVar's
    //   6. compute.init() — throw if it returns an error string
    //   7. store everything in gpuRef.current, return a cleanup that calls
    //      compute.dispose()

    return () => {
      gpuRef.current = null;
    };
  }, [gl, invalidate]);

  useFrame((state, rawDelta) => {
    const gpu = gpuRef.current;
    if (!gpu) return;
    const delta = Math.min(rawDelta, 1 / 30);

    gpu.velocityUniforms.uDelta.value = delta;
    gpu.velocityUniforms.uTime.value = state.clock.elapsedTime;
    gpu.positionUniforms.uDelta.value = delta;

    gpu.compute.compute();

    uniforms.uTexturePosition.value = gpu.compute.getCurrentRenderTarget(gpu.positionVar).texture;
    uniforms.uTextureVelocity.value = gpu.compute.getCurrentRenderTarget(gpu.velocityVar).texture;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        vertexShader={pointsVertexShader}
        fragmentShader={pointsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer, type Variable } from "three/addons/misc/GPUComputationRenderer.js";

const SIZE = 320; // 320 * 320 = 102,400 particles
const SPACING = 0.03; // world units between adjacent grid particles
const BURST_STRENGTH = 3.5;

const velocityShader = /* glsl */ \`
  uniform float uDelta;
  uniform float uTime;
  uniform float uSpring;
  uniform float uDamping;
  uniform float uNoiseStrength;
  uniform float uSpacing;
  uniform float uBurstStrength;

  const float BURST_PERIOD = 5.0;

  float hash11(float n) { return fract(sin(n) * 43758.5453123); }
  vec3 hash3(vec2 p) {
    float n = dot(p, vec2(41.3, 289.1));
    return vec3(hash11(n), hash11(n + 17.0), hash11(n + 53.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Home is this texel's own uv, centered and scaled — no separate
    // "rest position" texture needed anywhere in this pipeline.
    vec3 home = vec3((uv - 0.5) * resolution.xy * uSpacing, 0.0);

    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;

    vec3 noise = (hash3(uv * 37.0 + vec2(uTime * 0.1)) - 0.5) * uNoiseStrength;
    vec3 force = (home - pos) * uSpring + noise;

    // A single-frame impulse: only true for the one tick right after uTime
    // wraps past BURST_PERIOD, so it reads as a scatter, not a push.
    float tSinceBurst = mod(uTime, BURST_PERIOD);
    vec3 impulse = vec3(0.0);
    if (tSinceBurst < uDelta) {
      vec3 dir = normalize(hash3(uv * 91.7) - 0.5 + 1e-5);
      impulse = dir * uBurstStrength;
    }

    vel += force * uDelta + impulse;
    vel *= uDamping; // < 1, so the spring settles instead of ringing forever

    gl_FragColor = vec4(vel, 0.0);
  }
\`;

const positionShader = /* glsl */ \`
  uniform float uDelta;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    pos += vel * uDelta;
    gl_FragColor = vec4(pos, 0.0);
  }
\`;

const pointsVertexShader = /* glsl */ \`
  precision highp float;

  attribute vec2 aReference;

  uniform sampler2D uTexturePosition;
  uniform sampler2D uTextureVelocity;

  varying float vSpeed;

  void main() {
    vec3 pos = texture2D(uTexturePosition, aReference).xyz;
    vec3 vel = texture2D(uTextureVelocity, aReference).xyz;
    vSpeed = length(vel);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.2 * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
\`;

const pointsFragmentShader = /* glsl */ \`
  precision highp float;

  uniform float uMaxSpeed;
  varying float vSpeed;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;

    float t = clamp(vSpeed / max(uMaxSpeed, 1e-4), 0.0, 1.0);
    float hue = mix(0.62, 0.0, t); // blue (slow) -> red (fast)
    gl_FragColor = vec4(hsv2rgb(vec3(hue, 0.85, 1.0)), 1.0);
  }
\`;

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
    const x = i % SIZE;
    const y = Math.floor(i / SIZE);
    data[i * 4 + 0] = (x + 0.5 - SIZE / 2) * SPACING;
    data[i * 4 + 1] = (y + 0.5 - SIZE / 2) * SPACING;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 0;
  }
  return new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
}

function makeZeroVelocityTexture(): THREE.DataTexture {
  // A fresh Float32Array is already zero-filled — seeding velocity with
  // zeros means particles start at rest and get pulled in by the spring
  // instead of launching from an arbitrary initial speed.
  const data = new Float32Array(SIZE * SIZE * 4);
  return new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
}

interface GpuState {
  compute: GPUComputationRenderer;
  positionVar: Variable;
  velocityVar: Variable;
  velocityUniforms: { uDelta: { value: number }; uTime: { value: number } };
  positionUniforms: { uDelta: { value: number } };
}

export function ParticleGrid100k() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const gpuRef = useRef<GpuState | null>(null);

  const geometry = useMemo(() => buildParticleGeometry(), []);
  const uniforms = useMemo(
    () => ({
      uTexturePosition: { value: null as THREE.Texture | null },
      uTextureVelocity: { value: null as THREE.Texture | null },
      uMaxSpeed: { value: BURST_STRENGTH },
    }),
    [],
  );

  useEffect(() => {
    const compute = new GPUComputationRenderer(SIZE, SIZE, gl);
    // WebGL2 needs EXT_color_buffer_float to RENDER INTO float textures;
    // half-float is the broadly-supported safe default for state textures.
    compute.setDataType(THREE.HalfFloatType);

    const velocityVar = compute.addVariable("textureVelocity", velocityShader, makeZeroVelocityTexture());
    const positionVar = compute.addVariable("texturePosition", positionShader, makePositionTexture());
    compute.setVariableDependencies(velocityVar, [velocityVar, positionVar]);
    compute.setVariableDependencies(positionVar, [velocityVar, positionVar]);

    const velocityUniforms = { uDelta: { value: 0 }, uTime: { value: 0 } };
    Object.assign(velocityVar.material.uniforms, velocityUniforms, {
      uSpring: { value: 8 },
      uDamping: { value: 0.92 },
      uNoiseStrength: { value: 0.4 },
      uSpacing: { value: SPACING },
      uBurstStrength: { value: BURST_STRENGTH },
    });

    const positionUniforms = { uDelta: { value: 0 } };
    Object.assign(positionVar.material.uniforms, positionUniforms);

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
    const delta = Math.min(rawDelta, 1 / 30); // clamp so a stall doesn't fire a giant spring kick

    gpu.velocityUniforms.uDelta.value = delta;
    gpu.velocityUniforms.uTime.value = state.clock.elapsedTime;
    gpu.positionUniforms.uDelta.value = delta;

    gpu.compute.compute();

    uniforms.uTexturePosition.value = gpu.compute.getCurrentRenderTarget(gpu.positionVar).texture;
    uniforms.uTextureVelocity.value = gpu.compute.getCurrentRenderTarget(gpu.velocityVar).texture;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        vertexShader={pointsVertexShader}
        fragmentShader={pointsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}`,
    hints: [
      {
        vi: "\"Nhà\" của mỗi particle không cần lưu ở đâu cả — nó suy trực tiếp từ `gl_FragCoord.xy / resolution.xy` (chính là uv của texel đang tính), rồi center + scale bằng `uSpacing`. Một texture thứ ba lưu home là dư thừa.",
        en: "Each particle's \"home\" doesn't need to be stored anywhere — it's derived directly from `gl_FragCoord.xy / resolution.xy` (the uv of the texel being computed), then centered and scaled by `uSpacing`. A third texture storing home would be redundant.",
      },
      {
        vi: "Công thức lò xo là `force = (home - pos) * uSpring` — dấu đúng theo hướng bắt buộc: khi pos ở xa home, `home - pos` chỉ đúng hướng cần kéo về. `uDamping` phải nhỏ hơn 1 (ví dụ 0.9-0.95) và nhân trực tiếp vào `vel`, không nhân vào `force`.",
        en: "The spring formula is `force = (home - pos) * uSpring` — the sign matters: when pos is far from home, `home - pos` points exactly toward where it needs to go. `uDamping` must be less than 1 (e.g. 0.9-0.95) and multiplies `vel` directly, not `force`.",
      },
      {
        vi: "Gieo `textureVelocity` ban đầu bằng một `Float32Array` toàn số 0 (không `Math.random()`) — particle khởi động từ trạng thái đứng yên, để lực lò xo là thứ DUY NHẤT quyết định chuyển động đầu tiên, dễ debug hơn khi hệ chưa hoạt động đúng.",
        en: "Seed `textureVelocity` with an all-zero `Float32Array` (no `Math.random()`) — particles start at rest, so the spring force is the ONLY thing driving initial motion, which is much easier to debug while the system isn't behaving correctly yet.",
      },
    ],
    checklist: [
      {
        vi: "100.000 particle giữ 60fps ổn định trên GPU tầm trung (kiểm tra bằng stats.js hoặc Chrome DevTools Performance)",
        en: "100,000 particles hold a stable 60fps on a midrange GPU (verify with stats.js or Chrome DevTools Performance)",
      },
      {
        vi: "Không có vòng lặp `for` nào chạy trên CPU mỗi frame trong `useFrame` — chỉ gán vài uniform vô hướng rồi gọi `compute.compute()`",
        en: "No `for` loop runs on the CPU per frame inside `useFrame` — only a few scalar uniform assignments, then `compute.compute()`",
      },
      {
        vi: "Mỗi `BURST_PERIOD` giây, particle văng ra rõ rệt rồi lò xo kéo chúng tụ về đúng hình lưới ban đầu, không lệch dần theo mỗi lần burst",
        en: "Every `BURST_PERIOD` seconds, particles visibly scatter and the spring pulls them back into the exact original grid shape, with no drift accumulating across bursts",
      },
      {
        vi: "Màu đọc rõ là tốc độ: particle đứng yên gần home có màu lạnh (xanh), particle vừa bị burst có màu nóng (đỏ)",
        en: "Color clearly reads as speed: particles resting near home are cool-colored (blue), particles freshly hit by a burst are warm-colored (red)",
      },
      {
        vi: "Unmount rồi mount lại component (React Strict Mode hoặc điều hướng qua lại) không làm tăng số texture/render target còn sống — `compute.dispose()` chạy đúng một lần mỗi lần unmount thật",
        en: "Unmounting and remounting the component (React Strict Mode or navigating away and back) doesn't increase the count of live textures/render targets — `compute.dispose()` runs exactly once per real unmount",
      },
      {
        vi: "Hệ vẫn đúng khi `setDataType(THREE.HalfFloatType)` được gọi trước `init()` — không có vệt nhiễu hay NaN xuất hiện dù dùng độ chính xác thấp hơn Float32 đầy đủ",
        en: "The system still works correctly with `setDataType(THREE.HalfFloatType)` called before `init()` — no visible noise or NaN artifacts despite using lower precision than full Float32",
      },
    ],
  },
];
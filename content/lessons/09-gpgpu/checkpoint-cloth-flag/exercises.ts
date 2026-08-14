import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-cloth-flag",
    kind: "build",
    prompt: {
      vi: `Dựng \`ClothFlag\`, một component React Three Fiber độc lập: lá cờ 64×48 mô phỏng bằng mass-spring + Verlet trên \`GPUComputationRenderer\`, đúng bộ khung ping-pong + Jacobi relax của bài cloth-simulation-basics, ghim dọc mép cột cờ (\`col 0\`) thay vì mép trên.

Skeleton (wiring \`GPUComputationRenderer\`, hai biến \`texturePosition\`/\`texturePositionPrev\`, vòng lặp Jacobi relax structural+shear, mesh + \`PlaneGeometry\`) đã đầy đủ — việc của bạn là lấp 4 TODO: (1) chiếu lực gió lên pháp tuyến ước lượng trong shader tích phân, (2) công thức Verlet có damping, (3) tính lại pháp tuyến từ 4 hàng xóm trong vertex shader hiển thị, (4) tô hai tông trước/sau kèm sọc kẻ trong fragment shader hiển thị.

Lá cờ phải render như một mesh tô màu đặc (không wireframe), ổn định khi chạy liên tục, không nổ constraint.`,
      en: `Build \`ClothFlag\`, a standalone React Three Fiber component: a 64×48 flag simulated with mass-spring + Verlet on \`GPUComputationRenderer\`, the exact ping-pong + Jacobi relax framework from the cloth-simulation-basics lesson, pinned down the pole-edge column (\`col 0\`) instead of the top edge.

The skeleton (wiring \`GPUComputationRenderer\`, the two \`texturePosition\`/\`texturePositionPrev\` variables, the structural+shear Jacobi relax loop, the mesh + \`PlaneGeometry\`) is complete — your job is filling 4 TODOs: (1) project the wind force onto the estimated normal inside the integration shader, (2) the damped Verlet formula, (3) recompute the normal from 4 neighbors in the display vertex shader, (4) two-tone front/back shading plus a stripe pattern in the display fragment shader.

The flag must render as a solidly shaded mesh (not wireframe), stay stable running continuously, and never blow up its constraints.`,
    },
    starterCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const RES_X = 64;
const RES_Y = 48;
const FLAG_W = 3;
const FLAG_H = 2;

// Self-dependency: GPUComputationRenderer only auto-wires a variable's
// OTHER dependencies (see cloth-simulation-basics theory) — texturePosition
// must be declared and manually assigned below.
const integrateShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform sampler2D uInitial; // xyz = rest position, w = pin flag (pole edge)
  uniform vec2 uTexel;
  uniform float uDt;
  uniform float uDamping;
  uniform vec3 uGravity;
  uniform float uWindStrength;
  uniform float uTime;

  float gust(vec2 p, float t) {
    return sin(t * 1.3 + p.y * 1.7) * 0.5
      + sin(t * 0.7 - p.x * 2.3 + 1.7) * 0.3
      + sin(t * 2.1 + p.x * 0.6 + p.y * 0.9) * 0.2;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 initial = texture2D(uInitial, uv);

    // Pole edge: skip integration entirely, always the rest position.
    if (initial.w > 0.5) {
      gl_FragColor = vec4(initial.xyz, 0.0);
      return;
    }

    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 prev = texture2D(texturePositionPrev, uv).xyz;

    vec3 right = texture2D(texturePosition, uv + vec2(uTexel.x, 0.0)).xyz;
    vec3 left = texture2D(texturePosition, uv - vec2(uTexel.x, 0.0)).xyz;
    vec3 up = texture2D(texturePosition, uv + vec2(0.0, uTexel.y)).xyz;
    vec3 down = texture2D(texturePosition, uv - vec2(0.0, uTexel.y)).xyz;
    vec3 normal = normalize(cross(right - left, up - down) + vec3(0.0, 0.0, 1e-5));

    float g = 0.5 + 0.5 * gust(pos.xy, uTime);
    vec3 windDir = vec3(1.0, 0.0, 0.3);
    vec3 windRaw = windDir * uWindStrength * g;

    // TODO 1: project windRaw onto \`normal\` (dot(normal, windRaw), clamped
    // at 0, scaled back up by length(windRaw)) — the exact mechanism that
    // turns "puffs sideways like a rigid slab" into "flaps like fabric".
    vec3 wind = vec3(0.0);

    vec3 accel = uGravity + wind;

    // TODO 2: damped Verlet integration (fixed uDt, NOT the real frame
    // delta — see hints): next = pos + (pos - prev) * uDamping
    //                                + accel * uDt * uDt
    vec3 next = pos;

    gl_FragColor = vec4(next, 0.0);
  }
\`;

// texturePosition auto-wired here (different name than this variable's own
// "texturePositionPrev") — do not redeclare it.
const prevShader = /* glsl */ \`
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D(texturePosition, uv);
  }
\`;

// Jacobi distance-constraint relax, structural + shear — identical
// mechanism to the cloth-simulation-basics lesson, reused as-is.
const relaxShader = /* glsl */ \`
  precision highp float;

  uniform sampler2D uPosition;
  uniform sampler2D uInitial;
  uniform vec2 uTexel;
  uniform float uRestStructural;
  uniform float uRestShear;

  vec3 correction(vec3 self, vec2 uv, vec2 offset, float restLen, out float hit) {
    vec2 nUv = uv + offset;
    if (nUv.x < 0.0 || nUv.x > 1.0 || nUv.y < 0.0 || nUv.y > 1.0) {
      hit = 0.0;
      return vec3(0.0);
    }
    vec3 neighbor = texture2D(uPosition, nUv).xyz;
    vec3 delta = neighbor - self;
    float dist = length(delta);
    hit = 1.0;
    if (dist < 1e-5) return vec3(0.0);
    return delta * ((dist - restLen) / dist) * 0.5;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 initial = texture2D(uInitial, uv);
    vec4 data = texture2D(uPosition, uv);
    vec3 pos = data.xyz;

    if (initial.w > 0.5) {
      gl_FragColor = vec4(initial.xyz, data.w);
      return;
    }

    vec3 sum = vec3(0.0);
    float count = 0.0;
    float hit;

    sum += correction(pos, uv, vec2(uTexel.x, 0.0), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, 0.0), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(0.0, uTexel.y), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(0.0, -uTexel.y), uRestStructural, hit); count += hit;

    sum += correction(pos, uv, vec2(uTexel.x, uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(uTexel.x, -uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, -uTexel.y), uRestShear, hit); count += hit;

    vec3 corrected = count > 0.0 ? pos + sum / count : pos;
    gl_FragColor = vec4(corrected, data.w);
  }
\`;

const renderVertex = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform vec2 uTexel;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = texture2D(texturePosition, uv).xyz;

    // TODO 3: recompute the normal from 4 neighbor taps into
    // texturePosition (cross of right-left and up-down deltas) — never
    // reuse the flat plane's baked-in normal attribute, it never changes.
    vec3 n = vec3(0.0, 0.0, 1.0);

    vNormal = normalize(normalMatrix * n);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const renderFragment = /* glsl */ \`
  precision highp float;

  uniform vec3 uLightDir;
  uniform vec3 uFrontColor;
  uniform vec3 uBackColor;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
    float diff = max(dot(n, normalize(uLightDir)), 0.0);

    // TODO 4: two-tone shading by gl_FrontFacing (uFrontColor/uBackColor),
    // mixed with a UV-mapped stripe pattern, both lit by \`diff\`.
    vec3 lit = vec3(diff);

    gl_FragColor = vec4(lit, 1.0);
  }
\`;

function buildInitialTexture(gpu: GPUComputationRenderer): THREE.DataTexture {
  const texture = gpu.createTexture();
  const data = texture.image.data as Float32Array;

  for (let row = 0; row < RES_Y; row++) {
    for (let col = 0; col < RES_X; col++) {
      const i = row * RES_X + col;
      data[i * 4 + 0] = (col / (RES_X - 1)) * FLAG_W;
      data[i * 4 + 1] = (row / (RES_Y - 1)) * FLAG_H - FLAG_H / 2;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = col === 0 ? 1 : 0; // pole edge pinned, every row
    }
  }

  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

interface FlagSim {
  integrateUniforms: { uTime: { value: number }; uWindStrength: { value: number } };
  step: (iterations: number) => THREE.Texture;
  dispose: () => void;
}

function createFlagSim(gl: THREE.WebGLRenderer): FlagSim {
  const gpu = new GPUComputationRenderer(RES_X, RES_Y, gl);
  gpu.setDataType(THREE.HalfFloatType);

  const initialTexture = buildInitialTexture(gpu);
  const texel = new THREE.Vector2(1 / RES_X, 1 / RES_Y);

  const positionVar = gpu.addVariable("texturePosition", integrateShader, initialTexture);
  const prevVar = gpu.addVariable("texturePositionPrev", prevShader, initialTexture);
  gpu.setVariableDependencies(positionVar, [positionVar, prevVar]);
  gpu.setVariableDependencies(prevVar, [positionVar]);

  const integrateUniforms = { uTime: { value: 0 }, uWindStrength: { value: 3.5 } };
  Object.assign(positionVar.material.uniforms, {
    texturePosition: { value: null }, // self-dependency, not auto-wired
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uDt: { value: 1 / 60 },
    uDamping: { value: 0.99 },
    uGravity: { value: new THREE.Vector3(0, -1.6, 0) },
    ...integrateUniforms,
  });

  const error = gpu.init();
  if (error) throw new Error(error);

  const restStructural = FLAG_W / (RES_X - 1);
  const relaxUniforms = {
    uPosition: { value: null as THREE.Texture | null },
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uRestStructural: { value: restStructural },
    uRestShear: { value: restStructural * Math.SQRT2 },
  };
  const relaxMaterial = gpu.createShaderMaterial(relaxShader, relaxUniforms);
  const scratchTargets = [gpu.createRenderTarget(), gpu.createRenderTarget()] as const;

  return {
    integrateUniforms,
    step: (iterations: number) => {
      gpu.compute();

      let source = gpu.getCurrentRenderTarget(positionVar).texture;
      for (let i = 0; i < iterations; i++) {
        const target = scratchTargets[i % 2];
        relaxUniforms.uPosition.value = source;
        gpu.doRenderTarget(relaxMaterial, target);
        source = target.texture;
      }

      // Feed the relaxed result back as "current" so next frame's Verlet
      // implicit velocity is measured against the constraint-satisfied
      // shape, not the raw pre-relax integration candidate.
      gpu.renderTexture(source, gpu.getCurrentRenderTarget(positionVar));
      return gpu.getCurrentRenderTarget(positionVar).texture;
    },
    dispose: () => {
      scratchTargets[0].dispose();
      scratchTargets[1].dispose();
      relaxMaterial.dispose();
      gpu.dispose();
    },
  };
}

export function ClothFlag() {
  const { gl } = useThree();
  const simRef = useRef<FlagSim | null>(null);
  const paramsRef = useRef({ windStrength: 3.5, iterations: 6 });

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(FLAG_W, FLAG_H, RES_X - 1, RES_Y - 1),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const texel = useMemo(() => new THREE.Vector2(1 / RES_X, 1 / RES_Y), []);
  const renderUniforms = useMemo(
    () => ({
      texturePosition: { value: null as THREE.Texture | null },
      uTexel: { value: texel },
      uLightDir: { value: new THREE.Vector3(0.4, 0.6, 0.7) },
      uFrontColor: { value: new THREE.Color(0.85, 0.15, 0.2) },
      uBackColor: { value: new THREE.Color(0.55, 0.08, 0.12) },
    }),
    [texel],
  );

  useEffect(() => {
    const sim = createFlagSim(gl);
    simRef.current = sim;
    return () => {
      sim.dispose();
      simRef.current = null;
    };
  }, [gl]);

  useFrame((state) => {
    const sim = simRef.current;
    if (!sim) return;

    sim.integrateUniforms.uTime.value = state.clock.elapsedTime;
    sim.integrateUniforms.uWindStrength.value = paramsRef.current.windStrength;
    renderUniforms.texturePosition.value = sim.step(paramsRef.current.iterations);
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={renderVertex}
        fragmentShader={renderFragment}
        uniforms={renderUniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const RES_X = 64;
const RES_Y = 48;
const FLAG_W = 3;
const FLAG_H = 2;

const integrateShader = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform sampler2D uInitial; // xyz = rest position, w = pin flag (pole edge)
  uniform vec2 uTexel;
  uniform float uDt;
  uniform float uDamping;
  uniform vec3 uGravity;
  uniform float uWindStrength;
  uniform float uTime;

  float gust(vec2 p, float t) {
    return sin(t * 1.3 + p.y * 1.7) * 0.5
      + sin(t * 0.7 - p.x * 2.3 + 1.7) * 0.3
      + sin(t * 2.1 + p.x * 0.6 + p.y * 0.9) * 0.2;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 initial = texture2D(uInitial, uv);

    if (initial.w > 0.5) {
      gl_FragColor = vec4(initial.xyz, 0.0);
      return;
    }

    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 prev = texture2D(texturePositionPrev, uv).xyz;

    vec3 right = texture2D(texturePosition, uv + vec2(uTexel.x, 0.0)).xyz;
    vec3 left = texture2D(texturePosition, uv - vec2(uTexel.x, 0.0)).xyz;
    vec3 up = texture2D(texturePosition, uv + vec2(0.0, uTexel.y)).xyz;
    vec3 down = texture2D(texturePosition, uv - vec2(0.0, uTexel.y)).xyz;
    vec3 normal = normalize(cross(right - left, up - down) + vec3(0.0, 0.0, 1e-5));

    float g = 0.5 + 0.5 * gust(pos.xy, uTime);
    vec3 windDir = vec3(1.0, 0.0, 0.3);
    vec3 windRaw = windDir * uWindStrength * g;

    // Projected onto the surface normal: only the component of wind that
    // pushes ALONG the face survives, clamped at 0 so wind never "sucks"
    // the cloth from behind — this is what makes it flap, not slide.
    vec3 wind = normal * max(dot(normal, windRaw), 0.0) * length(windRaw);

    vec3 accel = uGravity + wind;

    // Verlet: velocity is implicit in (pos - prev). uDt is a FIXED
    // constant (1/60), never the real per-frame delta — a variable dt
    // would make each step's implicit velocity inconsistent frame to
    // frame, destabilizing the constraint solve even though nothing in
    // the formula itself would "blow up" numerically.
    vec3 next = pos + (pos - prev) * uDamping + accel * uDt * uDt;

    gl_FragColor = vec4(next, 0.0);
  }
\`;

const prevShader = /* glsl */ \`
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D(texturePosition, uv);
  }
\`;

const relaxShader = /* glsl */ \`
  precision highp float;

  uniform sampler2D uPosition;
  uniform sampler2D uInitial;
  uniform vec2 uTexel;
  uniform float uRestStructural;
  uniform float uRestShear;

  vec3 correction(vec3 self, vec2 uv, vec2 offset, float restLen, out float hit) {
    vec2 nUv = uv + offset;
    if (nUv.x < 0.0 || nUv.x > 1.0 || nUv.y < 0.0 || nUv.y > 1.0) {
      hit = 0.0;
      return vec3(0.0);
    }
    vec3 neighbor = texture2D(uPosition, nUv).xyz;
    vec3 delta = neighbor - self;
    float dist = length(delta);
    hit = 1.0;
    if (dist < 1e-5) return vec3(0.0);
    return delta * ((dist - restLen) / dist) * 0.5;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 initial = texture2D(uInitial, uv);
    vec4 data = texture2D(uPosition, uv);
    vec3 pos = data.xyz;

    if (initial.w > 0.5) {
      gl_FragColor = vec4(initial.xyz, data.w);
      return;
    }

    vec3 sum = vec3(0.0);
    float count = 0.0;
    float hit;

    sum += correction(pos, uv, vec2(uTexel.x, 0.0), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, 0.0), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(0.0, uTexel.y), uRestStructural, hit); count += hit;
    sum += correction(pos, uv, vec2(0.0, -uTexel.y), uRestStructural, hit); count += hit;

    sum += correction(pos, uv, vec2(uTexel.x, uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(uTexel.x, -uTexel.y), uRestShear, hit); count += hit;
    sum += correction(pos, uv, vec2(-uTexel.x, -uTexel.y), uRestShear, hit); count += hit;

    vec3 corrected = count > 0.0 ? pos + sum / count : pos;
    gl_FragColor = vec4(corrected, data.w);
  }
\`;

const renderVertex = /* glsl */ \`
  uniform sampler2D texturePosition;
  uniform vec2 uTexel;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = texture2D(texturePosition, uv).xyz;

    vec3 right = texture2D(texturePosition, uv + vec2(uTexel.x, 0.0)).xyz;
    vec3 left = texture2D(texturePosition, uv - vec2(uTexel.x, 0.0)).xyz;
    vec3 up = texture2D(texturePosition, uv + vec2(0.0, uTexel.y)).xyz;
    vec3 down = texture2D(texturePosition, uv - vec2(0.0, uTexel.y)).xyz;
    vec3 n = normalize(cross(right - left, up - down) + vec3(0.0, 0.0, 1e-5));

    vNormal = normalize(normalMatrix * n);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const renderFragment = /* glsl */ \`
  precision highp float;

  uniform vec3 uLightDir;
  uniform vec3 uFrontColor;
  uniform vec3 uBackColor;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
    float diff = max(dot(n, normalize(uLightDir)), 0.0);

    vec3 base = gl_FrontFacing ? uFrontColor : uBackColor;
    float stripe = step(0.5, fract(vUv.x * 6.0));
    vec3 color = mix(base, vec3(0.95, 0.95, 0.9), stripe * 0.35);
    vec3 lit = color * (0.3 + 0.7 * diff);

    gl_FragColor = vec4(lit, 1.0);
  }
\`;

function buildInitialTexture(gpu: GPUComputationRenderer): THREE.DataTexture {
  const texture = gpu.createTexture();
  const data = texture.image.data as Float32Array;

  for (let row = 0; row < RES_Y; row++) {
    for (let col = 0; col < RES_X; col++) {
      const i = row * RES_X + col;
      data[i * 4 + 0] = (col / (RES_X - 1)) * FLAG_W;
      data[i * 4 + 1] = (row / (RES_Y - 1)) * FLAG_H - FLAG_H / 2;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = col === 0 ? 1 : 0; // pole edge pinned, every row
    }
  }

  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

interface FlagSim {
  integrateUniforms: { uTime: { value: number }; uWindStrength: { value: number } };
  step: (iterations: number) => THREE.Texture;
  dispose: () => void;
}

function createFlagSim(gl: THREE.WebGLRenderer): FlagSim {
  const gpu = new GPUComputationRenderer(RES_X, RES_Y, gl);
  gpu.setDataType(THREE.HalfFloatType);

  const initialTexture = buildInitialTexture(gpu);
  const texel = new THREE.Vector2(1 / RES_X, 1 / RES_Y);

  const positionVar = gpu.addVariable("texturePosition", integrateShader, initialTexture);
  const prevVar = gpu.addVariable("texturePositionPrev", prevShader, initialTexture);
  gpu.setVariableDependencies(positionVar, [positionVar, prevVar]);
  gpu.setVariableDependencies(prevVar, [positionVar]);

  const integrateUniforms = { uTime: { value: 0 }, uWindStrength: { value: 3.5 } };
  Object.assign(positionVar.material.uniforms, {
    texturePosition: { value: null }, // self-dependency, not auto-wired
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uDt: { value: 1 / 60 },
    uDamping: { value: 0.99 },
    uGravity: { value: new THREE.Vector3(0, -1.6, 0) },
    ...integrateUniforms,
  });

  const error = gpu.init();
  if (error) throw new Error(error);

  const restStructural = FLAG_W / (RES_X - 1);
  const relaxUniforms = {
    uPosition: { value: null as THREE.Texture | null },
    uInitial: { value: initialTexture },
    uTexel: { value: texel },
    uRestStructural: { value: restStructural },
    uRestShear: { value: restStructural * Math.SQRT2 },
  };
  const relaxMaterial = gpu.createShaderMaterial(relaxShader, relaxUniforms);
  const scratchTargets = [gpu.createRenderTarget(), gpu.createRenderTarget()] as const;

  return {
    integrateUniforms,
    step: (iterations: number) => {
      gpu.compute();

      let source = gpu.getCurrentRenderTarget(positionVar).texture;
      for (let i = 0; i < iterations; i++) {
        const target = scratchTargets[i % 2];
        relaxUniforms.uPosition.value = source;
        gpu.doRenderTarget(relaxMaterial, target);
        source = target.texture;
      }

      gpu.renderTexture(source, gpu.getCurrentRenderTarget(positionVar));
      return gpu.getCurrentRenderTarget(positionVar).texture;
    },
    dispose: () => {
      scratchTargets[0].dispose();
      scratchTargets[1].dispose();
      relaxMaterial.dispose();
      gpu.dispose();
    },
  };
}

export function ClothFlag() {
  const { gl } = useThree();
  const simRef = useRef<FlagSim | null>(null);
  const paramsRef = useRef({ windStrength: 3.5, iterations: 6 });

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(FLAG_W, FLAG_H, RES_X - 1, RES_Y - 1),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const texel = useMemo(() => new THREE.Vector2(1 / RES_X, 1 / RES_Y), []);
  const renderUniforms = useMemo(
    () => ({
      texturePosition: { value: null as THREE.Texture | null },
      uTexel: { value: texel },
      uLightDir: { value: new THREE.Vector3(0.4, 0.6, 0.7) },
      uFrontColor: { value: new THREE.Color(0.85, 0.15, 0.2) },
      uBackColor: { value: new THREE.Color(0.55, 0.08, 0.12) },
    }),
    [texel],
  );

  useEffect(() => {
    const sim = createFlagSim(gl);
    simRef.current = sim;
    return () => {
      sim.dispose();
      simRef.current = null;
    };
  }, [gl]);

  useFrame((state) => {
    const sim = simRef.current;
    if (!sim) return;

    sim.integrateUniforms.uTime.value = state.clock.elapsedTime;
    sim.integrateUniforms.uWindStrength.value = paramsRef.current.windStrength;
    renderUniforms.texturePosition.value = sim.step(paramsRef.current.iterations);
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={renderVertex}
        fragmentShader={renderFragment}
        uniforms={renderUniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}`,
    hints: [
      {
        vi: "`uDt` là hằng số cố định (1/60), KHÔNG lấy từ delta thời gian thực mỗi frame — đổi thành `state.clock.getDelta()` nghe có vẻ 'chính xác' hơn nhưng làm vận tốc ngầm của Verlet không nhất quán giữa các frame, dễ làm constraint-solve mất ổn định dù công thức tích phân tự nó không hề sai.",
        en: "`uDt` is a fixed constant (1/60), NEVER taken from the real per-frame delta — swapping in `state.clock.getDelta()` sounds more 'accurate' but makes Verlet's implicit velocity inconsistent frame to frame, destabilizing the constraint solve even though the integration formula itself isn't wrong.",
      },
      {
        vi: "Gió chiếu lên pháp tuyến nghĩa là chỉ phần lực SONG SONG với bề mặt còn lại: `normal * max(dot(normal, windRaw), 0.0) * length(windRaw)` — cộng thẳng `windRaw` vào gia tốc (bỏ qua bước chiếu) làm cả tấm vải trôi cứng theo một hướng như một khối phẳng, không có cảm giác phần phật.",
        en: "Projecting wind onto the normal means only the force component PARALLEL to the surface survives: `normal * max(dot(normal, windRaw), 0.0) * length(windRaw)` — adding `windRaw` straight into acceleration (skipping the projection) makes the whole sheet drift rigidly in one direction like a flat slab, with no sense of flutter.",
      },
      {
        vi: "Pháp tuyến trong vertex shader hiển thị phải tính lại MỖI FRAME từ `texturePosition` (cross của right-left và up-down) — dùng pháp tuyến gốc của `PlaneGeometry` phẳng sẽ luôn chỉ thẳng ra (0,0,1) bất kể vải biến dạng thế nào, ánh sáng sẽ không bao giờ đổi theo nếp gấp.",
        en: "The normal in the display vertex shader must be recomputed EVERY FRAME from `texturePosition` (cross of right-left and up-down) — using the flat `PlaneGeometry`'s original normal always points straight at (0,0,1) regardless of how the cloth deforms, so lighting never reacts to folds.",
      },
    ],
    checklist: [
      {
        vi: "Lá cờ phần phật thuyết phục theo từng đợt gió (gust lên/xuống rõ ràng), không phồng cứng một khối",
        en: "The flag flutters convincingly through each gust (clearly rising and falling), never puffing up as one rigid mass",
      },
      {
        vi: "Cột cờ (col 0, mọi hàng) đứng yên tuyệt đối trong suốt quá trình chạy",
        en: "The pole edge (col 0, every row) never moves for the entire run",
      },
      {
        vi: "Chạy liên tục 5 phút không có đỉnh nào văng ra xa vô hạn (constraint không nổ)",
        en: "Runs 5 minutes straight with no vertex flying off to infinity (no constraint blowup)",
      },
      {
        vi: "Ánh sáng thể hiện rõ nếp gấp bề mặt — vùng lõm tối hơn, vùng lồi sáng hơn, thay đổi theo thời gian thực",
        en: "Lighting clearly shows surface folds — concave areas darker, convex areas brighter, changing in real time",
      },
      {
        vi: "Sọc kẻ biến dạng đúng theo hình dạng vải hiện tại, không phải một lớp phủ tĩnh đè lên trên",
        en: "The stripe pattern deforms with the cloth's actual current shape, not a static overlay pasted on top",
      },
      {
        vi: "Khung hình giữ ổn định suốt quá trình chạy, không giật cục dù mô phỏng cập nhật mỗi frame",
        en: "Frame rate stays stable throughout the run, no stutter even though the simulation updates every frame",
      },
    ],
  },
];

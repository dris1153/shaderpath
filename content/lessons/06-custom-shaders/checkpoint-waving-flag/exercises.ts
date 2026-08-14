import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-waving-flag",
    kind: "build",
    prompt: {
      vi: `Dựng một component \`WavingFlag\` bằng React Three Fiber: một \`planeGeometry\` (đủ segment để mượt) đóng vai trò lá cờ, ghim tại mép cột cờ (\`uv.x = 0\`) và bay tự do ở mép ngoài (\`uv.x = 1\`).

Vertex shader: kết hợp hai sóng \`sin\` khác tần số/tốc độ, điều khiển bởi ba uniform \`uTime\`, \`uWindStrength\`, \`uAmplitude\`; nhân toàn bộ displacement với \`uv.x\` để mép cột cờ không bao giờ dịch chuyển. Gắn thêm attribute tuỳ biến \`aFlutter\` (một giá trị ngẫu nhiên mỗi vertex, gán qua \`geometry.setAttribute\`) cộng thêm rung tần số cao, cũng nhân với cùng mask \`uv.x\`.

Fragment shader: tô hai màu dạng sọc/gradient dọc \`vUv.x\`, và giả lập ánh sáng bằng đạo hàm giải tích của phần \`sin\` (không dùng \`normalize\`/chia — phải an toàn khi \`uAmplitude = 0\`).

Uniform phải cập nhật bằng cách mutate \`.value\` trong \`useFrame\`/effect, không tạo lại \`ShaderMaterial\` mỗi lần đổi giá trị.`,
      en: `Build a \`WavingFlag\` component in React Three Fiber: a \`planeGeometry\` (enough segments for smoothness) acting as the flag, pinned at the pole edge (\`uv.x = 0\`) and free to move at the outer edge (\`uv.x = 1\`).

Vertex shader: combine two \`sin\` waves of different frequency/speed, driven by three uniforms \`uTime\`, \`uWindStrength\`, \`uAmplitude\`; multiply the whole displacement by \`uv.x\` so the pole edge never moves. Add a custom \`aFlutter\` attribute (one random value per vertex, assigned via \`geometry.setAttribute\`) adding high-frequency jitter, also multiplied by that same \`uv.x\` mask.

Fragment shader: paint two colors as a stripe/gradient along \`vUv.x\`, and fake shading using the analytic derivative of the \`sin\` terms (no \`normalize\`/division — must stay safe when \`uAmplitude = 0\`).

Uniforms must update by mutating \`.value\` inside \`useFrame\`/an effect, never by recreating the \`ShaderMaterial\` on every value change.`,
    },
    starterCode: `"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ \`
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uAmplitude;
  attribute float aFlutter;

  varying vec2 vUv;
  varying float vSlope;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // TODO 1: mask = 0 at the pole edge (uv.x = 0), 1 at the free edge —
    // multiply displacement by this so the pole never moves.
    float mask = 1.0;

    // TODO 2: combine TWO sine waves of different frequency/speed driven by
    // uTime and uWindStrength — a single sine reads as "jelly", not wind.
    float wave = 0.0;

    // TODO 3: add aFlutter-driven high-frequency jitter, masked the same way
    // so the pole edge stays pinned.
    float flutter = 0.0;

    float displacement = (wave + flutter) * uAmplitude * mask;

    // TODO 4: analytic derivative of wave w.r.t. pos.x (chain rule on the
    // sine terms: sin -> cos, scaled by each frequency), scaled the same way
    // as displacement. Must stay finite when uAmplitude = 0.
    float slope = 0.0;

    pos.z += displacement;
    vSlope = slope;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const fragmentShader = /* glsl */ \`
  precision highp float;
  varying vec2 vUv;
  varying float vSlope;

  void main() {
    // TODO 5: two-color stripe/gradient along vUv.x (fract + step, or mix)
    vec3 base = vec3(vUv.x, 0.5, 1.0 - vUv.x);

    // TODO 6: fake shading from vSlope — no normalize(), no division, so it
    // can never produce NaN.
    float shade = 1.0;

    gl_FragColor = vec4(base * shade, 1.0);
  }
\`;

export function WavingFlag() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 1.2, 60, 30);
    // TODO 7: build a Float32Array with one random value per vertex and
    // geo.setAttribute("aFlutter", ...) — length must match position.count.
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindStrength: { value: 2.0 },
      uAmplitude: { value: 0.25 },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}`,
    solutionCode: `"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ \`
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uAmplitude;
  attribute float aFlutter;

  varying vec2 vUv;
  varying float vSlope;

  void main() {
    vUv = uv;

    // Pinned at the pole (uv.x = 0), free to wave at the tip (uv.x = 1)
    float mask = uv.x;

    // Two sine waves at different frequency/speed read as wind, not a
    // single metronome beat.
    float k1 = 3.0;
    float k2 = 7.0;
    float phase1 = position.x * k1 + uTime * uWindStrength;
    float phase2 = position.x * k2 - uTime * uWindStrength * 1.7;
    float wave = sin(phase1) * 0.6 + sin(phase2) * 0.4;

    // High-frequency per-vertex jitter, masked the same way so the pole
    // edge stays put regardless of flutter strength.
    float flutter = aFlutter * sin(uTime * 9.0 + aFlutter * 40.0) * 0.15;

    float displacement = (wave + flutter) * uAmplitude * mask;

    // d(wave)/d(position.x) via the chain rule (sin -> cos, times each
    // frequency) — never divides or normalizes, so it can't produce NaN
    // even when uAmplitude/mask push displacement to exactly 0.
    float slope =
      (cos(phase1) * k1 * 0.6 + cos(phase2) * k2 * 0.4) * uAmplitude * mask;

    vec3 pos = position;
    pos.z += displacement;
    vSlope = slope;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const fragmentShader = /* glsl */ \`
  precision highp float;
  varying vec2 vUv;
  varying float vSlope;

  void main() {
    // Vertical stripes along the flag's length
    float stripe = step(0.5, fract(vUv.x * 6.0));
    vec3 colorA = vec3(0.85, 0.15, 0.2);
    vec3 colorB = vec3(0.95, 0.95, 0.92);
    vec3 base = mix(colorA, colorB, stripe);

    // Fake shading from the analytic slope: cos(0) = 1, so a flat patch
    // (slope = 0) is simply fully lit — no lighting model required.
    float shade = 0.55 + 0.45 * cos(vSlope);

    gl_FragColor = vec4(base * shade, 1.0);
  }
\`;

export function WavingFlag() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 1.2, 60, 30);
    const count = geo.attributes.position!.count;
    const flutter = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      flutter[i] = Math.random() * 2 - 1; // per-vertex noise seed in [-1, 1]
    }
    geo.setAttribute("aFlutter", new THREE.BufferAttribute(flutter, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindStrength: { value: 2.0 },
      uAmplitude: { value: 0.25 },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}`,
    hints: [
      {
        vi: "`uv.x` chạy 0→1 dọc chiều rộng plane — nhân displacement với `uv.x` ghim mép cột cờ (mask=0) trong khi mép ngoài (mask=1) nhận trọn vẹn chuyển động. Chỉ mask phần z-displacement, đừng đụng vào `position.x`.",
        en: "`uv.x` runs 0→1 along the plane's width — multiplying displacement by `uv.x` pins the pole edge (mask=0) while the free edge (mask=1) gets full motion. Only mask the z-displacement, don't touch `position.x`.",
      },
      {
        vi: "Không cần `dFdx`/`normalize` để giả shading: vì `z = mask * amplitude * (sin(phase1)*0.6 + sin(phase2)*0.4)`, đạo hàm theo x chính là biểu thức đó với `sin` đổi thành `cos`, mỗi số hạng nhân thêm tần số của nó (đạo hàm chuỗi) — đưa slope đó vào fragment và dùng `cos(slope)` trực tiếp, không có phép chia nào cả.",
        en: "You don't need `dFdx`/`normalize()` to fake shading: since `z = mask * amplitude * (sin(phase1)*0.6 + sin(phase2)*0.4)`, its slope w.r.t. x is that same expression with `sin` swapped for `cos`, each term scaled by its own frequency (chain rule) — pass that slope to the fragment shader and use `cos(slope)` directly, no division involved.",
      },
      {
        vi: "Thêm `attribute float aFlutter;` vào source vertex shader, rồi bên ngoài gọi `geometry.setAttribute(\"aFlutter\", new THREE.BufferAttribute(...))` với đúng một float cho mỗi vertex (bằng `position.count`) — Three khớp attribute theo TÊN, không theo thứ tự khai báo.",
        en: "Add `attribute float aFlutter;` to the vertex shader source, then outside of it call `geometry.setAttribute(\"aFlutter\", new THREE.BufferAttribute(...))` with exactly one float per vertex (matching `position.count`) — Three matches attributes by NAME, not declaration order.",
      },
    ],
    checklist: [
      {
        vi: "Mép cột cờ (uv.x = 0) đứng yên tuyệt đối bất kể uWindStrength/uAmplitude/uTime là gì",
        en: "The pole edge (uv.x = 0) never moves regardless of uWindStrength/uAmplitude/uTime",
      },
      {
        vi: "Chuyển động trông như gió (nhiều tần số chồng lên nhau) chứ không phải \"cờ thạch\" lắc đều một nhịp",
        en: "The motion reads as wind (multiple frequencies layered) rather than a \"jello flag\" bobbing on a single beat",
      },
      {
        vi: "uTime/uWindStrength/uAmplitude cập nhật mỗi frame bằng cách mutate `.value`, không tạo lại ShaderMaterial",
        en: "uTime/uWindStrength/uAmplitude update every frame by mutating `.value`, never by recreating the ShaderMaterial",
      },
      {
        vi: "Rung aFlutter nhìn rõ khi zoom gần, phân biệt được với hai sóng chính",
        en: "aFlutter jitter is clearly visible up close, distinguishable from the two main waves",
      },
      {
        vi: "Đặt uAmplitude = 0 cho lá cờ phẳng, tô màu bình thường — không NaN, không chớp hình đen",
        en: "Setting uAmplitude = 0 produces a flat, normally-shaded flag — no NaN, no black flashing",
      },
    ],
  },
];

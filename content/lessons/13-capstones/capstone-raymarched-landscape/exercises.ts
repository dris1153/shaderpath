import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-raymarched-landscape",
    kind: "build",
    prompt: {
      vi: `Dựng \`RaymarchedLandscapeApp\`: một địa hình vô hạn hoàn toàn bằng fullscreen fragment shader — FBM heightfield, bầu trời + sương mù, camera bay, và một hệ thống quality tier là công dân hạng nhất chứ không phải thêm sau cùng. \`starterCode\` đã dựng khung: thư viện hash/noise/fbm, các hàm \`terrainHeight\`/\`raymarchTerrain\`/\`terrainNormal\`/\`skyColor\` dạng placeholder, một camera tĩnh, và một component R3F rỗng — việc của bạn là lấp 6 TODO theo đúng 6 mốc.

Mốc 1 (TODO 1): xác nhận ray setup đúng bằng march thử — \`terrainHeight\` placeholder trả về hằng số 0 nên \`raymarchTerrain\` lúc này chỉ cần tìm đúng giao điểm với mặt phẳng \`y = 0\`. Mốc 2 (TODO 2): thay \`terrainHeight\` bằng FBM thật, cài đặt \`raymarchTerrain\` theo kỹ thuật terrain-marching (bước tăng dần rồi nhị phân tinh chỉnh — KHÔNG phải sphere tracing), \`terrainNormal\` bằng gradient, và Lambertian shading cơ bản. Mốc 3 (TODO 3): \`skyColor\` thật cộng sương mù hàm mũ. Mốc 4 (TODO 4): thay camera tĩnh bằng một quỹ đạo bay (gợi ý: đường tròn cộng bob nhẹ, không phải đường thẳng đơn thuần). Mốc 5 (TODO 5): một object \`TIERS\` (\`low\`/\`mid\`/\`high\`) điều khiển \`uMaxSteps\`/\`uOctaves\`/độ phân giải (qua \`dpr\` của \`Canvas\`) — mọi nơi khác trong file chỉ đọc config, không rẽ nhánh theo tên tier. Mốc 6 (TODO 6): \`TierWatchdog\` — benchmark \`PROBE_FRAMES\` khung hình đầu bằng chính shader này để chọn tier khởi điểm, rồi một watchdog EMA có hysteresis (\`HYSTERESIS_SAMPLES\` mẫu liên tiếp mới đổi tier) — cộng viết quy trình xác nhận bằng CPU throttle ngay trong comment.`,
      en: `Build \`RaymarchedLandscapeApp\`: a fully infinite landscape in a single fullscreen fragment shader — an FBM heightfield, sky + fog, a flying camera, and a quality-tier system as a first-class citizen, not bolted on at the end. \`starterCode\` already scaffolds it: the hash/noise/fbm library, placeholder \`terrainHeight\`/\`raymarchTerrain\`/\`terrainNormal\`/\`skyColor\` functions, a static camera, and an empty R3F component — your job is filling 6 TODOs matching the 6 milestones.

Milestone 1 (TODO 1): confirm the ray setup is correct with a test march — the \`terrainHeight\` placeholder returns a constant 0, so \`raymarchTerrain\` only needs to find the correct intersection with the \`y = 0\` plane for now. Milestone 2 (TODO 2): swap \`terrainHeight\` for real FBM, implement \`raymarchTerrain\` with the terrain-marching technique (growing steps then bisection refine — NOT sphere tracing), \`terrainNormal\` via gradient, and basic Lambertian shading. Milestone 3 (TODO 3): a real \`skyColor\` plus exponential fog. Milestone 4 (TODO 4): replace the static camera with a flight path (hint: a circular orbit plus a gentle bob, not a plain straight line). Milestone 5 (TODO 5): a \`TIERS\` object (\`low\`/\`mid\`/\`high\`) driving \`uMaxSteps\`/\`uOctaves\`/resolution (via \`Canvas\`'s \`dpr\`) — everywhere else in the file only reads the config, never branches by tier name. Milestone 6 (TODO 6): \`TierWatchdog\` — benchmark the first \`PROBE_FRAMES\` frames on this actual shader to pick a starting tier, then an EMA watchdog with hysteresis (\`HYSTERESIS_SAMPLES\` consecutive samples required before switching) — plus writing the CPU-throttle verification procedure directly as a comment.`,
    },
    starterCode: `"use client";
// SCAFFOLD -- 6 milestones, 6 TODOs. Fill each one in order; the shader
// reuses the SAME raymarchTerrain scaffold across TODO 1 and TODO 2, and
// the R3F side only gets a tier system once the shader itself works.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

// TODO 5: TierConfig shape + a TIERS: Record<Tier, TierConfig> object
// controlling maxSteps/octaves/dpr -- same "one config object" pattern as
// the adaptive-quality-tiers lesson (Track 12). Nothing else in this file
// should branch on tier by name once this exists.

const vertexShader = /* glsl */ \`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
\`;

const fragmentShader = /* glsl */ \`
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 34.45);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  const float MAX_HEIGHT = 3.2;

  // TODO 2: replace this constant-0 placeholder with
  // fbm(p * 0.15) * MAX_HEIGHT - 0.6
  float terrainHeight(vec2 p) {
    return 0.0;
  }

  // TODO 1: implement enough of this to find where a ray crosses y = 0
  // (terrainHeight is still a constant-0 placeholder, so this is really
  // just a flat-plane test right now). TODO 2 swaps in the real FBM
  // heightfield and needs the SAME function to still work correctly:
  // grow t in a loop until p.y - terrainHeight(p.xz) goes negative, THEN
  // bisection-refine between the last two t values (see the
  // iquilezles-terrainmarching reference -- NOT sphere tracing, a
  // heightfield has no true SDF).
  float raymarchTerrain(vec3 ro, vec3 rd, float tMax) {
    return -1.0;
  }

  // TODO 2: central-difference gradient, same shape as
  // sdf-normals-from-gradient (Track 8).
  vec3 terrainNormal(vec2 p) {
    return vec3(0.0, 1.0, 0.0);
  }

  // TODO 3: cheap gradient sky + sun glow (pow(sunAmount, N) term).
  vec3 skyColor(vec3 rd, vec3 sun) {
    return vec3(0.6, 0.7, 0.85);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    vec3 sun = normalize(vec3(0.5, 0.35, 0.4));

    // TODO 4: replace this static camera with a flight path (circular
    // orbit + gentle bob is the suggested shape) -- leave it static while
    // TODO 1/2/3 land, upgrade it last.
    vec3 ro = vec3(0.0, 3.2, 6.0);
    vec3 fwd = normalize(vec3(0.0, -0.3, -1.0));
    vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, fwd);
    vec3 rd = normalize(uv.x * right + uv.y * up + 1.4 * fwd);

    vec3 sky = skyColor(rd, sun);
    vec3 color = sky;

    if (true) { // TODO 1: bounded march interval, see the hint
      float t = raymarchTerrain(ro, rd, 60.0);
      if (t > 0.0) {
        vec3 p = ro + rd * t;
        vec3 n = terrainNormal(p.xz);
        float diff = max(dot(n, sun), 0.0);

        // TODO 2: real Lambertian shading + height/slope coloring instead
        // of this flat placeholder gray.
        vec3 lit = vec3(0.5) * (0.25 + 0.75 * diff);

        // TODO 3: blend "lit" toward an exponential height-fog color.
        color = lit;
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
\`;

function LandscapeScene() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // TODO 5: uMaxSteps / uOctaves uniforms, driven by the active tier.
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uResolution.value.set(state.gl.domElement.width, state.gl.domElement.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

// TODO 6: benchmark this shader for PROBE_FRAMES frames (EMA of useFrame's
// delta) to pick a starting tier, then keep watching with hysteresis --
// require several consecutive bad/good samples before switching tier, so a
// single GC hiccup doesn't flip-flop it back and forth. Once TODO 5 exists,
// this component takes a \`setTier: (t: Tier) => void\` prop and calls it.
function TierWatchdog() {
  const emaRef = useRef(0);
  useFrame((_state, delta) => {
    const ms = delta * 1000;
    emaRef.current = emaRef.current === 0 ? ms : emaRef.current * 0.9 + ms * 0.1;
  });
  return null;
}

export function RaymarchedLandscapeApp() {
  // TODO 5: add tier state (type Tier = "low" | "mid" | "high") plus a
  // TIERS: Record<Tier, TierConfig> object -- one config controlling
  // maxSteps/octaves/dpr, read here and threaded into LandscapeScene's
  // uniforms and Canvas's dpr prop. Nothing else should branch on tier name.
  return (
    <Canvas orthographic camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 }}>
      <TierWatchdog />
      <LandscapeScene />
    </Canvas>
  );
}

// TODO 6: write the verification procedure here -- what to check with
// DevTools CPU throttle 4x/6x, and what "hysteresis is working" looks like
// on screen (tier settles, doesn't oscillate every frame).`,
    solutionCode: `"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

type Tier = "low" | "mid" | "high";

interface TierConfig {
  maxSteps: number;
  octaves: number;
  dpr: [number, number];
}

// Milestone 5: ONE config object -- every tier's max march steps, FBM
// octave count, and resolution scale (DPR is this project's lever for it,
// same convention as adaptive-quality-tiers) lives here. Nothing else in
// this file branches on tier by name.
const TIERS: Record<Tier, TierConfig> = {
  low: { maxSteps: 48, octaves: 3, dpr: [1, 1] },
  mid: { maxSteps: 72, octaves: 4, dpr: [1, 1.5] },
  high: { maxSteps: 100, octaves: 5, dpr: [1, 2] },
};

const PROBE_FRAMES = 16;
const EMA_ALPHA = 0.1;
const GOOD_MS = 12; // comfortably under the 16.6ms/frame 60fps budget
const BAD_MS = 22;
const HYSTERESIS_SAMPLES = 8;

const vertexShader = /* glsl */ \`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
\`;

const fragmentShader = /* glsl */ \`
  uniform float uTime;
  uniform vec2 uResolution;
  uniform int uMaxSteps;
  uniform int uOctaves;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 34.45);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Milestone 5: octave count is a UNIFORM -- low tier runs a cheaper FBM.
  // A constant loop bound (6) with an early break stays portable across
  // GPUs that dislike fully dynamic loop bounds, while still letting the
  // tier control the real iteration count.
  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= uOctaves) break;
      sum += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  const float MAX_HEIGHT = 3.2;

  float terrainHeight(vec2 p) {
    return fbm(p * 0.15) * MAX_HEIGHT - 0.6;
  }

  // Milestone 2: Quilez terrain-marching pattern (see references) -- growing
  // steps, then a bisection refine once the ray crosses from above to below
  // the surface. NOT sphere tracing: a heightfield has no true SDF.
  float raymarchTerrain(vec3 ro, vec3 rd, float tMax) {
    float t = 0.1;
    float prevT = t;
    for (int i = 0; i < 128; i++) {
      if (i >= uMaxSteps || t > tMax) return -1.0;
      vec3 p = ro + rd * t;
      float diff = p.y - terrainHeight(p.xz);
      if (diff < 0.0) {
        float lo = prevT;
        float hi = t;
        for (int j = 0; j < 10; j++) {
          float mid = 0.5 * (lo + hi);
          vec3 pm = ro + rd * mid;
          float dm = pm.y - terrainHeight(pm.xz);
          if (dm < 0.0) { hi = mid; } else { lo = mid; }
        }
        return 0.5 * (lo + hi);
      }
      prevT = t;
      t += max(0.05, t * 0.03) * clamp(diff, 0.3, 4.0);
    }
    return -1.0;
  }

  vec3 terrainNormal(vec2 p) {
    vec2 e = vec2(0.05, 0.0);
    float hL = terrainHeight(p - e.xy);
    float hR = terrainHeight(p + e.xy);
    float hD = terrainHeight(p - e.yx);
    float hU = terrainHeight(p + e.yx);
    return normalize(vec3(hL - hR, 2.0 * e.x, hD - hU));
  }

  // Milestone 3: cheap gradient sky + sun glow (see fog-and-atmospheric-
  // scattering for how far this is from a real Rayleigh/Mie model).
  vec3 skyColor(vec3 rd, vec3 sun) {
    vec3 col = vec3(0.55, 0.7, 0.92) - rd.y * 0.35;
    float sunAmount = max(dot(rd, sun), 0.0);
    col += vec3(1.0, 0.75, 0.45) * pow(sunAmount, 12.0) * 0.8;
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    vec3 sun = normalize(vec3(0.5, 0.35, 0.4));

    // Milestone 4: circular flythrough instead of a straight line -- a
    // radius orbit plus a slow vertical bob, always looking ahead along
    // the tangent of the circle.
    float angle = uTime * 0.15;
    vec3 ro = vec3(cos(angle) * 6.0, 3.2 + sin(uTime * 0.3) * 0.4, sin(angle) * 6.0);
    vec3 tangent = vec3(-sin(angle), 0.0, cos(angle));
    vec3 target = ro + tangent * 2.0 - vec3(0.0, 0.6, 0.0);
    vec3 fwd = normalize(target - ro);
    vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, fwd);
    vec3 rd = normalize(uv.x * right + uv.y * up + 1.4 * fwd);

    vec3 sky = skyColor(rd, sun);
    vec3 color = sky;

    // Milestone 1: bounded march interval -- camera above MAX_HEIGHT with a
    // ray pointing level/up can never hit the terrain, skip the march.
    bool canHit = !(ro.y > MAX_HEIGHT && rd.y >= 0.0);

    if (canHit) {
      float t = raymarchTerrain(ro, rd, 60.0);
      if (t > 0.0) {
        vec3 p = ro + rd * t;
        vec3 n = terrainNormal(p.xz);
        float diff = max(dot(n, sun), 0.0);
        float slope = 1.0 - n.y;

        vec3 grass = vec3(0.3, 0.5, 0.25);
        vec3 rock = vec3(0.42, 0.38, 0.34);
        vec3 snow = vec3(0.96, 0.97, 1.0);
        vec3 base = mix(grass, rock, smoothstep(0.15, 0.45, slope));
        float snowMask = smoothstep(1.5, 2.1, p.y) * (1.0 - smoothstep(0.25, 0.55, slope));
        base = mix(base, snow, snowMask);

        vec3 lit = base * (0.25 + 0.75 * diff);

        // Milestone 3: exponential height fog, warming toward the sun.
        float sunAmount = max(dot(rd, sun), 0.0);
        float fog = 1.0 - exp(-t * 0.045);
        vec3 fogColor = mix(sky, vec3(1.0, 0.8, 0.6), sunAmount * 0.6);
        color = mix(lit, fogColor, fog);
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
\`;

function LandscapeScene({ tier }: { tier: Tier }) {
  const config = TIERS[tier];

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMaxSteps: { value: config.maxSteps },
      uOctaves: { value: config.octaves },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uMaxSteps.value = config.maxSteps;
    uniforms.uOctaves.value = config.octaves;
  }, [uniforms, config]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uResolution.value.set(state.gl.domElement.width, state.gl.domElement.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

// Milestone 5 + 6: benchmark the REAL shader (not a navigator guess) for the
// first PROBE_FRAMES frames to pick a starting tier, then a frame-time
// watchdog with hysteresis -- HYSTERESIS_SAMPLES consecutive bad/good
// samples required before switching -- so one GC hiccup or asset stall
// doesn't flip-flop the tier back and forth every second.
function TierWatchdog({ tier, setTier }: { tier: Tier; setTier: (t: Tier) => void }) {
  const emaRef = useRef(0);
  const streakRef = useRef(0);
  const probeFramesRef = useRef(0);
  const probedRef = useRef(false);

  useFrame((_state, delta) => {
    const ms = delta * 1000;
    // ema_t = alpha * dt + (1 - alpha) * ema_{t-1} -- same formula as
    // adaptive-quality-tiers (Track 12).
    emaRef.current = emaRef.current === 0 ? ms : emaRef.current * (1 - EMA_ALPHA) + ms * EMA_ALPHA;

    if (!probedRef.current) {
      probeFramesRef.current += 1;
      if (probeFramesRef.current >= PROBE_FRAMES) {
        probedRef.current = true;
        setTier(emaRef.current < GOOD_MS ? "high" : emaRef.current < BAD_MS ? "mid" : "low");
        streakRef.current = 0;
      }
      return;
    }

    if (emaRef.current > BAD_MS) {
      streakRef.current = streakRef.current <= 0 ? streakRef.current - 1 : -1;
      if (streakRef.current <= -HYSTERESIS_SAMPLES) {
        setTier(tier === "high" ? "mid" : "low");
        streakRef.current = 0;
      }
    } else if (emaRef.current < GOOD_MS) {
      streakRef.current = streakRef.current >= 0 ? streakRef.current + 1 : 1;
      if (streakRef.current >= HYSTERESIS_SAMPLES) {
        setTier(tier === "low" ? "mid" : "high");
        streakRef.current = 0;
      }
    } else {
      streakRef.current = 0;
    }
  });

  return null;
}

export function RaymarchedLandscapeApp() {
  // Probing starts at "high" (worst-case cost) on purpose: the benchmark
  // needs to measure the real load before deciding whether to back off.
  const [tier, setTier] = useState<Tier>("high");
  const config = TIERS[tier];

  return (
    <Canvas
      dpr={config.dpr}
      orthographic
      camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 }}
    >
      <TierWatchdog tier={tier} setTier={setTier} />
      <LandscapeScene tier={tier} />
    </Canvas>
  );
}

// VERIFICATION (part of this build, not optional):
// 1. No throttle: mount RaymarchedLandscapeApp -- after ~PROBE_FRAMES probe
//    frames the tier should settle to "high" (or "mid" on a slower dev GPU).
// 2. DevTools -> Performance tab -> gear icon -> CPU: 4x slowdown -> Record
//    5s -> Stop -- confirm the tier drops to "mid"/"low" within a couple
//    seconds, and does NOT oscillate every frame (hysteresis absorbing it).
// 3. Repeat at CPU: 6x slowdown -- tier should settle at "low" and STAY
//    there (frame time stays above BAD_MS even at the cheapest config).
// 4. Remove throttling -- the tier climbs back up only after
//    HYSTERESIS_SAMPLES consecutive good frames, never instantly.`,
    hints: [
      {
        vi: "\`raymarchTerrain\` dùng CHUNG một scaffold cho cả TODO 1 và TODO 2 — với \`terrainHeight\` placeholder trả về 0, thuật toán growing-step + bisection-refine của TODO 1 chỉ cần tìm đúng giao điểm với mặt phẳng phẳng; khi TODO 2 thay \`terrainHeight\` bằng FBM thật, thuật toán march KHÔNG cần đổi logic, chỉ hàm nó gọi đổi. Nếu TODO 1 chưa march đúng mặt phẳng, đừng chuyển sang TODO 2.",
        en: "\`raymarchTerrain\` shares ONE scaffold across TODO 1 and TODO 2 — with the \`terrainHeight\` placeholder returning 0, TODO 1's growing-step + bisection-refine algorithm only needs to find the correct flat-plane intersection; when TODO 2 swaps in real FBM, the march algorithm's LOGIC doesn't change, only the function it calls does. Don't move to TODO 2 until TODO 1 correctly marches the flat plane.",
      },
      {
        vi: "\`uMaxSteps\`/\`uOctaves\` là uniform \`int\`, nhưng vòng lặp GLSL vẫn dùng cận CỐ ĐỊNH (\`for (int i = 0; i < 128; i++)\`) cộng \`if (i >= uMaxSteps) return -1.0;\`/\`break\` bên trong — không viết \`for (int i = 0; i < uMaxSteps; i++)\` trực tiếp, một số driver GPU xử lý cận vòng lặp không phải hằng số kém hơn nhiều.",
        en: "\`uMaxSteps\`/\`uOctaves\` are \`int\` uniforms, but the GLSL loop still uses a CONSTANT bound (\`for (int i = 0; i < 128; i++)\`) plus \`if (i >= uMaxSteps) return -1.0;\`/\`break\` inside it — don't write \`for (int i = 0; i < uMaxSteps; i++)\` directly, some GPU drivers handle non-constant loop bounds noticeably worse.",
      },
      {
        vi: "Watchdog chỉ được đổi tier sau đúng \`HYSTERESIS_SAMPLES\` mẫu XẤU (hoặc TỐT) LIÊN TIẾP — dùng một bộ đếm streak riêng (âm cho xấu, dương cho tốt), reset về 0 ngay khi frame time quay lại vùng trung tính. Đổi tier ngay sau một mẫu xấu duy nhất là chính lỗi hysteresis bài \`adaptive-quality-tiers\` đã cảnh báo.",
        en: "The watchdog may only switch tier after exactly \`HYSTERESIS_SAMPLES\` consecutive BAD (or GOOD) samples — use a dedicated streak counter (negative for bad, positive for good), resetting to 0 the moment frame time returns to the neutral zone. Switching tier after a single bad sample is exactly the hysteresis mistake the \`adaptive-quality-tiers\` lesson warns about.",
      },
    ],
    checklist: [
      {
        vi: "Địa hình march đúng, không có lỗ thủng ở đường viền núi (silhouette) ở tốc độ march bình thường",
        en: "The terrain marches correctly with no holes along the mountain silhouette at normal marching speed",
      },
      {
        vi: "Bầu trời phía trên độ cao tối đa của địa hình bỏ qua march hoàn toàn nhờ \`canHit\` — không giật hình khi camera hướng lên",
        en: "The sky above the terrain's max height skips marching entirely thanks to \`canHit\` — no stutter when the camera points upward",
      },
      {
        vi: "Sương mù hàm mũ bán được cảm giác chiều sâu — địa hình xa mờ dần vào màu ấm gần mặt trời, không phải lớp mù đều toàn cảnh",
        en: "The exponential fog genuinely sells depth — distant terrain fades into a warm tone near the sun, not a flat uniform haze",
      },
      {
        vi: "Camera bay theo quỹ đạo mượt (không phải đường thẳng cố định), giữ ổn định suốt cảnh",
        en: "The camera flies along a smooth trajectory (not a fixed straight line), staying stable throughout",
      },
      {
        vi: "\`TIERS\` là MỘT object cấu hình — không có \`if (tier === \"low\")\` nào rải rác trong shader hay component ngoài chính \`TIERS\`",
        en: "\`TIERS\` is ONE config object — no \`if (tier === \"low\")\` scattered through the shader or component outside of \`TIERS\` itself",
      },
      {
        vi: "Tier khởi điểm được chọn từ benchmark đo trên chính shader này (EMA sau \`PROBE_FRAMES\` khung hình), không phải đoán qua \`navigator.hardwareConcurrency\` hay chuỗi GPU",
        en: "The starting tier is chosen from a benchmark measured on this actual shader (an EMA after \`PROBE_FRAMES\` frames), not guessed from \`navigator.hardwareConcurrency\` or a GPU string",
      },
      {
        vi: "Watchdog không nhấp nháy qua lại giữa hai tier khi frame time dập dềnh quanh ngưỡng — hysteresis (\`HYSTERESIS_SAMPLES\` mẫu liên tiếp) hấp thụ nhiễu ngắn hạn",
        en: "The watchdog doesn't flip-flop between two tiers when frame time hovers near a threshold — hysteresis (\`HYSTERESIS_SAMPLES\` consecutive samples) absorbs short-term noise",
      },
      {
        vi: "Dưới CPU throttle 4× và 6× (DevTools), tier tự hạ và giữ ổn định thay vì đơ cứng hoặc nhấp nháy — quy trình xác nhận được viết thành comment ngay trong file",
        en: "Under 4× and 6× CPU throttle (DevTools), the tier drops on its own and stays stable instead of locking up or flickering — the verification procedure is written as a comment directly in the file",
      },
    ],
  },
];

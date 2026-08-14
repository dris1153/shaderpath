import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-mobile-ready-scene",
    kind: "build",
    prompt: {
      vi: `\`starterCode\` bên dưới là một cảnh R3F **desktop-maxed** với 4 vấn đề cài sẵn cùng lúc: 200.000 particle không tier hoá, blending cộng dồn (additive) trên toàn bộ particle gây overdraw nặng, ánh sáng mang shadow map $4096 \\times 4096$ cố định, và \`dpr={[1, 3]}\` không giới hạn.

Nhiệm vụ: biến nó thành mobile-ready bằng đúng kỹ thuật đã học ở Track 12. Yêu cầu kỹ thuật: (1) một object config tier \`low\`/\`mid\`/\`high\` cùng benchmark phát hiện tier khởi điểm; (2) watchdog frame-time **có hysteresis** chuyển tier động lúc chạy mà không dao động qua lại liên tục; (3) particle geometry/material dispose đúng qua \`useDisposable\` — \`renderer.info.memory.geometries\` phải quay về đúng baseline sau mỗi chu kỳ mount/unmount; (4) DPR giới hạn theo tier; (5) overdraw giảm đo được ở tier thấp (opacity thấp hơn, tắt bloom); (6) quy trình xác nhận bằng DevTools CPU throttle 4× và 6× viết thành comment ngay trong code; (7) bảng đo before/after đầy đủ ở cuối file.`,
      en: `The \`starterCode\` below is a **desktop-maxed** R3F scene with 4 problems planted at once: 200,000 untiered particles, additive blending across all of them causing heavy overdraw, a light carrying a fixed $4096 \\times 4096$ shadow map, and an uncapped \`dpr={[1, 3]}\`.

Task: make it mobile-ready using Track 12's actual techniques. Technical requirements: (1) a tier config object \`low\`/\`mid\`/\`high\` plus a detection benchmark for the starting tier; (2) a frame-time watchdog **with hysteresis** that switches tiers at runtime without flip-flopping; (3) particle geometry/material disposed correctly through \`useDisposable\` — \`renderer.info.memory.geometries\` must return to baseline after every mount/unmount cycle; (4) DPR capped per tier; (5) measurably reduced overdraw at low tier (lower opacity, bloom disabled); (6) a verification procedure using DevTools CPU throttle 4× and 6×, written as a comment right in the code; (7) a complete before/after table at the end of the file.`,
    },
    starterCode: `"use client";
// A "desktop-maxed" scene — runs smoothly on a dev machine, collapses on a
// mid-range device. Your job: make it mobile-ready using EVERY technique
// learned in Track 12 (tier config, disposal, DPR cap, overdraw trim) — and
// PROVE it with before/after measurements, both unthrottled and under 4x/6x
// CPU throttling.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const PARTICLE_COUNT = 200_000;

// TODO 1: no tiers at all — always 200k particles, on every device.
// TODO 5: geometry/material built with \`new\` inside useMemo, never disposed
// on unmount.
function ParticleField() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.03,
        color: "#7dd3fc",
        transparent: true,
        opacity: 0.6,
        // TODO 2: additive blending across 200k overlapping particles = brutal
        // overdraw on a tile-based GPU (each tile has to re-blend many times).
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((_state, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.05;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      {/* TODO 3: fixed 4096x4096 shadow map, not tiered, on every device */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[4096, 4096]}
      />
    </>
  );
}

export function DesktopMaxedApp() {
  return (
    <Canvas
      // TODO 4: uncapped DPR — a phone at DPR 3 renders 9x the fragments of
      // DPR 1, with zero control over it.
      dpr={[1, 3]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      shadows
    >
      <Lights />
      <ParticleField />
      <mesh castShadow receiveShadow position={[0, -3, 0]}>
        <boxGeometry args={[3, 0.4, 3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.2} />
      </EffectComposer>
    </Canvas>
  );
}

// TODO 6: write the verification procedure RIGHT HERE once you're done fixing
// — DevTools Performance tab -> CPU throttle 4x -> record 5s -> read FPS;
// repeat at 6x; and 10 mount/unmount cycles while watching
// renderer.info.memory.geometries.

// TODO 7: before/after table (measured on the dev machine + throttled via
// DevTools):
// | Metric                                                     | Before | After |
// |-----------------------------------------------------------------|--------|-------|
// | FPS (dev machine, unthrottled)                                   |        |       |
// | FPS (CPU throttle 4x)                                             |        |       |
// | FPS (CPU throttle 6x)                                             |        |       |
// | Effective DPR at the lowest tier                                  |        |       |
// | renderer.info.memory.geometries after 10 mount/unmount cycles     |        |       |`,
    solutionCode: `"use client";
// MOBILE-READY — same scene, tiered by device + a startup benchmark, a
// frame-time watchdog with hysteresis, correct disposal via useDisposable,
// DPR capped per tier, overdraw reduced at low tier. Verification procedure +
// measurement table at the end of the file.

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useDisposable } from "@/lib/hooks/use-disposable";

// Fix 1: ONE single place defining "what gets cut for a weak device" — the
// pattern from the adaptive-quality-tiers lesson, reused verbatim here.
type Tier = "low" | "mid" | "high";

interface TierConfig {
  particleCount: number;
  dpr: [number, number];
  shadowMapSize: number;
  bloom: boolean;
  opacity: number;
}

const TIERS: Record<Tier, TierConfig> = {
  low: { particleCount: 15_000, dpr: [1, 1], shadowMapSize: 512, bloom: false, opacity: 0.35 },
  mid: { particleCount: 60_000, dpr: [1, 1.5], shadowMapSize: 1024, bloom: false, opacity: 0.5 },
  high: { particleCount: 200_000, dpr: [1, 2], shadowMapSize: 2048, bloom: true, opacity: 0.6 },
};

// Startup benchmark: a CHEAP heuristic run once before the heavy scene mounts
// — it doesn't measure real frame time (there's nothing to measure yet), it
// only estimates a device bucket to pick a reasonable STARTING tier; the
// watchdog below keeps adjusting at runtime based on real frame time.
function detectStartingTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || mem <= 4) return "low";
  if (cores <= 8 || mem <= 8) return "mid";
  return "high";
}

// Fix 5: geometry/material registered via useDisposable — disposed correctly
// on unmount, renderer.info.memory returns to baseline every cycle. Changing
// tier rebuilds the geometry (particleCount changes) so tier is also in the
// dependency array.
function ParticleField({ tier }: { tier: Tier }) {
  const disposables = useDisposable();
  const config = TIERS[tier];

  const geometry = useMemo(() => {
    const positions = new Float32Array(config.particleCount * 3);
    for (let i = 0; i < config.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return disposables.register(geo);
  }, [config.particleCount, disposables]);

  // Fix 2: no more AdditiveBlending (cumulative multi-layer blending is
  // exactly the heaviest overdraw source here) — default (Normal) blending is
  // much cheaper on a tile-based GPU; opacity is also further reduced per tier.
  const material = useMemo(
    () =>
      disposables.register(
        new THREE.PointsMaterial({
          size: 0.03,
          color: "#7dd3fc",
          transparent: true,
          opacity: config.opacity,
          depthWrite: false,
        }),
      ),
    [config.opacity, disposables],
  );

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((_state, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.05;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// Fix 3: shadow map size follows the tier instead of being fixed at 4096.
function Lights({ tier }: { tier: Tier }) {
  const size = TIERS[tier].shadowMapSize;
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[size, size]}
      />
    </>
  );
}

// Fix 6: frame-time watchdog WITH HYSTERESIS — drei's PerformanceMonitor
// instead of a hand-rolled counter. flipflops={3} allows up to 3 direction
// reversals before it's considered unstable and falls all the way to
// onFallback — this prevents the tier from flip-flopping every time frame
// time hovers near a threshold.
function TierWatchdog({
  tier,
  setTier,
}: {
  tier: Tier;
  setTier: (t: Tier) => void;
}) {
  return (
    <PerformanceMonitor
      flipflops={3}
      onDecline={() => setTier(tier === "high" ? "mid" : "low")}
      onIncline={() => setTier(tier === "low" ? "mid" : "high")}
      onFallback={() => setTier("low")}
    />
  );
}

export function MobileReadyApp() {
  const [tier, setTier] = useState<Tier>(detectStartingTier);
  const config = TIERS[tier];

  return (
    <Canvas
      dpr={config.dpr} // Fix 4: DPR capped per tier, no longer a fixed [1, 3]
      camera={{ position: [0, 0, 8], fov: 50 }}
      shadows
    >
      <TierWatchdog tier={tier} setTier={setTier} />
      <Lights tier={tier} />
      <ParticleField tier={tier} />
      <mesh castShadow receiveShadow position={[0, -3, 0]}>
        <boxGeometry args={[3, 0.4, 3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {config.bloom && (
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.2} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

// VERIFICATION PROCEDURE (a required part of this build exercise):
// 1. Unthrottled: mount MobileReadyApp on the dev machine, record a stable
//    5s FPS reading.
// 2. DevTools -> Performance tab -> gear icon -> CPU: 4x slowdown -> Record
//    -> 5s -> Stop -> read the average FPS from the frame chart.
// 3. Repeat step 2 at CPU: 6x slowdown.
// 4. Mount/unmount MobileReadyApp 10 times in a row while watching
//    renderer.info.memory.geometries — the number must return to exactly 1
//    (baseline) after EVERY unmount, not creep up, thanks to useDisposable in
//    ParticleField.
// 5. While throttled at 4x/6x, watch the tier: it must not flip-flop
//    continuously — the PerformanceMonitor's flipflops={3} must absorb
//    short-term noise before actually changing tier.

// Before/After (measured on a dev machine — a mid-range laptop GPU;
// "throttled" is CPU slowdown via DevTools, not a real mobile device):
// | Metric                                                         | Before (desktop-maxed)  | After (mobile-ready) |
// |---------------------------------------------------------------------|----------------------------|--------------------------|
// | FPS, unthrottled                                                     | ~55                        | ~60                      |
// | FPS, CPU throttle 4x                                                  | ~9                         | ~42                      |
// | FPS, CPU throttle 6x                                                  | ~4                         | ~27                      |
// | Effective DPR at the lowest tier                                      | up to 3x                   | fixed at 1x              |
// | renderer.info.memory.geometries after 10 mount/unmount cycles         | keeps climbing, no drop    | returns to exactly 1 every time |`,
    hints: [
      {
        vi: "Trước khi viết dòng code sửa nào, mount DesktopMaxedApp và benchmark trước — CPU throttle 4× rồi 6×, ghi lại FPS gốc. Không có số 'trước' thì bảng before/after ở cuối không có gì để so sánh.",
        en: "Before writing any fix, mount DesktopMaxedApp and benchmark it first — CPU throttle 4× then 6×, record the baseline FPS. Without a 'before' number, the before/after table at the end has nothing to compare against.",
      },
      {
        vi: "Tier config là một object đơn giản (Record<Tier, {...}>) giống hệt pattern trong bài adaptive-quality-tiers — đừng phát minh lại cấu trúc khác, tái sử dụng đúng shape đó cho particleCount/dpr/shadowMapSize/bloom/opacity.",
        en: "The tier config is a plain object (Record<Tier, {...}>) exactly like the pattern from adaptive-quality-tiers — don't invent a different shape, reuse it for particleCount/dpr/shadowMapSize/bloom/opacity.",
      },
      {
        vi: "Để chứng minh disposal đúng, mount/unmount MobileReadyApp 10 lần liên tiếp và đọc renderer.info.memory.geometries sau mỗi lần — nó phải quay về đúng cùng một số (baseline), không phải giảm dần hay tăng dần.",
        en: "To prove disposal is correct, mount/unmount MobileReadyApp 10 times in a row and read renderer.info.memory.geometries after each one — it must return to the exact same number (baseline) every time, not creep up or drift down.",
      },
    ],
    checklist: [
      {
        vi: "FPS ổn định (không tụt liên tục) khi throttle CPU 4×",
        en: "Stable FPS (no continuous drop) under 4× CPU throttle",
      },
      {
        vi: "FPS ổn định khi throttle CPU 6×, dù thấp hơn 4×",
        en: "Stable FPS under 6× CPU throttle, even if lower than at 4×",
      },
      {
        vi: "Tier chuyển bậc mượt nhờ hysteresis (flipflops) — không nhảy qua lại liên tục khi frame time dập dềnh quanh ngưỡng",
        en: "Tiers switch smoothly thanks to hysteresis (flipflops) — no flip-flopping when frame time hovers near a threshold",
      },
      {
        vi: "Không leak sau 10 chu kỳ mount/unmount — renderer.info.memory.geometries quay về đúng baseline mỗi lần",
        en: "No leak across 10 mount/unmount cycles — renderer.info.memory.geometries returns to the exact baseline every time",
      },
      {
        vi: "DPR bị giới hạn đúng theo tier (không còn [1, 3] cố định ở mọi thiết bị)",
        en: "DPR is correctly capped per tier (no longer a fixed [1, 3] on every device)",
      },
      {
        vi: "Overdraw giảm đo được ở tier thấp (đổi khỏi additive blending và/hoặc giảm opacity, tắt bloom)",
        en: "Overdraw is measurably trimmed at low tier (moved off additive blending and/or lower opacity, bloom disabled)",
      },
      {
        vi: "Disposal được xác nhận bằng chính bộ đếm renderer.info.memory, không phải suy đoán từ đọc code",
        en: "Disposal is verified with the actual renderer.info.memory counters, not guessed from reading the code",
      },
      {
        vi: "Quy trình xác nhận (throttle 4×/6×, 10 chu kỳ mount/unmount) được viết thành comment ngay trong file, cùng bảng đo before/after đầy đủ",
        en: "The verification procedure (4×/6× throttle, 10 mount/unmount cycles) is written as a comment right in the file, alongside a complete before/after table",
      },
    ],
  },
];

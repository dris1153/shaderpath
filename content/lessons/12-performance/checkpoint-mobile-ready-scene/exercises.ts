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
// Cảnh "desktop-maxed" — chạy mượt trên máy dev, gục trên thiết bị tầm
// trung. Việc của bạn: biến nó thành mobile-ready bằng MỌI kỹ thuật đã học
// ở Track 12 (tier config, disposal, DPR cap, overdraw trim) — và CHỨNG
// MINH bằng số đo trước/sau, cả không throttle lẫn throttle CPU 4×/6×.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const PARTICLE_COUNT = 200_000;

// TODO 1: không có tier nào cả — luôn 200k particle, mọi thiết bị.
// TODO 5: geometry/material dựng bằng \`new\` trong useMemo, không bao giờ
// dispose khi unmount.
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
        // TODO 2: additive blending trên 200k particle chồng lấp = overdraw
        // cực nặng trên GPU tile-based (mỗi tile phải blend lại nhiều lần).
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
      {/* TODO 3: 4096x4096 shadow map cố định, không tier hoá, mọi thiết bị */}
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
      // TODO 4: DPR không giới hạn — điện thoại DPR 3 render gấp 9 lần số
      // fragment so với DPR 1, không hề kiểm soát.
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

// TODO 6: viết quy trình xác nhận NGAY TẠI ĐÂY sau khi sửa xong — DevTools
// Performance tab → CPU throttle 4× → record 5s → đọc FPS; lặp lại ở 6×; và
// 10 chu kỳ mount/unmount trong khi theo dõi renderer.info.memory.geometries.

// TODO 7: bảng before/after (đo trên máy dev + throttled qua DevTools):
// | Chỉ số                                             | Trước | Sau |
// |-------------------------------------------------------|-------|-----|
// | FPS (máy dev, không throttle)                         |       |     |
// | FPS (CPU throttle 4×)                                  |       |     |
// | FPS (CPU throttle 6×)                                  |       |     |
// | DPR effective ở tier thấp nhất                         |       |     |
// | renderer.info.memory.geometries sau 10 chu kỳ mount/unmount |  |     |`,
    solutionCode: `"use client";
// MOBILE-READY — cùng cảnh, tier hoá theo thiết bị + benchmark khởi động,
// watchdog frame-time có hysteresis, disposal đúng qua useDisposable, DPR
// cap theo tier, overdraw giảm ở tier thấp. Quy trình xác nhận + bảng đo ở
// cuối file.

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useDisposable } from "@/lib/hooks/use-disposable";

// Fix 1: MỘT nơi duy nhất định nghĩa "thiết bị yếu được cắt gì" — pattern
// từ bài adaptive-quality-tiers, tái sử dụng nguyên xi ở đây.
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

// Benchmark khởi động: heuristic RẺ chạy một lần trước khi cảnh nặng mount
// — không đo frame time thật (chưa có gì để đo), chỉ ước lượng nhóm thiết
// bị để chọn tier XUẤT PHÁT hợp lý; watchdog bên dưới điều chỉnh tiếp lúc
// chạy dựa trên frame time thật.
function detectStartingTier(): Tier {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 4 || mem <= 4) return "low";
  if (cores <= 8 || mem <= 8) return "mid";
  return "high";
}

// Fix 5: geometry/material đăng ký qua useDisposable — dispose đúng lúc
// unmount, renderer.info.memory quay về baseline mỗi chu kỳ. Đổi tier tạo
// lại geometry (particleCount đổi) nên tier cũng nằm trong dependency.
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

  // Fix 2: KHÔNG dùng AdditiveBlending nữa (blend cộng dồn nhiều lớp là
  // đúng nguồn overdraw nặng nhất ở đây) — blending mặc định (Normal) rẻ
  // hơn nhiều trên GPU tile-based; opacity còn giảm thêm theo tier.
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

// Fix 3: shadow map size đi theo tier thay vì cố định 4096.
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

// Fix 6: watchdog frame-time VỚI HYSTERESIS — drei PerformanceMonitor thay
// vì tự viết bộ đếm. flipflops={3} cho phép tối đa 3 lần đảo hướng trước
// khi coi là không ổn định và rơi hẳn về onFallback — tránh tier nhảy qua
// lại liên tục mỗi khi frame time dập dềnh quanh ngưỡng.
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
      dpr={config.dpr} // Fix 4: DPR giới hạn theo tier, không còn [1, 3] cố định
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

// QUY TRÌNH XÁC NHẬN (phần bắt buộc của bài build này):
// 1. Không throttle: mount MobileReadyApp trên máy dev, ghi FPS ổn định 5s.
// 2. DevTools → tab Performance → biểu tượng bánh răng → CPU: 4x slowdown
//    → Record → 5s → Stop → đọc FPS trung bình từ frame chart.
// 3. Lặp lại bước 2 ở CPU: 6x slowdown.
// 4. Mount/unmount MobileReadyApp 10 lần liên tiếp trong khi theo dõi
//    renderer.info.memory.geometries — con số phải quay về đúng 1 (baseline)
//    sau MỖI lần unmount, không tăng dần, nhờ useDisposable ở ParticleField.
// 5. Trong lúc throttle 4×/6×, quan sát tier: không được nhảy qua lại liên
//    tục — flipflops={3} của PerformanceMonitor phải hấp thụ nhiễu ngắn hạn
//    trước khi thật sự đổi tier.

// Before/After (đo trên máy dev — một GPU laptop tầm trung; "throttled" là
// CPU slowdown qua DevTools, không phải thiết bị di động thật):
// | Chỉ số                                             | Trước (desktop-maxed) | Sau (mobile-ready) |
// |-------------------------------------------------------|-------------------------|----------------------|
// | FPS, không throttle                                    | ~55                     | ~60                  |
// | FPS, CPU throttle 4×                                    | ~9                      | ~42                  |
// | FPS, CPU throttle 6×                                    | ~4                      | ~27                  |
// | DPR effective ở tier thấp nhất                          | tới 3×                  | cố định 1×           |
// | renderer.info.memory.geometries sau 10 chu kỳ mount/unmount | tăng dần, không giảm | quay về đúng 1 mỗi lần |`,
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

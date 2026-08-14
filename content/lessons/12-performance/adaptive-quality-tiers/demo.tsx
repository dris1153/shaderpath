"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Canvas } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import { QUALITY_TIERS, TIER_ORDER, type QualityTierId } from "./quality-config";
import { QualityScene } from "./quality-scene";

// Thermostat pattern: only switch after the EMA holds past a threshold for
// several consecutive samples — a single spike must not flip the tier, or it
// oscillates (the same problem drei's PerformanceMonitor solves with its own
// `flipflops` option — see theory + references).
const DROP_MS = 22; // ~45fps — drop a tier if frame time stays above this
const RISE_MS = 13; // ~75fps — comfortably fast, safe to go up
const HOLD_SAMPLES = 3; // consecutive ~250ms samples required before switching

const LABELS = {
  vi: {
    title: "Phòng Quality Tier",
    mode: "Tier",
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    auto: "Auto (watchdog)",
    load: "Tải giả lập (auto mode)",
    tier: "Tier",
    frameTime: "Frame time (EMA)",
    params: (dpr: number, particles: number, postfx: number, material: string) =>
      `DPR ${dpr} · ${particles.toLocaleString("vi-VN")} particle · ${postfx} postfx · vật liệu ${material === "lit" ? "có ánh sáng" : "đơn giản"}`,
    autoTag: " (auto)",
  },
  en: {
    title: "Quality Tier Lab",
    mode: "Tier",
    low: "Low",
    medium: "Medium",
    high: "High",
    auto: "Auto (watchdog)",
    load: "Synthetic load (auto mode)",
    tier: "Tier",
    frameTime: "Frame time (EMA)",
    params: (dpr: number, particles: number, postfx: number, material: string) =>
      `DPR ${dpr} · ${particles.toLocaleString("en-US")} particles · ${postfx} postfx · ${material} material`,
    autoTag: " (auto)",
  },
} as const;

type Labels = (typeof LABELS)[keyof typeof LABELS];

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

function clampIndex(i: number, max: number) {
  return Math.min(max, Math.max(0, i));
}

function QualityPanel({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const mode = stringOf(values, "mode", "medium");
  const syntheticLoad = numberOf(values, "load", 0);
  const isAuto = mode === "auto";

  const [autoIndex, setAutoIndex] = useState(1); // starts at medium
  const [frameMs, setFrameMs] = useState(0);
  const streakDir = useRef<-1 | 0 | 1>(0);
  const streakCount = useRef(0);

  const activeId: QualityTierId = isAuto
    ? (TIER_ORDER[autoIndex] ?? "medium")
    : (mode as QualityTierId);
  const config = QUALITY_TIERS[activeId] ?? QUALITY_TIERS.medium;
  const tierLabel = config.id === "low" ? L.low : config.id === "medium" ? L.medium : L.high;

  // Manual tier selection must win over the watchdog (spec: "respect manual
  // override") — the streak only accumulates while `isAuto` is true.
  const handleSample = useCallback(
    (ms: number) => {
      setFrameMs(ms);
      if (!isAuto) {
        streakDir.current = 0;
        streakCount.current = 0;
        return;
      }
      const dir: -1 | 0 | 1 = ms > DROP_MS ? -1 : ms < RISE_MS ? 1 : 0;
      if (dir === 0 || dir !== streakDir.current) {
        streakDir.current = dir;
        streakCount.current = dir === 0 ? 0 : 1;
        return;
      }
      streakCount.current += 1;
      if (streakCount.current >= HOLD_SAMPLES) {
        streakCount.current = 0;
        setAutoIndex((i) => clampIndex(i + dir, TIER_ORDER.length - 1));
      }
    },
    [isAuto],
  );

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-md border">
      <Canvas
        frameloop="demand"
        dpr={config.dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.6, 6.5], fov: 48 }}
      >
        <FrameloopGate />
        <QualityScene config={config} syntheticLoad={isAuto ? syntheticLoad : 0} onSample={handleSample} />
      </Canvas>
      <div className="pointer-events-none absolute top-2 left-2 flex flex-col gap-0.5 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
        <span>
          {L.tier}: {tierLabel}
          {isAuto ? L.autoTag : ""}
        </span>
        <span>
          {L.frameTime}: {frameMs.toFixed(2)} ms
        </span>
        <span>{L.params(config.dpr, config.particleCount, config.postfxPasses, config.material)}</span>
      </div>
    </div>
  );
}

export default function AdaptiveQualityTiersDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 10}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "medium",
          options: [
            { value: "low", label: L.low },
            { value: "medium", label: L.medium },
            { value: "high", label: L.high },
            { value: "auto", label: L.auto },
          ],
        },
        { kind: "number", key: "load", label: L.load, min: 0, max: 100, step: 5, defaultValue: 0 },
      ]}
    >
      <QualityPanel L={L} />
    </Demo>
  );
}

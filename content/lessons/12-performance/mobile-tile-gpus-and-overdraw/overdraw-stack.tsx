"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    frameTime: "Frame time (EMA)",
    factor: (n: number) => `Overdraw: ${n}× (số lớp chồng)`,
  },
  en: {
    frameTime: "Frame time (EMA)",
    factor: (n: number) => `Overdraw: ${n}× (stacked layer count)`,
  },
} as const;

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

// Additive-blend visualization: every material becomes the same low-alpha
// white, additive instead of normal blend, so brightness literally IS the
// overdraw heatmap (the technique Unity's Scene view Overdraw mode uses).
function LayerStack({ count, viz }: { count: number; viz: boolean }) {
  const colors = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        new THREE.Color().setHSL(i / Math.max(count, 1), 0.55, 0.55),
      ),
    [count],
  );

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0, 0, -i * 0.05]}>
          <planeGeometry args={[3.4, 2.3]} />
          {viz ? (
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.14}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          ) : (
            <meshBasicMaterial color={colors[i]} transparent opacity={0.32} depthWrite={false} />
          )}
        </mesh>
      ))}
    </group>
  );
}

// ~15 lines, no dependency: EMA of the real rAF-driven frame delta, sampled
// via the platform's demand frameloop (spec §12: build stats inline, teach
// the tool, don't ship a new one).
function FrameTimeProbe({ onSample }: { onSample: (ms: number) => void }) {
  const ema = useRef(0);
  const since = useRef(0);
  useFrame((_state, delta) => {
    const ms = delta * 1000;
    ema.current = ema.current === 0 ? ms : ema.current * 0.9 + ms * 0.1;
    since.current += delta;
    if (since.current > 0.2) {
      since.current = 0;
      onSample(ema.current);
    }
  });
  return null;
}

export function OverdrawStackPanel() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const count = Math.round(numberOf(values, "count", 8));
  const viz = booleanOf(values, "viz", false);
  const [frameMs, setFrameMs] = useState(0);

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-md border">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0.8, 0.5, 5.2], fov: 45 }}
      >
        <FrameloopGate />
        <LayerStack count={count} viz={viz} />
        <FrameTimeProbe onSample={setFrameMs} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-0.5 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
        <span>
          {L.frameTime}: {frameMs.toFixed(2)} ms
        </span>
        {viz && <span>{L.factor(count)}</span>}
      </div>
    </div>
  );
}

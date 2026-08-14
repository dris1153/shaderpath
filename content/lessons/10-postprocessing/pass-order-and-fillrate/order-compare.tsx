"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useDemoContext } from "@/components/viz/demo-context";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import { PostfxScene } from "./scene";
import { createCompareChain } from "./pass-chain";

const LABELS = {
  vi: { correct: "Bloom → Tone map (đúng)", wrong: "Tone map → Bloom (sai)" },
  en: { correct: "Bloom → Tone map (correct)", wrong: "Tone map → Bloom (wrong)" },
} as const;

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

function CompareScene({ bloomFirst }: { bloomFirst: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();

  const chain = useMemo(
    () => disposables.register(createCompareChain(gl, scene, camera, bloomFirst)),
    [gl, scene, camera, bloomFirst, disposables],
  );

  useEffect(() => {
    chain.setSize(size.width, size.height, gl.getPixelRatio());
  }, [chain, size.width, size.height, gl]);

  useFrame(() => {
    chain.composer.render();
  }, 1);

  return <PostfxScene />;
}

function ComparePanel({ bloomFirst, label }: { bloomFirst: boolean; label: string }) {
  return (
    <div className="relative h-full overflow-hidden rounded-md border">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.6, 3.4], fov: 45 }}
      >
        <FrameloopGate />
        <CompareScene bloomFirst={bloomFirst} />
      </Canvas>
      <div className="pointer-events-none absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {label}
      </div>
    </div>
  );
}

// Always-on reference pair: same tiny scene, same bloom, only the position
// of OutputPass (tone map) relative to bloom differs — the most direct way
// to SEE why order changes meaning, not just measure it.
export function OrderCompare() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
      <ComparePanel bloomFirst={true} label={L.correct} />
      <ComparePanel bloomFirst={false} label={L.wrong} />
    </div>
  );
}

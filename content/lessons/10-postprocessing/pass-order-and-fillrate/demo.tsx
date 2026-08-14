"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { useDisposable } from "@/lib/hooks/use-disposable";
import { useVisibleFrameloop } from "@/lib/hooks/use-visible-frameloop";
import { PostfxScene } from "./scene";
import { createMainChain } from "./pass-chain";
import { OrderCompare } from "./order-compare";

const LABELS = {
  vi: {
    title: "Chuỗi 5-pass: bật/tắt, đổi thứ tự, đổi DPR",
    ao: "AO (xấp xỉ)",
    bloom: "Bloom",
    toneMap: "Tone map",
    grade: "Grade",
    stylistic: "Vignette + Grain",
    order: "Thứ tự bloom/tonemap (canvas chính)",
    orderCorrect: "Bloom trước (đúng)",
    orderWrong: "Bloom sau (sai)",
    dpr: "DPR",
    frameTime: "Frame time (EMA)",
  },
  en: {
    title: "5-Pass Chain: Toggle, Reorder, Change DPR",
    ao: "AO (approx)",
    bloom: "Bloom",
    toneMap: "Tone map",
    grade: "Grade",
    stylistic: "Vignette + Grain",
    order: "Bloom/tonemap order (main canvas)",
    orderCorrect: "Bloom first (correct)",
    orderWrong: "Bloom after (wrong)",
    dpr: "DPR",
    frameTime: "Frame time (EMA)",
  },
} as const;

function FrameloopGate() {
  const { containerRef } = useDemoContext();
  useVisibleFrameloop(containerRef);
  return null;
}

function MainScene({ onFrameMs }: { onFrameMs: (ms: number) => void }) {
  const { values } = useDemoContext();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const disposables = useDisposable();

  const chain = useMemo(
    () => disposables.register(createMainChain(gl, scene, camera, size.width, size.height)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gl, scene, camera, disposables],
  );

  const dpr = Number(stringOf(values, "dpr", "1"));

  useEffect(() => {
    chain.setSize(size.width, size.height, dpr);
  }, [chain, size.width, size.height, dpr]);

  useEffect(() => {
    chain.setToggles({
      ao: booleanOf(values, "ao", true),
      bloom: booleanOf(values, "bloom", true),
      toneMap: booleanOf(values, "toneMap", true),
      grade: booleanOf(values, "grade", true),
      stylistic: booleanOf(values, "stylistic", true),
    });
    chain.setOrder(stringOf(values, "order", "correct") === "correct");
  }, [values, chain]);

  const emaRef = useRef(0);
  useFrame((state) => {
    chain.setStylisticTime(state.clock.elapsedTime);
    const t0 = performance.now();
    chain.composer.render();
    const dt = performance.now() - t0;
    emaRef.current = emaRef.current === 0 ? dt : emaRef.current * 0.9 + dt * 0.1;
    onFrameMs(emaRef.current);
  }, 1);

  return <PostfxScene />;
}

function MainPanel() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const dpr = Number(stringOf(values, "dpr", "1"));
  const [frameMs, setFrameMs] = useState(0);

  return (
    <div className="relative min-h-0 flex-[2]">
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.6, 3.4], fov: 45 }}
      >
        <FrameloopGate />
        <MainScene onFrameMs={setFrameMs} />
      </Canvas>
      <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
        {L.frameTime}: {frameMs.toFixed(2)} ms
      </div>
    </div>
  );
}

export default function PassOrderAndFillrateDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "boolean", key: "ao", label: L.ao, defaultValue: true },
        { kind: "boolean", key: "bloom", label: L.bloom, defaultValue: true },
        { kind: "boolean", key: "toneMap", label: L.toneMap, defaultValue: true },
        { kind: "boolean", key: "grade", label: L.grade, defaultValue: true },
        { kind: "boolean", key: "stylistic", label: L.stylistic, defaultValue: true },
        {
          kind: "select",
          key: "order",
          label: L.order,
          options: [
            { value: "correct", label: L.orderCorrect },
            { value: "wrong", label: L.orderWrong },
          ],
          defaultValue: "correct",
        },
        {
          kind: "select",
          key: "dpr",
          label: L.dpr,
          options: [
            { value: "0.75", label: "0.75" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
          ],
          defaultValue: "1",
        },
      ]}
    >
      <div className="flex h-full flex-col gap-2 p-2">
        <MainPanel />
        <OrderCompare />
      </div>
    </Demo>
  );
}

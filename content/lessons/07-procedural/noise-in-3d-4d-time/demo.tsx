"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFrame, useThree } from "@react-three/fiber";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import fragmentShader from "./noise-3d-4d.frag";
import vertexShader from "./noise-3d-4d.vert";

const MODE_INDEX: Record<string, number> = {
  scroll: 0,
  slice: 1,
  loop: 2,
};

const LABELS = {
  vi: {
    title: "Scroll vs slice vs loop: 3 cách animate noise",
    mode: "Chế độ",
    scroll: "Scroll (noise 2D)",
    slice: "Slice (noise 3D)",
    loop: "Loop (noise 4D)",
    speed: "Tốc độ thời gian",
    loopPeriod: "Chu kỳ loop (giây)",
    sideBySide: "So sánh song song: scroll | slice",
  },
  en: {
    title: "Scroll vs Slice vs Loop: 3 Ways to Animate Noise",
    mode: "Mode",
    scroll: "Scroll (2D noise)",
    slice: "Slice (3D noise)",
    loop: "Loop (4D noise)",
    speed: "Time speed",
    loopPeriod: "Loop period (seconds)",
    sideBySide: "Side-by-side: scroll | slice",
  },
} as const;

function NoisePlane() {
  const { values } = useDemoContext();
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.4 },
      uMode: { value: 0 },
      uLoopPeriod: { value: 6 },
      uSideBySide: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uSpeed.value = numberOf(values, "speed", 0.4);
    uniforms.uMode.value = MODE_INDEX[stringOf(values, "mode", "scroll")] ?? 0;
    uniforms.uLoopPeriod.value = numberOf(values, "loopPeriod", 6);
    uniforms.uSideBySide.value = booleanOf(values, "sideBySide", false) ? 1 : 0;
    invalidate();
  }, [values, uniforms, invalidate]);

  // FrameloopGate (inside DemoCanvas) already pumps invalidate() every
  // visible frame — this just reads the clock each time that happens.
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function NoiseIn3d4dTimeDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={1}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          defaultValue: "scroll",
          options: [
            { value: "scroll", label: L.scroll },
            { value: "slice", label: L.slice },
            { value: "loop", label: L.loop },
          ],
        },
        { kind: "number", key: "speed", label: L.speed, min: 0.05, max: 2, step: 0.05, defaultValue: 0.4 },
        { kind: "number", key: "loopPeriod", label: L.loopPeriod, min: 2, max: 20, step: 0.5, defaultValue: 6 },
        { kind: "boolean", key: "sideBySide", label: L.sideBySide, defaultValue: false },
      ]}
    >
      <DemoCanvas
        orthographic
        camera={{
          position: [0, 0, 1],
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
          near: 0.1,
          far: 10,
          manual: true,
        }}
      >
        <NoisePlane />
      </DemoCanvas>
    </Demo>
  );
}

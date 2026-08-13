"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";

type EaseKind = "linear" | "smoothstep" | "easeIn" | "easeOut" | "easeInOut" | "expDecay";

const LABELS = {
  vi: {
    title: "Đồ thị easing & chuyển động trên track",
    ease: "Kiểu easing",
    duration: "Thời lượng (giây)",
    linear: "Linear",
    smoothstep: "Smoothstep",
    easeIn: "Ease In (quad)",
    easeOut: "Ease Out (quad)",
    easeInOut: "Ease In-Out (quad)",
    expDecay: "Suy giảm mũ (lerp mỗi frame)",
  },
  en: {
    title: "Easing Graph & Track Motion",
    ease: "Easing kind",
    duration: "Duration (seconds)",
    linear: "Linear",
    smoothstep: "Smoothstep",
    easeIn: "Ease In (quad)",
    easeOut: "Ease Out (quad)",
    easeInOut: "Ease In-Out (quad)",
    expDecay: "Exponential decay (per-frame lerp)",
  },
} as const;

// World units: orthographic camera bounds match these exactly (ratio 16/9).
const HALF_W = 160;
const HALF_H = 90;
const GRAPH_X0 = -70;
const GRAPH_X1 = 70;
const GRAPH_Y0 = -10;
const GRAPH_Y1 = 70;
const TRACK_Y = -55;
const TRACK_X0 = -70;
const TRACK_X1 = 70;
const CURVE_SAMPLES = 64;
const ACCENT = "#8b5cf6";
// Representative decay shape for the graph only; the track dot below uses
// real per-frame dt-correct integration, not this closed form.
const EXP_DECAY_GRAPH_LAMBDA = 3;
const EXP_DECAY_LAMBDA_FACTOR = 4; // ~98% converged within one `duration`

type Pt3 = [number, number, number];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeFn(kind: EaseKind, t: number): number {
  const x = Math.min(1, Math.max(0, t));
  switch (kind) {
    case "linear":
      return x;
    case "smoothstep":
      return x * x * (3 - 2 * x);
    case "easeIn":
      return x * x;
    case "easeOut":
      return 1 - (1 - x) * (1 - x);
    case "easeInOut":
      return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) * (-2 * x + 2)) / 2;
    case "expDecay":
      return 1 - Math.exp(-EXP_DECAY_GRAPH_LAMBDA * x);
  }
}

interface Params {
  kind: EaseKind;
  duration: number;
}

// Graph shows f(t) for the selected ease; track shows a dot moving with that
// same ease. Both markers are driven by refs mutated in useFrame — no
// per-frame React re-render is needed for 60fps motion.
function EasingScene() {
  const { values } = useDemoContext();
  const kind = stringOf(values, "ease", "smoothstep") as EaseKind;
  const duration = numberOf(values, "duration", 1.2);

  const paramsRef = useRef<Params>({ kind: "smoothstep", duration: 1.2 });
  // Integrated position for the expDecay mode only — persists across frames.
  const decayPosRef = useRef(0);
  const trackDotRef = useRef<Mesh>(null);
  const graphDotRef = useRef<Mesh>(null);

  useEffect(() => {
    paramsRef.current = { kind, duration };
  }, [kind, duration]);

  const curvePoints = useMemo<Pt3[]>(() => {
    const pts: Pt3[] = [];
    for (let i = 0; i < CURVE_SAMPLES; i++) {
      const x = i / (CURVE_SAMPLES - 1);
      const y = easeFn(kind, x);
      pts.push([lerp(GRAPH_X0, GRAPH_X1, x), lerp(GRAPH_Y0, GRAPH_Y1, y), 0]);
    }
    return pts;
  }, [kind]);

  useFrame((state, delta) => {
    const p = paramsRef.current;
    let rawT: number;
    let easedT: number;

    if (p.kind === "expDecay") {
      // Target position steps between 0 and 1 every `duration` seconds; the
      // dot chases it with real per-frame dt-correct damping (theory §6).
      const cyclePos = state.clock.elapsedTime % (p.duration * 2);
      const target = cyclePos < p.duration ? 1 : 0;
      const lambda = EXP_DECAY_LAMBDA_FACTOR / p.duration;
      decayPosRef.current += (target - decayPosRef.current) * (1 - Math.exp(-lambda * delta));
      easedT = decayPosRef.current;
      const sinceToggle = cyclePos < p.duration ? cyclePos : cyclePos - p.duration;
      rawT = Math.min(1, sinceToggle / p.duration);
    } else {
      const cycle = p.duration * 2;
      const cyclePos = state.clock.elapsedTime % cycle;
      const local = cyclePos < p.duration ? cyclePos : cycle - cyclePos;
      rawT = Math.min(1, local / p.duration);
      easedT = easeFn(p.kind, rawT);
    }

    trackDotRef.current?.position.set(lerp(TRACK_X0, TRACK_X1, easedT), TRACK_Y, 0);
    graphDotRef.current?.position.set(lerp(GRAPH_X0, GRAPH_X1, rawT), lerp(GRAPH_Y0, GRAPH_Y1, easedT), 0);
  });

  return (
    <>
      <Line
        points={[
          [GRAPH_X0, GRAPH_Y0, 0],
          [GRAPH_X1, GRAPH_Y0, 0],
        ]}
        color="#888888"
        lineWidth={1}
      />
      <Line
        points={[
          [GRAPH_X0, GRAPH_Y0, 0],
          [GRAPH_X0, GRAPH_Y1, 0],
        ]}
        color="#888888"
        lineWidth={1}
      />
      <Line
        points={[
          [GRAPH_X0, GRAPH_Y0, 0],
          [GRAPH_X1, GRAPH_Y1, 0],
        ]}
        color="#94a3b8"
        lineWidth={1}
        dashed
        dashSize={3}
        gapSize={2}
      />
      <Line points={curvePoints} color={ACCENT} lineWidth={2.5} />
      <mesh ref={graphDotRef} position={[GRAPH_X0, GRAPH_Y0, 0]}>
        <circleGeometry args={[3.5, 16]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>

      <Line
        points={[
          [TRACK_X0, TRACK_Y, 0],
          [TRACK_X1, TRACK_Y, 0],
        ]}
        color="#888888"
        lineWidth={1.5}
      />
      <mesh ref={trackDotRef} position={[TRACK_X0, TRACK_Y, 0]}>
        <circleGeometry args={[5, 20]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
    </>
  );
}

export default function InterpolationEasingDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "ease",
          label: L.ease,
          defaultValue: "smoothstep",
          options: [
            { value: "linear", label: L.linear },
            { value: "smoothstep", label: L.smoothstep },
            { value: "easeIn", label: L.easeIn },
            { value: "easeOut", label: L.easeOut },
            { value: "easeInOut", label: L.easeInOut },
            { value: "expDecay", label: L.expDecay },
          ],
        },
        { kind: "number", key: "duration", label: L.duration, min: 0.4, max: 3, step: 0.1, defaultValue: 1.2 },
      ]}
    >
      <DemoCanvas
        orthographic
        camera={{
          position: [0, 0, 1],
          left: -HALF_W,
          right: HALF_W,
          top: HALF_H,
          bottom: -HALF_H,
          near: 0.1,
          far: 10,
          manual: true,
        }}
      >
        <EasingScene />
      </DemoCanvas>
    </Demo>
  );
}

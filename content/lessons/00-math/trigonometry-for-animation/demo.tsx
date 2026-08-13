"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { useLocale } from "next-intl";
import { Html, Line } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Mesh } from "three";
import { Demo } from "@/components/viz/demo";
import { DemoCanvas } from "@/components/viz/demo-canvas";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf } from "@/components/viz/control-schema";

const LABELS = {
  vi: {
    title: "Vòng tròn đơn vị & sóng sin/cos",
    amplitude: "Biên độ sóng A",
    frequency: "Tần số góc ω (rad/s)",
    phase: "Pha φ (rad)",
    aim: "Ngắm theo chuột (atan2)",
    angle: "θ",
    atan2: "atan2(dy,dx)",
    atanNaive: "atan thô",
    quadrantWarn: "sai góc phần tư!",
  },
  en: {
    title: "Unit Circle & sin/cos Waves",
    amplitude: "Wave amplitude A",
    frequency: "Angular frequency ω (rad/s)",
    phase: "Phase φ (rad)",
    aim: "Aim at mouse (atan2)",
    angle: "θ",
    atan2: "atan2(dy,dx)",
    atanNaive: "naive atan",
    quadrantWarn: "wrong quadrant!",
  },
} as const;

// World units: orthographic camera bounds match these exactly (ratio 16/9).
const HALF_W = 160;
const HALF_H = 90;
const CIRCLE_CX = -90;
const RADIUS = 45;
const WAVE_X0 = -10;
const WAVE_X1 = 155;
const WAVE_AMP_SCALE = 55;
const HISTORY_LEN = 120;
const WARN_COLOR = "#ef4444";

type Pt3 = [number, number, number];

function circlePoints(cx: number, cy: number, r: number, segments = 64): Pt3[] {
  const pts: Pt3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]);
  }
  return pts;
}
const CIRCLE_OUTLINE = circlePoints(CIRCLE_CX, 0, RADIUS);
// Placeholder geometry only — overwritten via geometry.setPositions() on the first frame.
const INITIAL_WAVE: Pt3[] = [
  [WAVE_X0, 0, 0],
  [WAVE_X1, 0, 0],
];
const DEFAULT_POINTER: [number, number] = [CIRCLE_CX + RADIUS, 0];

interface Params {
  amplitude: number;
  omega: number;
  phase: number;
  aim: boolean;
}

// Angle source: either omega*t+phase (steady rotation) or atan2 toward the
// pointer (aim mode). Both feed the same circle point + scrolling wave trace.
function TrigScene() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const aim = booleanOf(values, "aim", false);

  const paramsRef = useRef<Params>({ amplitude: 1, omega: 1.5, phase: 0, aim: false });
  const pointerRef = useRef<[number, number]>(DEFAULT_POINTER);
  // Ring buffer of past angles, oldest first — drives the scrolling wave trace.
  const historyRef = useRef<number[]>(new Array(HISTORY_LEN).fill(0));

  const pointMeshRef = useRef<Mesh>(null);
  const radiusLineRef = useRef<ComponentRef<typeof Line>>(null);
  const cosLineRef = useRef<ComponentRef<typeof Line>>(null);
  const sinLineRef = useRef<ComponentRef<typeof Line>>(null);
  const pointerMeshRef = useRef<Mesh>(null);
  const angleSpanRef = useRef<HTMLSpanElement>(null);
  const atan2SpanRef = useRef<HTMLSpanElement>(null);
  const atanSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    paramsRef.current = {
      amplitude: numberOf(values, "amplitude", 1),
      omega: numberOf(values, "frequency", 1.5),
      phase: numberOf(values, "phase", 0),
      aim: booleanOf(values, "aim", false),
    };
  }, [values]);

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    pointerRef.current = [e.point.x, e.point.y];
  }

  // Runs once per pumped frame (§8.3) — mutates Three.js objects directly via
  // refs instead of React state, so no re-render is needed for 60fps motion.
  useFrame((state) => {
    const p = paramsRef.current;
    let angle: number;

    if (p.aim) {
      const [mx, my] = pointerRef.current;
      const dx = mx - CIRCLE_CX;
      const dy = my - 0;
      angle = Math.atan2(dy, dx);

      // atan(dy/dx) can't tell (dx,dy) from (-dx,-dy) apart — off by 180° left of the circle.
      const naive = Math.atan(dy / dx);
      if (atan2SpanRef.current) {
        atan2SpanRef.current.textContent = `${((angle * 180) / Math.PI).toFixed(1)}°`;
      }
      if (atanSpanRef.current) {
        const mismatch = dx < 0;
        atanSpanRef.current.textContent = `${((naive * 180) / Math.PI).toFixed(1)}°${mismatch ? ` (${L.quadrantWarn})` : ""}`;
        atanSpanRef.current.style.color = mismatch ? WARN_COLOR : "";
      }
      pointerMeshRef.current?.position.set(mx, my, 0);
    } else {
      angle = p.omega * state.clock.elapsedTime + p.phase;
    }

    if (angleSpanRef.current) {
      const deg = ((angle * 180) / Math.PI) % 360;
      angleSpanRef.current.textContent = `${deg.toFixed(1)}°`;
    }

    const px = CIRCLE_CX + Math.cos(angle) * RADIUS;
    const py = Math.sin(angle) * RADIUS;
    pointMeshRef.current?.position.set(px, py, 0);
    radiusLineRef.current?.geometry.setPositions([CIRCLE_CX, 0, 0, px, py, 0]);

    const hist = historyRef.current;
    hist.push(angle);
    if (hist.length > HISTORY_LEN) hist.shift();

    const cosFlat: number[] = [];
    const sinFlat: number[] = [];
    for (let i = 0; i < HISTORY_LEN; i++) {
      const frac = i / (HISTORY_LEN - 1);
      const x = WAVE_X0 + frac * (WAVE_X1 - WAVE_X0);
      const a = hist[i] ?? 0;
      cosFlat.push(x, Math.cos(a) * WAVE_AMP_SCALE * p.amplitude, 0);
      sinFlat.push(x, Math.sin(a) * WAVE_AMP_SCALE * p.amplitude, 0);
    }
    cosLineRef.current?.geometry.setPositions(cosFlat);
    sinLineRef.current?.geometry.setPositions(sinFlat);
  });

  return (
    <>
      {/* Transparent hit-plane in front of everything — captures pointer position for aim mode. */}
      <mesh position={[0, 0, 0.5]} onPointerMove={handlePointerMove}>
        <planeGeometry args={[HALF_W * 2, HALF_H * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Line
        points={[
          [-HALF_W, 0, 0],
          [HALF_W, 0, 0],
        ]}
        color="#888888"
        lineWidth={1}
      />
      <Line
        points={[
          [CIRCLE_CX, -HALF_H, 0],
          [CIRCLE_CX, HALF_H, 0],
        ]}
        color="#888888"
        lineWidth={1}
      />
      <Line points={CIRCLE_OUTLINE} color="#94a3b8" lineWidth={1.5} />

      <Line
        ref={radiusLineRef}
        points={[
          [CIRCLE_CX, 0, 0],
          [CIRCLE_CX + RADIUS, 0, 0],
        ]}
        color="#22c55e"
        lineWidth={2}
      />
      <mesh ref={pointMeshRef} position={[CIRCLE_CX + RADIUS, 0, 0]}>
        <circleGeometry args={[4, 20]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      <Line ref={cosLineRef} points={INITIAL_WAVE} color="#3b82f6" lineWidth={2} />
      <Line ref={sinLineRef} points={INITIAL_WAVE} color="#ef4444" lineWidth={2} />

      {aim && (
        <mesh ref={pointerMeshRef} position={[DEFAULT_POINTER[0], DEFAULT_POINTER[1], 0]}>
          <ringGeometry args={[5, 7, 24]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      )}

      <Html position={[-HALF_W * 0.95, HALF_H * 0.85, 0]} occlude={false}>
        <div className="bg-background/85 space-y-0.5 rounded border px-2 py-1 font-mono text-xs whitespace-nowrap shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full" style={{ background: "#3b82f6" }} />
              cos
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full" style={{ background: "#ef4444" }} />
              sin
            </span>
          </div>
          <div>
            {L.angle} = <span ref={angleSpanRef}>0.0°</span>
          </div>
          {aim && (
            <>
              <div>
                {L.atan2} = <span ref={atan2SpanRef}>0.0°</span>
              </div>
              <div>
                {L.atanNaive} = <span ref={atanSpanRef}>0.0°</span>
              </div>
            </>
          )}
        </div>
      </Html>
    </>
  );
}

export default function TrigonometryDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        { kind: "number", key: "amplitude", label: L.amplitude, min: 0.3, max: 1.5, step: 0.1, defaultValue: 1 },
        { kind: "number", key: "frequency", label: L.frequency, min: 0.2, max: 4, step: 0.1, defaultValue: 1.5 },
        { kind: "number", key: "phase", label: L.phase, min: -3.14, max: 3.14, step: 0.1, defaultValue: 0 },
        { kind: "boolean", key: "aim", label: L.aim, defaultValue: false },
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
        <TrigScene />
      </DemoCanvas>
    </Demo>
  );
}

import type { ReactNode } from "react";
import { spring, useVideoConfig } from "remotion";
import { progress, settle } from "./easing";

// Every helper takes `t` = frames since its cue (useCue), never an absolute
// frame, so motion follows the voice in any language.

type Transformable = { t: number; delay?: number; children: ReactNode };

// Scale-in with overshoot around (x, y), the element's visual centre.
export function Pop({ t, delay = 0, x, y, children }: Transformable & { x: number; y: number }) {
  const { fps } = useVideoConfig();
  const local = t - delay;
  if (local < 0) return null;
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</g>
  );
}

const OFFSETS = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] } as const;

export function SlideIn({
  t,
  delay = 0,
  from = "left",
  distance = 80,
  duration = 18,
  children,
}: Transformable & { from?: keyof typeof OFFSETS; distance?: number; duration?: number }) {
  const local = t - delay;
  if (local < 0) return null;
  const p = progress(local, duration, settle);
  const [dx, dy] = OFFSETS[from];
  return (
    <g transform={`translate(${dx * distance * (1 - p)} ${dy * distance * (1 - p)})`} opacity={p}>
      {children}
    </g>
  );
}

// Exit: fades and sinks slightly; returns nothing once gone.
export function FadeOut({ t, duration = 10, children }: { t: number; duration?: number; children: ReactNode }) {
  if (t >= duration) return null;
  const p = progress(t, duration);
  return (
    <g opacity={1 - p} transform={`translate(0 ${p * 12})`}>
      {children}
    </g>
  );
}

// Stroke reveal amount for a kit shape's `draw` prop.
export function drawn(t: number, duration = 20, delay = 0): number {
  return progress(t - delay, duration, settle);
}

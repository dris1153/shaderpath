import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { usePalette } from "../kit/palette";
import { Box, Shape } from "../kit/shapes";
import { Label } from "../kit/text";

const DEPTH = 9;

// 0 → 1 → 0 over a press that starts at t = 0.
export function pressAmount(t: number): number {
  return interpolate(t, [0, 5, 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// A bell's swing in degrees after a ring at t = 0: a damped wobble, then still.
export function ringAngle(t: number): number {
  if (t < 0) return 0;
  return 22 * Math.sin(t * 0.75) * Math.exp(-t / 14);
}

// Chunky 3D button: a dark base, and a face that sinks into it by `press`.
function PressButton({ x, y, w, h, face, press, children }: {
  x: number; y: number; w: number; h: number; face: string; press: number; children: ReactNode;
}) {
  const pal = usePalette();
  const sink = DEPTH * press;
  const r = Math.min(w, h) / 2.4;
  return (
    <g>
      <Box x={x - w / 2} y={y - h / 2 + DEPTH} w={w} h={h} r={r} fill={pal.outline} />
      <Box x={x - w / 2} y={y - h / 2 + sink} w={w} h={h} r={r} fill={face} />
      <g transform={`translate(0 ${sink})`}>{children}</g>
    </g>
  );
}

// Icons in a 100 × 100 box, drawn as paths: the fonts carry no such glyphs.
const CUFF = "M 8 46 Q 8 44 10 44 L 24 44 Q 26 44 26 46 L 26 88 Q 26 90 24 90 L 10 90 Q 8 90 8 88 Z";
const HAND = "M 32 48 L 46 22 Q 50 12 58 14 Q 66 17 63 30 L 60 42 L 84 42 Q 94 42 92 52 L 86 82 Q 84 90 76 90 L 32 90 Z";
const BELL = "M 50 16 Q 26 16 26 46 L 26 62 L 16 74 L 84 74 L 74 62 L 74 46 Q 74 16 50 16 Z";
const CLAPPER = "M 42 80 Q 50 92 58 80";

function Icon({ x, y, size, children }: { x: number; y: number; size: number; children: ReactNode }) {
  const s = size / 100;
  return <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}>{children}</g>;
}

export function LikeButton({ x, y, press, liked }: { x: number; y: number; press: number; liked: boolean }) {
  const pal = usePalette();
  const fill = liked ? pal.accent : pal.panel;
  return (
    <PressButton x={x} y={y} w={136} h={136} face={fill} press={press}>
      <Icon x={x} y={y - 2} size={92}>
        <Shape d={CUFF} fill={liked ? pal.panel : pal.accent} strokeWidth={6} />
        <Shape d={HAND} fill={liked ? pal.panel : pal.accent} strokeWidth={6} />
      </Icon>
    </PressButton>
  );
}

export function SubscribeButton({ x, y, press, subscribed, label }: {
  x: number; y: number; press: number; subscribed: boolean; label: string;
}) {
  const pal = usePalette();
  const face = subscribed ? pal.textMuted : pal.hero;
  return (
    <PressButton x={x} y={y} w={300} h={104} face={face} press={press}>
      <Label x={x} y={y + 13} size={38} color={pal.panel} halo={face}>
        {label}
      </Label>
    </PressButton>
  );
}

export function BellButton({ x, y, press, angle }: { x: number; y: number; press: number; angle: number }) {
  const pal = usePalette();
  return (
    <PressButton x={x} y={y} w={104} h={104} face={pal.panel} press={press}>
      <Icon x={x} y={y} size={76}>
        <g transform={`rotate(${angle} 50 14)`}>
          <Shape d={BELL} fill={pal.accent} strokeWidth={6} />
          <Shape d={CLAPPER} strokeWidth={6} />
          <circle cx={50} cy={12} r={5} fill={pal.outline} />
        </g>
      </Icon>
    </PressButton>
  );
}

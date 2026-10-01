import { Easing } from "remotion";
import { progress } from "../../kit/easing";
import { lerp, type Vec } from "../../kit/grid";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Label } from "../../kit/text";
import { Inko } from "../../mascot/Inko";

const STRIDE = Easing.inOut(Easing.cubic);

// Walk from → to over `duration` frames from t = 0, leaning into the motion.
// `p` is the eased progress, for anything that should keep pace with the walker.
export function stride(t: number, from: Vec, to: Vec, duration: number): { at: Vec; lean: number; p: number } {
  const p = progress(t, duration, STRIDE);
  return { at: lerp(from, to, p), lean: Math.sin(Math.PI * p) * 9 * Math.sign(to.x - from.x || 1), p };
}

// A small Inko on the move. `at` sits just under the tentacle tips, so a walker
// on a grid point hovers over it instead of hiding what is drawn there.
export function Walker({ at, lean = 0, scale = 0.4, lookAt, seed, pose, reach }: {
  at: Vec; lean?: number; scale?: number; lookAt?: Vec; seed?: number;
  pose?: "idle" | "surprised" | "cheer"; reach?: number;
}) {
  const y = at.y - 175 * scale;
  return (
    <g transform={`rotate(${lean} ${at.x} ${at.y})`}>
      <Inko x={at.x} y={y} scale={scale} lookAt={lookAt} seed={seed} pose={pose} reach={reach} />
    </g>
  );
}

// A keyboard key; `press` (0–1) sinks it and lights it in the accent.
export function KeyCap({ x, y, label, press }: { x: number; y: number; label: string; press: number }) {
  const pal = usePalette();
  const size = 72;
  const sink = 7 * press;
  const face = press > 0.5 ? pal.accent : pal.panel;
  return (
    <g>
      <Box x={x - size / 2} y={y - size / 2 + 8} w={size} h={size} r={16} fill={pal.outline} />
      <Box x={x - size / 2} y={y - size / 2 + sink} w={size} h={size} r={16} fill={face} />
      <Label x={x} y={y + sink + 13} size={38} halo={face}>{label}</Label>
    </g>
  );
}

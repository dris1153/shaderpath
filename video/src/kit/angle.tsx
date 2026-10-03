import type { Vec } from "./grid";
import { usePalette } from "./palette";
import { Label } from "./text";

// Angles are in degrees, counter-clockwise from +x as on a y-up grid; stage
// points come back in screen px (y down).
export function polar(at: Vec, deg: number, r: number): Vec {
  const a = (deg * Math.PI) / 180;
  return { x: at.x + Math.cos(a) * r, y: at.y - Math.sin(a) * r };
}

function wedgePath(at: Vec, r: number, from: number, to: number): string {
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  const p = polar(at, lo, r);
  const q = polar(at, hi, r);
  return `M ${at.x} ${at.y} L ${p.x} ${p.y} A ${r} ${r} 0 ${hi - lo > 180 ? 1 : 0} 0 ${q.x} ${q.y} Z`;
}

// The angle between two directions at `at`: a tinted wedge with an arc edge,
// and an optional label (θ) just outside the arc's middle.
export function AngleArc({ at, from, to, r = 64, color, label }: {
  at: Vec; from: number; to: number; r?: number; color?: string; label?: string;
}) {
  const pal = usePalette();
  const c = color ?? pal.accent;
  if (Math.abs(to - from) < 0.5) return null;
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  const p = polar(at, lo, r);
  const q = polar(at, hi, r);
  const mid = polar(at, (lo + hi) / 2, r + 30);
  return (
    <g>
      <path d={wedgePath(at, r, from, to)} fill={c} opacity={0.22} />
      <path d={`M ${p.x} ${p.y} A ${r} ${r} 0 ${hi - lo > 180 ? 1 : 0} 0 ${q.x} ${q.y}`} fill="none" stroke={c}
        strokeWidth={5} strokeLinecap="round" />
      {label ? <Label x={mid.x} y={mid.y + 10} size={30}>{label}</Label> : null}
    </g>
  );
}

// a's shadow on the line through `at` along `dir`: a dashed drop from `tip`
// (grown by `drop`), a right-angle mark at the foot, and the shadow segment
// from `at` to the foot (grown by `shadow`). Returns nothing until `drop` > 0.
export function ProjectionDrop({ at, tip, dir, drop, shadow = 0, color }: {
  at: Vec; tip: Vec; dir: number; drop: number; shadow?: number; color?: string;
}) {
  const pal = usePalette();
  if (drop <= 0) return null;
  const u = { x: Math.cos((dir * Math.PI) / 180), y: -Math.sin((dir * Math.PI) / 180) };
  const along = (tip.x - at.x) * u.x + (tip.y - at.y) * u.y;
  const foot = { x: at.x + u.x * along, y: at.y + u.y * along };
  const end = { x: tip.x + (foot.x - tip.x) * drop, y: tip.y + (foot.y - tip.y) * drop };
  // The mark's legs run back along the line (toward `at`) and up toward the tip.
  const back = { x: -u.x * Math.sign(along || 1) * 16, y: -u.y * Math.sign(along || 1) * 16 };
  const upLen = Math.hypot(tip.x - foot.x, tip.y - foot.y) || 1;
  const up = { x: ((tip.x - foot.x) / upLen) * 16, y: ((tip.y - foot.y) / upLen) * 16 };
  return (
    <g>
      {shadow > 0 ? (
        <line x1={at.x} y1={at.y} x2={at.x + (foot.x - at.x) * shadow} y2={at.y + (foot.y - at.y) * shadow}
          stroke={color ?? pal.hero} strokeWidth={16} strokeLinecap="round" opacity={0.55} />
      ) : null}
      <line x1={tip.x} y1={tip.y} x2={end.x} y2={end.y} stroke={pal.textMuted} strokeWidth={4} strokeDasharray="6 10"
        strokeLinecap="round" />
      {drop >= 1 && upLen > 24 ? (
        <path d={`M ${foot.x + back.x} ${foot.y + back.y} L ${foot.x + back.x + up.x} ${foot.y + back.y + up.y} L ${foot.x + up.x} ${foot.y + up.y}`}
          fill="none" stroke={pal.outline} strokeWidth={3} />
      ) : null}
    </g>
  );
}

// What a watcher at `at` sees: a translucent sector `half` degrees either side
// of `dir`, out to `range` px (`grow` 0–1 sweeps it out from the eye).
export function VisionCone({ at, dir, half, range, grow = 1, color }: {
  at: Vec; dir: number; half: number; range: number; grow?: number; color?: string;
}) {
  const pal = usePalette();
  if (grow <= 0) return null;
  const c = color ?? pal.accent;
  return (
    <g>
      <path d={wedgePath(at, range * grow, dir - half, dir + half)} fill={c} opacity={0.25} />
      <path d={wedgePath(at, range * grow, dir - half, dir + half)} fill="none" stroke={c} strokeWidth={4}
        strokeLinejoin="round" strokeDasharray="10 12" opacity={0.8} />
    </g>
  );
}

import { progress } from "./easing";
import { usePalette } from "./palette";
import { Label } from "./text";

export type Vec = { x: number; y: number };

// World units (y up) on a stage grid: one space per diagram, so every tuple
// lands on a grid point and nothing converts units by hand.
export type GridSpace = { ox: number; oy: number; unit: number };

export function toStage(g: GridSpace, p: Vec): Vec {
  return { x: g.ox + p.x * g.unit, y: g.oy - p.y * g.unit };
}

export function lerp(a: Vec, b: Vec, p: number): Vec {
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
}

// a + k·b
export function plus(a: Vec, b: Vec, k = 1): Vec {
  return { x: a.x + b.x * k, y: a.y + b.y * k };
}

export function minus(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

// Plain stage-px arrow: shaft plus a chunky head that shrinks on short arrows.
function ArrowPath({ a, b, stroke, width, dashed }: {
  a: Vec; b: Vec; stroke: string; width: number; dashed?: boolean;
}) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (!(len >= 1)) return null;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const head = Math.min(width * 3.4, len * 0.45);
  const h1 = { x: b.x - head * Math.cos(ang - 0.55), y: b.y - head * Math.sin(ang - 0.55) };
  const h2 = { x: b.x - head * Math.cos(ang + 0.55), y: b.y - head * Math.sin(ang + 0.55) };
  return (
    <g stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} strokeDasharray={dashed ? `${width * 1.6} ${width * 2.4}` : undefined} />
      <path d={`M ${h1.x} ${h1.y} L ${b.x} ${b.y} L ${h2.x} ${h2.y}`} />
    </g>
  );
}

// Unit grid lines over [x0, x1] × [y0, y1]. `axes` (a cue offset) grows the
// x and y axes through the origin; leave it out for a bare grid.
export function Grid({ space, x, y, t, axes }: {
  space: GridSpace; x: [number, number]; y: [number, number]; t: number; axes?: number;
}) {
  const pal = usePalette();
  const fade = progress(t, 18);
  if (fade <= 0) return null;
  const top = space.oy - y[1] * space.unit;
  const bottom = space.oy - y[0] * space.unit;
  const left = space.ox + x[0] * space.unit;
  const right = space.ox + x[1] * space.unit;
  const lines = [];
  for (let i = x[0]; i <= x[1]; i++) {
    const sx = space.ox + i * space.unit;
    lines.push(<line key={`x${i}`} x1={sx} y1={top} x2={sx} y2={bottom} />);
  }
  for (let j = y[0]; j <= y[1]; j++) {
    const sy = space.oy - j * space.unit;
    lines.push(<line key={`y${j}`} x1={left} y1={sy} x2={right} y2={sy} />);
  }
  const px = axes === undefined ? 0 : progress(axes, 20);
  const py = axes === undefined ? 0 : progress(axes - 6, 20);
  return (
    <g>
      <g stroke={pal.sky} strokeWidth={2} opacity={0.4 * fade}>{lines}</g>
      {px > 0 ? (
        <ArrowPath a={{ x: left - 10, y: space.oy }} b={{ x: left - 10 + (right - left + 30) * px, y: space.oy }}
          stroke={pal.outline} width={4} />
      ) : null}
      {py > 0 ? (
        <ArrowPath a={{ x: space.ox, y: bottom + 10 }} b={{ x: space.ox, y: bottom + 10 - (bottom - top + 30) * py }}
          stroke={pal.outline} width={4} />
      ) : null}
      {px > 0.9 ? <Label x={right + 44} y={space.oy + 10} size={28}>x</Label> : null}
      {py > 0.9 ? <Label x={space.ox} y={top - 34} size={28}>y</Label> : null}
    </g>
  );
}

// An arrow from `from` to `to` in world units. `grow` (0–1) extends the tip
// out of the tail; the label sits beside the shaft's middle, on its left
// (`side` = -1 puts it on the right).
export function Vector({ space, from, to, grow = 1, color, width = 7, dashed, opacity, label, side = 1 }: {
  space: GridSpace; from: Vec; to: Vec; grow?: number; color?: string; width?: number; dashed?: boolean;
  opacity?: number; label?: string; side?: 1 | -1;
}) {
  const pal = usePalette();
  if (grow <= 0) return null;
  const a = toStage(space, from);
  const b = lerp(a, toStage(space, to), Math.min(1, grow));
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (!(len >= 1)) return null;
  // Left-hand normal in screen coordinates (y down).
  const n = { x: (b.y - a.y) / len, y: -(b.x - a.x) / len };
  const mid = lerp(a, b, 0.5);
  // Clear the shaft by the label's rough half-size along the normal (~15 px per char at 30 px).
  const off = label ? 30 + Math.abs(n.x) * label.length * 8 + Math.abs(n.y) * 12 : 0;
  return (
    <g opacity={opacity}>
      <ArrowPath a={a} b={b} stroke={color ?? pal.hero} width={width} dashed={dashed} />
      {label && grow > 0.6 ? (
        <Label x={mid.x + n.x * off * side} y={mid.y + n.y * off * side + 10} size={30}>{label}</Label>
      ) : null}
    </g>
  );
}

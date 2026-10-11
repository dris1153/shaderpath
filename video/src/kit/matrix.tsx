import { useId } from "react";
import { progress } from "./easing";
import { lerp, toStage, type GridSpace, type Vec } from "./grid";
import { apply, matrixLayout, type Mat } from "./mat";
import { usePalette } from "./palette";
import { Box, Shape } from "./shapes";
import { Code } from "./text";

export { MONO, matrixLayout } from "./mat";

// A world segment carried through any world → stage map, sampled so a curved map draws a curve.
export function curvePath(map: (p: Vec) => Vec, from: Vec, to: Vec, n = 24): string {
  const pts = Array.from({ length: n + 1 }, (_, i) => map(lerp(from, to, i / n)));
  return `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
}

// The unit grid of `space` carried through m, clipped to `clip` (stage px). Axes are 4 px `outline`.
// `map` (world → stage) replaces the linear mapping for warps no matrix can make; lines are then sampled.
export function MatGrid({ space, m, x, y, t, clip, step = 1, map }: {
  space: GridSpace; m: Mat; x: [number, number]; y: [number, number]; t: number;
  clip: { x: number; y: number; w: number; h: number }; step?: number; map?: (p: Vec) => Vec;
}) {
  const pal = usePalette();
  const id = `clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fade = progress(t, 18);
  if (fade <= 0) return null;
  const at = (p: Vec) => toStage(space, apply(m, p));
  const seg = (p: Vec, q: Vec, key: string, stroke: string, width: number, opacity: number) => {
    if (map) return <path key={key} d={curvePath(map, p, q)} fill="none" stroke={stroke} strokeWidth={width} opacity={opacity} />;
    const a = at(p);
    const b = at(q);
    return <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width} opacity={opacity} />;
  };
  const lines = [];
  for (let i = x[0]; i <= x[1]; i += step) lines.push(seg({ x: i, y: y[0] }, { x: i, y: y[1] }, `x${i}`, pal.sky, 2, 0.45));
  for (let j = y[0]; j <= y[1]; j += step) lines.push(seg({ x: x[0], y: j }, { x: x[1], y: j }, `y${j}`, pal.sky, 2, 0.45));
  return (
    <g opacity={fade}>
      <defs>
        <clipPath id={id}>
          <rect x={clip.x} y={clip.y} width={clip.w} height={clip.h} rx={24} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {lines}
        <g strokeLinecap="round">
          {seg({ x: x[0], y: 0 }, { x: x[1], y: 0 }, "ax", pal.outline, 4, 1)}
          {seg({ x: 0, y: y[0] }, { x: 0, y: y[1] }, "ay", pal.outline, 4, 1)}
        </g>
      </g>
    </g>
  );
}

// The unit square carried through m: a faint `accent` parallelogram.
export function UnitSquare({ space, m, t, opacity = 0.3, map }: {
  space: GridSpace; m: Mat; t: number; opacity?: number; map?: (p: Vec) => Vec;
}) {
  const pal = usePalette();
  const p = progress(t, 16);
  if (p <= 0) return null;
  const unit = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
  const pts = map
    ? unit.flatMap((c, i) => Array.from({ length: 8 }, (_, k) => map(lerp(c, unit[(i + 1) % 4]!, k / 8))))
    : unit.map((c) => toStage(space, apply(m, c)));
  const d = `M ${pts.map((c) => `${c.x} ${c.y}`).join(" L ")} Z`;
  return <path d={d} fill={pal.accent} opacity={opacity * p} stroke={pal.outline} strokeWidth={3} strokeOpacity={0.5} />;
}

// A bracketed matrix centred on (x, y). `tint` (0–1 per column) washes a column in its colour
// (default: column 1 `hero` for î, column 2 `sky` for ĵ); `show` (0–1 per column) fades entries in.
export function MatrixCard({ x, y, text, size = 30, tint, show, colors, panel = true }: {
  x: number; y: number; text: string; size?: number; tint?: number[]; show?: number[]; colors?: string[]; panel?: boolean;
}) {
  const pal = usePalette();
  const { rows, colW, w, h, centres, rowY } = matrixLayout(text, size);
  const cols = colors ?? [pal.hero, pal.sky];
  const top = y - h / 2;
  const lip = size * 0.35;
  const bx = [x - w / 2 + size * 0.15, x + w / 2 - size * 0.15];
  const bracket = (bxv: number, dir: 1 | -1) =>
    `M ${bxv + dir * lip} ${top + size * 0.2} L ${bxv} ${top + size * 0.2} L ${bxv} ${top + h - size * 0.2} L ${bxv + dir * lip} ${top + h - size * 0.2}`;
  return (
    <g>
      {panel ? <Box x={x - w / 2 - 18} y={top - 12} w={w + 36} h={h + 24} r={22} fill={pal.panel} /> : null}
      {colW.map((cw, c) =>
        (tint?.[c] ?? 0) > 0 && cols[c] ? (
          <rect key={`t${c}`} x={x + centres[c]! - cw / 2 + 4} y={top + size * 0.25} width={cw - 8}
            height={h - size * 0.5} rx={size * 0.3} fill={cols[c]} opacity={0.28 * tint![c]!} />
        ) : null,
      )}
      <Shape d={bracket(bx[0]!, 1)} strokeWidth={5} />
      <Shape d={bracket(bx[1]!, -1)} strokeWidth={5} />
      {rows.map((row, r) =>
        row.map((entry, c) => (
          <g key={`${r}${c}`} opacity={show?.[c] ?? 1}>
            <Code x={x + centres[c]!} y={y + rowY[r]!} size={size} anchor="middle">{entry}</Code>
          </g>
        )),
      )}
    </g>
  );
}

// ✓ and ✗ as paths: the bundled fonts lack them.
export function Tick({ x, y, size = 40, draw = 1 }: { x: number; y: number; size?: number; draw?: number }) {
  const pal = usePalette();
  const s = size / 2;
  return <Shape d={`M ${x - s} ${y} L ${x - s * 0.25} ${y + s * 0.7} L ${x + s} ${y - s * 0.8}`} stroke={pal.ok} strokeWidth={size / 5} draw={draw} />;
}

export function Cross({ x, y, size = 40, draw = 1 }: { x: number; y: number; size?: number; draw?: number }) {
  const pal = usePalette();
  const s = size / 2;
  return (
    <g>
      <Shape d={`M ${x - s} ${y - s} L ${x + s} ${y + s}`} stroke={pal.warn} strokeWidth={size / 5} draw={draw} />
      <Shape d={`M ${x + s} ${y - s} L ${x - s} ${y + s}`} stroke={pal.warn} strokeWidth={size / 5} draw={Math.max(0, draw * 2 - 1)} />
    </g>
  );
}

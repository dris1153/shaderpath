import { progress } from "./easing";
import { Pop } from "./motion";
import { usePalette } from "./palette";
import { Arrow, Box, Circle, type LineStyle } from "./shapes";
import { Label } from "./text";

type Anim = { t: number; lineStyle?: LineStyle };

// y-up axes from an origin; each arrow grows from the origin.
export function Axis2D({
  t,
  ox,
  oy,
  xLen,
  yLen,
  xLabel = "x",
  yLabel = "y",
  color,
  lineStyle,
}: Anim & { ox: number; oy: number; xLen: number; yLen: number; xLabel?: string; yLabel?: string; color?: string }) {
  const pal = usePalette();
  const px = progress(t, 18);
  const py = progress(t - 6, 18);
  const stroke = color ?? pal.outline;
  return (
    <g>
      {px > 0 ? (
        <Arrow x1={ox} y1={oy} x2={ox + xLen * px} y2={oy} stroke={stroke} strokeWidth={6} lineStyle={lineStyle} seed={11} />
      ) : null}
      {py > 0 ? (
        <Arrow x1={ox} y1={oy} x2={ox} y2={oy - yLen * py} stroke={stroke} strokeWidth={6} lineStyle={lineStyle} seed={12} />
      ) : null}
      {px > 0.9 ? <Label x={ox + xLen + 26} y={oy + 12}>{xLabel}</Label> : null}
      {py > 0.9 ? <Label x={ox} y={oy - yLen - 20}>{yLabel}</Label> : null}
    </g>
  );
}

// A grid of pixel cells; `fillAt` colours a cell or leaves it blank (null).
export function PixelGrid({
  t,
  x,
  y,
  cols,
  rows,
  cell,
  fillAt,
  lineStyle,
}: Anim & {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cell: number;
  fillAt?: (col: number, row: number) => string | null;
}) {
  const pal = usePalette();
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const cx = x + c * cell;
      const cy = y + r * cell;
      cells.push(
        <Pop key={i} t={t} delay={i * 1.2} x={cx + cell / 2} y={cy + cell / 2}>
          <Box
            x={cx + 3}
            y={cy + 3}
            w={cell - 6}
            h={cell - 6}
            r={Math.min(10, cell / 5)}
            fill={fillAt?.(c, r) ?? pal.panel}
            strokeWidth={4}
            lineStyle={lineStyle}
            seed={100 + i}
          />
        </Pop>,
      );
    }
  }
  return <g>{cells}</g>;
}

export function Point({ t, x, y, color, label }: Anim & { x: number; y: number; color?: string; label?: string }) {
  const pal = usePalette();
  return (
    <Pop t={t} x={x} y={y}>
      <Circle cx={x} cy={y} r={13} fill={color ?? pal.hero} strokeWidth={5} />
      {label ? (
        <Label x={x + 22} y={y - 18} anchor="start" size={26}>
          {label}
        </Label>
      ) : null}
    </Pop>
  );
}

// A rounded bubble with a tail pointing at (tx, ty): captions and speech.
export function Callout({
  t,
  x,
  y,
  w,
  h,
  tx,
  ty,
  text,
  size = 28,
  lineStyle,
}: Anim & { x: number; y: number; w: number; h: number; tx: number; ty: number; text: string; size?: number }) {
  const pal = usePalette();
  // Tail sits on the bottom or top edge nearest the target and stays short,
  // aimed at the target: a bubble points at its speaker, it doesn't reach it.
  const below = ty > y + h / 2;
  const by = below ? y + h : y;
  const bx = Math.max(x + 44, Math.min(tx, x + w - 44));
  // Keep the tail inside a cone around the edge normal (~48° either side), so
  // a target off to the side tilts it instead of flattening it into a sliver.
  const dx = tx - bx;
  const dy = Math.max(Math.abs(ty - by), Math.abs(dx) * 0.9) * (below ? 1 : -1);
  const dist = Math.hypot(dx, dy) || 1;
  const len = Math.min(56, Math.hypot(tx - bx, ty - by));
  const tipX = bx + (dx / dist) * len;
  const tipY = by + (dy / dist) * Math.max(len, 24);
  const half = 18;
  return (
    <Pop t={t} x={x + w / 2} y={y + h / 2}>
      <Box x={x} y={y} w={w} h={h} r={24} fill={pal.panel} lineStyle={lineStyle} seed={51} />
      {/* Hide the box edge under the tail first; the tail's own sides go on top. */}
      <rect x={bx - half + 3} y={by - 3.5} width={half * 2 - 6} height={7} fill={pal.panel} />
      <path
        d={`M ${bx - half} ${by} L ${tipX} ${tipY} L ${bx + half} ${by}`}
        fill={pal.panel}
        stroke={pal.outline}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Label x={x + w / 2} y={y + h / 2 + size / 3} size={size} halo={pal.panel}>
        {text}
      </Label>
    </Pop>
  );
}

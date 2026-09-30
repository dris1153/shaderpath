import { useMemo } from "react";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import { usePalette } from "./palette";

// Two line styles share one API: "clean" is crisp vector with round joins,
// "sketch" runs the same geometry through rough.js with a fixed seed, so the
// wobble never "boils" from frame to frame.
export type LineStyle = "clean" | "sketch";

const gen = rough.generator();

type ShapeStyle = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  lineStyle?: LineStyle;
  seed?: number;
  opacity?: number;
  // 0..1 stroke reveal (see drawn() in motion.tsx); the fill fades in with it.
  draw?: number;
};

// rough.js treats seed 0 as "random", which would boil every frame.
function roughOptions(seed: number | undefined, stroke: string, strokeWidth: number, fill: string | undefined): Options {
  return {
    seed: seed || 7,
    roughness: 1.1,
    bowing: 0.8,
    stroke,
    strokeWidth,
    fill,
    fillStyle: "solid",
    disableMultiStroke: true,
    preserveVertices: true,
  };
}

function reveal(draw: number | undefined) {
  if (draw === undefined) return {};
  return { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw, fillOpacity: draw };
}

function RoughPaths({ drawable, opacity, draw }: { drawable: ReturnType<typeof gen.path>; opacity?: number; draw?: number }) {
  const paths = useMemo(() => gen.toPaths(drawable), [drawable]);
  return (
    <g opacity={opacity}>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          fill={p.fill ?? "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...reveal(draw)}
        />
      ))}
    </g>
  );
}

export function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

// Any closed or open path, in either line style.
export function Shape({ d, fill, stroke, strokeWidth = 5, lineStyle, seed, opacity, draw }: ShapeStyle & { d: string }) {
  const pal = usePalette();
  const line = stroke ?? pal.outline;
  const drawable = useMemo(
    () => (lineStyle === "sketch" ? gen.path(d, roughOptions(seed, line, strokeWidth, fill)) : null),
    [d, lineStyle, seed, line, strokeWidth, fill],
  );
  if (draw !== undefined && draw <= 0) return null;
  if (drawable) return <RoughPaths drawable={drawable} opacity={opacity} draw={draw} />;
  return (
    <path
      d={d}
      fill={fill ?? "none"}
      stroke={line}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      {...reveal(draw)}
    />
  );
}

export function Box({ x, y, w, h, r = 18, ...s }: ShapeStyle & { x: number; y: number; w: number; h: number; r?: number }) {
  return <Shape d={roundedRectPath(x, y, w, h, r)} {...s} />;
}

export function circlePath(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

export function Circle({ cx, cy, r, ...s }: ShapeStyle & { cx: number; cy: number; r: number }) {
  return <Shape d={circlePath(cx, cy, r)} {...s} />;
}

// A line with a chunky, rounded arrowhead at (x2, y2).
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  head = 18,
  ...s
}: ShapeStyle & { x1: number; y1: number; x2: number; y2: number; head?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const spread = 0.55;
  const hx1 = x2 - head * Math.cos(a - spread);
  const hy1 = y2 - head * Math.sin(a - spread);
  const hx2 = x2 - head * Math.cos(a + spread);
  const hy2 = y2 - head * Math.sin(a + spread);
  return (
    <>
      <Shape d={`M ${x1} ${y1} L ${x2} ${y2}`} {...s} fill={undefined} />
      <Shape d={`M ${hx1} ${hy1} L ${x2} ${y2} L ${hx2} ${hy2}`} {...s} fill={undefined} />
    </>
  );
}

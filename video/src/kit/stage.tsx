import { useId, type ReactNode } from "react";
import { usePalette } from "./palette";

export const W = 1280;
export const H = 720;
// Keep key content out of the bottom band: the player draws subtitles there.
export const SAFE = { top: 40, bottom: H - 110, left: 60, right: W - 60 };

// The scene canvas: one SVG in 1280×720 design units over dotted paper. The
// root stage fills the composition whatever its pixel size; nested stages
// (x/y/width/height) are for side-by-side comparisons.
export function Stage({
  children,
  x,
  y,
  width,
  height,
}: {
  children: ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const pal = usePalette();
  // React ids contain characters that break url(#…); keep the safe ones.
  const dots = `dots-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const nested = x !== undefined;
  return (
    <svg
      x={x}
      y={y}
      width={nested ? width : "100%"}
      height={nested ? height : "100%"}
      viewBox={`0 0 ${W} ${H}`}
      style={nested ? undefined : { position: "absolute", inset: 0 }}
    >
      <defs>
        <pattern id={dots} width={32} height={32} patternUnits="userSpaceOnUse">
          <circle cx={16} cy={16} r={2.4} fill={pal.bgDots} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={pal.bg} />
      <rect width={W} height={H} fill={`url(#${dots})`} />
      {children}
    </svg>
  );
}

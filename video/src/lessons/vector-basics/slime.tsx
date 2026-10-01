import { useCurrentFrame } from "remotion";
import { progress } from "../../kit/easing";
import type { Vec } from "../../kit/grid";
import { usePalette } from "../../kit/palette";

// The enemy: a lime blob standing on `at`. `face` runs from 1 (looking right)
// to −1 (left), so a turn slides the eyes across instead of snapping. `hop`
// lifts it off the ground while it moves.
export function Slime({ at, face = 1, scale = 0.7, hop = 0, scared = false }: {
  at: Vec; face?: number; scale?: number; hop?: number; scared?: boolean;
}) {
  const pal = usePalette();
  const frame = useCurrentFrame();
  const wob = Math.sin((frame * 2 * Math.PI) / 50) * 0.04;
  const stretch = 1 + Math.min(hop, 20) * 0.006;
  const ex = face * 14;
  const look = face * 4;
  const brow = scared ? -8 : 6; // inner brow end: down = mean, up = scared
  return (
    <g transform={`translate(${at.x} ${at.y - hop * scale}) scale(${scale * (1 + wob) / stretch} ${scale * (1 - wob) * stretch})`}>
      <path d="M -60 0 C -66 -46 -34 -92 0 -92 C 34 -92 66 -46 60 0 Q 0 12 -60 0 Z" fill={pal.slime}
        stroke={pal.outline} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -52 -8 Q 0 4 52 -8 Q 0 -20 -52 -8 Z" fill={pal.slimeShade} />
      <ellipse cx={-28 - ex * 0.6} cy={-68} rx={11} ry={6} fill="#FFFFFF" opacity={0.7} transform={`rotate(-30 ${-28 - ex * 0.6} -68)`} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={ex + side * 19} cy={-48} rx={13} ry={16} fill="#FFFFFF" stroke={pal.outline} strokeWidth={5} />
          <circle cx={ex + side * 19 + look} cy={-46} r={scared ? 4 : 6} fill={pal.outline} />
          <path d={`M ${ex + side * 32} -72 L ${ex + side * 10} ${-72 + brow}`} stroke={pal.outline} strokeWidth={5}
            strokeLinecap="round" />
        </g>
      ))}
      {scared ? (
        <ellipse cx={ex} cy={-22} rx={6} ry={7} fill={pal.outline} />
      ) : (
        <path d={`M ${ex - 9} -20 Q ${ex} -27 ${ex + 9} -20`} fill="none" stroke={pal.outline} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
}

// Dust puffs bursting out of `at` (t = frames since the burst).
export function Poof({ at, t }: { at: Vec; t: number }) {
  const pal = usePalette();
  if (t < 0) return null;
  const p = progress(t, 26);
  if (p >= 1) return null;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * 2 * Math.PI + 0.3;
        const r = 16 + p * 80;
        return (
          <circle key={i} cx={at.x + Math.cos(a) * r} cy={at.y + Math.sin(a) * r * 0.7} r={4 + 18 * (1 - p)}
            fill={pal.panel} stroke={pal.outline} strokeWidth={4} opacity={1 - p} />
        );
      })}
    </g>
  );
}

import { MONO } from "../../kit/matrix";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Code } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";

// A code chip sized to its text (markers count as the letters they mark).
export function Chip({ x, y, text, size = 30, border }: { x: number; y: number; text: string; size?: number; border?: string }) {
  const pal = usePalette();
  const w = 40 + vecPlain(text).length * MONO * size;
  const h = size * 2.1;
  return (
    <g>
      <Box x={x - w / 2} y={y - h / 2} w={w} h={h} r={22} fill={pal.panel} stroke={border} strokeWidth={border ? 6 : 5} />
      <Code x={x} y={y + size / 3} size={size} anchor="middle">{text}</Code>
    </g>
  );
}

// A numbered step badge (1, 2, 3) under a formula.
export function Badge({ x, y, text, fill }: { x: number; y: number; text: string; fill: string }) {
  const pal = usePalette();
  return (
    <g>
      <circle cx={x} cy={y} r={20} fill={fill} stroke={pal.outline} strokeWidth={4} />
      <Code x={x} y={y + 9} size={26} anchor="middle">{text}</Code>
    </g>
  );
}

import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Label } from "../../kit/text";

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

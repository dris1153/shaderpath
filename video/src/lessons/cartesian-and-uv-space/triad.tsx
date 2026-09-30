import { progress } from "../../kit/easing";
import { drawn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow } from "../../kit/shapes";
import { Label } from "../../kit/text";

type Vec = { x: number; y: number };
type Axis = "x" | "y" | "z";

// Three axis arrows from one origin, drawn x → y → z. `up` tints the up axis;
// `hero` tints one axis once `heroT` (frames since its own cue, default t) passes 0.
export function Triad({
  t,
  o,
  tips,
  up,
  hero,
  heroT,
  heroColor,
}: {
  t: number;
  o: Vec;
  tips: Record<Axis, Vec>;
  up?: Axis;
  hero?: Axis;
  heroT?: number;
  heroColor?: string;
}) {
  const pal = usePalette();
  const axes: Axis[] = ["x", "y", "z"];
  return (
    <g>
      {axes.map((axis, i) => {
        const tip = tips[axis];
        const lit = hero === axis ? progress(heroT ?? t, 10) : 0;
        const color = up === axis ? pal.accent : lit > 0.5 ? (heroColor ?? pal.hero) : pal.outline;
        const d = Math.hypot(tip.x - o.x, tip.y - o.y) || 1;
        const label = { x: tip.x + ((tip.x - o.x) / d) * 30, y: tip.y + ((tip.y - o.y) / d) * 30 + 10 };
        return (
          <g key={axis}>
            <Arrow x1={o.x} y1={o.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={6 + lit * 2} seed={40 + i}
              draw={drawn(t - i * 6, 18)} />
            {t - i * 6 > 16 ? <Label x={label.x} y={label.y}>{axis}</Label> : null}
          </g>
        );
      })}
    </g>
  );
}

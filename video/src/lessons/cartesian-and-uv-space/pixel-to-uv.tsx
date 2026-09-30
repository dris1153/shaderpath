import { PixelGrid } from "../../kit/diagram";
import { progress } from "../../kit/easing";
import { Pop, SlideIn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// A 4×2 screen; pixel (1, 0) shows edge vs centre; then Inko's eight tentacles
// each take a pixel and paint it with its own u, all at once.
const G = { x: 260, y: 90, cols: 4, rows: 2, cell: 130 };
const EDGE_X = G.x + G.cell;
const ROW0_Y = G.y + G.cell / 2;
const CENTERS = Array.from({ length: 8 }, (_, i) => ({
  x: G.x + ((i % 4) + 0.5) * G.cell,
  y: G.y + (Math.floor(i / 4) + 0.5) * G.cell,
}));

// `wide` fits the longer gl_FragCoord line at the minimum code size.
function Card({ t, y, children, strong, wide }: { t: number; y: number; children: string; strong?: boolean; wide?: boolean }) {
  const pal = usePalette();
  const [x, w] = wide ? [740, 480] : [820, 400];
  return (
    <SlideIn t={t} from="right" distance={60}>
      <Box x={x} y={y - 42} w={w} h={84} r={20} fill={pal.panel} stroke={strong ? pal.accent : pal.outline} />
      <Code x={x + w / 2} y={y + 10} size={wide ? 24 : 30} anchor="middle">{children}</Code>
    </SlideIn>
  );
}

export function PixelToUv() {
  const pal = usePalette();
  const grid = useCue("grid");
  const square = useCue("square");
  const center = useCue("center");
  const formula = useCue("formula");
  const paint = useCue("paint");
  const shader = useCue("shader");
  const s = { edge: useString("edge"), center: useString("centerSum"), formula: useString("formula"), shader: useString("shader") };
  // Every pixel at once: the point is that they run in parallel.
  const painted = paint > 20;
  const dotX = EDGE_X + (G.cell / 2) * progress(center, 20);
  // The edge/centre marks give way to the painting.
  const marks = 1 - progress(paint, 12);
  return (
    <Stage>
      <PixelGrid t={grid} {...G} fillAt={() => (painted ? pal.sky : null)} />
      {Array.from({ length: 4 }, (_, c) => (
        <Pop key={c} t={grid} delay={12 + c * 3} x={G.x + (c + 0.5) * G.cell} y={G.y - 22}>
          <Label x={G.x + (c + 0.5) * G.cell} y={G.y - 14} size={26} color={pal.textMuted}>{String(c)}</Label>
        </Pop>
      ))}
      {Array.from({ length: 2 }, (_, r) => (
        <Pop key={r} t={grid} delay={24 + r * 3} x={G.x - 30} y={G.y + (r + 0.5) * G.cell}>
          <Label x={G.x - 30} y={G.y + (r + 0.5) * G.cell + 9} size={26} color={pal.textMuted}>{String(r)}</Label>
        </Pop>
      ))}
      {square >= 0 && marks > 0 ? (
        <g opacity={marks}>
          <rect x={G.x + G.cell + 3} y={G.y + 3} width={G.cell - 6} height={G.cell - 6} rx={20} fill="none"
            stroke={pal.hero} strokeWidth={7 * progress(square, 10)} />
          <line x1={EDGE_X} y1={G.y - 6} x2={EDGE_X} y2={G.y + G.cell + 6} stroke={pal.accent} strokeWidth={8}
            strokeLinecap="round" opacity={progress(square - 10, 10)} />
          {center >= 0 ? <circle cx={dotX} cy={ROW0_Y} r={12} fill={pal.hero} stroke={pal.outline} strokeWidth={4} /> : null}
        </g>
      ) : null}
      {square >= 10 ? <Card t={square - 10} y={130}>{s.edge}</Card> : null}
      {center >= 10 ? <Card t={center - 10} y={230}>{s.center}</Card> : null}
      {formula >= 0 ? <Card t={formula} y={330} strong>{s.formula}</Card> : null}
      {shader >= 0 ? <Card t={shader} y={450} wide>{s.shader}</Card> : null}
      <Inko x={520} y={460} scale={0.85} pose="threads" threads={CENTERS} reach={progress(paint, 18) * (1 - progress(paint - 70, 18))}
        lookAt={{ x: 520, y: 200 }} seed={11} />
      {/* Labels go over the tentacles: they are the point of the beat. */}
      {CENTERS.map((p, i) =>
        painted ? (
          <Pop key={i} t={paint - 20} x={p.x} y={p.y}>
            <Label x={p.x} y={p.y + 9} size={26} halo={pal.sky}>{((i % 4) + 0.5) / 4 + ""}</Label>
          </Pop>
        ) : null,
      )}
    </Stage>
  );
}

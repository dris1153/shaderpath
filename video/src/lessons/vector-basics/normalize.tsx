import { progress } from "../../kit/easing";
import { Grid, lerp, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { NormalizeTrap } from "./normalize-trap";

// Three parts, each cleared before the next: v / |v| onto the unit circle;
// the race replayed as (0, 1) + (1, 0) and fixed by normalizing; the zero trap.
const O = { x: 0, y: 0 };
const HOST = { x: 150, y: 470 };

const GA: GridSpace = { ox: 520, oy: 520, unit: 70 };
const V = { x: 3, y: 4 };
const UNIT_V = { x: 0.6, y: 0.8 };

function UnitPart() {
  const pal = usePalette();
  const divide = useCue("divide");
  const unit = useCue("unit");
  const circle = useCue("circle");
  const s = { v: useString("v"), over: useString("vOverLength"), unit: useString("unitTuple") };
  const tip = lerp(V, UNIT_V, progress(unit, 30));
  const dot = toStage(GA, UNIT_V);
  return (
    <g>
      <Grid space={GA} x={[-1, 5]} y={[-1, 5]} t={divide} axes={divide} />
      {unit >= 0 ? <Vector space={GA} from={O} to={V} dashed opacity={0.4} label={s.v} /> : null}
      <Vector space={GA} from={O} to={tip} grow={drawn(divide, 18, 8)} label={unit < 0 ? s.v : undefined} />
      <Circle cx={GA.ox} cy={GA.oy} r={GA.unit} stroke={pal.sky} strokeWidth={5} draw={drawn(circle, 24)} />
      <Pop t={circle} delay={20} x={dot.x} y={dot.y}>
        <circle cx={dot.x} cy={dot.y} r={9} fill={pal.accent} stroke={pal.outline} strokeWidth={4} />
      </Pop>
      <Pop t={divide} delay={10} x={1055} y={220}>
        <Box x={900} y={150} w={310} h={150} r={24} fill={pal.panel} />
        <Code x={926} y={208} size={36}>{s.over}</Code>
        {unit >= 0 ? <g opacity={progress(unit, 10)}><Code x={926} y={270} size={32}>{s.unit}</Code></g> : null}
      </Pop>
    </g>
  );
}

const GB: GridSpace = { ox: 420, oy: 540, unit: 260 };
const W = { x: 0, y: 1 };
const D = { x: 1, y: 0 };
const SUM = { x: 1, y: 1 };
const HIT = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
const arcAt = (deg: number) => toStage(GB, { x: Math.cos((deg * Math.PI) / 180), y: Math.sin((deg * Math.PI) / 180) });

function RacePart() {
  const pal = usePalette();
  const replay = useCue("replay");
  const w = useCue("w");
  const d = useCue("d");
  const sum = useCue("sum");
  const root = useCue("root");
  const fix = useCue("fix");
  const norm = useCue("norm");
  const s = {
    w: useString("tuple01"), d: useString("tuple10"), sum: useString("tuple11"), root: useString("rootTwo"),
    gap: useString("gapPercent"), code: useString("normalizeSpeed"),
  };
  const a0 = arcAt(-12);
  const a1 = arcAt(102);
  const tip = lerp(SUM, HIT, progress(norm, 30));
  const band = { a: toStage(GB, HIT), b: lerp(toStage(GB, HIT), toStage(GB, SUM), drawn(root, 16)) };
  const ends = [toStage(GB, D), toStage(GB, HIT)];
  return (
    <g>
      <path d={`M ${a0.x} ${a0.y} A ${GB.unit} ${GB.unit} 0 0 0 ${a1.x} ${a1.y}`} fill="none" stroke={pal.sky}
        strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn(replay, 24)} />
      <Pop t={replay} x={GB.ox} y={GB.oy}>
        <circle cx={GB.ox} cy={GB.oy} r={9} fill={pal.panel} stroke={pal.outline} strokeWidth={4} />
      </Pop>
      <FadeOut t={norm}>
        {root >= 0 ? (
          <line x1={band.a.x} y1={band.a.y} x2={band.b.x} y2={band.b.y} stroke={pal.hero} strokeWidth={20}
            strokeLinecap="round" opacity={0.4} />
        ) : null}
        <Vector space={GB} from={D} to={SUM} grow={drawn(sum, 18)} color={pal.sky} dashed opacity={0.7} />
        <Pop t={root} delay={8} x={860} y={290}>
          <Title x={860} y={306} size={52}>{s.root}</Title>
        </Pop>
        <Pop t={fix} x={860} y={366}>
          <Title x={860} y={382} size={46} color={pal.hero}>{s.gap}</Title>
        </Pop>
      </FadeOut>
      <Vector space={GB} from={O} to={W} grow={drawn(w, 18)} color={pal.sky} label={s.w} />
      <Vector space={GB} from={O} to={D} grow={drawn(d, 18)} color={pal.accent} label={s.d} side={-1} />
      <Vector space={GB} from={O} to={tip} grow={drawn(sum, 18, 10)} label={norm < 0 ? s.sum : undefined} />
      {ends.map((p, i) => (
        <Pop key={i} t={norm} delay={30 + i * 5} x={p.x} y={p.y}>
          <circle cx={p.x} cy={p.y} r={11} fill={pal.ok} stroke={pal.outline} strokeWidth={4} />
        </Pop>
      ))}
      <Pop t={norm} delay={8} x={1010} y={470}>
        <Box x={800} y={430} w={420} h={80} r={22} fill={pal.panel} stroke={pal.ok} strokeWidth={6} />
        <Code x={1010} y={480} size={28} anchor="middle">{s.code}</Code>
      </Pop>
    </g>
  );
}

export function Normalize() {
  const divide = useCue("divide");
  const replay = useCue("replay");
  const zero = useCue("zero");
  const lookAt = replay >= 0 ? { x: 520, y: 380 } : toStage(GA, UNIT_V);
  return (
    <Stage>
      <FadeOut t={replay}><UnitPart /></FadeOut>
      {replay >= 0 ? <FadeOut t={zero}><RacePart /></FadeOut> : null}
      <FadeOut t={zero}>
        <Pop t={divide} x={HOST.x} y={HOST.y}>
          <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={15} lookAt={lookAt} />
        </Pop>
      </FadeOut>
      {zero >= 0 ? <NormalizeTrap /> : null}
    </Stage>
  );
}

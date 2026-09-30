import { progress } from "../../kit/easing";
import { Pop, SlideIn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow, Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// A ruler from −1 to 1. The [0, 1] bar stretches by two and shifts by one;
// the wrong "u − 0.5" only covers the middle half; y flips.
const ZERO = 640;
const UNIT = 400;
const BAR_Y = 300;
const TICKS = [-1, -0.5, 0, 0.5, 1];
const fmt = (n: number) => (n < 0 ? `−${-n}` : String(n));

function FormulaCard({ t, x, y, children }: { t: number; x: number; y: number; children: string }) {
  const pal = usePalette();
  return (
    <SlideIn t={t} from="up" distance={40}>
      <Box x={x - 170} y={y - 40} w={340} h={80} r={20} fill={pal.panel} />
      <Code x={x} y={y + 11} size={32} anchor="middle">{children}</Code>
    </SlideIn>
  );
}

export function Ndc() {
  const pal = usePalette();
  const range = useCue("range");
  const wide = useCue("wide");
  const sign = useCue("sign");
  const stretch = useCue("stretch");
  const wrong = useCue("wrong");
  const flip = useCue("flip");
  const s = { stretch: useString("stretch"), wrong: useString("wrong"), flip: useString("flip") };
  const grow = progress(wide, 30);
  const left = ZERO - UNIT * grow;
  const halves = progress(sign, 12);
  const ghost = progress(wrong, 16);
  return (
    <Stage>
      <line x1={ZERO - UNIT - 40} y1={BAR_Y + 50} x2={ZERO + UNIT + 40} y2={BAR_Y + 50} stroke={pal.outline} strokeWidth={5}
        strokeLinecap="round" opacity={progress(range, 12)} />
      {TICKS.map((v, i) => (
        <Pop key={v} t={range} delay={6 + i * 3} x={ZERO + v * UNIT} y={BAR_Y + 50}>
          <line x1={ZERO + v * UNIT} y1={BAR_Y + 40} x2={ZERO + v * UNIT} y2={BAR_Y + 60} stroke={pal.outline} strokeWidth={5} strokeLinecap="round" />
          <Label x={ZERO + v * UNIT} y={BAR_Y + 95} size={28}>{fmt(v)}</Label>
        </Pop>
      ))}
      {range >= 10 ? (
        <g opacity={progress(range - 10, 12)}>
          <Box x={left} y={BAR_Y - 30} w={ZERO + UNIT - left} h={60} r={14} fill={pal.sky} />
          {halves > 0 ? (
            <g opacity={halves}>
              <Box x={ZERO - UNIT} y={BAR_Y - 30} w={UNIT} h={60} r={14} fill={pal.sky} />
              <Box x={ZERO} y={BAR_Y - 30} w={UNIT} h={60} r={14} fill={pal.accent} />
              <Label x={ZERO - UNIT / 2} y={BAR_Y + 14} size={44} halo={pal.sky}>−</Label>
              <Label x={ZERO + UNIT / 2} y={BAR_Y + 14} size={44} halo={pal.accent}>+</Label>
            </g>
          ) : null}
        </g>
      ) : null}
      {stretch >= 0 ? <FormulaCard t={stretch} x={ZERO} y={130}>{s.stretch}</FormulaCard> : null}
      {wrong >= 0 ? (
        <g opacity={ghost}>
          <rect x={ZERO - UNIT / 2} y={BAR_Y + 130} width={UNIT} height={44} rx={12} fill="none" stroke={pal.warn}
            strokeWidth={5} strokeDasharray="14 10" />
          <Code x={ZERO} y={BAR_Y + 162} size={26} anchor="middle" color={pal.warn}>{s.wrong}</Code>
          <Shape d={`M ${ZERO + UNIT / 2 + 28} ${BAR_Y + 140} l 24 24 m 0 -24 l -24 24`} stroke={pal.warn} strokeWidth={7} />
        </g>
      ) : null}
      {flip >= 0 ? (
        <g>
          <FormulaCard t={flip} x={ZERO} y={560}>{s.flip}</FormulaCard>
          <Arrow x1={ZERO - 250} y1={520} x2={ZERO - 250} y2={600} strokeWidth={6} seed={71} />
          <Label x={ZERO - 280} y={570}>v</Label>
          <Arrow x1={ZERO + 250} y1={600} x2={ZERO + 250} y2={520} stroke={pal.hero} strokeWidth={6} seed={72} />
          <Label x={ZERO + 280} y={570}>y</Label>
        </g>
      ) : null}
      <Inko x={160} y={470} scale={0.6} pose="surprised" reach={progress(wrong, 12) * (1 - progress(flip, 12))} seed={12}
        lookAt={{ x: ZERO, y: BAR_Y }} />
    </Stage>
  );
}

import { progress } from "../../kit/easing";
import { ArrowPath } from "../../kit/grid";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { MatrixCard, MONO } from "./parts";

// One pill per idea as it is named, then the pointer to the lesson's demo.
const CHAR = 30 * MONO; // Code at 30 px
const pillW = (text: string) => 40 + vecPlain(text).length * CHAR;
const ROWS = [105, 230, 360, 485];

function Pill({ t, delay = 0, x, y, text, border }: { t: number; delay?: number; x: number; y: number; text: string; border?: string }) {
  const pal = usePalette();
  const w = pillW(text);
  return (
    <Pop t={t} delay={delay} x={x} y={y}>
      <Box x={x - w / 2} y={y - 36} w={w} h={72} r={36} fill={pal.panel} stroke={border} strokeWidth={6} />
      <Code x={x} y={y + 10} size={30} anchor="middle">{text}</Code>
    </Pop>
  );
}

export function Recap() {
  const pal = usePalette();
  const recap = useCue("recap");
  const linear = useCue("linear");
  const cols = useCue("cols");
  const mul = useCue("mul");
  const kinds = useCue("kinds");
  const order = useCue("order");
  const bigger = useCue("bigger");
  const next = useCue("next");
  const demo = useCue("demo");
  const s = {
    Mv: useString("Mv"), linear: useString("linear"), abcd: useString("matABCD"), mix: useString("mixColumns"),
    rot: useString("matRotate"), scale: useString("matScale"), shear: useString("matShear"), order: useString("RSv"),
    bigger: useString("bigger"), title: useString("demoTitle"), subtitle: useString("demoSubtitle"), b: useString("b"),
  };
  const kindsCards = [{ x: 560, text: s.rot }, { x: 800, text: s.scale }, { x: 990, text: s.shear }];
  // The translation icon: a box slides along an arrow (next lesson), then rests.
  const slide = progress(next - 10, 40);
  // The demo's b slider: the knob swings, then settles before the cut.
  const knob = 860 + 150 * Math.sin((2 * Math.PI * Math.max(0, demo - 30)) / 90) * progress(demo - 30, 12) * (1 - progress(demo - 120, 40));

  return (
    <Stage>
      <Inko x={210} y={400} scale={0.85} seed={13} pose={demo >= 0 ? "cheer" : "idle"} reach={progress(demo, 14)}
        lookAt={{ x: 800, y: 300 }} />
      <FadeOut t={demo}>
        <Pill t={recap} x={600} y={ROWS[0]!} text={s.Mv} border={pal.hero} />
        <Pill t={linear} x={820} y={ROWS[0]!} text={s.linear} border={pal.ok} />
        <Pop t={cols} x={560} y={ROWS[1]!}>
          <MatrixCard x={560} y={ROWS[1]!} text={s.abcd} size={30} tint={[1, 1]} />
        </Pop>
        <Pill t={mul} x={890} y={ROWS[1]!} text={s.mix} />
        {kindsCards.map((c, i) => (
          <Pop key={i} t={kinds} delay={i * 5} x={c.x} y={ROWS[2]!}>
            <MatrixCard x={c.x} y={ROWS[2]!} text={c.text} size={26} />
          </Pop>
        ))}
        <Pill t={order} x={620} y={ROWS[3]!} text={s.order} border={pal.warn} />
        <Pill t={bigger} x={880} y={ROWS[3]!} text={s.bigger} />
        <Pop t={next} x={1110} y={ROWS[3]!}>
          <ArrowPath a={{ x: 1030, y: ROWS[3]! + 26 }} b={{ x: 1200, y: ROWS[3]! + 26 }} stroke={pal.outline} width={4} />
          <Box x={1030 + 110 * slide} y={ROWS[3]! - 26} w={40} h={40} r={8} fill={pal.accent} strokeWidth={4} />
        </Pop>
      </FadeOut>
      <Pop t={demo} delay={10} x={820} y={300}>
        <Box x={470} y={170} w={700} h={260} r={36} fill={pal.panel} stroke={pal.hero} strokeWidth={7} />
        <Shape d="M 530 222 L 530 298 L 596 260 Z" fill={pal.hero} strokeWidth={5} />
        <Label x={880} y={258} size={42} halo={pal.panel}>{s.title}</Label>
        <Label x={880} y={306} size={30} color={pal.textMuted} halo={pal.panel}>{s.subtitle}</Label>
        <Label x={600} y={382} size={32} halo={pal.panel}>{s.b}</Label>
        <line x1={640} y1={372} x2={1080} y2={372} stroke={pal.sky} strokeWidth={8} strokeLinecap="round" />
        <circle cx={knob} cy={372} r={17} fill={pal.panel} stroke={pal.outline} strokeWidth={5} />
      </Pop>
    </Stage>
  );
}

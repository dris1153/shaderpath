import { progress } from "../../kit/easing";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// One pill per idea as it is named, then the pointer to the lesson's demo.
const CHAR = 18; // JetBrains Mono at 30 px
const pillW = (text: string) => 40 + vecPlain(text).length * CHAR;
const ROWS = [110, 195, 280, 365, 450, 535];
const MID = 820;

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
  const dot = useCue("dot");
  const sign = useCue("sign");
  const cos = useCue("cos");
  const crossCue = useCue("cross");
  const order = useCue("order");
  const normal = useCue("normal");
  const light = useCue("light");
  const demo = useCue("demo");
  const s = {
    dot: useString("dotAlgebra"), signs: [useString("signFront"), useString("signSide"), useString("signBehind")],
    cos: useString("dotUnit"), cross: useString("crossSymbol"), order: useString("crossSwap"),
    normal: useString("normalFormula"), light: useString("lambert"), demo: useString("demoTitle"),
  };
  const signTones = [pal.ok, pal.textMuted, pal.warn];

  return (
    <Stage>
      <Inko x={210} y={400} scale={0.85} seed={13} pose={demo >= 0 ? "cheer" : "idle"} reach={progress(demo, 14)}
        lookAt={{ x: MID, y: 300 }} />
      <FadeOut t={demo}>
        <Pill t={dot} x={MID} y={ROWS[0]!} text={s.dot} border={pal.hero} />
        {s.signs.map((text, i) => (
          <Pill key={text} t={sign} delay={i * 5} x={MID - 160 + i * 160} y={ROWS[1]!} text={text} border={signTones[i]} />
        ))}
        <Pill t={cos} x={MID} y={ROWS[2]!} text={s.cos} />
        <Pill t={crossCue} x={MID - 230} y={ROWS[3]!} text={s.cross} border={pal.hero} />
        <Pill t={order} x={MID + 90} y={ROWS[3]!} text={s.order} border={pal.warn} />
        <Pill t={normal} x={MID} y={ROWS[4]!} text={s.normal} />
        <Pill t={light} x={MID} y={ROWS[5]!} text={s.light} border={pal.accent} />
      </FadeOut>
      <Pop t={demo} delay={10} x={MID} y={300}>
        <Box x={480} y={210} w={680} h={180} r={36} fill={pal.panel} stroke={pal.hero} strokeWidth={7} />
        <Shape d="M 540 262 L 540 338 L 606 300 Z" fill={pal.hero} strokeWidth={5} />
        <Label x={870} y={314} size={42} halo={pal.panel}>{s.demo}</Label>
      </Pop>
    </Stage>
  );
}

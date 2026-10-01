import { progress } from "../../kit/easing";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow, Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// One pill per idea as it is named, then the three traps in `warn`, then the
// pointer to the lesson's demo.
const CHAR = 18; // JetBrains Mono at 30 px
const pillW = (text: string) => 40 + text.length * CHAR;

function Pill({ t, x, y, text, border }: { t: number; x: number; y: number; text: string; border?: string }) {
  const pal = usePalette();
  const w = pillW(text);
  return (
    <Pop t={t} x={x} y={y}>
      <Box x={x - w / 2} y={y - 36} w={w} h={72} r={36} fill={pal.panel} stroke={border} strokeWidth={6} />
      <Code x={x} y={y + 10} size={30} anchor="middle">{text}</Code>
    </Pop>
  );
}

export function Recap() {
  const pal = usePalette();
  const recap = useCue("recap");
  const ops = [useCue("add"), useCue("sub"), useCue("scale"), useCue("length"), useCue("unit")];
  const traps = [useCue("speed"), useCue("order"), useCue("zeroTrap")];
  const demo = useCue("demo");
  const s = {
    tuple: useString("recapTuple"),
    ops: [useString("aPlusB"), useString("playerMinusEnemy"), useString("kTimesV"), useString("lengthShort"), useString("vOverLength")],
    traps: [useString("gapPercent"), useString("enemyMinusPlayer"), useString("nan")],
    demo: useString("demoTitle"), demoSub: useString("demoSubtitle"),
  };
  const opAt = [{ x: 565, y: 230 }, { x: 800, y: 230 }, { x: 1035, y: 230 }, { x: 680, y: 330 }, { x: 910, y: 330 }];
  const trapX = [560, 800, 1030];
  return (
    <Stage>
      <Inko x={210} y={400} scale={0.85} seed={13} pose={demo >= 0 ? "cheer" : "idle"} reach={progress(demo, 14)}
        lookAt={{ x: 800, y: 280 }} />
      <FadeOut t={demo}>
        <Pop t={recap} x={800} y={110}>
          <Box x={560} y={72} w={480} h={76} r={38} fill={pal.panel} stroke={pal.hero} strokeWidth={6} />
          <Arrow x1={610} y1={126} x2={690} y2={94} stroke={pal.hero} strokeWidth={7} />
          <Code x={850} y={121} size={32} anchor="middle">{s.tuple}</Code>
        </Pop>
        {s.ops.map((text, i) => (
          <Pill key={text} t={ops[i]!} x={opAt[i]!.x} y={opAt[i]!.y} text={text} />
        ))}
        {s.traps.map((text, i) => (
          <Pill key={text} t={traps[i]!} x={trapX[i]!} y={450} text={text} border={pal.warn} />
        ))}
      </FadeOut>
      <Pop t={demo} delay={10} x={820} y={300}>
        <Box x={480} y={200} w={680} h={200} r={36} fill={pal.panel} stroke={pal.hero} strokeWidth={7} />
        <Shape d="M 540 262 L 540 338 L 606 300 Z" fill={pal.hero} strokeWidth={5} />
        <Label x={870} y={290} size={42} halo={pal.panel}>{s.demo}</Label>
        <Label x={870} y={346} size={32} color={pal.textMuted} halo={pal.panel}>{s.demoSub}</Label>
      </Pop>
    </Stage>
  );
}

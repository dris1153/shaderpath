import { progress } from "../../kit/easing";
import { Grid, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// v = (3, 4): its legs make a right triangle, and the card works Pythagoras
// through to 5. Then the lengthSq aside, with the square root crossed out.
const G: GridSpace = { ox: 270, oy: 520, unit: 80 };
const V = { x: 3, y: 4 };
const HOST = { x: 130, y: 470 };
const CARD = { x: 650, y: 96, w: 560, h: 230 };
const SQ = { x: 650, y: 380, w: 440, h: 90 };
const ROOT = { x: 1160, y: 420 };

export function Length() {
  const pal = usePalette();
  const triangle = useCue("triangle");
  const legs = useCue("legs");
  const formula = useCue("formula");
  const example = useCue("example");
  const five = useCue("five");
  const threeD = useCue("threeD");
  const compare = useCue("compare");
  const cheap = useCue("cheap");
  const s = {
    v: useString("v"), x: useString("x"), y: useString("y"), three: useString("three"), four: useString("four"),
    formula: useString("lengthFormula"), example: useString("lengthExample"), result: useString("lengthResult"), threeD: useString("length3d"),
    sq: useString("lengthSq"), root: useString("root"),
  };

  const o = toStage(G, { x: 0, y: 0 });
  const corner = toStage(G, { x: V.x, y: 0 });
  const tip = toStage(G, V);
  const xLeg = progress(legs, 18);
  const yLeg = progress(legs - 12, 18);
  const named = example >= 0;

  return (
    <Stage>
      <Grid space={G} x={[0, 4]} y={[0, 5]} t={triangle} axes={triangle} />
      {xLeg > 0 ? (
        <line x1={o.x} y1={o.y} x2={o.x + (corner.x - o.x) * xLeg} y2={o.y} stroke={pal.accent} strokeWidth={9} strokeLinecap="round" />
      ) : null}
      {yLeg > 0 ? (
        <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + (tip.y - corner.y) * yLeg} stroke={pal.sky}
          strokeWidth={9} strokeLinecap="round" />
      ) : null}
      {yLeg >= 1 ? (
        <path d={`M ${corner.x - 24} ${corner.y} L ${corner.x - 24} ${corner.y - 24} L ${corner.x} ${corner.y - 24}`} fill="none"
          stroke={pal.outline} strokeWidth={4} />
      ) : null}
      <Vector space={G} from={{ x: 0, y: 0 }} to={V} grow={drawn(triangle, 20, 10)} label={s.v} />
      <Pop t={legs} delay={14} x={(o.x + corner.x) / 2} y={o.y + 44}>
        <Label x={(o.x + corner.x) / 2} y={o.y + 50} size={32}>{named ? s.three : s.x}</Label>
      </Pop>
      <Pop t={legs} delay={26} x={corner.x + 34} y={(corner.y + tip.y) / 2}>
        <Label x={corner.x + 34} y={(corner.y + tip.y) / 2 + 11} size={32}>{named ? s.four : s.y}</Label>
      </Pop>

      <Pop t={formula} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={24} fill={pal.panel} />
        <Code x={CARD.x + 30} y={CARD.y + 66} size={36}>{s.formula}</Code>
        {example >= 0 ? (
          <g opacity={progress(example, 10)}>
            <Code x={CARD.x + 30} y={CARD.y + 136} size={34}>{s.example}</Code>
          </g>
        ) : null}
        {five >= 0 ? (
          <g opacity={progress(five, 10)}>
            {/* Mono advance is 0.6 em: start one space after the first part. */}
            <Code x={CARD.x + 30 + (vecPlain(s.example).length + 1) * 34 * 0.6} y={CARD.y + 136} size={34}>{s.result}</Code>
          </g>
        ) : null}
        {threeD >= 0 ? (
          <g opacity={progress(threeD, 10)}>
            <Code x={CARD.x + 30} y={CARD.y + 198} size={28} color={pal.textMuted}>{s.threeD}</Code>
          </g>
        ) : null}
      </Pop>
      <Pop t={compare} x={SQ.x + SQ.w / 2} y={SQ.y + SQ.h / 2}>
        <Box x={SQ.x} y={SQ.y} w={SQ.w} h={SQ.h} r={22} fill={pal.panel} stroke={pal.ok} strokeWidth={6} />
        <Code x={SQ.x + 22} y={SQ.y + 53} size={24}>{s.sq}</Code>
      </Pop>
      <Pop t={cheap} x={ROOT.x} y={ROOT.y}>
        <Title x={ROOT.x} y={ROOT.y + 32} size={100}>{s.root}</Title>
        <path d={`M ${ROOT.x - 46} ${ROOT.y + 44} L ${ROOT.x + 46} ${ROOT.y - 44}`} stroke={pal.warn} strokeWidth={8}
          strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn(cheap, 12, 8)} />
      </Pop>
      <Pop t={triangle} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.45} seed={12} lookAt={compare >= 0 ? { x: 860, y: 425 } : formula >= 0 ? { x: 900, y: 200 } : tip} />
      </Pop>
    </Stage>
  );
}

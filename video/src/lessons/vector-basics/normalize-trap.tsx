import { progress } from "../../kit/easing";
import { toStage, type GridSpace } from "../../kit/grid";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Code, Label, useString } from "../../kit/text";
import { useCue } from "../../scene/cue";
import { stride, Walker } from "./parts";
import { Poof, Slime } from "./slime";

// The slime lands on Inko, player − enemy = (0, 0), a hand-written normalize
// divides by zero and the slime turns into NaN and vanishes. The fix checks
// the length first, and the slime is back.
const G: GridSpace = { ox: 640, oy: 430, unit: 64 };
const P = toStage(G, { x: 2, y: 0 });
const E = toStage(G, { x: -4, y: 0 });

function Card({ t, y, w, text, border }: { t: number; y: number; w: number; text: string; border: string }) {
  const pal = usePalette();
  return (
    <Pop t={t} x={640} y={y}>
      <Box x={640 - w / 2} y={y - 38} w={w} h={76} r={22} fill={pal.panel} stroke={border} strokeWidth={6} />
      <Code x={640} y={y + 11} size={30} anchor="middle">{text}</Code>
    </Pop>
  );
}

export function NormalizeTrap() {
  const pal = usePalette();
  const zero = useCue("zero");
  const pz = useCue("pz");
  const nan = useCue("nan");
  const poof = useCue("poof");
  const vanish = useCue("vanish");
  const noError = useCue("noError");
  const check = useCue("check");
  const s = {
    zero: useString("zeroChip"), nan: useString("nanCard"), label: useString("nan"),
    errors: useString("noErrors"), fix: useString("fixCode"),
  };
  const hop = stride(zero - 30, E, P, 50);
  const hopY = hop.p > 0 && hop.p < 1 ? 60 * Math.sin(Math.PI * hop.p) : 0;
  // Gone at the poof (a quick shrink), back where it started once the fix is in.
  const gone = check >= 0 ? 0 : progress(vanish, 6);
  const slimeAt = check >= 0 ? E : hop.at;
  return (
    <g>
      <Pop t={zero} x={P.x} y={P.y - 60}>
        <Walker at={P} scale={0.5} seed={4} pose="surprised" lookAt={slimeAt}
          reach={progress(zero - 70, 10) * (1 - progress(check, 14))} />
      </Pop>
      {gone < 1 ? (
        <Pop t={check >= 0 ? check : zero} delay={check >= 0 ? 10 : 8} x={slimeAt.x} y={slimeAt.y - 40}>
          <g transform={`translate(${slimeAt.x} ${slimeAt.y}) scale(${1 - gone}) translate(${-slimeAt.x} ${-slimeAt.y})`}>
            <Slime at={slimeAt} scale={0.6} hop={hopY} face={1} />
          </g>
        </Pop>
      ) : null}
      {check < 0 ? <Poof at={{ x: P.x, y: P.y - 25 }} t={vanish} /> : null}
      <FadeOut t={check}>
        <Pop t={poof} delay={6} x={P.x + 150} y={P.y - 70}>
          <Label x={P.x + 150} y={P.y - 56} size={44} color={pal.warn}>{s.label}</Label>
        </Pop>
      </FadeOut>

      <FadeOut t={check}>
        <Card t={pz} y={100} w={520} text={s.zero} border={pal.outline} />
        <Card t={nan} y={190} w={520} text={s.nan} border={pal.warn} />
        <Pop t={noError} x={1060} y={540}>
          <Box x={950} y={508} w={220} h={64} r={20} fill={pal.panel} />
          <Code x={1060} y={550} size={28} anchor="middle" color={pal.textMuted}>{s.errors}</Code>
        </Pop>
      </FadeOut>
      <Card t={check} y={120} w={520} text={s.fix} border={pal.ok} />
    </g>
  );
}

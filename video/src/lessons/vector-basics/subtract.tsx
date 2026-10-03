import { progress } from "../../kit/easing";
import { Grid, lerp, minus, plus, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { useCue } from "../../scene/cue";
import { stride, Walker } from "../../mascot/Walker";
import { Slime } from "../../mascot/Slime";

// player − enemy runs from the slime to Inko. The slime follows it part way,
// then the swapped order points away from Inko and the slime runs to its tip.
const G: GridSpace = { ox: 640, oy: 400, unit: 64 };
const P = { x: 5, y: 0 };
const E = { x: -5, y: -1 };
const M = lerp(E, P, 0.55);
// It stops short of the swapped arrow's tip, so the head stays in view.
const FLED = plus(M, minus(M, P), 0.55);
const CHIP = { x: 640, y: 96 };
const hops = (p: number) => (p > 0 && p < 1 ? 18 * Math.abs(Math.sin(Math.PI * p * 3)) : 0);

function Chip({ text, border, t }: { text: string; border: string; t: number }) {
  const pal = usePalette();
  return (
    <Pop t={t} x={CHIP.x} y={CHIP.y}>
      <Box x={CHIP.x - 180} y={CHIP.y - 36} w={360} h={72} r={22} fill={pal.panel} stroke={border} strokeWidth={6} />
      <Code x={CHIP.x} y={CHIP.y + 11} size={34} anchor="middle">{text}</Code>
    </Pop>
  );
}

export function Subtract() {
  const pal = usePalette();
  const chase = useCue("chase");
  const formula = useCue("formula");
  const arrow = useCue("arrow");
  const follow = useCue("follow");
  const flip = useCue("flip");
  const runs = useCue("runs");
  const silent = useCue("silent");
  const always = useCue("always");
  const s = { right: useString("playerMinusEnemy"), wrong: useString("enemyMinusPlayer"), player: useString("player"), enemy: useString("enemy") };

  const close = stride(follow, E, M, 70);
  const flee = stride(runs - 10, M, FLED, 60);
  const slime = runs - 10 >= 0 ? flee.at : close.at;
  // Live player − enemy while closing in; at the flip it turns through zero to
  // enemy − player, which stays put while the slime runs along it.
  const flipP = progress(flip, 20);
  const toward = minus(P, slime);
  const away = minus(M, P);
  const showFlip = flip >= 0 && always < 0;
  const face = runs >= 0 && always < 0 ? 1 - 2 * progress(runs, 10) : always >= 0 ? -1 + 2 * progress(always, 10) : 1;
  const ps = toStage(G, P);
  const es = toStage(G, slime);
  const tick = { x: CHIP.x + 210, y: CHIP.y };

  return (
    <Stage>
      <Grid space={G} x={[-8, 8]} y={[-3, 3]} t={chase} />
      {flip < 0 || always >= 0 ? (
        <Vector space={G} from={slime} to={plus(slime, toward)} grow={always >= 0 ? drawn(always, 18) : drawn(arrow, 20)} />
      ) : null}
      {flip >= 0 ? (
        <FadeOut t={always}>
          <Vector space={G} from={M} to={plus(M, lerp(minus(P, M), away, flipP))} color={pal.warn}
            opacity={1 - 0.4 * progress(runs, 30)} />
        </FadeOut>
      ) : null}

      <Pop t={chase} delay={6} x={es.x} y={es.y - 40}>
        <Slime at={toStage(G, slime)} face={face} hop={runs - 10 >= 0 ? hops(flee.p) : hops(close.p)}
          scared={runs >= 0 && always < 0} />
        <Label x={es.x} y={es.y + 44} size={26} color={pal.textMuted}>{s.enemy}</Label>
      </Pop>
      <Pop t={chase} x={ps.x} y={ps.y - 60}>
        <Walker at={ps} scale={0.5} seed={4} lookAt={es} pose="surprised"
          reach={progress(runs, 12) * (1 - progress(silent, 12))} />
        <Label x={ps.x} y={ps.y + 44} size={26} color={pal.textMuted}>{s.player}</Label>
      </Pop>

      <FadeOut t={flip}><Chip text={s.right} border={pal.outline} t={formula} /></FadeOut>
      <FadeOut t={always}>
        <Chip text={s.wrong} border={pal.warn} t={flip - 4} />
        {silent >= 0 ? (
          <path d={`M ${tick.x - 16} ${tick.y} L ${tick.x - 4} ${tick.y + 13} L ${tick.x + 18} ${tick.y - 14}`} fill="none"
            stroke={pal.ok} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn(silent, 12)} />
        ) : null}
      </FadeOut>
      <Chip text={s.right} border={pal.ok} t={always - 4} />
    </Stage>
  );
}

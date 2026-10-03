import { progress } from "../../kit/easing";
import { lerp, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Title, useString } from "../../kit/text";
import { useCue } from "../../scene/cue";
import { stride, Walker } from "../../mascot/Walker";
import { KeyCap } from "./parts";

// Two starts, each with a ring of radius one "speed setting" (one unit). The D
// walker lands on its ring; the W+D walker moves (1, 1) in the same time and
// ends √2 out, past its ring. Same walk length, so the gap is the 41%.
const L: GridSpace = { ox: 300, oy: 420, unit: 180 };
const R: GridSpace = { ox: 830, oy: 420, unit: 180 };
const WALK = 60;
const START = 14;
const O = { x: 0, y: 0 };
const STRAIGHT = { x: 1, y: 0 };
const DIAGONAL = { x: 1, y: 1 };
const RING_HIT = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
const TITLE = { x: 640, y: 140 };

export function Hook() {
  const pal = usePalette();
  const t = useCue("in");
  const straight = useCue("straight");
  const diagonal = useCue("diagonal");
  const gap = useCue("gap");
  const pct = useCue("pct");
  const answer = useCue("answer");
  const s = { w: useString("keyW"), d: useString("keyD"), gap: useString("gapPercent"), title: useString("vectors") };

  const a = stride(straight - START, toStage(L, O), toStage(L, STRAIGHT), WALK);
  const b = stride(diagonal - START, toStage(R, O), toStage(R, DIAGONAL), WALK);
  // A key is held from just before its walker sets off until it arrives.
  const held = (cue: number) => progress(cue - 6, 6) * (1 - progress(cue - START - WALK, 6));
  const watch = answer >= 0 ? TITLE : null;
  const overshoot = { a: toStage(R, RING_HIT), b: toStage(R, DIAGONAL) };
  const band = lerp(overshoot.a, overshoot.b, drawn(gap, 16));

  return (
    <Stage>
      {[L, R].map((g, i) => (
        <g key={i}>
          <Circle cx={g.ox} cy={g.oy} r={g.unit} stroke={pal.sky} strokeWidth={5} draw={drawn(t, 30, 6 + i * 5)} />
          <Pop t={t} delay={4 + i * 5} x={g.ox} y={g.oy}>
            <circle cx={g.ox} cy={g.oy} r={9} fill={pal.panel} stroke={pal.outline} strokeWidth={4} />
          </Pop>
        </g>
      ))}

      {/* Trails while walking; they become arrows once "vectors" is said. */}
      <g stroke={pal.textMuted} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" opacity={1 - progress(answer, 12)}>
        {straight > START ? <line x1={L.ox} y1={L.oy} x2={a.at.x} y2={a.at.y} /> : null}
        {diagonal > START ? <line x1={R.ox} y1={R.oy} x2={b.at.x} y2={b.at.y} /> : null}
      </g>
      {gap >= 0 ? (
        <line x1={overshoot.a.x} y1={overshoot.a.y} x2={band.x} y2={band.y} stroke={pal.hero} strokeWidth={20}
          strokeLinecap="round" opacity={0.4} />
      ) : null}
      <Vector space={L} from={O} to={STRAIGHT} grow={drawn(answer, 18)} color={pal.accent} />
      <Vector space={R} from={O} to={DIAGONAL} grow={drawn(answer, 18, 5)} />

      <FadeOut t={answer}>
        <Pop t={straight} x={L.ox} y={110}>
          <KeyCap x={L.ox} y={110} label={s.d} press={held(straight)} />
        </Pop>
        <Pop t={diagonal} x={R.ox} y={110}>
          <KeyCap x={R.ox - 44} y={110} label={s.w} press={held(diagonal)} />
          <KeyCap x={R.ox + 44} y={110} label={s.d} press={held(diagonal)} />
        </Pop>
      </FadeOut>
      <Pop t={pct} x={1120} y={305}>
        <Title x={1120} y={322} size={52}>{s.gap}</Title>
      </Pop>

      <Pop t={t} x={L.ox} y={L.oy - 60}>
        <Walker at={a.at} lean={a.lean} seed={3}
          lookAt={watch ?? (diagonal >= 0 ? b.at : toStage(L, STRAIGHT))} />
      </Pop>
      <Pop t={t} delay={6} x={R.ox} y={R.oy - 60}>
        <Walker at={b.at} lean={b.lean} seed={9} pose="surprised"
          reach={progress(gap, 12) * (1 - progress(answer, 12))}
          lookAt={watch ?? (gap >= 0 ? overshoot.a : toStage(R, DIAGONAL))} />
      </Pop>
      <Pop t={answer} delay={8} x={TITLE.x} y={TITLE.y - 20}>
        <Title x={TITLE.x} y={TITLE.y} size={76}>{s.title}</Title>
      </Pop>
    </Stage>
  );
}

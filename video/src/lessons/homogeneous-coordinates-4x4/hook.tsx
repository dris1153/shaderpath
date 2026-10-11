import { progress } from "../../kit/easing";
import { ArrowPath, lerp, toStage, type GridSpace } from "../../kit/grid";
import { mul, rotation, scaling, type Mat } from "../../kit/mat";
import { Cross, MatGrid, MatrixCard } from "../../kit/matrix";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Label, Title, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { Slime, SlimeSprite } from "../../mascot/Slime";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// The slime stands on the origin; the goal is 5 steps right. The plane runs through a stretch,
// a turn (by angle) and a shear, and every line moves except the origin: M * 0 = 0.
const G: GridSpace = { ox: 560, oy: 420, unit: 60 };
const CLIP = { x: 250, y: 130, w: 750, h: 460 };
const GOAL = { x: 5, y: 0 };
const HOST = { x: 130, y: 480 };
const CARD = { x: 1110, y: 250 };

const shear = (k: number): Mat => ({ a: 1, b: k, c: 0, d: 1 });

export function Hook() {
  const pal = usePalette();
  const t = useCue("in");
  const tryCue = useCue("try");
  const push = useCue("push");
  const stuck = useCue("stuck");
  const why = useCue("why");
  const needs = useCue("needs");
  const none = useCue("none");
  const fix = useCue("fix");
  const s = {
    goal: useString("goal"), zero: useString("zeroRule"), originToT: useString("originToT"), t: useString("t"),
    q: useString("matQuestion"), w: useString("w"),
  };

  // A small preview on "stretch, turn and shear" (back by "Now try"), then the real push;
  // both ease back to rest, the push before "needs".
  const pre = 1 - progress(t - 118, 26);
  const back = 1 - progress(push - 150, 34);
  const sx = 1 + 0.35 * progress(t - 50, 18) * pre + 0.6 * progress(push, 30) * back;
  const turn = 18 * progress(t - 67, 18) * pre + 30 * progress(push - 40, 30) * back;
  const k = 0.35 * progress(t - 86, 18) * pre + 0.6 * progress(push - 80, 30) * back;
  const m = mul(shear(k), mul(rotation(turn), scaling(sx, 1)));
  const o = toStage(G, { x: 0, y: 0 });
  const goal = toStage(G, GOAL);
  const wobble = Math.sin(Math.max(0, stuck) * 0.5) * 3 * (1 - progress(stuck - 40, 20)) * (stuck >= 0 ? 1 : 0);
  const ring = 1 + 0.15 * Math.sin(Math.PI * progress(why - 10, 24));

  let pose: Pose = "idle";
  let reach = 0;
  if (fix >= 12) { pose = "cheer"; reach = progress(fix - 12, 14); }
  else if (none >= 12) { pose = "think"; reach = progress(none - 12, 14) * (1 - progress(fix, 12)); }
  else if (stuck >= 0) { pose = "surprised"; reach = progress(stuck, 12) * (1 - progress(needs, 12)); }
  const lookAt = fix >= 0 ? { x: CARD.x, y: 470 } : none >= 0 ? { x: CARD.x, y: CARD.y } : tryCue >= 0 && push < 0 ? goal : o;

  return (
    <Stage>
      <MatGrid space={G} m={m} x={[-10, 14]} y={[-8, 8]} t={t} clip={CLIP} />
      {/* The goal: a ghost slime five steps right. */}
      <Pop t={tryCue} x={goal.x} y={goal.y - 40}>
        <g opacity={0.35}><Slime at={goal} scale={0.9} /></g>
      </Pop>
      {tryCue >= 0 && needs < 12 ? (
        <g opacity={1 - progress(needs, 12)}>
          <ArrowPath a={{ x: o.x + 40, y: o.y + 34 }} b={lerp({ x: o.x + 40, y: o.y + 34 }, { x: goal.x - 40, y: goal.y + 34 }, drawn(tryCue, 20))}
            stroke={pal.textMuted} width={5} dashed />
        </g>
      ) : null}
      <Pop t={tryCue} delay={14} x={(o.x + goal.x) / 2} y={o.y + 84}>
        <g opacity={1 - progress(needs, 12)}><Chip x={(o.x + goal.x) / 2} y={o.y + 84} text={s.goal} /></g>
      </Pop>

      {needs >= 0 ? (
        <ArrowPath a={o} b={lerp(o, goal, drawn(needs, 22))} stroke={pal.accent} width={7} />
      ) : null}
      {/* "by a vector, t" names the arrow; "send the origin to t" brings the chip. */}
      <Pop t={needs} delay={60} x={(o.x + goal.x) / 2} y={o.y - 30}>
        <Label x={(o.x + goal.x) / 2} y={o.y - 22} size={34}>{s.t}</Label>
      </Pop>
      <Pop t={needs} delay={86} x={(o.x + goal.x) / 2} y={o.y - 120}>
        <Chip x={(o.x + goal.x) / 2} y={o.y - 120} text={s.originToT} />
      </Pop>

      <g transform={`translate(${wobble} 0)`}>
        <Pop t={t} delay={8} x={o.x} y={o.y - 40}>
          <SlimeSprite at={o} m={m} scale={0.9} pivot="feet" />
        </Pop>
      </g>
      <Pop t={why} x={o.x} y={o.y}>
        <circle cx={o.x} cy={o.y} r={34 * ring} fill="none" stroke={pal.hero} strokeWidth={4} strokeDasharray="6 10"
          strokeDashoffset={-0.6 * Math.max(0, why)} />
      </Pop>
      <Pop t={why} x={o.x} y={170}>
        <Chip x={o.x} y={170} text={s.zero} />
      </Pop>

      <Pop t={none} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.q} size={30} />
        <Cross x={CARD.x} y={CARD.y + 110} size={44} draw={drawn(none - 14, 14)} />
      </Pop>
      <Pop t={fix} x={CARD.x} y={470}>
        <Title x={CARD.x} y={500} size={110} color={pal.accent}>{s.w}</Title>
      </Pop>

      <Pop t={t} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.55} seed={7} pose={pose} reach={reach} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}


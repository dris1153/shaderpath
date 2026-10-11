import { progress } from "../../kit/easing";
import { lerp } from "../../kit/grid";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { mul, rotation, scaling, type Mat } from "../../kit/mat";
import { MatrixCard } from "../../kit/matrix";
import { SlimeSprite } from "../../mascot/Slime";

// One slime, two orders of the same two steps: stretch ×2 along x (S) and a
// quarter turn (R). Stretch-then-turn (R * S) stands tall; turn-then-stretch (S * R) lies wide.
const CENTER = { x: 640, y: 430 };
const LEFT = { x: 450, y: 430 };
const RIGHT = { x: 870, y: 430 };
const SIZE = 1.25;
const HOST = { x: 140, y: 470 };
const CHIPS = [{ x: 510, y: 105, w: 220 }, { x: 790, y: 105, w: 240 }];
const ORDER_Y = 575;

function Chip({ x, y, w, letter, text }: { x: number; y: number; w: number; letter: string; text: string }) {
  const pal = usePalette();
  return (
    <g>
      <Box x={x - w / 2} y={y - 48} w={w} h={96} r={24} fill={pal.panel} />
      <Title x={x - w / 2 + 50} y={y + 22} size={60} halo={pal.panel}>{letter}</Title>
      <Code x={x + 30} y={y + 11} size={30} anchor="middle">{text}</Code>
    </g>
  );
}

function OrderCard({ x, text, lit }: { x: number; text: string; lit: number }) {
  const pal = usePalette();
  return (
    <g>
      <Box x={x - 80} y={ORDER_Y - 32} w={160} h={64} r={22} fill={pal.panel} />
      {lit > 0 ? <Box x={x - 80} y={ORDER_Y - 32} w={160} h={64} r={22} stroke={pal.accent} strokeWidth={7} opacity={lit} /> : null}
      <Code x={x} y={ORDER_Y + 10} size={30} anchor="middle">{text}</Code>
    </g>
  );
}

export function Hook() {
  const pal = usePalette();
  const t = useCue("in");
  const stretch = useCue("stretch");
  const turn = useCue("turn");
  const left = useCue("left");
  const right = useCue("right");
  const same = useCue("same");
  const question = useCue("question");
  const answer = useCue("answer");
  const s = {
    S: useString("S"), R: useString("R"), stretch: useString("stretch"), turn: useString("turn"),
    st: useString("stretchThenTurn"), ts: useString("turnThenStretch"),
    sEq: useString("SEq"), rEq: useString("REq"), matS: useString("matStretch"), matR: useString("matRotate90"),
  };

  // Before the split, the one slime gives a hint of each step as it is named.
  const bump = (cue: number) => Math.sin(Math.PI * progress(cue, 26));
  const hint: Mat = mul(rotation(22 * bump(turn)), scaling(1 + 0.3 * bump(stretch), 1));
  const split = progress(left, 20);
  const mLeft = mul(rotation(90 * progress(left - 50, 26)), scaling(1 + progress(left - 22, 22), 1));
  const mRight = mul(scaling(1 + progress(right - 42, 22), 1), rotation(90 * progress(right - 10, 26)));
  // Both squash once on "same".
  const sq = Math.sin(Math.PI * progress(same, 16));
  const squash = (at: { x: number; y: number }) =>
    `translate(${at.x} ${at.y}) scale(${1 + 0.08 * sq} ${1 - 0.12 * sq}) translate(${-at.x} ${-at.y})`;
  const lit = progress(answer, 12);

  // "surprised" blends out before "think" blends in, so no tentacle jumps.
  const pose = question >= 12 ? "think" : same >= 0 ? "surprised" : "idle";
  const reach = question >= 12 ? progress(question - 12, 14) : progress(same, 12) * (1 - progress(question, 12));
  const lookAt = question >= 0 ? { x: 650, y: 110 }
    : right >= 0 ? { x: RIGHT.x, y: RIGHT.y - 80 }
    : left >= 0 ? { x: LEFT.x, y: LEFT.y - 80 }
    : stretch >= 0 && split <= 0 ? { x: 650, y: 110 } : { x: CENTER.x, y: CENTER.y - 60 };

  const chips = [
    { t: stretch, letter: s.S, text: s.stretch, eq: s.sEq, mat: s.matS },
    { t: turn, letter: s.R, text: s.turn, eq: s.rEq, mat: s.matR },
  ];

  return (
    <Stage>
      {split <= 0 ? (
        <Pop t={t} delay={6} x={CENTER.x} y={CENTER.y - 46 * SIZE}>
          <SlimeSprite at={CENTER} m={hint} scale={SIZE} />
        </Pop>
      ) : (
        <>
          <g transform={squash(LEFT)}>
            <SlimeSprite at={lerp(CENTER, LEFT, split)} m={mLeft} scale={SIZE} />
          </g>
          <g transform={squash(RIGHT)}>
            <SlimeSprite at={lerp(CENTER, RIGHT, split)} m={mRight} scale={SIZE} />
          </g>
        </>
      )}

      {chips.map((c, i) => (
        <g key={i}>
          <FadeOut t={question}>
            <Pop t={c.t} x={CHIPS[i]!.x} y={CHIPS[i]!.y}>
              <Chip x={CHIPS[i]!.x} y={CHIPS[i]!.y} w={CHIPS[i]!.w} letter={c.letter} text={c.text} />
            </Pop>
          </FadeOut>
          <Pop t={question} delay={8 + i * 5} x={CHIPS[i]!.x} y={CHIPS[i]!.y}>
            <Box x={CHIPS[i]!.x - CHIPS[i]!.w / 2} y={CHIPS[i]!.y - 58} w={CHIPS[i]!.w} h={116} r={24} fill={pal.panel} />
            <Title x={CHIPS[i]!.x - CHIPS[i]!.w / 2 + 52} y={CHIPS[i]!.y + 16} size={44} halo={pal.panel}>{c.eq}</Title>
            <MatrixCard x={CHIPS[i]!.x + CHIPS[i]!.w / 2 - 74} y={CHIPS[i]!.y} text={c.mat} size={28} panel={false} />
          </Pop>
        </g>
      ))}

      <Pop t={left} delay={20} x={LEFT.x} y={ORDER_Y}>
        <OrderCard x={LEFT.x} text={s.st} lit={lit} />
      </Pop>
      <Pop t={right} delay={10} x={RIGHT.x} y={ORDER_Y}>
        <OrderCard x={RIGHT.x} text={s.ts} lit={progress(answer - 5, 12)} />
      </Pop>

      <Pop t={t} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.55} seed={5} pose={pose} reach={reach} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

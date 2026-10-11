import { progress } from "../../kit/easing";
import { ArrowPath, lerp, toStage, type GridSpace, type Vec } from "../../kit/grid";
import { apply, IDENTITY, mul, rotation, scaling } from "../../kit/mat";
import { Cross, MatGrid, MatrixCard, MONO } from "../../kit/matrix";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { SlimeSprite } from "../../mascot/Slime";
import { useCue } from "../../scene/cue";
import { Badge, Chip } from "./parts";

// M = T * R * S read right to left: the slime grows in place, turns in place, then moves out.
// R * T moves first, so the turn swings the whole slime around the world origin: it orbits.
const G: GridSpace = { ox: 560, oy: 465, unit: 50 };
const CLIP = { x: 220, y: 230, w: 680, h: 360 };
const FORMULA = { x: 640, y: 96, size: 48 };
const CARD = { x: 1070, y: 250 };
const HOST = { x: 130, y: 480 };
// Small enough that the orbit (r ≈ 135 px) stays under the step labels and above the subtitles.
const SPOT = { x: 2.5, y: 1 };
const ANGLE = 30;

export function Trs() {
  const pal = usePalette();
  const build = useCue("build");
  const blocks = useCue("blocks");
  const read = useCue("read");
  const scale = useCue("scale");
  const rotate = useCue("rotate");
  const move = useCue("move");
  const swap = useCue("swap");
  const orbit = useCue("orbit");
  const s = {
    layout: useString("matLayout"), trs: useString("TRS"), rt: useString("RT"), scale: useString("stepScale"),
    rotate: useString("stepRotate"), move: useString("stepMove"),
  };

  // After "orbit" both keep turning by the same angle: one spins in place, one circles the origin.
  const spin = 120 * progress(orbit - 40, 110);
  const k = 1 + 0.4 * progress(scale, 24);
  const angle = ANGLE * progress(rotate, 24) + spin;
  const right = mul(rotation(angle), scaling(k, k));
  const spot = lerp({ x: 0, y: 0 }, SPOT, progress(move, 30));
  const ghostOut = lerp({ x: 0, y: 0 }, SPOT, progress(swap - 82, 30));
  const ghostAt: Vec = apply(rotation(ANGLE * progress(orbit, 30) + spin), ghostOut);
  const ghostM = mul(rotation(ANGLE * progress(orbit, 30) + spin), scaling(1.4, 1.4));

  const char = FORMULA.size * MONO;
  const left = FORMULA.x - (s.trs.length * char) / 2;
  const letterX = (i: number) => left + (i + 0.5) * char;
  const steps = [
    { t: scale, x: letterX(8), n: "1", label: s.scale },
    { t: rotate, x: letterX(4), n: "2", label: s.rotate },
    { t: move, x: letterX(0), n: "3", label: s.move },
  ];
  const r = Math.hypot(SPOT.x, SPOT.y) * G.unit;
  const o = toStage(G, { x: 0, y: 0 });

  let pose: Pose = "idle";
  let reach = 0;
  if (orbit >= 12) { pose = "surprised"; reach = progress(orbit - 12, 14); }
  else if (move >= 0) { pose = "cheer"; reach = progress(move, 14) * (1 - progress(swap, 12)); }

  return (
    <Stage>
      <MatGrid space={G} m={IDENTITY} x={[-8, 9]} y={[-5, 5]} t={build} clip={CLIP} />
      <Pop t={build} delay={8} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.layout} size={26} colors={[pal.sky, pal.sky, pal.sky, pal.accent]}
          tint={[progress(blocks, 12), progress(blocks, 12), progress(blocks, 12), 0.6]} />
      </Pop>
      <Pop t={blocks} delay={70} x={FORMULA.x} y={FORMULA.y}>
        <Code x={FORMULA.x} y={FORMULA.y + 16} size={FORMULA.size} anchor="middle">{s.trs}</Code>
      </Pop>
      {read >= 0 ? (
        <ArrowPath a={{ x: letterX(8) + 40, y: FORMULA.y + 50 }}
          b={lerp({ x: letterX(8) + 40, y: FORMULA.y + 50 }, { x: letterX(0) - 40, y: FORMULA.y + 50 }, drawn(read, 24))}
          stroke={pal.outline} width={4} />
      ) : null}
      {steps.map((st, i) => (
        <Pop key={i} t={st.t} x={st.x} y={FORMULA.y + 92}>
          <Badge x={st.x} y={FORMULA.y + 92} text={st.n} fill={pal.accent} />
          <Label x={st.x} y={FORMULA.y + 140} size={26}>{st.label}</Label>
        </Pop>
      ))}

      {swap >= 0 ? (
        <circle cx={o.x} cy={o.y} r={r} fill="none" stroke={pal.textMuted} strokeWidth={3} strokeDasharray="6 10"
          opacity={0.7 * progress(orbit, 16)} />
      ) : null}
      {swap >= 60 ? (
        <g opacity={0.55 * progress(swap - 60, 12)}>
          <SlimeSprite at={toStage(G, ghostAt)} m={ghostM} scale={0.6} />
        </g>
      ) : null}
      <Pop t={build} delay={14} x={o.x} y={o.y - 30}>
        <SlimeSprite at={toStage(G, spot)} m={right} scale={0.6} />
      </Pop>
      <Pop t={swap} x={CARD.x} y={460}>
        <Chip x={CARD.x} y={460} text={s.rt} border={pal.warn} />
        <Cross x={CARD.x + 100} y={460} size={34} draw={drawn(swap - 20, 14)} />
      </Pop>

      <Pop t={build} delay={4} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={33} pose={pose} reach={reach}
          lookAt={swap >= 60 ? toStage(G, ghostAt) : toStage(G, spot)} />
      </Pop>
    </Stage>
  );
}

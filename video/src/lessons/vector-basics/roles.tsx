import { progress } from "../../kit/easing";
import { Grid, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { Walker } from "./parts";

// Three chips for the three roles, one demo each: a point measured from the
// origin; a box's normal that ignores the slide; a velocity whose length is
// the speed. Then the loop, stepping one frame at a time.
const G: GridSpace = { ox: 340, oy: 500, unit: 60 };
const O = { x: 0, y: 0 };
const CHIP_X = [330, 640, 950];
const HOST = { x: 130, y: 470 };
const GROUND = 0.5;
const STEP = 12; // frames per loop tick; at v = 2 units/s, one tick moves 0.8 units
// Monospace advance is 0.6 em, so the operators sit at fixed character columns.
const CODE = { x: 640, y: 170, size: 32 };
const col = (i: number) => CODE.x + (i - 12.5) * CODE.size * 0.6;

export function Roles() {
  const pal = usePalette();
  const roles = useCue("roles");
  const position = useCue("position");
  const direction = useCue("direction");
  const box = useCue("box");
  const velocity = useCue("velocity");
  const twice = useCue("twice");
  const loop = useCue("loop");
  const code = useCue("code");
  const names = useCue("names");
  const s = {
    chips: [useString("rolePosition"), useString("roleDirection"), useString("roleVelocity")],
    point: useString("tuple33"), normal: useString("normalUp"), v: useString("v"), twoV: useString("twoV"),
    loop: useString("loopCode"), add: useString("opAdd"), scale: useString("opScale"),
  };

  const active = velocity >= 0 ? 2 : direction >= 0 ? 1 : position >= 0 ? 0 : -1;
  const slide = 6 * progress(box, 40);
  // Speed 1 unit/s until "twice", then 2 units/s.
  const fast = Math.max(0, twice);
  // ponytail: clamped so a longer re-voice can't walk the arrow off the grid.
  const walkX = Math.min(9.5, 1 + (Math.max(0, velocity) - fast) / 30 + (2 * fast) / 30);
  const speed = 1 + progress(twice, 12);
  const ticks = code >= 0 ? Math.min(10, Math.floor(code / STEP)) : 0;
  const loopX = 1 + ticks * 0.8;

  return (
    <Stage>
      <Grid space={G} x={[-1, 13]} y={[-1, 5]} t={roles} axes={position} />
      {s.chips.map((text, i) => (
        <Pop key={text} t={roles} delay={8 + i * 5} x={CHIP_X[i]!} y={80}>
          <Box x={CHIP_X[i]! - 130} y={46} w={260} h={68} r={34} fill={pal.panel}
            stroke={active === i ? pal.hero : pal.outline} strokeWidth={active === i ? 7 : 5} />
          <Label x={CHIP_X[i]!} y={91} size={32} halo={pal.panel} color={active > i ? pal.textMuted : pal.text}>{text}</Label>
        </Pop>
      ))}

      <FadeOut t={direction}>
        <Vector space={G} from={O} to={{ x: 3, y: 3 }} grow={drawn(position, 20, 10)} dashed />
        <Pop t={position} delay={24} x={toStage(G, { x: 3, y: 3 }).x} y={toStage(G, { x: 3, y: 3 }).y}>
          <circle cx={toStage(G, { x: 3, y: 3 }).x} cy={toStage(G, { x: 3, y: 3 }).y} r={13} fill={pal.accent}
            stroke={pal.outline} strokeWidth={5} />
          <Label x={toStage(G, { x: 3, y: 3 }).x + 70} y={toStage(G, { x: 3, y: 3 }).y - 14} size={28}>{s.point}</Label>
        </Pop>
      </FadeOut>

      <FadeOut t={velocity}>
        <Pop t={direction} delay={6} x={toStage(G, { x: 3 + slide, y: 1 }).x} y={toStage(G, { x: 3, y: 1 }).y}>
          <Box x={toStage(G, { x: 2 + slide, y: 2 }).x} y={toStage(G, { x: 0, y: 2 }).y} w={2 * G.unit} h={2 * G.unit} r={10}
            fill={pal.panel} />
          <Vector space={G} from={{ x: 3 + slide, y: 2 }} to={{ x: 3 + slide, y: 3 }} grow={drawn(direction, 16, 16)}
            label={s.normal} side={-1} />
        </Pop>
      </FadeOut>

      <FadeOut t={loop}>
        {velocity >= 0 ? (
          <Pop t={velocity} x={toStage(G, { x: 1, y: GROUND }).x} y={toStage(G, { x: 1, y: 1.5 }).y}>
            <Walker at={toStage(G, { x: walkX, y: GROUND })} lean={6} scale={0.4} seed={8} />
            <Vector space={G} from={{ x: walkX + 0.7, y: GROUND + 1.2 }} to={{ x: walkX + 0.7 + speed, y: GROUND + 1.2 }}
              grow={drawn(velocity, 14, 8)} label={twice >= 0 ? s.twoV : s.v} />
          </Pop>
        ) : null}
      </FadeOut>

      {loop >= 0 ? (
        <g>
          {Array.from({ length: ticks }, (_, i) => {
            const p = toStage(G, { x: 1 + i * 0.8, y: GROUND });
            return <circle key={i} cx={p.x} cy={p.y} r={7} fill={pal.accent} stroke={pal.outline} strokeWidth={3} />;
          })}
          <Pop t={loop} delay={6} x={toStage(G, { x: 1, y: GROUND }).x} y={toStage(G, { x: 1, y: 1.5 }).y}>
            <Walker at={toStage(G, { x: loopX, y: GROUND })} scale={0.4} seed={8} />
            <Vector space={G} from={{ x: loopX + 0.7, y: GROUND + 1.2 }} to={{ x: loopX + 2.7, y: GROUND + 1.2 }}
              label={s.chips[2]} />
          </Pop>
          <Pop t={code} x={CODE.x} y={CODE.y}>
            <Box x={CODE.x - 280} y={CODE.y - 38} w={560} h={76} r={22} fill={pal.panel} />
            <Code x={CODE.x} y={CODE.y + 11} size={CODE.size} anchor="middle">{s.loop}</Code>
          </Pop>
          {[{ at: col(10), w: 2, text: s.add }, { at: col(23), w: 4, text: s.scale }].map((op, i) => (
            <Pop key={op.text} t={names} delay={i * 8} x={op.at} y={CODE.y + 70}>
              <line x1={op.at - op.w * 9.6} y1={CODE.y + 24} x2={op.at + op.w * 9.6} y2={CODE.y + 24} stroke={pal.accent}
                strokeWidth={6} strokeLinecap="round" />
              <Label x={op.at} y={CODE.y + 80} size={30}>{op.text}</Label>
            </Pop>
          ))}
        </g>
      ) : null}

      <Pop t={roles} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={16} lookAt={{ x: CHIP_X[Math.max(0, active)]!, y: 80 }} />
      </Pop>
    </Stage>
  );
}

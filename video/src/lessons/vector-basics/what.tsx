import { Point } from "../../kit/diagram";
import { progress } from "../../kit/easing";
import { Grid, lerp, plus, toStage, Vector, type GridSpace, type Vec } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { stride } from "./parts";

const G: GridSpace = { ox: 720, oy: 380, unit: 60 };
const V = { x: 3, y: 2 };
const O = { x: 0, y: 0 };
// Where the one arrow v sits over the scene: first draw, two slides, the origin, then away.
const P0 = { x: -6, y: -2 };
const P1 = { x: -1, y: 1 };
const P2 = { x: 3, y: -2 };
const AWAY = { x: -7, y: 1 };
const HOST = { x: 120, y: 470 };
const Z = toStage(G, AWAY);

export function What() {
  const pal = usePalette();
  const arrow = useCue("arrow");
  const draw = useCue("draw");
  const size = useCue("size");
  const head = useCue("head");
  const slide = useCue("slide");
  const tuple = useCue("tuple");
  const origin = useCue("origin");
  const point = useCue("point");
  const move = useCue("move");
  const zero = useCue("zero");
  const remember = useCue("remember");
  const s = { v: useString("v"), tuple: useString("tuple"), point: useString("point32"), zero: useString("zeroTuple") };

  let tail = lerp(P0, P1, progress(slide, 30));
  tail = lerp(tail, P2, progress(slide - 70, 30));
  tail = lerp(tail, O, progress(origin, 30));
  tail = lerp(tail, AWAY, progress(move, 30));
  const shrink = 1 - progress(zero, 24);
  const tip = plus(tail, V, shrink);

  // Before the arrow: a dot makes the move, leaving a trail.
  const walker = stride(arrow - 16, toStage(G, P0), toStage(G, plus(P0, V)), 50);
  // Length bracket along the right side of the first arrow.
  const a = toStage(G, P0);
  const b = toStage(G, plus(P0, V));
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const n = { x: -((b.y - a.y) / len) * 30, y: ((b.x - a.x) / len) * 30 };
  const bracketEnd = lerp(a, b, drawn(size, 18));
  const tick = (p: Vec) => `M ${p.x - n.x / 2} ${p.y - n.y / 2} L ${p.x + n.x / 2} ${p.y + n.y / 2}`;
  const tipPx = toStage(G, V);
  const ghost = (at: Vec, t: number) => (
    <FadeOut t={tuple} duration={12}>
      {t >= 0 ? <Vector space={G} from={at} to={plus(at, V)} opacity={0.3} label={s.v} /> : null}
    </FadeOut>
  );

  const lookAt = point >= 0 && move < 0 ? tipPx : toStage(G, plus(tail, V, 0.5));
  return (
    <Stage>
      <Grid space={G} x={[-8, 7]} y={[-3, 4]} t={arrow} axes={tuple} />
      {ghost(P0, slide)}
      {ghost(P1, slide - 70)}

      <g opacity={1 - progress(draw, 10)}>
        {arrow > 16 ? (
          <line x1={a.x} y1={a.y} x2={walker.at.x} y2={walker.at.y} stroke={pal.textMuted} strokeWidth={5}
            strokeDasharray="4 14" strokeLinecap="round" />
        ) : null}
        <Pop t={arrow} delay={6} x={a.x} y={a.y}>
          <circle cx={walker.at.x} cy={walker.at.y} r={13} fill={pal.accent} stroke={pal.outline} strokeWidth={5} />
        </Pop>
      </g>

      <FadeOut t={slide}>
        {size >= 0 ? (
          <g stroke={pal.accent} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M ${a.x + n.x} ${a.y + n.y} L ${bracketEnd.x + n.x} ${bracketEnd.y + n.y}`} />
            <path d={tick({ x: a.x + n.x, y: a.y + n.y })} />
            {drawn(size, 18) > 0.95 ? <path d={tick({ x: b.x + n.x, y: b.y + n.y })} /> : null}
          </g>
        ) : null}
        <Pop t={head} x={b.x} y={b.y}>
          <Circle cx={b.x} cy={b.y} r={32} stroke={pal.accent} strokeWidth={5} />
        </Pop>
      </FadeOut>

      <FadeOut t={zero}>
        {origin > 34 ? (
          <g stroke={pal.textMuted} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round"
            opacity={progress(origin - 34, 10)}>
            <line x1={tipPx.x} y1={tipPx.y} x2={tipPx.x} y2={G.oy} />
            <line x1={tipPx.x} y1={tipPx.y} x2={G.ox} y2={tipPx.y} />
          </g>
        ) : null}
        <Pop t={origin} delay={40} x={tipPx.x} y={G.oy + 40}>
          <Label x={tipPx.x} y={G.oy + 44} size={30}>{String(V.x)}</Label>
        </Pop>
        <Pop t={origin} delay={44} x={G.ox - 30} y={tipPx.y}>
          <Label x={G.ox - 30} y={tipPx.y + 10} size={30}>{String(V.y)}</Label>
        </Pop>
        <Point t={point} x={tipPx.x} y={tipPx.y} color={pal.accent} label={s.point} />
      </FadeOut>

      <Vector space={G} from={tail} to={tip} grow={drawn(draw, 18)} label={s.v} />
      {zero > 20 ? (
        <Pop t={zero - 20} x={Z.x} y={Z.y}>
          <circle cx={Z.x} cy={Z.y} r={12} fill={pal.hero} stroke={pal.outline} strokeWidth={5} />
          <circle cx={Z.x} cy={Z.y} r={34} fill="none" stroke={pal.hero} strokeWidth={4} strokeDasharray="6 10" />
          <Label x={Z.x} y={Z.y - 50} size={30}>{s.zero}</Label>
        </Pop>
      ) : null}

      <Pop t={tuple} x={1040} y={108}>
        <Box x={900} y={70} w={280} h={76} r={20} fill={pal.panel} />
        <Code x={1040} y={119} size={32} anchor="middle">{s.tuple}</Code>
      </Pop>
      <Pop t={arrow} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.55} seed={5} pose={remember >= 0 ? "think" : "idle"}
          reach={progress(remember, 14)} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

import { interpolate } from "remotion";
import { AngleArc, VisionCone } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { ArrowPath, Grid, lerp, toStage, type GridSpace, type Vec } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Slime } from "../../mascot/Slime";
import { stride, Walker } from "../../mascot/Walker";
import { useCue } from "../../scene/cue";

// The guard at the origin faces +x. Every number on screen is computed from
// Inko's world position: d = player − guard, and the test is f · d > cos 30°.
const V: GridSpace = { ox: 180, oy: 330, unit: 110 };
const G = { x: 0, y: 0 };
const F_RAW = { x: 2, y: 0 };
const P1 = { x: 3, y: -0.8 }; // in the cone (−15°)
const P2 = { x: 2, y: 1.6 }; // just outside (39°)
const FAR = { x: 3.15, y: 2.2 }; // far, outside (35°): raw dot 3.15
const NEAR = { x: 0.78, y: -0.3 }; // close, in the cone (−21°): raw dot 0.78
const HALF = 30;
const THRESHOLD = Math.cos((HALF * Math.PI) / 180);
const RANGE = 3.5;
const WALK = 30;
const SCALE = 0.35;
const CARD = { x: 880, y: 150, w: 340, h: 130 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Positions are Inko's body centre; the walker's feet sit this far below it.
const FEET = 175 * SCALE;

const len = (v: Vec) => Math.hypot(v.x, v.y);
const scaleTo = (v: Vec, l: number): Vec => ({ x: (v.x / len(v)) * l, y: (v.y / len(v)) * l });
const deg = (v: Vec) => (Math.atan2(v.y, v.x) * 180) / Math.PI;

export function Vision() {
  const pal = usePalette();
  const back = useCue("back");
  const facing = useCue("facing");
  const toPlayer = useCue("toPlayer");
  const norm = useCue("norm");
  const dot = useCue("dot");
  const cone = useCue("cone");
  const compare = useCue("compare");
  const trap = useCue("trap");
  const far = useCue("far");
  const near = useCue("near");
  const fix = useCue("fix");
  const s = {
    f: useString("f"), d: useString("dDef"), fd: useString("fDotD"), normalize: useString("normalizeD"),
    half: useString("deg30"), full: useString("cone60"), cos30: useString("cos30"), theta: useString("theta"),
  };

  // Inko's path: steps out of the cone and back during {compare}, then far, then near.
  const leg = (t: number, from: Vec, to: Vec) => stride(t, toStage(V, from), toStage(V, to), WALK);
  const walk =
    near >= 0 ? leg(near, FAR, NEAR)
    : far >= 0 ? leg(far, P1, FAR)
    : compare >= 120 ? leg(compare - 120, P2, P1)
    : leg(compare - 40, P1, P2);
  const player = { x: (walk.at.x - V.ox) / V.unit, y: (V.oy - walk.at.y) / V.unit };
  const d = { x: player.x - G.x, y: player.y - G.y };

  // k = 1 while d is normalized: from {norm}, off at {trap}, on again at {fix}.
  const k = trap < 0 ? progress(norm, 20) : fix < 0 ? 1 - progress(trap, 20) : progress(fix, 20);
  const dShown = scaleTo(d, len(d) + (1 - len(d)) * k);
  const fShown = scaleTo(F_RAW, 2 - progress(norm, 20));
  const value = dShown.x; // f is unit along +x, so f · d is d's x part
  const seen = cone >= 0 && value > THRESHOLD;
  const tone = value > THRESHOLD ? pal.ok : pal.warn;
  const o = toStage(V, G);
  const eye = { x: o.x + 14, y: o.y - 46 };
  const strike = drawn(trap, 10, 4) * (1 - progress(fix, 10));
  // Below the line to Inko, clear of f and of Inko; it leaves once the cone takes over.
  const label = toStage(V, { x: d.x * 0.42, y: d.y * 0.42 - 0.42 });

  return (
    <Stage>
      <Grid space={V} x={[-1, 6]} y={[-2, 2]} t={back} />
      <VisionCone at={o} dir={0} half={HALF} range={RANGE * V.unit} grow={drawn(cone, 24)} color={seen ? pal.hero : pal.accent} />
      {cone >= 0 ? <AngleArc at={o} from={0} to={HALF * progress(cone - 10, 16)} r={150} color={pal.accent} label={cone > 22 ? s.half : undefined} /> : null}
      <Pop t={cone} delay={20} x={toStage(V, { x: RANGE + 0.45, y: 0 }).x} y={o.y}>
        <Title x={toStage(V, { x: RANGE + 0.45, y: 0 }).x} y={o.y + 16} size={44}>{s.full}</Title>
      </Pop>
      <Circle cx={o.x} cy={o.y} r={V.unit} stroke={pal.sky} strokeWidth={4} draw={drawn(norm, 24, 6)} />
      {dot >= 0 && trap < 0 ? <AngleArc at={o} from={0} to={deg(d)} r={70} color={tone} label={Math.abs(deg(d)) > 12 ? s.theta : undefined} /> : null}

      <FadeOut t={cone}>
        <Pop t={toPlayer} delay={12} x={label.x} y={label.y}>
          <Label x={label.x} y={label.y} size={28}>{s.d}</Label>
        </Pop>
      </FadeOut>

      <Pop t={back} x={o.x} y={o.y - 30}>
        <Slime at={{ x: o.x, y: o.y + 22 }} scale={0.5} face={1} />
      </Pop>
      <Pop t={back} delay={6} x={walk.at.x} y={walk.at.y}>
        <Walker at={{ x: walk.at.x, y: walk.at.y + FEET }} lean={walk.lean} scale={SCALE} seed={2} lookAt={eye}
          pose="surprised" reach={progress(cone, 10) * interpolate(value, [THRESHOLD - 0.05, THRESHOLD + 0.05], [0, 1], clamp)} />
      </Pop>

      {/* Drawn over the guard and Inko, so short arrows stay visible next to them. */}
      {/* d: dashed to Inko once it is shorter than the walk to Inko. */}
      {toPlayer >= 0 && k > 0 ? (
        <line x1={o.x} y1={o.y} x2={walk.at.x} y2={walk.at.y} stroke={pal.textMuted} strokeWidth={4}
          strokeDasharray="6 12" strokeLinecap="round" opacity={k} />
      ) : null}
      <ArrowPath a={o} b={lerp(o, toStage(V, fShown), drawn(facing, 16))} stroke={pal.accent} width={7} />
      <ArrowPath a={o} b={lerp(o, toStage(V, dShown), drawn(toPlayer, 18))} stroke={pal.hero} width={7} />
      {facing > 14 ? <Title x={toStage(V, fShown).x + 6} y={o.y - 18} size={40}>{s.f}</Title> : null}
      <Pop t={dot} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={22} fill={pal.panel} />
        <rect x={CARD.x + 20} y={CARD.y + 20} width={12} height={CARD.h - 40} rx={6} fill={compare >= 0 ? tone : pal.textMuted} />
        <Code x={CARD.x + 52} y={CARD.y + 54} size={30}>{`${s.fd} ${value.toFixed(2)}`}</Code>
        {compare >= 0 ? <Code x={CARD.x + 52} y={CARD.y + 98} size={26} color={pal.textMuted}>{s.cos30}</Code> : null}
      </Pop>
      <Pop t={norm} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h + 60}>
        <Box x={CARD.x + 40} y={CARD.y + CARD.h + 30} w={CARD.w - 80} h={60} r={18} fill={pal.panel}
          stroke={strike > 0 ? pal.warn : pal.ok} strokeWidth={5} />
        <Code x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h + 70} size={28} anchor="middle"
          color={strike > 0 ? pal.textMuted : pal.text}>{s.normalize}</Code>
        {strike > 0 ? (
          <line x1={CARD.x + 56} y1={CARD.y + CARD.h + 60} x2={CARD.x + 56 + (CARD.w - 112) * strike} y2={CARD.y + CARD.h + 60}
            stroke={pal.warn} strokeWidth={7} strokeLinecap="round" />
        ) : null}
      </Pop>
    </Stage>
  );
}

import { interpolate } from "remotion";
import { polar, ProjectionDrop } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { ArrowPath } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Label, Title, useString } from "../../kit/text";
import { Slime } from "../../mascot/Slime";
import { Walker } from "../../mascot/Walker";
import { useCue } from "../../scene/cue";

// a's shadow on b's direction is a · b̂ = |a| cos(angle between them). Then the
// same picture becomes the game: Inko at the origin, a its velocity v, and b
// the direction toward the guard. 130 px per unit.
const O = { x: 360, y: 430 };
const PX = 130;
const B_DEG = 12;
const A_LEN = 2.4;
const B_LEN = 3;
const GUARD_AT = 5.2;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// "a · b" with a hat drawn over the last letter (the fonts have no b̂).
function HatLabel({ x, y, left, letter }: { x: number; y: number; left: string; letter: string }) {
  const pal = usePalette();
  return (
    <g>
      <Label x={x} y={y} size={30} anchor="end">{left}</Label>
      <Label x={x + 6} y={y} size={30} anchor="start">{letter}</Label>
      <path d={`M ${x + 9} ${y - 27} L ${x + 15} ${y - 34} L ${x + 21} ${y - 27}`} fill="none" stroke={pal.text}
        strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function Projection() {
  const pal = usePalette();
  const shadowCue = useCue("shadow");
  const drop = useCue("drop");
  const length = useCue("length");
  const speed = useCue("speed");
  const toward = useCue("toward");
  const away = useCue("away");
  const longer = useCue("longer");
  const s = { a: useString("a"), b: useString("b"), bHat: useString("bHat"), v: useString("v"), aDot: useString("aDot") };

  // a's angle: 60°, then toward the guard (25°), then away (140°), where it stays
  // while b stretches, so the shadow visibly holds still.
  const aDeg =
    away >= 0 ? interpolate(away, [0, 18], [25, 140], clamp)
    : interpolate(toward, [0, 18], [60, 25], clamp);
  const bLen = B_LEN + 1.6 * progress(longer - 18, 24);
  const value = A_LEN * Math.cos(((aDeg - B_DEG) * Math.PI) / 180);
  const tone = value >= 0 ? pal.ok : pal.warn;
  const aTip = polar(O, aDeg, A_LEN * PX * drawn(shadowCue, 18, 4));
  const bTip = polar(O, B_DEG, bLen * PX * drawn(shadowCue, 18, 12));
  const foot = polar(O, B_DEG, value * PX);
  const game = progress(speed, 14);
  const lineA = polar(O, B_DEG + 180, 2.2 * PX);
  const lineB = polar(O, B_DEG, 6.2 * PX);
  const mid = polar({ x: (O.x + foot.x) / 2, y: (O.y + foot.y) / 2 }, B_DEG - 90, 38);
  const aLabel = polar(O, aDeg + 6, A_LEN * PX + 30);
  const guard = polar(O, B_DEG, GUARD_AT * PX);

  return (
    <Stage>
      {/* b's whole line, so a shadow behind the origin still lands on it. */}
      {/* The dots creep along b, 1 px a frame: only Inko's idle motion moves here for 4 s, which qc reads as still in a 2x render. */}
      <line x1={lineA.x} y1={lineA.y} x2={lineB.x} y2={lineB.y} stroke={pal.sky} strokeWidth={3} strokeDasharray="4 10"
        strokeDashoffset={-Math.max(0, drop)} opacity={0.6 * progress(drop, 12)} />
      {/* Inko sits under the arrows from the start (ambient motion); in the game, v starts at its body. */}
      <Pop t={shadowCue} x={O.x} y={O.y}>
        <Walker at={{ x: O.x, y: O.y + 61 }} scale={0.35} seed={2} lookAt={guard}
          pose={away >= 0 ? "surprised" : "idle"} reach={progress(away, 12)} />
      </Pop>
      <ProjectionDrop at={O} tip={aTip} dir={B_DEG} drop={drawn(drop, 18)} shadow={drawn(length, 16)} color={length >= 0 ? tone : pal.hero} />
      <ArrowPath a={O} b={bTip} stroke={pal.accent} width={7} />
      <ArrowPath a={O} b={aTip} stroke={pal.sky} width={7} />
      {shadowCue > 20 ? (
        <>
          <g opacity={1 - game}><Label x={aLabel.x} y={aLabel.y + 10} size={30}>{s.a}</Label></g>
          <g opacity={game}><Label x={aLabel.x} y={aLabel.y + 10} size={30}>{s.v}</Label></g>
          <Label x={bTip.x + 6} y={bTip.y - 18} size={30}>{s.b}</Label>
        </>
      ) : null}
      <Pop t={length} delay={10} x={mid.x} y={mid.y}>
        <g opacity={1 - game}><HatLabel x={mid.x} y={mid.y + 10} left={s.aDot} letter={s.bHat} /></g>
        <g opacity={game}><Title x={mid.x} y={mid.y + 14} size={40} color={tone}>{value.toFixed(1).replace("-", "−")}</Title></g>
      </Pop>

      <Pop t={speed} delay={6} x={guard.x} y={guard.y - 40}>
        <Slime at={{ x: guard.x, y: guard.y + 30 }} scale={0.55} face={-1} />
      </Pop>
    </Stage>
  );
}

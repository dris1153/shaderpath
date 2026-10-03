import { interpolate } from "remotion";
import { AngleArc, polar } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { ArrowPath } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// a = (3, 1) and b = (2, 2) as plain arrows (75 px per unit). Normalizing
// brings both to the unit circle (drawn at 200 px), then b swings round a:
// 0° (cos 1), 90° (cos 0), 180° (cos −1), with the readout following.
const O = { x: 330, y: 390 };
const PX = 75;
const R = 200;
const A_DEG = (Math.atan2(1, 3) * 180) / Math.PI;
const START = 45 - A_DEG;
const A_LEN = Math.hypot(3, 1) * PX;
const B_LEN = Math.hypot(2, 2) * PX;
const CARD = { x: 640, y: 300, w: 380, h: 120 };
const CHIP_Y = 480;
const ACOS = { x: 660, y: 540, w: 180, h: 60 };
const HOST = { x: 1150, y: 370 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export function Angle() {
  const pal = usePalette();
  const meaning = useCue("meaning");
  const formula = useCue("formula");
  const unit = useCue("unit");
  const cos = useCue("cos");
  const sweep = useCue("sweep");
  const front = useCue("front");
  const side = useCue("side");
  const behind = useCue("behind");
  const sign = useCue("sign");
  const noTrig = useCue("noTrig");
  const s = {
    a: useString("a"), b: useString("b"), eight: useString("dotIs8"), geo: useString("dotGeometric"),
    unitDot: useString("dotUnit"), theta: useString("theta"), thetaEq: useString("thetaEq"), cosEq: useString("cosEq"),
    one: useString("one"), chips: [useString("signFront"), useString("signSide"), useString("signBehind")],
    acos: useString("acos"),
  };

  const shrink = progress(unit, 24);
  const aLen = A_LEN + (R - A_LEN) * shrink;
  const bLen = B_LEN + (R - B_LEN) * shrink;
  // θ lands on each beat: 0° just after {front}, 90° on {side}, 180° after {behind}.
  const lead = sweep - front;
  const theta =
    side < -30 ? interpolate(sweep, [0, lead + 10], [START, 0], clamp)
    : behind < -25 ? interpolate(side, [-30, 5], [0, 90], clamp)
    : interpolate(behind, [-25, 30], [90, 180], clamp);
  const c = Math.cos((theta * Math.PI) / 180);
  const shown = Math.abs(c) < 0.005 ? 0 : c;
  const tone = shown > 0 ? pal.ok : shown < 0 ? pal.warn : pal.textMuted;
  const bDeg = A_DEG + theta;
  const aTip = polar(O, A_DEG, aLen * drawn(meaning, 18, 4));
  const bTip = polar(O, bDeg, bLen * drawn(meaning, 18, 10));
  const aLabel = polar(O, A_DEG - 9, aLen + 26);
  const bLabel = polar(O, bDeg + 8, bLen + 30);
  const chipCues = [front, side, behind];
  const chipTones = [pal.ok, pal.textMuted, pal.warn];
  const lookAt = noTrig >= 0 ? { x: ACOS.x + ACOS.w / 2, y: ACOS.y } : sweep >= 0 ? bTip : cos >= 0 ? { x: 900, y: 240 } : { x: 900, y: 150 };
  const strike = drawn(noTrig, 10, 6);

  return (
    <Stage>
      <Circle cx={O.x} cy={O.y} r={R} stroke={pal.sky} strokeWidth={4} draw={drawn(unit, 30, 10)} />
      <Pop t={unit} delay={24} x={O.x} y={O.y - R - 26}>
        <Label x={O.x} y={O.y - R - 16} size={28} color={pal.sky}>{s.one}</Label>
      </Pop>
      {formula >= 0 ? <AngleArc at={O} from={A_DEG} to={bDeg} r={70} color={tone} label={s.theta} /> : null}
      <ArrowPath a={O} b={aTip} stroke={pal.sky} width={7} />
      <ArrowPath a={O} b={bTip} stroke={pal.accent} width={7} />
      {meaning > 20 ? (
        <>
          <Label x={aLabel.x} y={aLabel.y + 10} size={30}>{s.a}</Label>
          <Label x={bLabel.x} y={bLabel.y + 10} size={30}>{s.b}</Label>
        </>
      ) : null}
      <circle cx={O.x} cy={O.y} r={8} fill={pal.panel} stroke={pal.outline} strokeWidth={4} />

      <FadeOut t={formula}>
        <Pop t={meaning} delay={14} x={900} y={130}>
          <Title x={900} y={150} size={52}>{s.eight}</Title>
        </Pop>
      </FadeOut>
      <Pop t={formula} delay={8} x={900} y={130}>
        <Title x={900} y={150} size={48}>{s.geo}</Title>
      </Pop>
      <Pop t={cos} x={900} y={220}>
        <Title x={900} y={240} size={52} color={pal.hero}>{s.unitDot}</Title>
      </Pop>

      <Pop t={sweep} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={22} fill={pal.panel} />
        <rect x={CARD.x + 20} y={CARD.y + 20} width={12} height={CARD.h - 40} rx={6} fill={tone} />
        <Code x={CARD.x + 52} y={CARD.y + 50} size={30}>{`${s.thetaEq} ${Math.round(theta)}°`}</Code>
        <Code x={CARD.x + 52} y={CARD.y + 94} size={30}>{`${s.cosEq} ${shown < 0 ? `−${(-shown).toFixed(2)}` : shown.toFixed(2)}`}</Code>
      </Pop>

      {chipCues.map((t, i) => {
        // {sign} pulses the three chips' borders in turn.
        const pulse = progress(sign - i * 5, 8) * (1 - progress(sign - i * 5 - 14, 10));
        return (
          <Pop key={i} t={t} x={720 + i * 140} y={CHIP_Y}>
            <Box x={660 + i * 140} y={CHIP_Y - 30} w={120} h={60} r={18} fill={pal.panel} stroke={chipTones[i]}
              strokeWidth={5 + 4 * pulse} />
            <Code x={720 + i * 140} y={CHIP_Y + 11} size={30} anchor="middle">{s.chips[i]}</Code>
          </Pop>
        );
      })}
      <Pop t={noTrig} x={ACOS.x + ACOS.w / 2} y={ACOS.y + ACOS.h / 2}>
        <Box x={ACOS.x} y={ACOS.y} w={ACOS.w} h={ACOS.h} r={18} fill={pal.panel} />
        <Code x={ACOS.x + ACOS.w / 2} y={ACOS.y + 40} size={28} anchor="middle" color={pal.textMuted}>{s.acos}</Code>
        {strike > 0 ? (
          <line x1={ACOS.x + 10} y1={ACOS.y + ACOS.h - 6} x2={ACOS.x + 10 + (ACOS.w - 20) * strike}
            y2={ACOS.y + ACOS.h - 6 - (ACOS.h - 12) * strike} stroke={pal.warn} strokeWidth={7} strokeLinecap="round" />
        ) : null}
      </Pop>

      <Pop t={meaning} delay={4} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={6} lookAt={lookAt} pose={noTrig >= 0 ? "cheer" : "idle"}
          reach={progress(noTrig, 14)} />
      </Pop>
    </Stage>
  );
}

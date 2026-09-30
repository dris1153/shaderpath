import { progress } from "../../kit/easing";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow, Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { Triad } from "./triad";

// A: which axis is up (two panels). B: handedness (Inko's tentacles as axes). C: canvas y-down.
const LEFT = { x: 290, y: 380 };
const RIGHT = { x: 990, y: 380 };
const HOST = { x: 640, y: 330 };
const HAND_R = { x: 380, y: 390 };
const HAND_L = { x: 930, y: 390 };
// Head along z (down-left, toward the viewer): Inko's "up" rotated onto the z axis.
const LIE_DEG = -126;

export function Conventions() {
  const pal = usePalette();
  const t = useCue("in");
  const yup = useCue("yup");
  const zup = useCue("zup");
  const lies = useCue("lies");
  const hand = useCue("hand");
  const curl = useCue("curl");
  const thumb = useCue("thumb");
  const left = useCue("left");
  const canvas = useCue("canvas");
  const s = {
    yUp: useString("yUp"), zUp: useString("zUp"), right: useString("rightHanded"), left: useString("leftHanded"),
    rightTools: useString("rightTools"), leftTools: useString("leftTools"), math: useString("math"), canvas: useString("canvasFrame"),
  };
  const rTips = { x: { x: 600, y: 390 }, y: { x: 380, y: 160 }, z: { x: 230, y: 540 } };
  return (
    <Stage>
      <FadeOut t={hand}>
        <Pop t={t} delay={4} x={290} y={290}>
          <Box x={60} y={70} w={460} h={440} r={28} fill={pal.panel} />
          {yup >= 0 ? <Label x={290} y={122} size={30} halo={pal.panel}>{s.yUp}</Label> : null}
          <Triad t={yup - 8} o={LEFT} tips={{ x: { x: 440, y: 380 }, y: { x: 290, y: 190 }, z: { x: 185, y: 460 } }} up="y" />
        </Pop>
        <Pop t={t} delay={10} x={990} y={290}>
          <Box x={760} y={70} w={460} h={440} r={28} fill={pal.panel} />
          {zup >= 0 ? <Label x={990} y={122} size={30} halo={pal.panel}>{s.zUp}</Label> : null}
          <Triad t={zup - 8} o={RIGHT} tips={{ x: { x: 1140, y: 380 }, y: { x: 1080, y: 310 }, z: { x: 990, y: 190 } }} up="z" />
          {zup >= 0 ? <Inko x={1135} y={225} scale={0.3} seed={6} lookAt={HOST} /> : null}
        </Pop>
        {/* Inko hosts between the panels, looking at whichever one is being talked about. */}
        <Pop t={t} x={HOST.x} y={HOST.y}>
          <Inko x={HOST.x} y={HOST.y} scale={0.7} pose="surprised" reach={progress(lies, 12)} seed={5}
            lookAt={lies >= 0 ? { x: 150, y: 300 } : zup >= 0 ? RIGHT : LEFT} />
        </Pop>
        {lies >= 0 ? (
          <g transform={`rotate(${LIE_DEG * progress(lies - 10, 20)} 150 300)`}>
            <Pop t={lies} x={150} y={300}>
              <Inko x={150} y={300} scale={0.3} seed={14} />
            </Pop>
          </g>
        ) : null}
      </FadeOut>

      <FadeOut t={canvas}>
        <Pop t={hand - 10} x={HAND_R.x} y={HAND_R.y}>
          <Triad t={hand} o={HAND_R} tips={rTips} hero="z" heroT={thumb} />
          <Inko x={HAND_R.x} y={HAND_R.y} scale={0.55} pose="threads" threads={[rTips.x, rTips.y, rTips.z]}
            reach={progress(hand - 20, 20)} seed={7} />
          {/* Fingers curl from x toward y. */}
          <Shape d={`M ${HAND_R.x + 160} ${HAND_R.y} A 160 160 0 0 0 ${HAND_R.x} ${HAND_R.y - 160}`} stroke={pal.accent}
            strokeWidth={6} draw={drawn(curl, 24)} />
          <Label x={HAND_R.x} y={600 - 12} size={30}>{s.right}</Label>
          <Label x={HAND_R.x + 220} y={600 - 12} size={26} color={pal.textMuted}>{s.rightTools}</Label>
        </Pop>
        <Pop t={left} x={HAND_L.x} y={HAND_L.y}>
          <Triad t={left} o={HAND_L} tips={{ x: { x: 1130, y: 390 }, y: { x: 930, y: 160 }, z: { x: 1060, y: 280 } }} hero="z" heroColor={pal.accent} />
          <Label x={HAND_L.x} y={600 - 12} size={30}>{s.left}</Label>
          <Label x={HAND_L.x + 190} y={600 - 12} size={26} color={pal.textMuted}>{s.leftTools}</Label>
        </Pop>
      </FadeOut>

      {canvas >= 10 ? (
        <>
          <Pop t={canvas - 10} x={360} y={320}>
            <Label x={360} y={110} size={34}>{s.math}</Label>
            <Arrow x1={230} y1={470} x2={520} y2={470} strokeWidth={6} seed={31} draw={drawn(canvas - 10, 18)} />
            <Arrow x1={230} y1={470} x2={230} y2={170} stroke={pal.hero} strokeWidth={6} seed={32} draw={drawn(canvas - 16, 18)} />
            <Label x={545} y={480}>x</Label>
            <Label x={230} y={150}>y</Label>
          </Pop>
          <Pop t={canvas} x={900} y={320}>
            <Label x={900} y={110} size={34}>{s.canvas}</Label>
            <Box x={730} y={150} w={340} h={320} r={10} fill={pal.panel} />
            <Arrow x1={730} y1={150} x2={1020} y2={150} strokeWidth={6} seed={33} draw={drawn(canvas, 18)} />
            <Arrow x1={730} y1={150} x2={730} y2={440} stroke={pal.hero} strokeWidth={6} seed={34} draw={drawn(canvas - 6, 18)} />
            <circle cx={730} cy={150} r={11} fill={pal.outline} />
            <Label x={1045} y={160}>x</Label>
            <Label x={705} y={470}>y</Label>
          </Pop>
          <Pop t={canvas + 10} x={640} y={530}>
            <Inko x={640} y={520} scale={0.45} seed={8} lookAt={{ x: 900, y: 300 }} />
          </Pop>
        </>
      ) : null}
    </Stage>
  );
}

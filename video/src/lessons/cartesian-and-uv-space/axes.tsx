import { Point } from "../../kit/diagram";
import { progress } from "../../kit/easing";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

const O = { x: 700, y: 390 };
const STEP = 100;
const TICKS = [-3, -2, -1, 0, 1, 2, 3];
const Z_TIP = { x: O.x - 190, y: O.y + 170 };

export function Axes() {
  const pal = usePalette();
  const line = useCue("line");
  const plane = useCue("plane");
  const walk = useCue("walk");
  const space = useCue("space");
  const assume = useCue("assume");
  const pointLabel = useString("point");
  // The dot walks 2 steps along x, then 1 step up.
  const across = progress(walk, 24);
  const up = progress(walk - 30, 18);
  const dot = { x: O.x + 2 * STEP * across, y: O.y - STEP * up };
  const landed = walk - 48;
  return (
    <Stage>
      <Inko x={170} y={470} scale={0.75} pose="think" reach={progress(assume, 14)} lookAt={O} seed={4} />
      <Arrow x1={O.x - 360} y1={O.y} x2={O.x + 380} y2={O.y} strokeWidth={6} seed={21} draw={drawn(line, 24)} />
      {TICKS.map((k, i) => {
        // Ticks pulse in turn once "evenly spaced" is said.
        const pulse = progress(assume - 20 - i * 4, 8) * (1 - progress(assume - 32 - i * 4, 8));
        const x = O.x + k * STEP;
        return (
          <Pop key={k} t={line} delay={14 + i * 3} x={x} y={O.y}>
            <line x1={x} y1={O.y - 12 - pulse * 6} x2={x} y2={O.y + 12 + pulse * 6}
              stroke={pulse > 0.05 ? pal.accent : pal.outline} strokeWidth={5 + pulse * 3} strokeLinecap="round" />
            <Label x={x} y={O.y + 50} size={28}>
              {k < 0 ? `−${-k}` : String(k)}
            </Label>
          </Pop>
        );
      })}
      <Arrow x1={O.x} y1={O.y} x2={O.x} y2={O.y - 290} strokeWidth={6} seed={22} draw={drawn(plane, 22)} />
      {plane > 18 ? <Label x={O.x + 405} y={O.y + 12}>x</Label> : null}
      {plane > 18 ? <Label x={O.x} y={O.y - 312}>y</Label> : null}
      {landed > 0 ? (
        <g stroke={pal.textMuted} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={progress(landed, 10)}>
          <line x1={O.x} y1={dot.y} x2={dot.x} y2={dot.y} />
          <line x1={dot.x} y1={O.y} x2={dot.x} y2={dot.y} />
        </g>
      ) : null}
      {walk >= 0 ? <Point t={walk} x={dot.x} y={dot.y} label={landed > 0 ? pointLabel : undefined} /> : null}
      <Arrow x1={O.x} y1={O.y} x2={Z_TIP.x} y2={Z_TIP.y} strokeWidth={6} seed={23} draw={drawn(space, 22)} />
      {space > 18 ? <Label x={Z_TIP.x - 24} y={Z_TIP.y + 12}>z</Label> : null}
      {assume >= 0 ? (
        <Shape d={`M ${O.x + 26} ${O.y} L ${O.x + 26} ${O.y - 26} L ${O.x} ${O.y - 26}`} stroke={pal.accent}
          strokeWidth={5} draw={drawn(assume, 12)} />
      ) : null}
    </Stage>
  );
}

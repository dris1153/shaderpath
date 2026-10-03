import { progress } from "../../kit/easing";
import { Axis3D, FloorGrid, toStage3, Vector3, type IsoSpace, type Vec3 } from "../../kit/iso";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// a and b lie on the floor (y = 0), so a × b stands straight up. They start at
// P, off the axes, so a × b never hides the y axis. a × b is shown at a fixed
// length: the beat is its direction, not its size.
const I: IsoSpace = { ox: 500, oy: 300, unit: 85 };
const P: Vec3 = { x: 1.6, y: 0, z: 0.6 };
const add = (u: Vec3, v: Vec3): Vec3 => ({ x: u.x + v.x, y: u.y + v.y, z: u.z + v.z });
const A: Vec3 = { x: 0.4, y: 0, z: 2.2 };
const B: Vec3 = { x: 2.2, y: 0, z: 0.5 };
const UP: Vec3 = { x: 0, y: 2.4, z: 0 };
const MARK = 0.32;
const HOST = { x: 1110, y: 430 };

// A small right-angle square at P in the plane of `u` and `v` (both unit length).
function rightAngle(u: Vec3, v: Vec3): string {
  const p = (k: number, l: number) => toStage3(I, add(P, { x: u.x * k + v.x * l, y: u.y * k + v.y * l, z: u.z * k + v.z * l }));
  const [a, b, c] = [p(MARK, 0), p(MARK, MARK), p(0, MARK)];
  return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`;
}

const unitOf = (v: Vec3): Vec3 => {
  const l = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / l, y: v.y / l, z: v.z / l };
};

export function Cross() {
  const pal = usePalette();
  const threeD = useCue("threeD");
  const crossCue = useCue("cross");
  const perp = useCue("perp");
  const s = { a: useString("a"), b: useString("b"), cross: useString("crossSymbol") };
  const marks = progress(perp - 18, 12);

  return (
    <Stage>
      <FloorGrid space={I} x={[0, 4]} z={[0, 3]} t={threeD} />
      <Axis3D space={I} len={2.7} t={threeD - 8} />
      <Vector3 space={I} from={P} to={add(P, A)} grow={drawn(crossCue, 18, 4)} color={pal.sky} label={s.a} />
      <Vector3 space={I} from={P} to={add(P, B)} grow={drawn(crossCue, 18, 14)} color={pal.accent} label={s.b} />
      <Vector3 space={I} from={P} to={add(P, UP)} grow={drawn(perp, 22)} label={s.cross} labelAt={1.16} />
      {marks > 0 ? (
        <g stroke={pal.outline} strokeWidth={3} fill="none" opacity={marks}>
          <path d={rightAngle(unitOf(A), unitOf(UP))} />
          <path d={rightAngle(unitOf(B), unitOf(UP))} />
        </g>
      ) : null}
      <Pop t={threeD} delay={6} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={8} lookAt={toStage3(I, add(P, perp >= 0 ? UP : A))} />
      </Pop>
    </Stage>
  );
}

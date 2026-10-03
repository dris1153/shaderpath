import { progress } from "../../kit/easing";
import { ArrowPath, type Vec } from "../../kit/grid";
import { Axis3D, cross, FloorGrid, toStage3, Vector3, type IsoSpace, type Vec3 } from "../../kit/iso";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// a and b lie on the floor (y = 0), so a × b stands straight up. They start at
// P, off the axes, so a × b never hides the y axis. a × b is shown at a fixed
// length: the beat is its direction, not its size.
const I: IsoSpace = { ox: 500, oy: 300, unit: 85 };
const P: Vec3 = { x: 1.6, y: 0, z: 0.6 };
const add = (u: Vec3, v: Vec3): Vec3 => ({ x: u.x + v.x, y: u.y + v.y, z: u.z + v.z });
const scale = (v: Vec3, k: number): Vec3 => ({ x: v.x * k, y: v.y * k, z: v.z * k });
const unitOf = (v: Vec3): Vec3 => scale(v, 1 / Math.hypot(v.x, v.y, v.z));
const A: Vec3 = { x: 0.4, y: 0, z: 2.2 };
const B: Vec3 = { x: 2.2, y: 0, z: 0.5 };
const AXB = cross(A, B); // (0, 4.64, 0): straight up, as the right-hand rule says
const UP = scale(unitOf(AXB), 2.4);
const DOWN = scale(UP, -1);
const MARK = 0.32;
const CURL_R = 1.4;
const CURL_Y = 0.35;
const HOST = { x: 1110, y: 470 };
const CHIP_X = 990;

// A small right-angle square at P in the plane of `u` and `v` (both unit length).
function rightAngle(u: Vec3, v: Vec3): string {
  const p = (k: number, l: number) => toStage3(I, add(P, add(scale(u, k), scale(v, l))));
  const [a, b, c] = [p(MARK, 0), p(MARK, MARK), p(0, MARK)];
  return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`;
}

// The curl of the right hand's fingers: an arc just above the floor from one
// direction to the other around P (slerp between the two unit vectors).
function curlPoints(from: Vec3, to: Vec3): Vec[] {
  const u = unitOf(from);
  const v = unitOf(to);
  const th = Math.acos(u.x * v.x + u.y * v.y + u.z * v.z);
  return Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const d = add(scale(u, Math.sin((1 - t) * th) / Math.sin(th)), scale(v, Math.sin(t * th) / Math.sin(th)));
    return toStage3(I, add(P, { x: d.x * CURL_R, y: CURL_Y, z: d.z * CURL_R }));
  });
}

function Curl({ from, to, draw, color, dashed }: { from: Vec3; to: Vec3; draw: number; color: string; dashed?: boolean }) {
  if (draw <= 0) return null;
  const pts = curlPoints(from, to);
  const n = Math.max(2, Math.round(pts.length * draw));
  const shown = pts.slice(0, n);
  const end = shown[n - 1]!;
  const prev = shown[n - 2]!;
  const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
  const head = (s: number) => ({ x: end.x - 18 * Math.cos(ang + s), y: end.y - 18 * Math.sin(ang + s) });
  return (
    <g stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${shown.map((p) => `${p.x} ${p.y}`).join(" L ")}`} strokeDasharray={dashed ? "8 12" : undefined} />
      <path d={`M ${head(-0.55).x} ${head(-0.55).y} L ${end.x} ${end.y} L ${head(0.55).x} ${head(0.55).y}`} />
    </g>
  );
}

function Chip({ t, y, text, border }: { t: number; y: number; text: string; border: string }) {
  const pal = usePalette();
  return (
    <Pop t={t} x={CHIP_X} y={y}>
      <Box x={CHIP_X - 160} y={y - 32} w={320} h={64} r={20} fill={pal.panel} stroke={border} strokeWidth={5} />
      <Label x={CHIP_X} y={y + 11} size={30} halo={pal.panel}>{text}</Label>
    </Pop>
  );
}

export function Cross() {
  const pal = usePalette();
  const threeD = useCue("threeD");
  const crossCue = useCue("cross");
  const perp = useCue("perp");
  const two = useCue("two");
  const hand = useCue("hand");
  const thumb = useCue("thumb");
  const axes = useCue("axes");
  const swap = useCue("swap");
  const unlike = useCue("unlike");
  const s = {
    a: useString("a"), b: useString("b"), cross: useString("crossSymbol"), ask: useString("question"),
    xy: useString("xCrossY"), swapped: useString("crossSwap"), ba: useString("bCrossA"), commutes: useString("dotCommutes"),
  };

  const marks = progress(perp - 18, 12);
  // The downward twin: a question at {two}, gone once the thumb picks "up".
  const twin = progress(two, 16) * (1 - progress(thumb, 14));
  // {axes} dims the a, b picture while the axes make the same point.
  const dim = 1 - 0.7 * progress(axes, 12) * (1 - progress(swap, 12));
  const swell = progress(thumb - 4, 8) * (1 - progress(thumb - 20, 14));
  const down = toStage3(I, add(P, DOWN));
  const upTip = toStage3(I, add(P, UP));
  const o = toStage3(I, { x: 0, y: 0, z: 0 });
  const axisTip = (v: Vec3) => toStage3(I, scale(v, 2.7));
  const lookAt = swap >= 0 ? down : axes >= 0 ? axisTip({ x: 0, y: 0, z: 1 }) : thumb >= 0 ? upTip : hand >= 0 ? curlPoints(A, B)[12]! : upTip;

  return (
    <Stage>
      <FloorGrid space={I} x={[0, 4]} z={[0, 3]} t={threeD} />
      <Axis3D space={I} len={2.7} t={threeD - 8} />
      {/* x × y = z, traced over the axes. */}
      {axes >= 0 ? (
        <g opacity={1 - progress(swap, 12)}>
          <ArrowPath a={o} b={axisTip({ x: drawn(axes, 14), y: 0, z: 0 })} stroke={pal.sky} width={7} />
          <ArrowPath a={o} b={axisTip({ x: 0, y: drawn(axes, 14, 10), z: 0 })} stroke={pal.accent} width={7} />
          <ArrowPath a={o} b={axisTip({ x: 0, y: 0, z: drawn(axes, 16, 24) })} stroke={pal.hero} width={7} />
        </g>
      ) : null}

      <g opacity={dim}>
        <Vector3 space={I} from={P} to={add(P, A)} grow={drawn(crossCue, 18, 4)} color={pal.sky} label={s.a} />
        <Vector3 space={I} from={P} to={add(P, B)} grow={drawn(crossCue, 18, 14)} color={pal.accent} label={s.b} />
        {twin > 0 ? (
          <g opacity={twin}>
            <Vector3 space={I} from={P} to={add(P, DOWN)} color={pal.textMuted} dashed width={6} />
            <Title x={down.x + 44} y={down.y - 30} size={48}>{s.ask}</Title>
          </g>
        ) : null}
        {/* hero and warn share a hue: a × b steps back while b × a is shown. */}
        <g opacity={1 - 0.6 * progress(swap, 12)}>
          <Vector3 space={I} from={P} to={add(P, UP)} grow={drawn(perp, 22)} width={7 + 4 * swell} label={s.cross} labelAt={1.16} />
        </g>
        {marks > 0 ? (
          <g stroke={pal.outline} strokeWidth={3} fill="none" opacity={marks * (1 - progress(hand, 10))}>
            <path d={rightAngle(unitOf(A), unitOf(UP))} />
            <path d={rightAngle(unitOf(B), unitOf(UP))} />
          </g>
        ) : null}
        <Curl from={A} to={B} draw={drawn(hand, 30, 6) * (1 - progress(swap, 10))} color={pal.ok} />
        <Curl from={B} to={A} draw={drawn(swap, 26, 4)} color={pal.warn} dashed />
        {swap >= 0 ? (
          <g>
            <Vector3 space={I} from={P} to={add(P, DOWN)} grow={drawn(swap, 22, 24)} color={pal.warn} />
            {swap > 40 ? <Label x={down.x + 70} y={down.y - 20} size={30}>{s.ba}</Label> : null}
          </g>
        ) : null}
      </g>

      <Chip t={axes} y={150} text={s.xy} border={pal.hero} />
      <Chip t={swap - 40} y={232} text={s.swapped} border={pal.warn} />
      <Chip t={unlike} y={314} text={s.commutes} border={pal.ok} />

      <Pop t={threeD} delay={6} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={8} lookAt={lookAt}
          pose={unlike >= 0 ? "think" : "idle"} reach={progress(unlike, 14)} />
      </Pop>
    </Stage>
  );
}

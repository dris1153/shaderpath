import { progress } from "../../kit/easing";
import { polar } from "../../kit/angle";
import { lerp, type Vec } from "../../kit/grid";
import { cross, FloorGrid, toStage3, Vector3, type IsoSpace, type Vec3 } from "../../kit/iso";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// Triangle ABC on the floor. (B − A) × (C − A) points up, toward the camera, so
// A → B → C runs counter-clockwise on screen: the front face in WebGL/three.js.
const I: IsoSpace = { ox: 520, oy: 250, unit: 95 };
const A: Vec3 = { x: 0.6, y: 0, z: 2.4 };
const B: Vec3 = { x: 3.2, y: 0, z: 2.0 };
const C: Vec3 = { x: 1.4, y: 0, z: 0.4 };
const sub = (u: Vec3, v: Vec3): Vec3 => ({ x: u.x - v.x, y: u.y - v.y, z: u.z - v.z });
const add = (u: Vec3, v: Vec3): Vec3 => ({ x: u.x + v.x, y: u.y + v.y, z: u.z + v.z });
const scale = (v: Vec3, k: number): Vec3 => ({ x: v.x * k, y: v.y * k, z: v.z * k });
const mix = (u: Vec3, v: Vec3, k: number): Vec3 => add(u, scale(sub(v, u), k));
// C slides onto the line AB for {zero}: the edges go parallel and the triangle flattens.
const C_FLAT = mix(A, B, 0.5);
const RAW_LEN = 2.6; // the raw cross is long; shown at this length before normalizing
const CHIP_X = 1020;
const HOST = { x: 1130, y: 510 };

function Chip({ t, y, text, border, w = 400 }: { t: number; y: number; text: string; border: string; w?: number }) {
  const pal = usePalette();
  return (
    <Pop t={t} x={CHIP_X} y={y}>
      <Box x={CHIP_X - w / 2} y={y - 30} w={w} h={60} r={20} fill={pal.panel} stroke={border} strokeWidth={5} />
      <Label x={CHIP_X} y={y + 10} size={26} halo={pal.panel}>{text}</Label>
    </Pop>
  );
}

// Arrows just inside each edge, in corner order, so the winding reads at a glance.
// ↺ drawn from geometry (the fonts carry no such glyph): a counter-clockwise arc of 270° around `at`,
// ending in a solid arrowhead on the tangent, so the icon stays round, readable and centred on the chip.
function CcwIcon({ at, r, color }: { at: Vec; r: number; color: string }) {
  const START = 30;
  const END = 300;
  const end = polar(at, END, r);
  const rad = (END * Math.PI) / 180;
  // Direction of travel at the end of the arc (counter-clockwise, y down on screen).
  const dir = Math.atan2(-Math.cos(rad), -Math.sin(rad));
  const along = (d: number, side: number) => ({
    x: end.x + d * Math.cos(dir) - side * Math.sin(dir),
    y: end.y + d * Math.sin(dir) + side * Math.cos(dir),
  });
  const head = [along(9, 0), along(-3, 7), along(-3, -7)];
  const from = polar(at, START, r);
  return (
    <g>
      <path d={`M ${from.x} ${from.y} A ${r} ${r} 0 1 0 ${end.x} ${end.y}`} fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" />
      <path d={`M ${head.map((q) => `${q.x} ${q.y}`).join(" L ")} Z`} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}

function Winding({ pts, draw, color }: { pts: Vec[]; draw: number; color: string }) {
  if (draw <= 0) return null;
  const c = { x: (pts[0]!.x + pts[1]!.x + pts[2]!.x) / 3, y: (pts[0]!.y + pts[1]!.y + pts[2]!.y) / 3 };
  const inset = pts.map((p) => lerp(p, c, 0.28));
  return (
    <g stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {inset.map((p, i) => {
        const q = inset[(i + 1) % 3]!;
        const k = Math.max(0, Math.min(1, draw * 3 - i));
        if (k <= 0) return null;
        const a = lerp(p, q, 0.12);
        const b = lerp(p, q, 0.12 + 0.76 * k);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const h = (s: number) => `${b.x - 14 * Math.cos(ang + s)} ${b.y - 14 * Math.sin(ang + s)}`;
        return (
          <g key={i}>
            <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
            {k >= 1 ? <path d={`M ${h(-0.6)} L ${b.x} ${b.y} L ${h(0.6)}`} /> : null}
          </g>
        );
      })}
    </g>
  );
}

export function Normal() {
  const pal = usePalette();
  const why = useCue("why");
  const out = useCue("out");
  const corners = useCue("corners");
  const ab = useCue("ab");
  const ac = useCue("ac");
  const crossEdges = useCue("crossEdges");
  const normalize = useCue("normalize");
  const area = useCue("area");
  const half = useCue("half");
  const zero = useCue("zero");
  const winding = useCue("winding");
  const ccw = useCue("ccw");
  const flipped = useCue("flipped");
  const s = {
    names: [useString("cornerA"), useString("cornerB"), useString("cornerC")],
    ab: useString("edgeAB"), ac: useString("edgeAC"), n: useString("N"), formula: useString("normalFormula"),
    area: useString("areaFormula"), nan: useString("nan"), front: useString("front"),
  };

  const flat = progress(zero, 24) * (1 - progress(winding - 30, 20));
  const c = mix(C, C_FLAT, flat);
  const nRaw = cross(sub(B, A), sub(c, A));
  const nLen = Math.hypot(nRaw.x, nRaw.y, nRaw.z);
  const full = cross(sub(B, A), sub(C, A));
  const fullLen = Math.hypot(full.x, full.y, full.z);
  // Shown length: the raw cross (RAW_LEN) until {normalize}, then 1. From {area} to
  // just before {winding} it is the raw cross again (its length is the area), so it
  // shrinks to zero with the flattening triangle; {flipped} turns it through the floor.
  const unitLen = RAW_LEN + (1 - RAW_LEN) * progress(normalize, 20);
  const rawK = progress(area, 16) * (1 - progress(winding - 30, 20));
  const shownLen = unitLen + (RAW_LEN * (nLen / fullLen) - unitLen) * rawK;
  const flip = 1 - 2 * progress(flipped - 20, 24);
  const nShown = scale({ x: 0, y: 1, z: 0 }, shownLen * flip);
  const p = [A, B, c].map((v) => toStage3(I, v));
  const d = toStage3(I, add(add(A, sub(B, A)), sub(c, A)));
  const tri = `M ${p[0]!.x} ${p[0]!.y} L ${p[1]!.x} ${p[1]!.y} L ${p[2]!.x} ${p[2]!.y} Z`;
  const para = `M ${p[0]!.x} ${p[0]!.y} L ${p[1]!.x} ${p[1]!.y} L ${d.x} ${d.y} L ${p[2]!.x} ${p[2]!.y} Z`;
  // {flipped}: B and C trade labels, so the corner order reverses.
  const swapK = progress(flipped, 18);
  const labelAt = [p[0]!, lerp(p[1]!, p[2]!, swapK), lerp(p[2]!, p[1]!, swapK)];
  const OFF = [{ x: -26, y: 26 }, { x: 22, y: 30 }, { x: 4, y: -22 }];
  const labelOff = [OFF[0]!, lerp(OFF[1]!, OFF[2]!, swapK), lerp(OFF[2]!, OFF[1]!, swapK)];
  const windPts = flipped >= 0 ? [p[0]!, p[2]!, p[1]!] : p;
  const nTip = toStage3(I, add(A, nShown));
  const lookAt = flipped >= 0 ? nTip : winding >= 0 ? p[1]! : zero >= 0 ? p[2]! : area >= 0 ? d : crossEdges >= 0 ? nTip : p[0]!;

  return (
    <Stage>
      <FloorGrid space={I} x={[0, 4]} z={[0, 3]} t={why} />
      {area >= 0 ? <path d={para} fill={pal.accent} opacity={0.3 * progress(area, 14) * (1 - flat) * (1 - progress(winding, 14))} stroke={pal.accent} strokeWidth={3} /> : null}
      <Pop t={out} x={(p[0]!.x + p[1]!.x + p[2]!.x) / 3} y={(p[0]!.y + p[1]!.y + p[2]!.y) / 3}>
        <path d={tri} fill={pal.sky} opacity={0.35 + 0.3 * progress(half, 12)} stroke={pal.outline} strokeWidth={5} strokeLinejoin="round" />
      </Pop>
      {/* The face's direction, shown once before it is rebuilt from the edges. */}
      <FadeOut t={corners} duration={12}>
        {out >= 0 ? <Vector3 space={I} from={A} to={add(A, { x: 0, y: 1.3, z: 0 })} grow={drawn(out, 18, 12)} /> : null}
      </FadeOut>

      <Vector3 space={I} from={A} to={B} grow={drawn(ab, 18)} color={pal.sky} width={6} />
      <Vector3 space={I} from={A} to={c} grow={drawn(ac, 18)} color={pal.accent} width={6} />
      <g opacity={1 - flat}>
      <Pop t={ab} delay={10} x={lerp(p[0]!, p[1]!, 0.5).x} y={lerp(p[0]!, p[1]!, 0.5).y + 34}>
        <Label x={lerp(p[0]!, p[1]!, 0.5).x - 10} y={lerp(p[0]!, p[1]!, 0.5).y + 44} size={28}>{s.ab}</Label>
      </Pop>
      <Pop t={ac} delay={10} x={lerp(p[0]!, p[2]!, 0.5).x - 60} y={lerp(p[0]!, p[2]!, 0.5).y}>
        <Label x={lerp(p[0]!, p[2]!, 0.5).x - 70} y={lerp(p[0]!, p[2]!, 0.5).y} size={28}>{s.ac}</Label>
      </Pop>
      </g>
      {crossEdges >= 0 ? (
        <Vector3 space={I} from={A} to={add(A, nShown)} grow={drawn(crossEdges, 18)} color={flip < 0 ? pal.warn : pal.hero}
          label={normalize > 20 && rawK < 0.5 && Math.abs(nShown.y) > 0.4 ? s.n : undefined} labelAt={1.3} />
      ) : null}
      <Winding pts={windPts} draw={flipped >= 0 ? drawn(flipped - 10, 30) : drawn(winding, 30)} color={flipped >= 0 ? pal.warn : pal.ok} />

      {labelAt.map((q, i) => (
        <Pop key={i} t={corners} delay={i * 5} x={q.x} y={q.y}>
          <circle cx={q.x} cy={q.y} r={9} fill={pal.panel} stroke={pal.outline} strokeWidth={4} />
          <Title x={q.x + labelOff[i]!.x} y={q.y + labelOff[i]!.y + 14} size={40}>{s.names[i]}</Title>
        </Pop>
      ))}

      <Chip t={normalize} y={120} text={s.formula} border={pal.hero} />
      <Chip t={area} y={200} text={s.area} border={pal.accent} w={300} />
      <Chip t={zero - 20} y={280} text={s.nan} border={pal.warn} w={160} />
      <Pop t={ccw} x={CHIP_X} y={360}>
        <Box x={CHIP_X - 110} y={330} w={220} h={60} r={20} fill={pal.panel} stroke={pal.ok} strokeWidth={5} />
        <CcwIcon at={{ x: CHIP_X - 62, y: 360 }} r={13} color={pal.ok} />
        <Label x={CHIP_X + 22} y={371} size={30} halo={pal.panel}>{s.front}</Label>
      </Pop>

      <Pop t={why} delay={6} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={9} lookAt={lookAt}
          pose={flipped >= 0 ? "surprised" : "idle"} reach={progress(flipped, 12)} />
      </Pop>
    </Stage>
  );
}

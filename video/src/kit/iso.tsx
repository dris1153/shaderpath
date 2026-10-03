import { progress } from "./easing";
import { ArrowPath, lerp, type Vec } from "./grid";
import { usePalette } from "./palette";
import { Label } from "./text";

export type Vec3 = { x: number; y: number; z: number };

// Right-handed world, y up, seen from the (+x, +y, +z) side: x runs right-down,
// z left-down, y straight up. One fixed isometric view, so x × y = z reads true.
export type IsoSpace = { ox: number; oy: number; unit: number };

const COS30 = Math.sqrt(3) / 2;

export function toStage3(s: IsoSpace, p: Vec3): Vec {
  return { x: s.ox + (p.x - p.z) * COS30 * s.unit, y: s.oy + ((p.x + p.z) / 2 - p.y) * s.unit };
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

// Faint unit lines on the y = 0 floor over [x0, x1] × [z0, z1].
export function FloorGrid({ space, x, z, t }: { space: IsoSpace; x: [number, number]; z: [number, number]; t: number }) {
  const pal = usePalette();
  const fade = progress(t, 18);
  if (fade <= 0) return null;
  const line = (a: Vec3, b: Vec3, key: string) => {
    const p = toStage3(space, a);
    const q = toStage3(space, b);
    return <line key={key} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />;
  };
  const lines = [];
  for (let i = x[0]; i <= x[1]; i++) lines.push(line({ x: i, y: 0, z: z[0] }, { x: i, y: 0, z: z[1] }, `x${i}`));
  for (let j = z[0]; j <= z[1]; j++) lines.push(line({ x: x[0], y: 0, z: j }, { x: x[1], y: 0, z: j }, `z${j}`));
  // A faint fill gives the floor a surface, so arrows read as lying on it.
  const corners = [[x[0], z[0]], [x[1], z[0]], [x[1], z[1]], [x[0], z[1]]].map(([cx, cz]) => toStage3(space, { x: cx!, y: 0, z: cz! }));
  return (
    <g opacity={fade}>
      <path d={`M ${corners.map((c) => `${c.x} ${c.y}`).join(" L ")} Z`} fill={pal.sky} opacity={0.1} />
      <g stroke={pal.sky} strokeWidth={2} opacity={0.4}>{lines}</g>
    </g>
  );
}

// x, y and z axes from the origin, each growing in turn from `t`.
export function Axis3D({ space, len, t, labels = ["x", "y", "z"] }: {
  space: IsoSpace; len: number; t: number; labels?: [string, string, string];
}) {
  const pal = usePalette();
  const o = toStage3(space, { x: 0, y: 0, z: 0 });
  const ends: Vec3[] = [{ x: len, y: 0, z: 0 }, { x: 0, y: len, z: 0 }, { x: 0, y: 0, z: len }];
  return (
    <g>
      {ends.map((end, i) => {
        const p = progress(t - i * 6, 20);
        if (p <= 0) return null;
        const tip = toStage3(space, end);
        const label = toStage3(space, { x: end.x * 1.18, y: end.y * 1.12, z: end.z * 1.18 });
        return (
          <g key={i}>
            <ArrowPath a={o} b={lerp(o, tip, p)} stroke={pal.outline} width={4} />
            {p > 0.9 ? <Label x={label.x} y={label.y + 10} size={28}>{labels[i]}</Label> : null}
          </g>
        );
      })}
    </g>
  );
}

// An arrow in world units; `grow` (0–1) extends the tip out of the tail.
export function Vector3({ space, from = { x: 0, y: 0, z: 0 }, to, grow = 1, color, width = 7, dashed, label, labelAt = 1.12 }: {
  space: IsoSpace; from?: Vec3; to: Vec3; grow?: number; color?: string; width?: number; dashed?: boolean;
  label?: string; labelAt?: number;
}) {
  const pal = usePalette();
  if (grow <= 0) return null;
  const a = toStage3(space, from);
  const b = lerp(a, toStage3(space, to), Math.min(1, grow));
  const l = lerp(a, toStage3(space, to), labelAt);
  return (
    <g>
      <ArrowPath a={a} b={b} stroke={color ?? pal.hero} width={width} dashed={dashed} />
      {label && grow > 0.6 ? <Label x={l.x} y={l.y + 10} size={30}>{label}</Label> : null}
    </g>
  );
}

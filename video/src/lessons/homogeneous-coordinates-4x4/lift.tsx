import { progress } from "../../kit/easing";
import { Axis3D, FloorGrid, toStage3, Vector3, type IsoSpace, type Vec3 } from "../../kit/iso";
import { MatrixCard } from "../../kit/matrix";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { Slime } from "../../mascot/Slime";
import { useCue } from "../../scene/cue";

// One dimension down: a 2D world (x across, y into the page) lifted to height w = 1 above the
// w = 0 floor. The 3x3 matrix with t in its last column is a shear: the plane at height 1 slides
// by t, the floor stays, and the posts joining them lean. Heights are drawn H times taller.
const S: IsoSpace = { ox: 600, oy: 410, unit: 62 };
const H = 2.4;
const EXT: [number, number] = [-3, 3];
const T = { x: 2, z: -1 };
const POSTS: [number, number][] = [[-2, -2], [2, -2], [2, 2], [-2, 2], [0, 0]];
const HOST = { x: 120, y: 490 };
const CARD = { x: 1080, y: 130 };

const at = (x: number, w: number, z: number): Vec3 => ({ x, y: w * H, z });

function PlaneGrid({ shift, rise, t }: { shift: { x: number; z: number }; rise: number; t: number }) {
  const pal = usePalette();
  const fade = progress(t, 18);
  if (fade <= 0) return null;
  const p = (x: number, z: number) => toStage3(S, at(x + shift.x, rise, z + shift.z));
  const lines = [];
  for (let i = EXT[0]; i <= EXT[1]; i++) {
    const a = p(i, EXT[0]); const b = p(i, EXT[1]);
    const c = p(EXT[0], i); const d = p(EXT[1], i);
    lines.push(<line key={`x${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />, <line key={`z${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} />);
  }
  const corners = [p(EXT[0], EXT[0]), p(EXT[1], EXT[0]), p(EXT[1], EXT[1]), p(EXT[0], EXT[1])];
  return (
    <g opacity={fade}>
      <path d={`M ${corners.map((q) => `${q.x} ${q.y}`).join(" L ")} Z`} fill={pal.accent} opacity={0.22} />
      <g stroke={pal.accent} strokeWidth={2.5} opacity={0.75}>{lines}</g>
    </g>
  );
}

export function Lift() {
  const pal = usePalette();
  const see = useCue("see");
  const down = useCue("down");
  const plane = useCue("plane");
  const shear = useCue("shear");
  const top = useCue("top");
  const floor = useCue("floor");
  const moves = useCue("moves");
  const s = { mat: useString("mat3T"), w1: useString("wOne"), w0: useString("wZero"), t: useString("t"), x: useString("x"), y: useString("y"), w: useString("w") };

  // The world appears on the floor and rises on "floats on the plane at height one".
  const rise = progress(plane - 99, 40);
  const k = progress(top, 40);
  // The last column glows on "last column", and again on "a plain matrix made a translation".
  const glow = progress(shear - 70, 12) + 0.8 * Math.sin(Math.PI * progress(moves - 85, 30));
  const shift = { x: T.x * k, z: T.z * k };
  const slimeAt = toStage3(S, at(shift.x, rise, shift.z));
  const corner = toStage3(S, at(EXT[0] + shift.x, rise, EXT[1] + shift.z));
  const floorCorner = toStage3(S, at(EXT[1], 0, EXT[0]));

  return (
    <Stage>
      <FloorGrid space={S} x={EXT} z={EXT} t={see} />
      <Axis3D space={S} len={3.6} t={see - 4} labels={[s.x, s.w, s.y]} />
      {plane >= 0 ? (
        <g stroke={pal.outline} strokeWidth={3} strokeDasharray="6 8" opacity={0.55 * progress(plane, 16)}>
          {POSTS.map(([x, z], i) => {
            const a = toStage3(S, at(x, 0, z));
            const b = toStage3(S, at(x + shift.x, rise, z + shift.z));
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>
      ) : null}
      {floor >= 0 ? (
        <g>
          {POSTS.map(([x, z], i) => {
            const a = toStage3(S, at(x, 0, z));
            return (
              <Pop key={i} t={floor} delay={i * 4} x={a.x} y={a.y}>
                <circle cx={a.x} cy={a.y} r={11} fill={pal.sky} stroke={pal.outline} strokeWidth={4} />
              </Pop>
            );
          })}
          <Pop t={floor} delay={20} x={floorCorner.x + 70} y={floorCorner.y}>
            <Label x={floorCorner.x + 70} y={floorCorner.y + 10} size={30}>{s.w0}</Label>
          </Pop>
        </g>
      ) : null}
      <PlaneGrid shift={shift} rise={rise} t={plane} />
      {/* Stops short of the slime standing on its tip, so the head stays visible. */}
      <Vector3 space={S} from={at(0, 1, 0)} to={at(T.x, 1, T.z)} grow={0.85 * drawn(moves, 20)} color={pal.hero} width={6}
        label={s.t} labelAt={0.5} />
      <Pop t={plane} delay={30} x={slimeAt.x} y={slimeAt.y - 30}>
        <Slime at={slimeAt} scale={0.55} />
      </Pop>
      <Pop t={plane} delay={128} x={corner.x - 64} y={corner.y}>
        <Label x={corner.x - 64} y={corner.y + 10} size={30}>{s.w1}</Label>
      </Pop>
      <Pop t={shear} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.mat} size={34} colors={[pal.hero, pal.sky, pal.accent]}
          tint={[0, 0, glow]} />
      </Pop>

      <Pop t={see} delay={10} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={23} pose={down >= 0 && plane < 12 ? "think" : "idle"}
          reach={progress(down, 14) * (1 - progress(plane, 12))} lookAt={top >= 0 ? slimeAt : { x: S.ox, y: S.oy }} />
      </Pop>
    </Stage>
  );
}

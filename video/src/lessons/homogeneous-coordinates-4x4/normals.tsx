import { progress } from "../../kit/easing";
import { ArrowPath, lerp, plus, toStage, type GridSpace, type Vec } from "../../kit/grid";
import { apply, mul, rotation, scaling, type Mat } from "../../kit/mat";
import { Cross, Tick } from "../../kit/matrix";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Circle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// A ball (unit circle) stretched ×2 along x. Normals moved by M lean with the stretch; the
// inverse transpose keeps them perpendicular. With M = R·D, (M⁻¹)ᵀ = R·D⁻¹, so under a uniform
// scale (and any rotation) the two sets agree again.
const B: GridSpace = { ox: 560, oy: 300, unit: 120 };
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const FOCUS = 45;
const LEN = 0.6;
const HOST = { x: 130, y: 480 };
const SUN = { x: 980, y: 150 };

const unit = (deg: number): Vec => ({ x: Math.cos((deg * Math.PI) / 180), y: Math.sin((deg * Math.PI) / 180) });
const norm = (v: Vec, l: number): Vec => {
  const k = l / (Math.hypot(v.x, v.y) || 1);
  return { x: v.x * k, y: v.y * k };
};

export function Normals() {
  const pal = usePalette();
  const catchCue = useCue("catch");
  const stretch = useCue("stretch");
  const wrong = useCue("wrong");
  const light = useCue("light");
  const fix = useCue("fix");
  const hide = useCue("hide");
  const s = { bad: useString("normalWrong"), good: useString("normalRight") };

  // Stretch ×2 along x; on "hide" ease to a uniform 1.2 and turn a little, then rest.
  const st = progress(stretch, 30);
  const back = progress(hide - 10, 40);
  const sx = 1 + st - back * (2 - 1.2);
  const sy = 1 + back * 0.2;
  const turn = 40 * progress(hide - 10, 140);
  const D = scaling(sx, sy);
  const M: Mat = mul(rotation(turn), D);
  const IT: Mat = mul(rotation(turn), scaling(1 / sx, 1 / sy));
  const at = (p: Vec) => toStage(B, p);
  const outline = Array.from({ length: 73 }, (_, i) => at(apply(M, unit(i * 5))));
  const ballPath = `M ${outline.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
  const focus = apply(M, unit(FOCUS));
  const tangent = norm(apply(M, unit(FOCUS + 90)), 0.9);
  const rightN = norm(apply(IT, unit(FOCUS)), LEN);
  const showRight = progress(fix, 16);
  const badFade = 1 - 0.7 * showRight;

  // Right-angle mark between the tangent and the true normal at the focus point.
  const [m1, m2, m3] = [
    at(plus(focus, norm(tangent, 0.12))),
    at(plus(plus(focus, norm(tangent, 0.12)), norm(rightN, 0.12))),
    at(plus(focus, norm(rightN, 0.12))),
  ];
  const mark = `M ${m1.x} ${m1.y} L ${m2.x} ${m2.y} L ${m3.x} ${m3.y}`;
  const toBad = progress(wrong, 12);

  let pose: Pose = "idle";
  let reach = 0;
  if (fix >= 12) { pose = "cheer"; reach = progress(fix - 12, 14) * (1 - progress(hide, 14)); }
  else if (wrong >= 12) { pose = "think"; reach = progress(wrong - 12, 14) * (1 - progress(fix, 12)); }

  return (
    <Stage>
      <Pop t={catchCue} x={B.ox} y={B.oy}>
        <path d={ballPath} fill={pal.panel} stroke={pal.outline} strokeWidth={6} strokeLinejoin="round" />
      </Pop>
      {wrong >= 0 ? (
        <path d={`M ${at(plus(focus, tangent)).x} ${at(plus(focus, tangent)).y} L ${at(plus(focus, { x: -tangent.x, y: -tangent.y })).x} ${at(plus(focus, { x: -tangent.x, y: -tangent.y })).y}`}
          stroke={pal.textMuted} strokeWidth={4} strokeDasharray="6 8" opacity={progress(wrong - 60, 14) * (1 - back)} />
      ) : null}
      {ANGLES.map((a, i) => {
        const p = apply(M, unit(a));
        const bad = norm(apply(M, unit(a)), LEN);
        const good = norm(apply(IT, unit(a)), LEN);
        const grow = drawn(catchCue - 10 - i * 3, 16);
        return (
          <g key={a}>
            {toBad < 1 ? (
              <g opacity={1 - toBad}>
                <ArrowPath a={at(p)} b={lerp(at(p), at(plus(p, bad)), grow)} stroke={pal.sky} width={5} />
              </g>
            ) : null}
            {toBad > 0 ? (
              <g opacity={toBad * badFade}>
                <ArrowPath a={at(p)} b={at(plus(p, bad))} stroke={pal.hero} width={5} dashed />
              </g>
            ) : null}
            {fix >= 0 ? <ArrowPath a={at(p)} b={lerp(at(p), at(plus(p, good)), drawn(fix - i * 3, 16))} stroke={pal.ok} width={6} /> : null}
          </g>
        );
      })}
      {fix >= 30 ? <path d={mark} fill="none" stroke={pal.outline} strokeWidth={3} opacity={progress(fix - 30, 12) * (1 - back)} /> : null}
      {wrong >= 0 ? (
        <g opacity={1 - showRight}>
          <Cross x={at(plus(focus, tangent)).x + 34} y={at(plus(focus, tangent)).y - 30} size={34} draw={drawn(wrong - 120, 14)} />
        </g>
      ) : null}

      <Pop t={wrong} delay={30} x={950} y={330}>
        <g opacity={badFade}><Chip x={950} y={330} text={s.bad} /></g>
      </Pop>
      <Pop t={light} x={SUN.x} y={SUN.y}>
        {Array.from({ length: 8 }, (_, i) => {
          const d = unit(i * 45);
          return <line key={i} x1={SUN.x + d.x * 40} y1={SUN.y - d.y * 40} x2={SUN.x + d.x * 58} y2={SUN.y - d.y * 58}
            stroke={pal.accent} strokeWidth={6} strokeLinecap="round" />;
        })}
        <Circle cx={SUN.x} cy={SUN.y} r={30} fill={pal.accent} strokeWidth={5} />
      </Pop>
      {light >= 0 ? (
        <g opacity={progress(light, 12) * (1 - showRight)}>
          <ArrowPath a={{ x: SUN.x - 40, y: SUN.y + 30 }} b={at(plus(focus, norm(rightN, 0.15)))} stroke={pal.accent} width={4} dashed />
          <Cross x={SUN.x - 70} y={SUN.y + 80} size={30} draw={drawn(light - 10, 14)} />
        </g>
      ) : null}
      <Pop t={fix} delay={40} x={640} y={560}>
        <Chip x={640} y={560} text={s.good} size={28} />
        <Tick x={640 + 290} y={556} size={34} draw={drawn(fix - 56, 14)} />
      </Pop>

      <Pop t={catchCue} delay={6} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={31} pose={pose} reach={reach} lookAt={at(focus)} />
      </Pop>
    </Stage>
  );
}

import { progress } from "../../kit/easing";
import { ArrowPath, lerp, plus, toStage, type GridSpace, type Vec } from "../../kit/grid";
import { drawn, FadeOut, Pop, SlideIn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { apply, IDENTITY, mix, type Mat } from "../../kit/mat";
import { Cross, curvePath, MatGrid, UnitSquare } from "../../kit/matrix";

// The machine M, then the whole plane carried through it. The plane breathes between
// identity and M while the three rules are named, settles on "linear", then breaks the
// rules twice on the same grid: a fisheye bulge bends the lines (no matrix can), and a
// slide moves the origin (no 2x2 matrix can). Each snaps back before the next.
const M: Mat = { a: 1.3, b: 0.6, c: 0.3, d: 1.1 };
const G: GridSpace = { ox: 700, oy: 400, unit: 56 };
const CLIP = { x: 300, y: 160, w: 800, h: 430 };
const MC = { x: 640, y: 280 };
const BADGE = { x: 130, y: 105 };
const HOST = { x: 130, y: 480 };
const BULGE = 0.55;
const R2 = 40; // world units², the bulge fades to nothing at |p| ≈ 6.3
const SLIDE = { x: 1.6, y: 0.9 };
const NOTE = { x: 440, y: 212 };

function gearPath(cx: number, cy: number, r: number, teeth = 8) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.72;
    pts.push(`${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

// Fisheye: points near the origin are pushed out more than far ones, so straight lines bow.
function bulge(p: Vec, k: number): Vec {
  const s = 1 + k * (1 - Math.min(1, (p.x * p.x + p.y * p.y) / R2));
  return { x: p.x * s, y: p.y * s };
}

export function Machine() {
  const pal = usePalette();
  const machine = useCue("machine");
  const feed = useCue("feed");
  const grid = useCue("grid");
  const straight = useCue("straight");
  const parallel = useCue("parallel");
  const origin = useCue("origin");
  const linear = useCue("linear");
  const bend = useCue("bend");
  const bendx = useCue("bendx");
  const slide = useCue("slide");
  const slidex = useCue("slidex");
  const s = {
    M: useString("M"), v: useString("v"), Mv: useString("Mv"), straight: useString("straight"),
    parallel: useString("parallel"), origin: useString("origin"), linear: useString("linear"),
    fisheye: useString("fisheye"), twoByTwo: useString("twoByTwo"),
  };

  const dock = progress(grid, 24);
  const at = lerp(MC, BADGE, dock);
  const size = 1 - 0.55 * dock;
  const spin = 4 * Math.max(0, Math.min(feed, grid + 24));
  const breathe = 0.5 - 0.5 * Math.cos((2 * Math.PI * Math.max(0, grid - 30)) / 170);
  const calm = 1 - progress(linear, 30);
  const m = mix(IDENTITY, M, progress(grid, 30) * (1 - 0.45 * breathe * calm));
  // The two rule breakers, each undone before the next starts.
  const relax = progress(slide + 20, 20);
  const kb = BULGE * progress(bend, 30) * (1 - relax);
  const home = progress(slidex - 70, 24);
  const ks = progress(slide, 30) * (1 - home);
  const map = (p: Vec) => toStage(G, plus(bulge(apply(m, p), kb), SLIDE, ks));

  const lit = (y: number, t: number) =>
    t >= 0 ? (
      <path d={curvePath(map, { x: -3.5, y }, { x: -3.5 + 7 * drawn(t, 20), y })} fill="none" stroke={pal.accent}
        strokeWidth={7} strokeLinecap="round" />
    ) : null;
  const o = toStage(G, { x: 0, y: 0 });
  const moved = map({ x: 0, y: 0 });
  const tagStraight = map({ x: 2.2, y: 2 });
  const tagParallel = map({ x: 2.2, y: -1 });
  const bent = map({ x: -1.6, y: 2 });

  let pose: Pose = "idle";
  let reach = 0;
  if (slide >= 12) {
    pose = "surprised";
    reach = progress(slide - 12, 14) * (1 - progress(slidex - 70, 14));
  } else if (bend >= 12) {
    pose = "think";
    reach = progress(bend - 12, 14) * (1 - progress(slide, 12));
  } else if (linear >= 0) {
    pose = "cheer";
    reach = progress(linear, 14) * (1 - progress(bend, 12));
  }
  const lookAt = slide >= 0 ? moved : bend >= 0 ? bent : linear >= 0 ? { x: G.ox, y: 110 }
    : grid >= 0 ? o : feed >= 30 ? { x: 950, y: 240 } : MC;

  return (
    <Stage>
      <MatGrid space={G} m={m} x={[-9, 9]} y={[-6, 7]} t={grid - 10} clip={CLIP} map={map} />
      <UnitSquare space={G} m={m} t={grid - 20} map={map} />
      {lit(2, straight)}
      {lit(-1, parallel)}
      <Pop t={straight} delay={14} x={tagStraight.x} y={tagStraight.y - 30}>
        <Label x={tagStraight.x} y={tagStraight.y - 22} size={30}>{s.straight}</Label>
      </Pop>
      <Pop t={parallel} delay={14} x={tagParallel.x} y={tagParallel.y + 40}>
        <Label x={tagParallel.x} y={tagParallel.y + 50} size={30}>{s.parallel}</Label>
      </Pop>
      <Pop t={origin} x={o.x} y={o.y}>
        <circle cx={o.x} cy={o.y} r={32} fill="none" stroke={pal.hero} strokeWidth={4} strokeDasharray="6 10"
          strokeDashoffset={-0.6 * Math.max(0, origin)} />
        <Label x={o.x - 84} y={o.y - 22} size={30}>{s.origin}</Label>
      </Pop>
      {ks > 0.02 ? (
        <g opacity={progress(slide - 12, 10) * (1 - home)}>
          <ArrowPath a={o} b={lerp(o, moved, 0.82)} stroke={pal.outline} width={4} dashed />
        </g>
      ) : null}
      <Pop t={origin} x={o.x} y={o.y}>
        <circle cx={moved.x} cy={moved.y} r={12} fill={pal.hero} stroke={pal.outline} strokeWidth={5} />
      </Pop>
      <Pop t={linear} x={G.ox} y={100}>
        <Title x={G.ox} y={124} size={72}>{s.linear}</Title>
      </Pop>

      {bend >= 0 && relax < 1 ? (
        <g opacity={1 - relax}>
          <Pop t={bend} delay={16} x={NOTE.x} y={NOTE.y}>
            <Label x={NOTE.x} y={NOTE.y + 10} size={32}>{s.fisheye}</Label>
          </Pop>
          {bendx >= 0 ? <Cross x={bent.x} y={bent.y - 36} size={44} draw={drawn(bendx, 14)} /> : null}
        </g>
      ) : null}
      {slidex >= 0 && home < 1 ? (
        <g opacity={1 - home}>
          <Pop t={slidex} x={NOTE.x} y={NOTE.y}>
            <Box x={NOTE.x - 50} y={NOTE.y - 30} w={100} h={60} r={20} fill={pal.panel} />
            <Code x={NOTE.x} y={NOTE.y + 10} size={30} anchor="middle">{s.twoByTwo}</Code>
          </Pop>
          <Cross x={NOTE.x + 86} y={NOTE.y} size={40} draw={drawn(slidex - 8, 14)} />
        </g>
      ) : null}

      <FadeOut t={grid}>
        <SlideIn t={feed} from="left" distance={120}>
          <ArrowPath a={{ x: 300, y: 318 }} b={{ x: 480, y: 290 }} stroke={pal.accent} width={7} />
          <Label x={380} y={356} size={34}>{s.v}</Label>
        </SlideIn>
        {feed >= 30 ? (
          <g>
            <ArrowPath a={{ x: 800, y: 290 }} b={lerp({ x: 800, y: 290 }, { x: 1070, y: 170 }, drawn(feed - 30, 22))}
              stroke={pal.hero} width={7} />
            <Pop t={feed - 46} x={970} y={290}>
              <Label x={970} y={290} size={34}>{s.Mv}</Label>
            </Pop>
          </g>
        ) : null}
      </FadeOut>
      <Pop t={machine} x={MC.x} y={MC.y}>
        <g transform={`translate(${at.x} ${at.y}) scale(${size}) translate(${-MC.x} ${-MC.y})`}>
          <path d={gearPath(MC.x + 70, MC.y - 85, 30)} fill={pal.accent} stroke={pal.outline} strokeWidth={5}
            strokeLinejoin="round" transform={`rotate(${spin} ${MC.x + 70} ${MC.y - 85})`} />
          <rect x={MC.x - 134} y={MC.y - 32} width={18} height={64} rx={6} fill={pal.outline} />
          <rect x={MC.x + 116} y={MC.y - 32} width={18} height={64} rx={6} fill={pal.outline} />
          <Box x={MC.x - 120} y={MC.y - 85} w={240} h={170} r={30} fill={pal.panel} strokeWidth={6} />
          <Title x={MC.x} y={MC.y + 30} size={88} halo={pal.panel}>{s.M}</Title>
        </g>
      </Pop>

      <Pop t={machine} delay={6} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.55} seed={11} pose={pose} reach={reach} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

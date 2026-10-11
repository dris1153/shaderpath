import { progress } from "../../kit/easing";
import { toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, useString } from "../../kit/text";
import { useCue } from "../../scene/cue";
import { stride, Walker } from "../../mascot/Walker";
import { apply, IDENTITY, mix, scaling } from "./mat";
import { MatGrid, MatrixCard } from "./parts";

// v = (3, 4) is three î plus four ĵ. The matrix keeps the weights and swaps in its
// columns (2, 0) and (0, 1): M v = 3 * (2, 0) + 4 * (0, 1) = (6, 4), the theory's example.
const G: GridSpace = { ox: 150, oy: 500, unit: 60 };
const CLIP = { x: 70, y: 120, w: 580, h: 470 };
const CARD = { x: 800, y: 175 };
const SUMS = { x: 760, y: 280, w: 420, h: 220 };
const ROWS = [340, 400, 468];
// World points of Inko's walk: parked, origin, three î along x, then four ĵ up to v.
const PARK = { x: 5, y: 0 };
const O = { x: 0, y: 0 };
const X3 = { x: 3, y: 0 };
const V = { x: 3, y: 4 };

export function Multiply() {
  const pal = usePalette();
  const how = useCue("how");
  const mixCue = useCue("mix");
  const v = useCue("v");
  const keep = useCue("keep");
  const c1 = useCue("c1");
  const c2 = useCue("c2");
  const result = useCue("result");
  const recipe = useCue("recipe");
  const why = useCue("why");
  const s = {
    i: useString("iHat"), j: useString("jHat"), mat: useString("matStretch"), v: useString("v"), Mv: useString("Mv"),
    t34: useString("tuple34"), mix34: useString("mix34"), combo1: useString("combo1"), combo2: useString("combo2"),
    result: useString("result64"), recipe: useString("rowRecipe"),
  };

  const m = mix(IDENTITY, scaling(2, 1), progress(keep, 36));
  // Inko waits off to the side while î and ĵ are named, walks to the origin, then up the staircase.
  // On "c1" it hops back and walks the three stretched î steps; on "c2" it climbs the four ĵ steps.
  const toOrigin = stride(v - 45, PARK, O, 30);
  const climbX = stride(v - 75, O, X3, 30);
  const climbY = stride(v - 105, X3, V, 40);
  const back = stride(c1, V, O, 20);
  const walkI = stride(c1 - 24, O, X3, 80);
  const walkJ = stride(c2 - 6, X3, V, 90);
  const leg = c2 >= 0 ? { ...walkJ, lean: 0 } : c1 >= 24 ? walkI : c1 >= 0 ? back
    : v >= 105 ? { ...climbY, lean: 0 } : v >= 75 ? climbX : toOrigin;
  const steps = 3 * climbX.p + 4 * climbY.p;
  const at = toStage(G, apply(m, leg.at));
  const swell = (t: number) => Math.sin(Math.PI * progress(t, 20));
  const pulse = (t: number) => Math.sin(Math.PI * progress(t, 24));
  // The columns light up as they are swapped in ("keep") and again on "why".
  const tint: [number, number] = [
    0.5 + 0.5 * Math.max(pulse(keep - 60), pulse(why)),
    0.5 + 0.5 * Math.max(pulse(keep - 80), pulse(why - 8)),
  ];
  // Each sum row lands on "Take three/four of it", not on the column it names.
  const rows = [
    { t: c1, delay: 100, text: s.combo1, color: pal.hero },
    { t: c2, delay: 105, text: s.combo2, color: pal.sky },
    { t: result, delay: 4, text: s.result, color: pal.accent },
  ];
  const lookAt = result >= 0 ? { x: SUMS.x + 200, y: ROWS[2]! } : keep >= 0 || v < 0 ? toStage(G, apply(m, O)) : undefined;

  return (
    <Stage>
      <MatGrid space={G} m={m} x={[-2, 9]} y={[-2, 7]} t={how} clip={CLIP} />

      {/* The unit pair before the walk. */}
      {v < 0 ? (
        <g>
          <Vector space={G} from={{ x: 0, y: 0 }} to={{ x: 1, y: 0 }} grow={drawn(mixCue, 16)} color={pal.hero} label={s.i} side={-1} />
          <Vector space={G} from={{ x: 0, y: 0 }} to={{ x: 0, y: 1 }} grow={drawn(mixCue, 16, 6)} color={pal.sky} label={s.j} />
        </g>
      ) : null}
      {v >= 0 ? (
        <g opacity={1 - 0.6 * progress(keep, 20)}>
          <Vector space={G} from={{ x: 0, y: 0 }} to={{ x: 3, y: 4 }} grow={drawn(v - 10, 20)} color={pal.accent}
            dashed={keep >= 0} label={s.v} />
        </g>
      ) : null}
      {[0, 1, 2].map((k) => (
        <Vector key={`i${k}`} space={G} from={apply(m, { x: k, y: 0 })} to={apply(m, { x: k + 1, y: 0 })}
          grow={Math.min(1, Math.max(0, steps - k))} color={pal.hero} width={7 + 4 * swell(c1 - k * 5)} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <Vector key={`j${k}`} space={G} from={apply(m, { x: 3, y: k })} to={apply(m, { x: 3, y: k + 1 })}
          grow={Math.min(1, Math.max(0, steps - 3 - k))} color={pal.sky} width={7 + 4 * swell(c2 - k * 5)} />
      ))}
      <Pop t={how} delay={6} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.mat} size={40} tint={tint} />
      </Pop>
      <Pop t={v} x={1075} y={150}>
        <Code x={1075} y={160} size={32} anchor="middle">{s.t34}</Code>
      </Pop>
      <Pop t={v} delay={72} x={1075} y={210}>
        <Code x={1075} y={220} size={32} anchor="middle">{s.mix34}</Code>
      </Pop>

      <Pop t={c1} delay={96} x={SUMS.x + SUMS.w / 2} y={SUMS.y + SUMS.h / 2}>
        <Box x={SUMS.x} y={SUMS.y} w={SUMS.w} h={SUMS.h} r={24} fill={pal.panel} />
      </Pop>
      {rows.map((r, i) => (
        <Pop key={i} t={r.t} delay={r.delay} x={SUMS.x + SUMS.w / 2} y={ROWS[i]! - 10}>
          <rect x={SUMS.x + 22} y={ROWS[i]! - 22} width={10} height={28} rx={5} fill={r.color} />
          <Code x={SUMS.x + SUMS.w - 26} y={ROWS[i]!} size={32} anchor="end">{r.text}</Code>
        </Pop>
      ))}
      {result >= 0 ? (
        <line x1={SUMS.x + 22} y1={ROWS[2]! - 40} x2={SUMS.x + 22 + (SUMS.w - 44) * drawn(result, 12)} y2={ROWS[2]! - 40}
          stroke={pal.outline} strokeWidth={4} strokeLinecap="round" />
      ) : null}

      <Pop t={recipe} x={970} y={548}>
        <Box x={720} y={516} w={500} h={64} r={22} fill={pal.panel} stroke={pal.ok} strokeWidth={6} />
        <Code x={970} y={557} size={25} anchor="middle">{s.recipe}</Code>
      </Pop>

      <Pop t={how} delay={14} x={at.x} y={at.y - 40}>
        <Walker at={at} lean={leg.lean} scale={0.3} seed={4} lookAt={lookAt}
          pose={result >= 0 ? "cheer" : undefined} reach={progress(result - 20, 14)} />
      </Pop>
      {/* Drawn over Inko, who ends on (6, 4): the result's arrowhead stays visible. */}
      <Vector space={G} from={O} to={{ x: 6, y: 4 }} grow={drawn(result, 22)} color={pal.accent} width={8}
        label={s.Mv} side={-1} />
    </Stage>
  );
}

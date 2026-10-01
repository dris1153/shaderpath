import { progress } from "../../kit/easing";
import { Grid, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { useCue } from "../../scene/cue";
import { stride, Walker } from "./parts";

// The theory's example: a = (3, 1), b = (−2, 4), a + b = (1, 5).
const G: GridSpace = { ox: 560, oy: 500, unit: 64 };
const O = { x: 0, y: 0 };
const A = { x: 3, y: 1 };
const B = { x: -2, y: 4 };
const S = { x: 1, y: 5 };
const CARD = { x: 915, y: 190, w: 300, h: 250 };
const ROWS = [262, 330, 412];

export function Add() {
  const pal = usePalette();
  const walk = useCue("walk");
  const aCue = useCue("a");
  const then = useCue("then");
  const sum = useCue("sum");
  const swap = useCue("swap");
  const para = useCue("para");
  const numbers = useCue("numbers");
  const rows = [useCue("first"), useCue("second"), useCue("result")];
  const s = {
    a: useString("a"), b: useString("b"), sum: useString("aPlusB"),
    rows: [useString("tupleA"), useString("tupleB"), useString("tupleSum")],
  };

  const legA = stride(aCue, toStage(G, O), toStage(G, A), 40);
  const legB = stride(then, toStage(G, A), toStage(G, S), 44);
  const inko = then >= 0 ? legB : legA;
  const corners = [O, A, S, B].map((p) => toStage(G, p));
  // The sum arrow swells once as the parallelogram appears.
  const swell = progress(para - 6, 10) * (1 - progress(para - 18, 14));
  const lookAt = numbers >= 0 ? { x: CARD.x + CARD.w / 2, y: CARD.y + 100 } : sum >= 0 ? toStage(G, O) : undefined;
  const names = [s.a, s.b, s.sum];
  const colors = [pal.sky, pal.accent, pal.hero];

  return (
    <Stage>
      <Grid space={G} x={[-3, 5]} y={[-1, 6]} t={walk} axes={walk - 10} />
      {para >= 0 ? (
        <path d={`M ${corners.map((c) => `${c.x} ${c.y}`).join(" L ")} Z`} fill={pal.accent}
          opacity={0.2 * progress(para, 16)} />
      ) : null}
      <Vector space={G} from={O} to={B} grow={drawn(swap, 24)} color={pal.accent} dashed opacity={0.8} />
      <Vector space={G} from={B} to={S} grow={drawn(swap, 24, 30)} color={pal.sky} dashed opacity={0.8} />
      <Vector space={G} from={O} to={A} grow={legA.p} color={pal.sky} label={s.a} />
      <Vector space={G} from={A} to={S} grow={legB.p} color={pal.accent} label={s.b} side={-1} />
      <Vector space={G} from={O} to={S} grow={drawn(sum, 20)} width={7 + swell * 4} label={s.sum} side={-1} />

      <Pop t={walk} delay={8} x={G.ox} y={G.oy - 50}>
        <Walker at={inko.at} lean={inko.lean} scale={0.36} seed={2} lookAt={lookAt ?? (then >= 0 ? toStage(G, S) : toStage(G, A))} />
      </Pop>

      <Pop t={numbers} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
        <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={24} fill={pal.panel} />
        {rows.map((t, i) => (
          <Pop key={i} t={t} x={CARD.x + CARD.w / 2} y={ROWS[i]! - 10}>
            <rect x={CARD.x + 22} y={ROWS[i]! - 18} width={10} height={24} rx={5} fill={colors[i]} />
            <Label x={CARD.x + 44} y={ROWS[i]!} size={28} anchor="start" halo={pal.panel}>{names[i]}</Label>
            <Code x={CARD.x + CARD.w - 22} y={ROWS[i]!} size={30} anchor="end">{s.rows[i]}</Code>
          </Pop>
        ))}
        {rows[2]! >= 0 ? (
          <line x1={CARD.x + 22} y1={ROWS[2]! - 44} x2={CARD.x + 22 + (CARD.w - 44) * drawn(rows[2]!, 12)}
            y2={ROWS[2]! - 44} stroke={pal.outline} strokeWidth={4} strokeLinecap="round" />
        ) : null}
      </Pop>
    </Stage>
  );
}

import { progress } from "../../kit/easing";
import { Grid, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// The worked example: (3, 1) · (2, 2) = 3·2 + 1·2 = 8. The matching parts light
// up on the grid as their products land in the column.
const G: GridSpace = { ox: 150, oy: 540, unit: 100 };
const O = { x: 0, y: 0 };
const A = { x: 3, y: 1 };
const B = { x: 2, y: 2 };
const COL = 760;
const ROWS = [320, 390];
const SUM_Y = 480;
const HOST = { x: 1130, y: 400 };
// JetBrains Mono advances 0.6 em per character; the formula line is placed from its length.
const MONO = 0.6;
const ALG = { x: 560, size: 26 };

export function MultiplyAdd() {
  const pal = usePalette();
  const number = useCue("number");
  const pairs = useCue("pairs");
  const example = useCue("example");
  const xs = useCue("xs");
  const ys = useCue("ys");
  const sum = useCue("sum");
  const threeD = useCue("threeD");
  const code = useCue("code");
  const order = useCue("order");
  const s = {
    a: useString("a"), b: useString("b"), ta: useString("tupleA"), tb: useString("tupleB"),
    dot: useString("dotSymbol"), algebra: useString("dotAlgebra"), z: useString("dot3d"),
    rows: [useString("mulX"), useString("mulY")], sum: useString("sumResult"),
    code: useString("dotCode"), commutes: useString("dotCommutes"),
  };

  const [codeHead = "", codeBody = ""] = s.code.split(" = ");
  const at = (p: { x: number; y: number }) => toStage(G, p);
  // A leg is a thick tinted segment under the arrow: the part being multiplied.
  const leg = (from: { x: number; y: number }, to: { x: number; y: number }, color: string, t: number, key: string) => {
    if (t < 0) return null;
    const p = at(from);
    const q = at(to);
    const k = drawn(t, 14);
    return (
      <line key={key} x1={p.x} y1={p.y} x2={p.x + (q.x - p.x) * k} y2={p.y + (q.y - p.y) * k} stroke={color}
        strokeWidth={14} strokeLinecap="round" opacity={0.55} />
    );
  };
  const active = ys >= 0 ? 1 : 0;
  const lookAt = code >= 0 ? { x: 920, y: 560 } : sum >= 0 ? { x: COL, y: SUM_Y } : pairs >= 0 ? { x: 820, y: 210 } : at(A);

  return (
    <Stage>
      <Grid space={G} x={[0, 4]} y={[0, 3]} t={number} axes={number - 6} />
      {leg(O, { x: A.x, y: 0 }, pal.sky, xs, "ax")}
      {leg({ x: 0, y: -0.12 }, { x: B.x, y: -0.12 }, pal.accent, xs - 4, "bx")}
      {leg({ x: A.x, y: 0 }, A, pal.sky, ys, "ay")}
      {leg({ x: B.x, y: 0 }, B, pal.accent, ys - 4, "by")}
      <Vector space={G} from={O} to={A} grow={drawn(number, 18, 12)} color={pal.sky} label={s.a} />
      <Vector space={G} from={O} to={B} grow={drawn(number, 18, 20)} color={pal.accent} label={s.b} />
      <Pop t={example} x={at(A).x + 50} y={at(A).y}>
        <Label x={at(A).x + 64} y={at(A).y + 10} size={28} anchor="start">{s.ta}</Label>
      </Pop>
      <Pop t={example} delay={8} x={at(B).x} y={at(B).y - 40}>
        <Label x={at(B).x} y={at(B).y - 30} size={28}>{s.tb}</Label>
      </Pop>

      <Pop t={number} delay={30} x={900} y={130}>
        <Title x={900} y={150} size={64}>{s.dot}</Title>
      </Pop>
      <Pop t={pairs} x={810} y={210}>
        <Code x={ALG.x} y={220} size={ALG.size}>{s.algebra}</Code>
      </Pop>
      {/* The 3D term continues the same line, so it starts where the 2D formula ends. */}
      <Pop t={threeD} x={1100} y={210}>
        <Code x={ALG.x + vecPlain(s.algebra).length * ALG.size * MONO + 14} y={220} size={ALG.size} color={pal.textMuted}>{s.z}</Code>
      </Pop>

      {[xs, ys].map((t, i) => (
        <Pop key={i} t={t} x={COL} y={ROWS[i]! - 10}>
          <rect x={COL - 120} y={ROWS[i]! - 20} width={10} height={26} rx={5} fill={i === active ? pal.hero : pal.textMuted} />
          <Code x={COL - 96} y={ROWS[i]!} size={32}>{s.rows[i]}</Code>
        </Pop>
      ))}
      {sum >= 0 ? (
        <line x1={COL - 120} y1={SUM_Y - 56} x2={COL - 120 + 260 * drawn(sum, 12)} y2={SUM_Y - 56} stroke={pal.outline}
          strokeWidth={4} strokeLinecap="round" />
      ) : null}
      <Pop t={sum} delay={6} x={COL} y={SUM_Y - 16}>
        <Title x={COL + 10} y={SUM_Y} size={56} color={pal.hero}>{s.sum}</Title>
      </Pop>

      <Pop t={code} x={920} y={560}>
        <Box x={620} y={514} w={600} h={92} r={18} fill={pal.panel} />
        <Code x={920} y={552} size={26} anchor="middle">{`${codeHead} =`}</Code>
        <Code x={920} y={588} size={26} anchor="middle">{codeBody}</Code>
      </Pop>
      <Pop t={order} x={320} y={170}>
        <Box x={190} y={138} w={260} h={64} r={20} fill={pal.panel} stroke={pal.ok} strokeWidth={5} />
        <Label x={320} y={181} size={32} halo={pal.panel}>{s.commutes}</Label>
      </Pop>

      <Pop t={number} delay={4} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={4} lookAt={lookAt} pose={order >= 0 ? "cheer" : "idle"}
          reach={progress(order, 14)} />
      </Pop>
    </Stage>
  );
}

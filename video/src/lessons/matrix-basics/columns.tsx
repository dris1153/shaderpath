import { progress } from "../../kit/easing";
import { toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { apply, IDENTITY, mix, scaling, type Mat } from "./mat";
import { Cross, MatGrid, matrixLayout, MatrixCard, Tick, UnitSquare } from "./parts";

// î and ĵ decide the whole grid; the card stores where they land, one per column.
// The theory's example: columns (2, 0) and (0, 1), a horizontal stretch.
const G: GridSpace = { ox: 330, oy: 420, unit: 90 };
const CLIP = { x: 70, y: 130, w: 560, h: 460 };
const LAND: Mat = { a: 1.4, b: -0.5, c: 0.5, d: 1.1 };
const CARD = { x: 860, y: 270, size: 56 };
const HOST = { x: 1165, y: 505 };

export function Columns() {
  const pal = usePalette();
  const even = useCue("even");
  const i = useCue("i");
  const j = useCue("j");
  const land = useCue("land");
  const columns = useCue("columns");
  const col1 = useCue("col1");
  const col2 = useCue("col2");
  const example = useCue("example");
  const double = useCue("double");
  const second = useCue("second");
  const stay = useCue("stay");
  const read = useCue("read");
  const rows = useCue("rows");
  const s = {
    i: useString("iHat"), j: useString("jHat"), t10: useString("tuple10"), t01: useString("tuple01"),
    abcd: useString("matABCD"), stretchMat: useString("matStretch"), t20: useString("tuple20"),
    stretch: useString("stretch"), columns: useString("columns"), rows: useString("rows"),
  };

  let m = mix(IDENTITY, LAND, progress(land, 40));
  m = mix(m, IDENTITY, progress(columns, 30));
  m = mix(m, scaling(2, 1), progress(double, 30));
  const iTip = apply(m, { x: 1, y: 0 });
  const jTip = apply(m, { x: 0, y: 1 });
  const jPx = toStage(G, jTip);
  const i2 = toStage(G, { x: 2, y: 0 });

  const card = matrixLayout(s.abcd, CARD.size);
  const colX = card.centres.map((c) => CARD.x + c);
  const cardTop = CARD.y - card.h / 2;
  const chipY = CARD.y + card.h / 2 + 52;
  const isExample = example >= 4;
  const pulse = (t: number) => Math.sin(Math.PI * progress(t, 24));
  const tint: [number, number] = isExample
    ? [0.6 + 0.4 * pulse(example), progress(second, 12) * (0.6 + 0.4 * pulse(second))]
    : [progress(col1, 12), progress(col2, 12)];

  const lookAt = rows >= 0 || (columns >= 0 && double < 0) ? { x: CARD.x, y: CARD.y }
    : j >= 0 ? jPx : toStage(G, iTip);

  return (
    <Stage>
      <MatGrid space={G} m={m} x={[-6, 6]} y={[-5, 5]} t={even} clip={CLIP} />
      <UnitSquare space={G} m={m} t={land} opacity={0.25 * (1 - progress(columns, 20)) + 0.25 * progress(double, 20)} />
      <Vector space={G} from={{ x: 0, y: 0 }} to={jTip} grow={drawn(j, 18)} color={pal.sky} label={s.j} />
      <Vector space={G} from={{ x: 0, y: 0 }} to={iTip} grow={drawn(i, 18)} color={pal.hero} label={s.i} side={-1} />
      <FadeOut t={land}>
        <Pop t={i} delay={16} x={G.ox + G.unit + 60} y={G.oy - 28}>
          <Label x={G.ox + G.unit + 16} y={G.oy - 18} size={30} anchor="start">{s.t10}</Label>
        </Pop>
        <Pop t={j} delay={16} x={G.ox - 70} y={G.oy - G.unit}>
          <Label x={G.ox - 74} y={G.oy - G.unit + 10} size={30}>{s.t01}</Label>
        </Pop>
      </FadeOut>
      <Pop t={double} delay={22} x={i2.x} y={i2.y + 50}>
        <Label x={i2.x} y={i2.y + 56} size={30}>{s.t20}</Label>
      </Pop>
      <Pop t={stay} x={jPx.x} y={jPx.y}>
        <circle cx={jPx.x} cy={jPx.y} r={30} fill="none" stroke={pal.accent} strokeWidth={5} strokeDasharray="6 9"
          strokeDashoffset={-0.5 * Math.max(0, stay)} />
      </Pop>

      <FadeOut t={example}>
        <Pop t={columns} x={CARD.x} y={CARD.y}>
          <MatrixCard x={CARD.x} y={CARD.y} text={s.abcd} size={CARD.size} tint={tint} />
        </Pop>
      </FadeOut>
      <Pop t={example} delay={4} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.stretchMat} size={CARD.size} tint={tint} show={[1, progress(second, 12)]} />
      </Pop>
      <Pop t={col1} x={colX[0]!} y={cardTop - 44}>
        <Title x={colX[0]!} y={cardTop - 30} size={50} color={pal.hero}>{s.i}</Title>
      </Pop>
      <Pop t={col2} x={colX[1]!} y={cardTop - 44}>
        <Title x={colX[1]!} y={cardTop - 30} size={50} color={pal.sky}>{s.j}</Title>
      </Pop>

      <Pop t={read} x={CARD.x} y={chipY}>
        <Box x={CARD.x - 90} y={chipY - 32} w={180} h={64} r={22} fill={pal.panel} />
        <Code x={CARD.x} y={chipY + 10} size={32} anchor="middle">{s.stretch}</Code>
      </Pop>
      {rows >= 0 ? (
        <g>
          <rect x={colX[0]! - card.colW[0]! / 2} y={cardTop - 4} width={card.colW[0]!} height={card.h + 8} rx={16}
            fill="none" stroke={pal.ok} strokeWidth={5} opacity={progress(rows, 12)} />
          <rect x={CARD.x - card.w / 2 - 10} y={CARD.y - CARD.size * 1.25} width={card.w + 20} height={CARD.size * 0.95}
            rx={14} fill="none" stroke={pal.warn} strokeWidth={5} strokeDasharray="10 9" opacity={progress(rows - 36, 12)} />
        </g>
      ) : null}
      <Pop t={rows} delay={6} x={760} y={520}>
        <Label x={740} y={530} size={32}>{s.columns}</Label>
        <Tick x={840} y={518} size={36} draw={drawn(rows - 14, 14)} />
      </Pop>
      <Pop t={rows} delay={40} x={930} y={520}>
        <Label x={920} y={530} size={32}>{s.rows}</Label>
        <Cross x={985} y={520} size={32} draw={drawn(rows - 52, 14)} />
      </Pop>

      <Pop t={even} delay={10} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={17} pose={read >= 0 && rows < 14 ? "cheer" : "idle"}
          reach={progress(read, 14) * (1 - progress(rows, 14))} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

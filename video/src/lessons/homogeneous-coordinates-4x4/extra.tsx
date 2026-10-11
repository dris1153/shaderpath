import { progress } from "../../kit/easing";
import { ArrowPath, toStage, Vector, type GridSpace } from "../../kit/grid";
import { IDENTITY } from "../../kit/mat";
import { MatGrid, matrixLayout, MatrixCard, MONO } from "../../kit/matrix";
import { drawn, FadeOut, Pop, SlideIn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { Slime } from "../../mascot/Slime";
import { stride } from "../../mascot/Walker";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// The 4x4 card: rotate/scale block (sky), the move column t (accent), the bottom row 0 0 0 1.
// Its columns mix with the point's numbers as weights; w = 1 adds t. The theory's example:
// t = (5, −2, 0) moves (1, 1, 1, 1) to (6, −1, 1, 1), and the slime finally slides.
const CARD = { x: 860, y: 300, size: 44 };
const G: GridSpace = { ox: 260, oy: 420, unit: 36 };
const CLIP = { x: 150, y: 290, w: 420, h: 280 };
const TUPLE = { x: 340, y: 170, size: 56 };
const HOST = { x: 95, y: 500 };
const FROM = { x: 1, y: 1 };
const TO = { x: 6, y: -1 };

export function Extra() {
  const pal = usePalette();
  const add = useCue("add");
  const tuple = useCue("tuple");
  const name = useCue("name");
  const grow = useCue("grow");
  const block = useCue("block");
  const column = useCue("column");
  const row = useCue("row");
  const mix = useCue("mix");
  const weight = useCue("weight");
  const example = useCue("example");
  const point = useCue("point");
  const lands = useCue("lands");
  const chain = useCue("chain");
  const s = {
    t3: useString("tuple3"), t4: useString("tuple4"), name: useString("homogeneous"), layout: useString("matLayout"),
    T: useString("matT"), t: useString("t"), tEx: useString("tExample"), pIn: useString("pointIn"), pOut: useString("pointOut"),
    x: useString("x"), y: useString("y"), z: useString("z"), w: useString("w"), one: useString("one"), plusT: useString("plusT"),
    move: useString("stepMove"), rotate: useString("stepRotate"), scale: useString("stepScale"),
  };

  const L = matrixLayout(s.layout, CARD.size);
  const top = CARD.y - L.h / 2;
  const colX = L.centres.map((c) => CARD.x + c);
  const colLeft = (c: number) => colX[c]! - L.colW[c]! / 2 + 4;
  const rowTop = (r: number) => CARD.y + L.rowY[r]! - CARD.size * 0.85;
  const rowH = CARD.size * 1.15;
  const pulse = (t: number) => Math.sin(Math.PI * progress(t, 24));
  // The 1 of (x, y, z, 1): mono advance, so its x is the start plus 10.5 characters.
  const t4Left = TUPLE.x - (s.t4.length * MONO * TUPLE.size) / 2;
  const oneX = t4Left + 10.5 * MONO * TUPLE.size;
  const symbols = [s.x, s.y, s.z, s.w];
  const toOnes = progress(point - 16, 10);
  // "…weighted by w": the w label and the move column light up until the example.
  const hot = progress(weight - 28, 10) * (1 - progress(example, 10));
  const wHot = hot * (0.7 + 0.3 * pulse(weight - 28));
  // "zero, zero, zero, one" and "mix the columns": each entry or column flashes on its word.
  const rowWords = [28, 57, 85, 117];
  const colFlash = (c: number) => 0.45 * pulse(mix - 68 - c * 6);
  const slide = stride(lands - 10, toStage(G, FROM), toStage(G, TO), 40);
  const slime = lands >= 0 ? slide.at : toStage(G, FROM);
  const chips = [{ t: chain - 7, text: s.move }, { t: chain - 24, text: s.rotate }, { t: chain - 42, text: s.scale }];

  return (
    <Stage>
      {/* Phase A: the tuple gets its fourth number. */}
      <FadeOut t={example}>
        <Pop t={add} x={TUPLE.x} y={TUPLE.y}>
          <Code x={TUPLE.x} y={TUPLE.y + 20} size={TUPLE.size} anchor="middle" color={pal.textMuted}>{s.t3}</Code>
        </Pop>
        <Pop t={tuple} delay={40} x={TUPLE.x} y={TUPLE.y + 110}>
          {tuple >= 97 ? (
            <rect x={oneX - 24} y={TUPLE.y + 76} width={48} height={64} rx={14} fill={pal.accent}
              opacity={0.5 * progress(tuple - 97, 10)} />
          ) : null}
          <Code x={TUPLE.x} y={TUPLE.y + 128} size={TUPLE.size} anchor="middle">{s.t4}</Code>
        </Pop>
        <Pop t={name} x={TUPLE.x} y={TUPLE.y + 200}>
          <Label x={TUPLE.x} y={TUPLE.y + 212} size={40}>{s.name}</Label>
        </Pop>
      </FadeOut>

      {/* The card, its regions, and the weights under its columns. The regions are laid out from
          matLayout but stay under the T card too: its last column is also two characters wide. */}
      {block >= 0 ? (
        <rect x={colLeft(0)} y={rowTop(0)} width={colX[2]! + L.colW[2]! / 2 - 4 - colLeft(0)} height={rowTop(2) + rowH - rowTop(0)}
          rx={12} fill={pal.sky} opacity={0.25 * progress(block, 12)} />
      ) : null}
      {column >= 0 ? (
        <rect x={colLeft(3)} y={rowTop(0)} width={L.colW[3]! - 8} height={rowTop(2) + rowH - rowTop(0)} rx={12}
          fill={pal.accent} opacity={(0.35 + 0.25 * wHot) * progress(column, 12)} />
      ) : null}
      {row >= 0 ? (
        <rect x={colLeft(0)} y={rowTop(3)} width={colX[3]! + L.colW[3]! / 2 - 4 - colLeft(0)} height={rowH} rx={12}
          fill={pal.textMuted} opacity={0.18 * progress(row, 12)} />
      ) : null}
      {row >= 0 && example < 0
        ? rowWords.map((d, c) => (
          <rect key={`r${c}`} x={colLeft(c)} y={rowTop(3)} width={L.colW[c]! - 8} height={rowH} rx={12}
            fill={pal.accent} opacity={0.65 * pulse(row - d)} />
        ))
        : null}
      {mix >= 0 && example < 0
        ? colX.map((_, c) => (
          <rect key={`c${c}`} x={colLeft(c)} y={rowTop(0)} width={L.colW[c]! - 8} height={rowTop(3) + rowH - rowTop(0)} rx={12}
            fill={pal.accent} opacity={colFlash(c)} />
        ))
        : null}
      <FadeOut t={example}>
        <Pop t={grow} x={CARD.x} y={CARD.y}>
          <MatrixCard x={CARD.x} y={CARD.y} text={s.layout} size={CARD.size} panel={false} />
        </Pop>
      </FadeOut>
      <Pop t={example} delay={4} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.T} size={CARD.size} panel={false} />
      </Pop>
      <FadeOut t={example}>
        <Pop t={column} delay={20} x={colX[3]!} y={top - 34}>
          <Label x={colX[3]!} y={top - 24} size={38}>{s.t}</Label>
        </Pop>
      </FadeOut>
      {symbols.map((sym, c) => (
        <Pop key={c} t={mix} delay={68 + c * 5} x={colX[c]!} y={top + L.h + 46}>
          <g opacity={(1 - toOnes) * (c === 3 ? 1 - hot : 1)}>
            <Code x={colX[c]!} y={top + L.h + 58} size={34} anchor="middle">{sym}</Code>
          </g>
          {c === 3 ? (
            <g opacity={(1 - toOnes) * hot}>
              <Code x={colX[c]!} y={top + L.h + 58} size={34} anchor="middle" color={pal.hero}>{sym}</Code>
            </g>
          ) : null}
          <g opacity={toOnes}>
            <Code x={colX[c]!} y={top + L.h + 58} size={34} anchor="middle">{s.one}</Code>
          </g>
        </Pop>
      ))}
      <FadeOut t={example}>
        <Pop t={weight} delay={124} x={CARD.x + L.w / 2 + 90} y={CARD.y}>
          <Chip x={CARD.x + L.w / 2 + 90} y={CARD.y} text={s.plusT} />
        </Pop>
      </FadeOut>
      <Pop t={example} delay={30} x={CARD.x} y={top - 90}>
        <Chip x={CARD.x} y={top - 90} text={s.tEx} />
      </Pop>

      {/* The payoff: the slime moves at last. */}
      <MatGrid space={G} m={IDENTITY} x={[-4, 12]} y={[-6, 6]} t={point - 10} clip={CLIP} />
      {lands >= 0 ? (
        <Vector space={G} from={FROM} to={TO} grow={drawn(lands - 10, 40)} color={pal.accent} width={5} dashed />
      ) : null}
      <Pop t={point} x={slime.x} y={slime.y - 30}>
        <g transform={`rotate(${slide.lean} ${slime.x} ${slime.y})`}><Slime at={slime} scale={0.5} /></g>
      </Pop>
      <Pop t={point} delay={16} x={260} y={230}>
        <Chip x={260} y={230} text={s.pIn} />
      </Pop>
      <Pop t={lands} delay={20} x={540} y={230}>
        <ArrowPath a={{ x: 398, y: 230 }} b={{ x: 432, y: 230 }} stroke={pal.textMuted} width={4} />
        <Code x={440} y={240} size={30}>{s.pOut}</Code>
      </Pop>

      {chips.map((c, i) => (
        <SlideIn key={i} t={c.t} from="right" distance={140}>
          <Chip x={CARD.x + 270} y={CARD.y - 100 + i * 80} text={c.text} />
        </SlideIn>
      ))}

      <Pop t={add} delay={10} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.45} seed={19} pose={chain >= 0 ? "cheer" : "idle"} reach={progress(chain, 14)}
          lookAt={lands >= 0 ? slime : grow >= 0 ? { x: CARD.x, y: CARD.y } : { x: TUPLE.x, y: TUPLE.y + 110 }} />
      </Pop>
    </Stage>
  );
}

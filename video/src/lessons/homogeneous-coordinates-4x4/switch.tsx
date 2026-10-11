import { progress } from "../../kit/easing";
import { ArrowPath, plus, toStage, Vector, type GridSpace, type Vec } from "../../kit/grid";
import { IDENTITY } from "../../kit/mat";
import { Cross, MatGrid, matrixLayout, MatrixCard, Tick } from "../../kit/matrix";
import { drawn, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { Slime } from "../../mascot/Slime";
import { stride } from "../../mascot/Walker";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// w is the switch on the move column: the slime (a point, w = 1) slides by t; its velocity
// (a direction, w = 0) rides along unturned. With w = 1 by mistake, the velocity picks up the
// slime's own offset and points further off the farther the slime goes.
const G: GridSpace = { ox: 420, oy: 380, unit: 46 };
const CLIP = { x: 190, y: 150, w: 580, h: 440 };
const CARD = { x: 1000, y: 190, size: 30 };
const HOST = { x: 105, y: 500 };
const P0 = { x: -4, y: 1 };
const P1 = { x: 1, y: -1 }; // P0 + t, t = (5, −2)
const P2 = { x: 4, y: 1 };
// Off the P2 ray from the origin, so the wrong arrow turns from 21° to 59° off V on "drift".
const P3 = { x: 5, y: -3 };
const V = { x: 1.4, y: 1.4 };

export function Switch() {
  const pal = usePalette();
  const switchCue = useCue("switch");
  const point = useCue("point");
  const direction = useCue("direction");
  const same = useCue("same");
  const unchanged = useCue("unchanged");
  const game = useCue("game");
  const arrows = useCue("arrows");
  const bug = useCue("bug");
  const drift = useCue("drift");
  const s = {
    T: useString("matT"), w1: useString("wOne"), w0: useString("wZero"), point: useString("point"), direction: useString("direction"),
    dirIn: useString("dirIn"), dirOut: useString("dirOut"), velocity: useString("velocity"), one: useString("one"), zero: useString("zero"),
  };

  // Where the slime is: moved by t on "gets moved", across the map on "game", farther on "drift".
  const legs = [stride(point - 80, P0, P1, 40), stride(game - 16, P1, P2, 50), stride(drift - 10, P2, P3, 50)];
  const at: Vec = drift >= 10 ? legs[2]!.at : game >= 16 ? legs[1]!.at : legs[0]!.at;
  const px = toStage(G, at);
  // The wrong velocity (w = 1): V plus the slime's offset, kept at V's length so it stays on screen.
  const wrongRaw = plus(V, at);
  const len = Math.hypot(V.x, V.y) / Math.hypot(wrongRaw.x, wrongRaw.y);
  const wrong = { x: wrongRaw.x * len, y: wrongRaw.y * len };
  // The ✗ sits off the wrong arrow's tip on the side away from V, wherever the arrow turns.
  const u = { x: wrong.x / Math.hypot(V.x, V.y), y: wrong.y / Math.hypot(V.x, V.y) };
  const tip = plus(at, wrong);
  const crossAt = toStage(G, { x: tip.x + u.y * 0.7 + u.x * 0.3, y: tip.y - u.x * 0.7 + u.y * 0.3 });

  const L = matrixLayout(s.T, CARD.size);
  const colX = L.centres.map((c) => CARD.x + c);
  // The move column: its weight 0 lands on "multiplied by zero", the column fades on "vanishes".
  const fade = 1 - 0.75 * progress(direction - 150, 20);
  const weights = [s.one, s.one, s.one, s.zero];

  let pose: Pose = "idle";
  let reach = 0;
  if (bug >= 12) { pose = "surprised"; reach = progress(bug - 12, 14); }
  else if (unchanged >= 0) { pose = "cheer"; reach = progress(unchanged, 14) * (1 - progress(bug, 12)); }

  return (
    <Stage>
      <MatGrid space={G} m={IDENTITY} x={[-8, 12]} y={[-6, 6]} t={switchCue} clip={CLIP} />
      <Vector space={G} from={at} to={plus(at, V)} grow={drawn(direction, 16)} color={pal.sky} width={6} />
      {arrows >= 0 ? (
        <Vector space={G} from={at} to={plus(at, V)} color={pal.sky} width={6} opacity={progress(arrows, 12)} label={s.velocity} />
      ) : null}
      {bug >= 0 ? (
        <g opacity={progress(bug, 12)}>
          <Vector space={G} from={at} to={tip} color={pal.hero} width={5} dashed />
          <Cross x={crossAt.x} y={crossAt.y} size={30} draw={drawn(bug - 40, 14)} />
        </g>
      ) : null}
      <Pop t={switchCue} delay={8} x={px.x} y={px.y - 30}>
        <g transform={`rotate(${(drift >= 10 ? legs[2]! : game >= 16 ? legs[1]! : legs[0]!).lean} ${px.x} ${px.y})`}>
          <Slime at={px} scale={0.55} />
        </g>
      </Pop>

      <Pop t={switchCue} delay={10} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.T} size={CARD.size} colors={[pal.sky, pal.sky, pal.sky, pal.accent]}
          tint={[0, 0, 0, fade]} show={[1, 1, 1, fade]} />
      </Pop>
      {weights.map((wt, c) => (
        // The 0 lands as the move is "multiplied by zero"; the 1s wait until (1, 1, 1, 0) is named.
        <Pop key={c} t={c === 3 ? direction : same} delay={c === 3 ? 90 : 50 + c * 4} x={colX[c]!} y={CARD.y + L.h / 2 + 34}>
          <Code x={colX[c]!} y={CARD.y + L.h / 2 + 44} size={30} anchor="middle" color={c === 3 ? pal.hero : undefined}>{wt}</Code>
        </Pop>
      ))}
      <Pop t={point} x={930} y={385}>
        <Chip x={930} y={385} text={s.w1} />
        <Label x={1010} y={395} size={32} anchor="start">{s.point}</Label>
      </Pop>
      <Pop t={direction} x={930} y={455}>
        <Chip x={930} y={455} text={s.w0} />
        <Label x={1010} y={465} size={32} anchor="start" color={pal.sky}>{s.direction}</Label>
      </Pop>
      <Pop t={same} delay={50} x={895} y={540}>
        <Chip x={895} y={540} text={s.dirIn} size={24} />
      </Pop>
      <Pop t={unchanged} x={1110} y={540}>
        <ArrowPath a={{ x: 1008, y: 540 }} b={{ x: 1034, y: 540 }} stroke={pal.textMuted} width={3} />
        <Code x={1040} y={548} size={24}>{s.dirOut}</Code>
        <Tick x={1126} y={500} size={34} draw={drawn(unchanged - 10, 14)} />
      </Pop>

      <Pop t={switchCue} delay={14} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.45} seed={27} pose={pose} reach={reach} lookAt={px} />
      </Pop>
    </Stage>
  );
}

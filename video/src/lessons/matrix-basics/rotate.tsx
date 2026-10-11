import { AngleArc } from "../../kit/angle";
import { progress } from "../../kit/easing";
import { toStage, Vector, type GridSpace, type Vec } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Circle, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { apply, mix, rotation, type Mat } from "./mat";
import { Cross, MatGrid, MatrixCard, MONO } from "./parts";
import { vecPlain } from "../../kit/vec-marker";

// Build R(θ) from where î and ĵ land on the unit circle (θ = 30° for the general case),
// check it at 90°, then drop the minus sign: the axes swap and the F comes out mirrored.
const G: GridSpace = { ox: 330, oy: 380, unit: 150 };
const CLIP = { x: 70, y: 130, w: 540, h: 460 };
const THETA = 30;
const SWAP: Mat = { a: 0, b: 1, c: 1, d: 0 };
const CARD = { x: 930, y: 215, size: 36 };
const HOST = { x: 1160, y: 500 };
const O = { x: 0, y: 0 };
// An F in the third quadrant, clear of î, ĵ and their labels: asymmetric, so a
// mirror image is plain to see.
const F: Vec[] = [
  { x: 0.3, y: 0.1 }, { x: 0.45, y: 0.1 }, { x: 0.45, y: 0.45 }, { x: 0.7, y: 0.45 }, { x: 0.7, y: 0.6 },
  { x: 0.45, y: 0.6 }, { x: 0.45, y: 0.75 }, { x: 0.8, y: 0.75 }, { x: 0.8, y: 0.9 }, { x: 0.3, y: 0.9 },
].map((p) => ({ x: -1.3 + (p.x - 0.3) * 0.8, y: -0.95 + (p.y - 0.1) * 0.85 }));
const F_MID = { x: -1.1, y: -0.6 };

const unitAt = (deg: number): Vec => ({ x: Math.cos((deg * Math.PI) / 180), y: Math.sin((deg * Math.PI) / 180) });

export function Rotate() {
  const pal = usePalette();
  const build = useCue("build");
  const turn = useCue("turn");
  const i = useCue("i");
  const iturn = useCue("iturn");
  const col1 = useCue("col1");
  const j = useCue("j");
  const jends = useCue("jends");
  const jlands = useCue("jlands");
  const col2 = useCue("col2");
  const check = useCue("check");
  const iup = useCue("iup");
  const jleft = useCue("jleft");
  const trap = useCue("trap");
  const mirror = useCue("mirror");
  const s = {
    i: useString("iHat"), j: useString("jHat"), theta: useString("theta"), cosSin: useString("cosSin"),
    negSinCos: useString("negSinCos"), deg90: useString("deg90"), mat: useString("matRotate"),
    mat90: useString("matRotate90"), matSwap: useString("matSwap"), t01: useString("tuple01"),
    tNeg10: useString("tupleNeg10"), wrong: useString("wrongColumn"), jEnds: useString("deg90PlusTheta"),
  };

  // The swap starts on "and the two axes", after the dropped sign is shown.
  const swap = progress(trap - 35, 40);
  // The plane: a preview turn by θ, back to rest, then the 90° check (turned by angle, so
  // lengths never change), then the swap.
  const deg = THETA * progress(turn, 40) * (1 - progress(i, 24)) + 90 * progress(check, 40);
  const plane = mix(rotation(deg), SWAP, swap);
  // The arrows ride the unit circle: î to θ, ĵ to 90° + θ, both on to the 90° check.
  // From the swap on they follow the plane, so ĵ shrinks through zero to (1, 0).
  const iDeg = THETA * progress(iturn, 36) * (1 - progress(check, 40)) + 90 * progress(check, 40);
  const jDeg = 90 + THETA * progress(jends, 36) * (1 - progress(check, 40)) + 90 * progress(check, 40);
  const iEnd = trap >= 0 ? apply(plane, { x: 1, y: 0 }) : unitAt(iDeg);
  const jEnd = trap >= 0 ? apply(plane, { x: 0, y: 1 }) : unitAt(jDeg);
  const o = toStage(G, O);
  const iTip = toStage(G, iEnd);
  const jTip = toStage(G, jEnd);
  const wrongW = 40 + vecPlain(s.wrong).length * MONO * 30;
  const f = F.map((p) => toStage(G, apply(plane, p)));
  const fPath = `M ${f.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
  const fMid = toStage(G, apply(plane, F_MID));
  const guides = progress(iturn - 30, 14) * (1 - progress(check, 12));

  const pose = mirror >= 0 ? "surprised" : "idle";
  const lookAt = trap >= 0 ? fMid : col1 >= 0 && j < 0 ? { x: CARD.x, y: CARD.y } : j >= 0 ? jTip : iTip;

  return (
    <Stage>
      <MatGrid space={G} m={plane} x={[-3, 3]} y={[-3, 3]} step={0.5} t={build} clip={CLIP} />
      <Pop t={build} delay={20} x={fMid.x} y={fMid.y}>
        <Shape d={fPath} fill={pal.accent} strokeWidth={4} />
      </Pop>
      <FadeOut t={i}>
        {turn >= 0 ? <AngleArc at={o} from={0} to={THETA * progress(turn, 40)} r={210} color={pal.accent} label={s.theta} /> : null}
      </FadeOut>
      <Circle cx={o.x} cy={o.y} r={G.unit} stroke={pal.textMuted} strokeWidth={4} draw={drawn(i, 30)} />

      <FadeOut t={check}>
        {iturn >= 0 ? <AngleArc at={o} from={0} to={iDeg} r={56} color={pal.accent} label={s.theta} /> : null}
        {j >= 0 ? <AngleArc at={o} from={0} to={90 * progress(j - 10, 20)} r={110} color={pal.textMuted} label={s.deg90} /> : null}
        {jends >= 0 ? <AngleArc at={o} from={90} to={jDeg} r={56} color={pal.accent} label={s.theta} /> : null}
        {guides > 0 ? (
          <g stroke={pal.textMuted} strokeWidth={4} strokeDasharray="4 10" strokeLinecap="round" opacity={guides}>
            <line x1={iTip.x} y1={iTip.y} x2={iTip.x} y2={o.y} />
            <line x1={iTip.x} y1={iTip.y} x2={o.x} y2={iTip.y} />
          </g>
        ) : null}
        <Pop t={iturn} delay={36} x={iTip.x + 120} y={iTip.y - 30}>
          <Label x={iTip.x + 20} y={iTip.y - 22} size={30} anchor="start">{s.cosSin}</Label>
        </Pop>
        <FadeOut t={jlands + 4}>
          <Pop t={jends} delay={30} x={jTip.x} y={jTip.y - 40}>
            <Label x={jTip.x} y={jTip.y - 34} size={30}>{s.jEnds}</Label>
          </Pop>
        </FadeOut>
        <Pop t={jlands} delay={16} x={jTip.x} y={jTip.y - 40}>
          <Label x={jTip.x} y={jTip.y - 34} size={30}>{s.negSinCos}</Label>
        </Pop>
      </FadeOut>

      <Vector space={G} from={O} to={jEnd} grow={drawn(j, 16)} color={pal.sky} dashed={trap >= 0} label={s.j} />
      <Vector space={G} from={O} to={iEnd} grow={drawn(i - 10, 16)} color={pal.hero} label={s.i} />

      <FadeOut t={trap}>
        <Pop t={iup} delay={30} x={iTip.x + 60} y={iTip.y}>
          <Label x={iTip.x + 26} y={iTip.y + 10} size={30} anchor="start">{s.t01}</Label>
        </Pop>
        <Pop t={jleft} delay={30} x={jTip.x} y={jTip.y + 46}>
          <Label x={jTip.x} y={jTip.y + 52} size={30}>{s.tNeg10}</Label>
        </Pop>
      </FadeOut>
      {mirror >= 0 ? <Cross x={fMid.x} y={fMid.y - 90} size={56} draw={drawn(mirror, 16)} /> : null}

      <FadeOut t={check}>
        <Pop t={col1} x={CARD.x} y={CARD.y}>
          <MatrixCard x={CARD.x} y={CARD.y} text={s.mat} size={CARD.size} show={[1, progress(col2, 12)]}
            tint={[1, progress(col2, 12)]} />
        </Pop>
      </FadeOut>
      <FadeOut t={trap}>
        <Pop t={check} delay={12} x={CARD.x} y={CARD.y}>
          <MatrixCard x={CARD.x} y={CARD.y} text={s.mat90} size={CARD.size} tint={[1, 1]}
            show={[progress(iup, 12), progress(jleft, 12)]} />
        </Pop>
      </FadeOut>
      <Pop t={trap} delay={4} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.matSwap} size={CARD.size} tint={[1, 1]} />
      </Pop>
      <Pop t={trap} delay={20} x={CARD.x} y={CARD.y + 150}>
        <Box x={CARD.x - wrongW / 2} y={CARD.y + 118} w={wrongW} h={64} r={22} fill={pal.panel} stroke={pal.warn} strokeWidth={6} />
        <Code x={CARD.x} y={CARD.y + 160} size={30} anchor="middle">{s.wrong}</Code>
        <Cross x={CARD.x - wrongW / 2 - 36} y={CARD.y + 150} size={32} draw={drawn(trap - 30, 14)} />
      </Pop>

      <Pop t={build} delay={10} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={21} pose={pose} reach={progress(mirror, 12)} lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

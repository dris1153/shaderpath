import { progress } from "../../kit/easing";
import { Grid, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// One arrow k·v with k going 1 → 2 → 0.5 → −1 along its line, then the
// example (4, −2) × −1.5 = (−6, 3), then the three tiny functions.
const G: GridSpace = { ox: 700, oy: 340, unit: 64 };
const O = { x: 0, y: 0 };
const V = { x: 2, y: 1 };
const U = { x: 4, y: -2 };
const R = { x: -6, y: 3 };
const HOST = { x: 140, y: 460 };
const CARD = { x: 730, y: 60, w: 480, h: 76 };
const FNS_Y = [220, 320, 420];

export function Scale() {
  const pal = usePalette();
  const scale = useCue("scale");
  const stretch = useCue("stretch");
  const shrink = useCue("shrink");
  const flip = useCue("flip");
  const example = useCue("example");
  const gives = useCue("gives");
  const engine = useCue("engine");
  const s = {
    k: [useString("v"), useString("twoV"), useString("halfV"), useString("negV")],
    u: useString("tuple42"), r: useString("tupleNeg63"), card: useString("scaleExample"), result: useString("scaleResult"),
    fns: [useString("fnAdd"), useString("fnSub"), useString("fnScale")],
  };

  const k = 1 + progress(stretch, 20) - 1.5 * progress(shrink, 20) - 1.5 * progress(flip, 24);
  const step = flip >= 0 ? 3 : shrink >= 0 ? 2 : stretch >= 0 ? 1 : 0;
  const line = (d: { x: number; y: number }, t: number) => {
    const a = toStage(G, { x: -d.x * 3, y: -d.y * 3 });
    const b = toStage(G, { x: d.x * 3, y: d.y * 3 });
    return t >= 0 ? (
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={pal.textMuted} strokeWidth={3} strokeDasharray="4 12"
        strokeLinecap="round" opacity={progress(t, 12) * 0.8} />
    ) : null;
  };

  return (
    <Stage>
      <Grid space={G} x={[-7, 6]} y={[-4, 3]} t={scale} axes={scale} />
      <FadeOut t={example}>
        {line(V, stretch)}
        {stretch >= 0 ? <Vector space={G} from={O} to={V} dashed opacity={0.4} /> : null}
        <Vector space={G} from={O} to={{ x: V.x * k, y: V.y * k }} grow={drawn(scale, 18, 10)} label={s.k[step]}
          side={step === 2 ? -1 : 1} />
      </FadeOut>

      <FadeOut t={engine}>
        {line({ x: 2, y: -1 }, example)}
        <Vector space={G} from={O} to={U} grow={drawn(example, 18, 6)} color={pal.sky} label={s.u} side={-1} />
        <Vector space={G} from={O} to={R} grow={drawn(gives, 22)} label={s.r} />
        <Pop t={example} x={CARD.x + CARD.w / 2} y={CARD.y + CARD.h / 2}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={22} fill={pal.panel} />
          <Code x={CARD.x + 24} y={CARD.y + 48} size={28}>{s.card}</Code>
          {gives >= 0 ? (
            <g opacity={progress(gives, 10)}>
              <Code x={CARD.x + CARD.w - 24} y={CARD.y + 48} size={28} anchor="end" color={pal.hero}>{s.result}</Code>
            </g>
          ) : null}
        </Pop>
      </FadeOut>

      {s.fns.map((text, i) => (
        <Pop key={text} t={engine} delay={6 + i * 5} x={700} y={FNS_Y[i]!}>
          <Box x={520} y={FNS_Y[i]! - 38} w={360} h={76} r={22} fill={pal.panel} />
          <Code x={700} y={FNS_Y[i]! + 11} size={34} anchor="middle">{text}</Code>
        </Pop>
      ))}
      <Pop t={scale} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.55} seed={11} pose={engine >= 0 ? "cheer" : "idle"} reach={progress(engine, 14)}
          lookAt={engine >= 0 ? { x: 700, y: 320 } : toStage(G, { x: V.x * k, y: V.y * k })} />
      </Pop>
    </Stage>
  );
}

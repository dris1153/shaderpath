import { progress } from "../../kit/easing";
import { lerp, toStage, Vector, type GridSpace, type Vec } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { apply, mix, rotation, scaling, type Mat } from "../../kit/mat";
import { MatGrid, MatrixCard, UnitSquare } from "../../kit/matrix";

// Scale: each column touches one axis. Shear: î stays, ĵ slides to (k, 1); the square
// leans like a rotation, but its sheared edge grows to √(k² + 1) where a rotation keeps 1.
const G: GridSpace = { ox: 300, oy: 440, unit: 130 };
const CLIP = { x: 70, y: 130, w: 560, h: 460 };
const CARD = { x: 930, y: 230, size: 40 };
const HOST = { x: 1160, y: 500 };
const K = 0.8;
const O = { x: 0, y: 0 };

export function ScaleShear() {
  const pal = usePalette();
  const scale = useCue("scale");
  const sx = useCue("sx");
  const sy = useCue("sy");
  const own = useCue("own");
  const shear = useCue("shear");
  const istay = useCue("istay");
  const jslide = useCue("jslide");
  const lean = useCue("lean");
  const looks = useCue("looks");
  const keeps = useCue("keeps");
  const grows = useCue("grows");
  const s = {
    i: useString("iHat"), j: useString("jHat"), scale: useString("matScale"), shear: useString("matShear"),
    k1: useString("tupleK1"), one: useString("one"), edge: useString("edgeLength"),
  };

  // The two scales breathe out of phase on "own", then rest before the shear.
  const env = progress(own, 12) * (1 - progress(shear, 20));
  const wave = (2 * Math.PI * Math.max(0, own)) / 80;
  const sxV = 1 + 0.6 * progress(sx, 30) + 0.25 * Math.sin(wave) * env;
  const syV = 1 - 0.3 * progress(sy, 30) + 0.2 * Math.sin(wave + Math.PI / 2) * env;
  // After "grows", k sways a little so the last label keeps moving, then settles.
  const sway = 0.12 * Math.sin((2 * Math.PI * Math.max(0, grows - 20)) / 70) * progress(grows - 20, 10) * (1 - progress(grows - 110, 30));
  const k = K * progress(jslide, 40) + sway;
  const m: Mat = mix(scaling(sxV, syV), { a: 1, b: k, c: 0, d: 1 }, progress(shear, 30));
  const iTip = apply(m, { x: 1, y: 0 });
  const jTip = apply(m, { x: 0, y: 1 });
  const iPx = toStage(G, iTip);
  const jPx = toStage(G, jTip);
  const o = toStage(G, O);

  // A rotation that leans the same way, dashed, with every edge still 1.
  const rot = rotation(-28);
  const rc = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }].map((p) => toStage(G, apply(rot, p)));
  // "1" just outside the bottom and right edges of the rotated square, clear of ĵ's length line.
  const edgeTags: Vec[] = [
    { at: { x: 0.5, y: 0 }, out: { x: 0, y: -1 } },
    { at: { x: 1, y: 0.5 }, out: { x: 1, y: 0 } },
  ].map((e) => toStage(G, apply(rot, { x: e.at.x + e.out.x * 0.24, y: e.at.y + e.out.y * 0.24 })));
  const isScale = shear < 0;
  const tint: [number, number] = isScale ? [progress(sx, 12), progress(sy, 12)] : [progress(istay, 12), progress(jslide, 12)];
  const bracket = drawn(grows, 18);
  const n = { x: -(jPx.y - o.y), y: jPx.x - o.x };
  const nl = Math.hypot(n.x, n.y) || 1;
  const off = { x: (n.x / nl) * -26, y: (n.y / nl) * -26 };
  const bEnd = lerp(o, jPx, bracket);
  // The √ label sits on the free side of the length line, away from the square.
  const tag = lerp(o, jPx, 0.6);
  const tagAt = { x: tag.x + off.x * 2.6, y: tag.y + off.y * 2.6 };

  return (
    <Stage>
      <MatGrid space={G} m={m} x={[-4, 4]} y={[-4, 4]} step={0.5} t={scale} clip={CLIP} />
      <UnitSquare space={G} m={m} t={scale - 20} />
      {looks >= 0 ? (
        <path d={`M ${rc.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`} fill="none" stroke={pal.textMuted} strokeWidth={4}
          strokeDasharray="8 9" opacity={progress(looks, 14)} />
      ) : null}
      {lean >= 0 ? (
        <line x1={o.x} y1={o.y} x2={lerp(o, iPx, drawn(lean, 16)).x} y2={o.y} stroke={pal.ok} strokeWidth={10}
          strokeLinecap="round" opacity={0.85} />
      ) : null}
      <Vector space={G} from={O} to={jTip} grow={drawn(scale - 20, 16, 6)} color={pal.sky} label={looks < 0 ? s.j : undefined} />
      <Vector space={G} from={O} to={iTip} grow={drawn(scale - 20, 16)} color={pal.hero} label={looks < 0 ? s.i : undefined}
        side={-1} />

      <Pop t={istay} x={iPx.x} y={iPx.y}>
        <circle cx={iPx.x} cy={iPx.y} r={30} fill="none" stroke={pal.accent} strokeWidth={5} strokeDasharray="6 9"
          strokeDashoffset={-0.5 * Math.max(0, istay)} />
      </Pop>
      <FadeOut t={grows}>
        <Pop t={jslide} delay={40} x={jPx.x + 70} y={jPx.y}>
          <Label x={jPx.x + 30} y={jPx.y + 10} size={30} anchor="start">{s.k1}</Label>
        </Pop>
      </FadeOut>
      {edgeTags.map((p, n) => (
        <Pop key={n} t={keeps} delay={n * 8} x={p.x} y={p.y}>
          <Label x={p.x} y={p.y + 10} size={30} color={pal.textMuted}>{s.one}</Label>
        </Pop>
      ))}
      {grows >= 0 ? (
        <g stroke={pal.accent} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d={`M ${o.x + off.x} ${o.y + off.y} L ${bEnd.x + off.x} ${bEnd.y + off.y}`} />
        </g>
      ) : null}
      <Pop t={grows} delay={40} x={tagAt.x - 70} y={tagAt.y}>
        <Label x={tagAt.x} y={tagAt.y + 10} size={34} anchor="end">{s.edge}</Label>
      </Pop>

      <FadeOut t={shear}>
        <Pop t={scale} delay={10} x={CARD.x} y={CARD.y}>
          <MatrixCard x={CARD.x} y={CARD.y} text={s.scale} size={CARD.size} tint={tint} />
        </Pop>
      </FadeOut>
      <Pop t={shear} delay={6} x={CARD.x} y={CARD.y}>
        <MatrixCard x={CARD.x} y={CARD.y} text={s.shear} size={CARD.size} tint={tint}
          show={[progress(istay, 12), progress(jslide, 12)]} />
      </Pop>

      <Pop t={scale} delay={14} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.5} seed={25} pose={looks >= 0 && grows < 14 ? "think" : "idle"}
          reach={progress(looks, 14) * (1 - progress(grows, 14))} lookAt={looks >= 0 ? jPx : { x: CARD.x, y: CARD.y }} />
      </Pop>
    </Stage>
  );
}

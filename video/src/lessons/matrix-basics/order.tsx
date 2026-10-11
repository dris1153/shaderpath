import { progress } from "../../kit/easing";
import { ArrowPath, toStage, Vector, type GridSpace } from "../../kit/grid";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { vecPlain } from "../../kit/vec-marker";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { apply, IDENTITY, mix, mul, rotation, scaling } from "../../kit/mat";
import { Cross, MatGrid, MONO, UnitSquare } from "../../kit/matrix";
import { SlimeSprite } from "../../mascot/Slime";

// A chain runs right to left: R * S * v stretches first, then turns. Then î on two grids:
// R * S takes it to (2, 0), then (0, 2); S * R turns it to (0, 1), where the x stretch cannot touch it.
const FORMULA = { x: 640, y: 130, size: 48 };
const CHAR = FORMULA.size * MONO;
const SLIMES = [{ x: 330, y: 470 }, { x: 950, y: 470 }];
const S2 = scaling(2, 1);
const R90 = rotation(90);
const GL: GridSpace = { ox: 400, oy: 475, unit: 80 };
const GR: GridSpace = { ox: 1000, oy: 475, unit: 80 };
const CLIPS = [{ x: 170, y: 210, w: 440, h: 380 }, { x: 760, y: 210, w: 440, h: 380 }];
const HOST = { x: 690, y: 490 };
const O = { x: 0, y: 0 };

function Badge({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const pal = usePalette();
  return (
    <g>
      <circle cx={x} cy={y} r={22} fill={color} stroke={pal.outline} strokeWidth={4} />
      <Label x={x} y={y + 10} size={28} halo={color}>{text}</Label>
    </g>
  );
}

export function Order() {
  const pal = usePalette();
  const back = useCue("back");
  const chain = useCue("chain");
  const closest = useCue("closest");
  const written = useCue("written");
  const trap = useCue("trap");
  const watch = useCue("watch");
  const rs = useCue("rs");
  const rs2 = useCue("rs2");
  const sr = useCue("sr");
  const cant = useCue("cant");
  const bug = useCue("bug");
  const fix = useCue("fix");
  const s = {
    formula: useString("RSv"), v: useString("v"), RS: useString("RS"), SR: useString("SR"), st: useString("stretchThenTurn"),
    ts: useString("turnThenStretch"), one: useString("first"), two: useString("second"), t20: useString("tuple20"),
    t02: useString("tuple02"), t01: useString("tuple01"), errors: useString("noErrors"), i: useString("iHat"),
  };

  // Letter centres inside "R * S * v" (mono, middle-anchored).
  const plain = vecPlain(s.formula);
  const left = FORMULA.x - (plain.length * CHAR) / 2;
  const charX = (ch: string) => left + (plain.indexOf(ch) + 0.5) * CHAR;
  const [rX, sX, vX] = [charX("R"), charX("S"), charX("v")];
  const badgeY = FORMULA.y + 52;
  const formulaOn = progress(written, 12) * (1 - progress(watch, 10)) + progress(fix, 12);
  const firstPulse = 1 + 0.25 * Math.sin(Math.PI * progress(fix - 10, 20));

  const mLeft = mul(rotation(90 * progress(rs2 - 10, 30)), mix(IDENTITY, S2, progress(rs - 30, 30)));
  const mRight = mul(mix(IDENTITY, S2, progress(cant, 30)), rotation(90 * progress(sr - 27, 30)));
  const tipL = toStage(GL, apply(mLeft, { x: 1, y: 0 }));
  const tipR = toStage(GR, apply(mRight, { x: 1, y: 0 }));
  const pull = Math.sin(Math.PI * progress(cant, 30));

  const pose = bug >= 0 && fix < 12 ? "surprised" : "idle";
  const lookAt = fix >= 0 ? { x: sX, y: FORMULA.y } : sr >= 0 ? tipR : rs >= 0 ? tipL
    : closest >= 0 ? { x: FORMULA.x, y: FORMULA.y } : undefined;

  return (
    <Stage>
      <FadeOut t={watch}>
        <Pop t={back} x={SLIMES[0]!.x} y={SLIMES[0]!.y - 60}>
          <SlimeSprite at={SLIMES[0]!} m={mul(R90, S2)} />
        </Pop>
        <Pop t={back} delay={6} x={SLIMES[1]!.x} y={SLIMES[1]!.y - 60}>
          <SlimeSprite at={SLIMES[1]!} m={mul(S2, R90)} />
        </Pop>
        {SLIMES.map((p, i) => {
          const before = i === 0 ? s.st : s.ts;
          const after = i === 0 ? s.RS : s.SR;
          return (
            <Pop key={i} t={back} delay={10 + i * 5} x={p.x} y={575}>
              <Box x={p.x - 80} y={543} w={160} h={64} r={22} fill={pal.panel} />
              <g opacity={1 - progress(written, 12)}><Code x={p.x} y={585} size={30} anchor="middle">{before}</Code></g>
              <g opacity={progress(written, 12)}><Code x={p.x} y={585} size={30} anchor="middle">{after}</Code></g>
            </Pop>
          );
        })}
        {chain >= 0 ? (
          <ArrowPath a={{ x: vX + 60, y: badgeY + 46 }} b={{ x: vX + 60 - (vX - rX + 120) * drawn(chain, 24), y: badgeY + 46 }}
            stroke={pal.outline} width={5} />
        ) : null}
        <g opacity={progress(closest, 10) * (1 - progress(written, 12))}>
          <Code x={vX} y={FORMULA.y + 16} size={FORMULA.size} anchor="middle">{s.v}</Code>
          <rect x={sX - 22} y={FORMULA.y - 26} width={44} height={56} rx={10} fill="none" stroke={pal.textMuted}
            strokeWidth={4} strokeDasharray="6 7" />
        </g>
        {trap >= 0 ? (
          <g opacity={progress(trap, 10)}>
            <ArrowPath a={{ x: rX - 40, y: FORMULA.y - 62 }} b={{ x: rX - 40 + (vX - rX + 80) * drawn(trap, 20), y: FORMULA.y - 62 }}
              stroke={pal.warn} width={5} dashed />
            <Cross x={FORMULA.x + 210} y={FORMULA.y - 62} size={36} draw={drawn(trap - 20, 14)} />
          </g>
        ) : null}
      </FadeOut>

      {formulaOn > 0 ? (
        <g opacity={Math.min(1, formulaOn)}>
          <Code x={FORMULA.x} y={FORMULA.y + 16} size={FORMULA.size} anchor="middle">{s.formula}</Code>
        </g>
      ) : null}
      <Pop t={closest} x={sX} y={badgeY}>
        <g opacity={1 - progress(watch, 10) + progress(fix, 12)}
          transform={`translate(${sX} ${badgeY}) scale(${firstPulse}) translate(${-sX} ${-badgeY})`}>
          <Badge x={sX} y={badgeY} text={s.one} color={pal.accent} />
        </g>
      </Pop>
      <Pop t={written} delay={20} x={rX} y={badgeY}>
        <g opacity={1 - progress(watch, 10) + progress(fix, 12)}>
          <Badge x={rX} y={badgeY} text={s.two} color={pal.panel} />
        </g>
      </Pop>

      {watch >= 0 ? (
        <g>
          {[GL, GR].map((g, i) => (
            <g key={i}>
              <MatGrid space={g} m={i === 0 ? mLeft : mRight} x={[-4, 4]} y={[-4, 4]} t={watch - i * 6} clip={CLIPS[i]!} />
              <UnitSquare space={g} m={i === 0 ? mLeft : mRight} t={watch - i * 6} />
              <Vector space={g} from={O} to={apply(i === 0 ? mLeft : mRight, { x: 1, y: 0 })} grow={drawn(watch - 10 - i * 6, 16)}
                color={pal.hero} label={s.i} side={-1} />
              <Pop t={watch} delay={i * 6} x={g.ox} y={CLIPS[i]!.y + 36}>
                <Box x={g.ox - 80} y={CLIPS[i]!.y + 4} w={160} h={60} r={20} fill={pal.panel} />
                <Code x={g.ox} y={CLIPS[i]!.y + 45} size={30} anchor="middle">{i === 0 ? s.RS : s.SR}</Code>
              </Pop>
            </g>
          ))}
        </g>
      ) : null}
      <FadeOut t={rs2}>
        <Pop t={rs} delay={80} x={tipL.x} y={tipL.y + 44}>
          <Label x={tipL.x} y={tipL.y + 50} size={30}>{s.t20}</Label>
        </Pop>
      </FadeOut>
      <Pop t={rs2} delay={50} x={tipL.x + 60} y={tipL.y}>
        <Label x={tipL.x + 24} y={tipL.y + 10} size={30} anchor="start">{s.t02}</Label>
      </Pop>
      <Pop t={sr} delay={75} x={tipR.x + 60} y={tipR.y}>
        <Label x={tipR.x + 24} y={tipR.y + 10} size={30} anchor="start">{s.t01}</Label>
      </Pop>
      {cant >= 0 && pull > 0 ? (
        <g opacity={pull}>
          <ArrowPath a={{ x: GR.ox - 40, y: GR.oy + 90 }} b={{ x: GR.ox - 40 - 90 * pull, y: GR.oy + 90 }} stroke={pal.outline} width={5} />
          <ArrowPath a={{ x: GR.ox + 40, y: GR.oy + 90 }} b={{ x: GR.ox + 40 + 90 * pull, y: GR.oy + 90 }} stroke={pal.outline} width={5} />
        </g>
      ) : null}
      <FadeOut t={fix}>
        <Pop t={bug} x={HOST.x} y={300}>
          <Label x={HOST.x} y={310} size={30} color={pal.textMuted}>{s.errors}</Label>
        </Pop>
      </FadeOut>

      <Pop t={back} delay={12} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.45} seed={29} pose={pose} reach={progress(bug, 12) * (1 - progress(fix, 12))}
          lookAt={lookAt} />
      </Pop>
    </Stage>
  );
}

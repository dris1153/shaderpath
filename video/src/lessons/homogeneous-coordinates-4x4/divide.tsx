import { progress } from "../../kit/easing";
import { ArrowPath, lerp } from "../../kit/grid";
import { drawn, FadeOut, Pop, SlideIn } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, Title, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { Slime } from "../../mascot/Slime";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// Side view: the camera on the left, depth (the new w) to the right. Two slimes of the same
// height 2 stand at depth 5 and 10; their rays cross a screen line, and x / w gives 0.4 and 0.2.
const CAM = { x: 200, y: 400 };
const DU = 88; // px per depth unit
const HU = 60; // px per height unit
const SCREEN = 2.5; // depth of the drawn screen line
const NEAR = 5;
const FAR = 10;
const HOST = { x: 105, y: 525 };
const PANEL = { x: 250, y: 100, w: 270, h: 120 };

const px = (depth: number, height: number) => ({ x: CAM.x + depth * DU, y: CAM.y - height * HU });

export function Divide() {
  const pal = usePalette();
  const last = useCue("last");
  const never = useCue("never");
  const projection = useCue("projection");
  const divide = useCue("divide");
  const near = useCue("near");
  const far = useCue("far");
  const smaller = useCue("smaller");
  const s = {
    w: useString("w"), w1: useString("wOne"), w0: useString("wZero"), xw: useString("xOverW"), near: useString("near"),
    far: useString("far"), w5: useString("wFive"), w10: useString("wTen"), T: useString("T"), R: useString("R"), S: useString("S"),
  };

  const slimes = [
    { t: near, depth: NEAR, color: pal.hero, label: s.w5, chip: s.near, chipDelay: 124 },
    { t: far, depth: FAR, color: pal.sky, label: s.w10, chip: s.far, chipDelay: 85 },
  ];
  const screenX = px(SCREEN, 0).x;
  // "The point's depth": a w marker runs out along the depth axis, then settles where the near slime lands.
  const probeDepth = 0.6 + 7.4 * progress(projection - 50, 70) + (NEAR - 8) * progress(divide - 30, 80);
  const probe = { x: px(probeDepth, 0).x, y: CAM.y + 70 };

  let pose: Pose = "idle";
  let reach = 0;
  if (smaller >= 12) { pose = "cheer"; reach = progress(smaller - 12, 14); }
  else if (far >= 12) { pose = "surprised"; reach = progress(far - 12, 14) * (1 - progress(smaller, 12)); }

  return (
    <Stage>
      {/* Part 1: T, R and S pass over w and leave it as it was. */}
      <FadeOut t={projection}>
        <Pop t={last} x={640} y={200}>
          <Title x={640} y={230} size={120} color={pal.accent}>{s.w}</Title>
        </Pop>
        <Pop t={never} delay={90} x={520} y={360}>
          <Chip x={520} y={360} text={s.w1} />
        </Pop>
        <Pop t={never} delay={135} x={760} y={360}>
          <Chip x={760} y={360} text={s.w0} />
        </Pop>
        {[s.T, s.R, s.S].map((l, i) => (
          <SlideIn key={i} t={never} delay={[0, 26, 45][i]!} from="left" distance={300} duration={40}>
            <Chip x={560 + i * 80} y={460} text={l} />
          </SlideIn>
        ))}
      </FadeOut>

      {/* Part 2: the side view. */}
      {projection >= 0 ? (
        <g opacity={progress(projection, 16)}>
          <line x1={CAM.x} y1={CAM.y} x2={1180} y2={CAM.y} stroke={pal.outline} strokeWidth={4} strokeLinecap="round" />
          <ArrowPath a={{ x: CAM.x, y: CAM.y + 70 }} b={{ x: 1180, y: CAM.y + 70 }} stroke={pal.textMuted} width={3} />
          <Label x={1196} y={CAM.y + 80} size={30} color={pal.textMuted}>{s.w}</Label>
          <line x1={screenX} y1={CAM.y} x2={screenX} y2={CAM.y - 2.6 * HU} stroke={pal.outline} strokeWidth={5} strokeLinecap="round" />
          {/* A camera looking right, its lens on the axis: the rays start at CAM, so the hit dots sit on them. */}
          <Box x={CAM.x - 70} y={CAM.y - 22} w={56} h={44} r={10} fill={pal.panel} />
          <Shape d={`M ${CAM.x - 14} ${CAM.y - 8} L ${CAM.x + 6} ${CAM.y - 18} L ${CAM.x + 6} ${CAM.y + 18} L ${CAM.x - 14} ${CAM.y + 8} Z`}
            fill={pal.panel} />
        </g>
      ) : null}
      <FadeOut t={near}>
        <g opacity={progress(projection - 50, 14)}>
          <line x1={probe.x} y1={CAM.y} x2={probe.x} y2={probe.y} stroke={pal.hero} strokeWidth={3} strokeDasharray="6 8" />
          <circle cx={probe.x} cy={probe.y} r={11} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
          <Label x={probe.x} y={probe.y + 44} size={30} color={pal.hero}>{s.w}</Label>
        </g>
      </FadeOut>
      <Pop t={divide} x={640} y={110}>
        <Chip x={640} y={110} text={s.xw} size={40} />
      </Pop>
      {/* Rays first, so no ray crosses a slime's face. */}
      {slimes.map((sl, i) => {
        const top = px(sl.depth, 2);
        const hit = px(SCREEN, (2 * SCREEN) / sl.depth);
        const ray = drawn(sl.t - 20, 30);
        const end = lerp(CAM, top, ray);
        return sl.t >= 20 ? (
          <g key={i}>
            <line x1={CAM.x} y1={CAM.y} x2={end.x} y2={end.y} stroke={sl.color} strokeWidth={3} strokeDasharray="6 8" />
            {ray > 0.95 ? (
              <g>
                <line x1={screenX} y1={CAM.y} x2={screenX} y2={hit.y} stroke={sl.color} strokeWidth={10} strokeLinecap="round"
                  transform={`translate(${i === 0 ? -9 : 9} 0)`} />
                <circle cx={hit.x} cy={hit.y} r={7} fill={sl.color} stroke={pal.outline} strokeWidth={3} />
              </g>
            ) : null}
          </g>
        ) : null;
      })}
      {slimes.map((sl, i) => {
        const foot = px(sl.depth, 0);
        const top = px(sl.depth, 2);
        return (
          <g key={i}>
            <Pop t={sl.t} x={foot.x} y={foot.y - 60}>
              <Slime at={foot} scale={(2 * HU) / 92} />
              <Label x={foot.x} y={foot.y + 38} size={30}>{sl.label}</Label>
            </Pop>
            <Pop t={sl.t} delay={sl.chipDelay} x={foot.x} y={top.y - 70}>
              <Chip x={foot.x} y={top.y - 70} text={sl.chip} />
            </Pop>
          </g>
        );
      })}

      {/* The screen: same slime, half the size when twice as far. */}
      <Pop t={smaller} x={PANEL.x + PANEL.w / 2} y={PANEL.y + PANEL.h / 2}>
        <Box x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} r={20} fill={pal.panel} />
        <Slime at={{ x: PANEL.x + 85, y: PANEL.y + PANEL.h - 14 }} scale={0.8} />
        <Slime at={{ x: PANEL.x + 200, y: PANEL.y + PANEL.h - 14 }} scale={0.4} />
      </Pop>

      <Pop t={last} delay={10} x={HOST.x} y={HOST.y}>
        <Inko x={HOST.x} y={HOST.y} scale={0.42} seed={37} pose={pose} reach={reach}
          lookAt={far >= 0 ? px(FAR, 2) : near >= 0 ? px(NEAR, 2) : { x: 640, y: 300 }} />
      </Pop>
    </Stage>
  );
}

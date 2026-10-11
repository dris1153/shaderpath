import { progress } from "../../kit/easing";
import { ArrowPath } from "../../kit/grid";
import { MatrixCard } from "../../kit/matrix";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import { Chip } from "./parts";

// One pill per idea as it is named, then the pointer to the lesson's demo: drag t, and the
// red points slide while the blue arrows (directions) stay still.
const ROWS = [105, 215, 330, 450];

export function Recap() {
  const pal = usePalette();
  const recap = useCue("recap");
  const layout = useCue("layout");
  const points = useCue("points");
  const dirs = useCue("dirs");
  const normals = useCue("normals");
  const order = useCue("order");
  const div = useCue("div");
  const next = useCue("next");
  const demo = useCue("demo");
  const s = {
    zero: useString("zeroRule"), t4: useString("tuple4"), layout: useString("matLayout"), p: useString("demoTitle"),
    d: useString("demoSubtitle"), n: useString("normalRight"), trs: useString("TRS"), xw: useString("xOverW"), mvp: useString("mvp"),
    t: useString("t"),
  };
  // The demo's t slider: the knob swings, the red points follow, then all rest before the cut.
  const swing = 150 * Math.sin((2 * Math.PI * Math.max(0, demo - 30)) / 90) * progress(demo - 30, 12) * (1 - progress(demo - 120, 40));
  const knob = 860 + swing;
  const corner = progress(layout - 44, 12);

  return (
    <Stage>
      <Inko x={210} y={400} scale={0.85} seed={13} pose={demo >= 0 ? "cheer" : "idle"} reach={progress(demo, 14)}
        lookAt={{ x: 820, y: 300 }} />
      <FadeOut t={demo}>
        <Pop t={recap} x={600} y={ROWS[0]!}><Chip x={600} y={ROWS[0]!} text={s.zero} /></Pop>
        <Pop t={recap} delay={121} x={930} y={ROWS[0]!}><Chip x={930} y={ROWS[0]!} text={s.t4} border={pal.accent} /></Pop>
        <Pop t={layout} x={580} y={ROWS[1]! + 20}>
          {/* The corner tints on "rotation and scale", the last column on "the move". */}
          <MatrixCard x={580} y={ROWS[1]! + 20} text={s.layout} size={24} colors={[pal.sky, pal.sky, pal.sky, pal.accent]}
            tint={[corner, corner, corner, progress(layout - 111, 12)]} />
        </Pop>
        <Pop t={points} x={920} y={ROWS[1]!}><Chip x={920} y={ROWS[1]!} text={s.p} border={pal.hero} /></Pop>
        <Pop t={dirs} x={920} y={ROWS[1]! + 75}><Chip x={920} y={ROWS[1]! + 75} text={s.d} border={pal.sky} /></Pop>
        <Pop t={normals} x={760} y={ROWS[2]! + 30}><Chip x={760} y={ROWS[2]! + 30} text={s.n} border={pal.ok} /></Pop>
        <Pop t={order} x={560} y={ROWS[3]!}><Chip x={560} y={ROWS[3]!} text={s.trs} /></Pop>
        <Pop t={div} x={780} y={ROWS[3]!}><Chip x={780} y={ROWS[3]!} text={s.xw} /></Pop>
        <Pop t={next} x={1000} y={ROWS[3]!}><Chip x={1000} y={ROWS[3]!} text={s.mvp} border={pal.accent} /></Pop>
      </FadeOut>
      <Pop t={demo} delay={10} x={820} y={300}>
        <Box x={470} y={170} w={700} h={270} r={36} fill={pal.panel} stroke={pal.hero} strokeWidth={7} />
        <Shape d="M 530 222 L 530 298 L 596 260 Z" fill={pal.hero} strokeWidth={5} />
        <Label x={880} y={248} size={40} halo={pal.panel}>{s.p}</Label>
        <Label x={880} y={296} size={34} color={pal.sky} halo={pal.panel}>{s.d}</Label>
        {/* Two blue directions that never move, two red points that follow the slider. */}
        <ArrowPath a={{ x: 640, y: 350 }} b={{ x: 690, y: 320 }} stroke={pal.sky} width={6} />
        <ArrowPath a={{ x: 1000, y: 350 }} b={{ x: 1050, y: 320 }} stroke={pal.sky} width={6} />
        <circle cx={790 + swing * 0.4} cy={335} r={10} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
        <circle cx={890 + swing * 0.4} cy={335} r={10} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
        <Label x={600} y={410} size={32} halo={pal.panel}>{s.t}</Label>
        <line x1={640} y1={400} x2={1080} y2={400} stroke={pal.accent} strokeWidth={8} strokeLinecap="round" />
        <circle cx={knob} cy={400} r={17} fill={pal.panel} stroke={pal.outline} strokeWidth={5} />
      </Pop>
    </Stage>
  );
}

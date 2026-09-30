import { Callout, Axis2D, PixelGrid, Point } from "../../kit/diagram";
import { NIGHT, PAPER, ThemeContext, usePalette, type Palette } from "../../kit/palette";
import { progress } from "../../kit/easing";
import { drawn, FadeOut, Pop, SlideIn } from "../../kit/motion";
import { Arrow, Box, Circle, type LineStyle } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, Title, useString } from "../../kit/text";
import { Inko, type Pose } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";
import type { LessonModule } from "../../scene/LessonVideo";

// Style frames for the look checkpoint: every primitive, both palettes, both
// line styles, every Inko pose. Section titles are dev labels; the talk scene
// goes through strings.json like a real lesson.

function Specimen({ palette, name }: { palette: Palette; name: string }) {
  const t = useCue("in");
  return (
    <ThemeContext.Provider value={palette}>
      <Stage x={name === "paper" ? 20 : 650} y={140} width={610} height={343}>
        <Title x={640} y={120} size={80}>
          {name}
        </Title>
        <Inko x={330} y={390} scale={1.1} pose="idle" lookAt={{ x: 900, y: 360 }} />
        <Pop t={t} delay={8} x={900} y={380}>
          <Box x={760} y={290} w={280} h={180} fill={palette.hero} />
          <Circle cx={900} cy={380} r={46} fill={palette.accent} />
        </Pop>
        <Label x={900} y={560} size={44}>
          x, y → u, v
        </Label>
      </Stage>
    </ThemeContext.Provider>
  );
}

function Palettes() {
  return (
    <Stage>
      <Title x={640} y={90} size={52}>
        Palette
      </Title>
      <Specimen palette={PAPER} name="paper" />
      <Specimen palette={NIGHT} name="night" />
      <Label x={640} y={545} size={26}>
        Baloo 2 · Nunito · JetBrains Mono
      </Label>
      <Code x={640} y={598} size={28} anchor="middle">
        {"vec2 uv = fragCoord / resolution;"}
      </Code>
    </Stage>
  );
}

function LineColumn({ x, lineStyle, title }: { x: number; lineStyle: LineStyle; title: string }) {
  const t = useCue("in");
  const pal = usePalette();
  return (
    <g>
      <Title x={x + 230} y={90} size={44}>
        {title}
      </Title>
      <Pop t={t} x={x + 90} y={200}>
        <Box x={x + 20} y={140} w={140} h={120} fill={pal.hero} lineStyle={lineStyle} seed={3} />
      </Pop>
      <Pop t={t} delay={4} x={x + 290} y={200}>
        <Circle cx={x + 290} cy={200} r={60} fill={pal.accent} lineStyle={lineStyle} seed={4} />
      </Pop>
      <Arrow x1={x + 370} y1={250} x2={x + 450} y2={150} lineStyle={lineStyle} seed={5} draw={drawn(t, 18, 8)} />
      <Axis2D t={t - 10} ox={x + 40} oy={540} xLen={170} yLen={190} lineStyle={lineStyle} />
      <PixelGrid t={t - 16} x={x + 250} y={360} cols={3} rows={3} cell={62} lineStyle={lineStyle}
        fillAt={(c, r) => ((c + r) % 2 === 0 ? pal.sky : null)} />
    </g>
  );
}

function Lines() {
  return (
    <Stage>
      <LineColumn x={60} lineStyle="clean" title="clean" />
      <line x1={640} y1={120} x2={640} y2={580} stroke="#00000022" strokeWidth={3} strokeDasharray="6 10" />
      <LineColumn x={700} lineStyle="sketch" title="sketch" />
    </Stage>
  );
}

const POSES: Pose[] = ["idle", "point", "think", "cheer", "surprised"];

function Poses() {
  const t = useCue("in");
  return (
    <Stage>
      <SlideIn t={t} from="up" distance={40}>
        <Title x={640} y={90} size={52}>
          Inko
        </Title>
      </SlideIn>
      {POSES.map((pose, i) => {
        const x = 150 + i * 245;
        return (
          <Pop key={pose} t={t} delay={i * 5} x={x} y={330}>
            <Inko x={x} y={300} scale={0.62} pose={pose} seed={i + 2}
              pointAt={{ x: x + 150, y: 170 }} lookAt={{ x: x + 150, y: 170 }} />
            <Label x={x} y={540} size={30}>
              {pose}
            </Label>
          </Pop>
        );
      })}
    </Stage>
  );
}

function Threads() {
  const t = useCue("in");
  const paint = useCue("paint");
  const pal = usePalette();
  const cols = 4;
  const cell = 104;
  const gx = 432;
  const gy = 130;
  const targets = Array.from({ length: 8 }, (_, i) => ({
    x: gx + (i % cols) * cell + cell / 2,
    y: gy + Math.floor(i / cols) * cell + cell / 2,
  }));
  const colors = [pal.hero, pal.accent, pal.ok, pal.sky];
  return (
    <Stage>
      <Title x={640} y={90} size={48}>
        8 tentacles · 8 threads
      </Title>
      <PixelGrid t={t} x={gx} y={gy} cols={cols} rows={2} cell={cell}
        fillAt={(c, r) => (paint > (r * cols + c) * 4 ? colors[(r * cols + c) % 4]! : null)} />
      <Inko x={640} y={470} scale={0.8} pose="threads" threads={targets}
        reach={progress(paint, 16)} lookAt={{ x: 640, y: 200 }} />
    </Stage>
  );
}

function Talk() {
  const t = useCue("in");
  const bubble = useCue("bubble");
  const out = useCue("out");
  return (
    <Stage>
      <Pop t={t} x={380} y={380}>
        <Inko x={380} y={380} scale={1.25} pose="idle" lookAt={{ x: 900, y: 260 }} seed={9} />
      </Pop>
      <FadeOut t={out}>
        <Callout t={bubble} x={640} y={170} w={520} h={120} tx={520} ty={300}
          text={useString("bubble")} size={34} />
        <Point t={bubble - 40} x={900} y={420} label={useString("center")} />
      </FadeOut>
    </Stage>
  );
}

export const lesson: LessonModule = {
  scenes: { palettes: Palettes, lines: Lines, poses: Poses, threads: Threads, talk: Talk },
};

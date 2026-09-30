import { PixelGrid } from "../../kit/diagram";
import { progress } from "../../kit/easing";
import { drawn, FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Arrow, Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Code, Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// A: two texture sizes. B/C: the unit square, then a finer texture, same code. D: image vs WebGL origin.
const SQ = { x: 400, y: 110, size: 340 };

export function Uv() {
  const pal = usePalette();
  const square = useCue("square");
  const corners = useCue("corners");
  const why = useCue("why");
  const swap = useCue("swap");
  const origin = useCue("origin");
  const flipped = useCue("flipped");
  const s = {
    small: useString("px16"), big: useString("px8192"), c00: useString("corner00"), c11: useString("corner11"),
    sample: useString("sample"), image: useString("image"), texture: useString("texture"), v0: useString("v0"),
  };
  const checker = (c: number, r: number) => ((c + r) % 2 ? pal.sky : null);
  const flip = progress(flipped, 24);
  return (
    <Stage>
      <FadeOut t={corners}>
        <PixelGrid t={square} x={250} y={220} cols={4} rows={4} cell={30} fillAt={checker} />
        <Pop t={square} delay={10} x={310} y={400}><Label x={310} y={400}>{s.small}</Label></Pop>
        <PixelGrid t={square - 12} x={560} y={110} cols={8} rows={8} cell={40} fillAt={checker} />
        <Pop t={square} delay={30} x={720} y={480}><Label x={720} y={480}>{s.big}</Label></Pop>
      </FadeOut>

      <FadeOut t={origin}>
        {corners >= 0 ? (
          <g>
            <PixelGrid t={corners} x={SQ.x} y={SQ.y} cols={4} rows={4} cell={SQ.size / 4} fillAt={checker} />
            {/* "Swap in a bigger texture": a finer checker pops in over the coarse one. */}
            <PixelGrid t={swap} x={SQ.x} y={SQ.y} cols={8} rows={8} cell={SQ.size / 8} fillAt={checker} />
            <Arrow x1={SQ.x} y1={SQ.y + SQ.size + 40} x2={SQ.x + SQ.size + 30} y2={SQ.y + SQ.size + 40} strokeWidth={6}
              seed={51} draw={drawn(corners - 10, 18)} />
            <Arrow x1={SQ.x - 40} y1={SQ.y + SQ.size} x2={SQ.x - 40} y2={SQ.y - 20} strokeWidth={6} seed={52}
              draw={drawn(corners - 16, 18)} />
            {corners > 30 ? <Label x={SQ.x + SQ.size + 55} y={SQ.y + SQ.size + 50}>u</Label> : null}
            {corners > 36 ? <Label x={SQ.x - 40} y={SQ.y - 40}>v</Label> : null}
            <Pop t={corners} delay={20} x={SQ.x} y={SQ.y + SQ.size}>
              <circle cx={SQ.x} cy={SQ.y + SQ.size} r={12} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
              <Label x={SQ.x - 70} y={SQ.y + SQ.size + 10} size={28}>{s.c00}</Label>
            </Pop>
            <Pop t={corners} delay={34} x={SQ.x + SQ.size} y={SQ.y}>
              <circle cx={SQ.x + SQ.size} cy={SQ.y} r={12} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
              <Label x={SQ.x + SQ.size + 70} y={SQ.y + 10} size={28}>{s.c11}</Label>
            </Pop>
          </g>
        ) : null}
        <Pop t={why} x={1000} y={300}>
          <Box x={800} y={258} w={400} h={84} r={20} fill={pal.panel} />
          <Code x={830} y={310} size={30}>{s.sample}</Code>
          {swap >= 0 ? <Shape d="M 1150 300 L 1163 314 L 1186 286" stroke={pal.ok} strokeWidth={7} draw={drawn(swap - 60, 10)} /> : null}
        </Pop>
        <Inko x={1060} y={500} scale={0.6} seed={9} lookAt={{ x: SQ.x + SQ.size / 2, y: SQ.y + SQ.size / 2 }} />
      </FadeOut>

      {origin >= 10 ? (
        <>
          {[
            { x: 180, label: s.image, v0Top: true },
            { x: 720, label: s.texture, v0Top: false },
          ].map(({ x, label, v0Top }, i) => (
            <Pop key={label} t={origin - 10} delay={i * 8} x={x + 150} y={290}>
              <Label x={x + 150} y={112} size={32}>{label}</Label>
              <Box x={x} y={140} w={300} h={300} r={10} fill={pal.panel} />
              <Arrow x1={x + 340} y1={v0Top ? 140 : 440} x2={x + 340} y2={v0Top ? 450 : 130} strokeWidth={6} seed={60 + i} />
              <Label x={x + 340} y={v0Top ? 490 : 110}>v</Label>
              <circle cx={x} cy={v0Top ? 140 : 440} r={11} fill={pal.hero} stroke={pal.outline} strokeWidth={4} />
              <Label x={x - 20} y={v0Top ? 150 : 450} size={26} anchor="end">{s.v0}</Label>
              {/* The same picture: upright in the image, upside down in the texture (a vertical flip only). */}
              <g transform={`translate(0 ${290}) scale(1 ${i ? 1 - 2 * flip : 1}) translate(0 ${-290})`}>
                <Inko x={x + 150} y={270} scale={0.55} seed={10} />
              </g>
            </Pop>
          ))}
        </>
      ) : null}
    </Stage>
  );
}

import { progress } from "../../kit/easing";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box, Shape } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

// The hook's three chips come back with one-liners, then the two classic
// slips, then the pointer to the lesson's demo.
const ROW_Y = [130, 250, 370];

export function Recap() {
  const pal = usePalette();
  const rows = [useCue("recap"), useCue("uv"), useCue("ndc")];
  const slipsAt = [useCue("half"), useCue("flipy")];
  const demo = useCue("demo");
  const names = [useString("chipPixels"), useString("chipUv"), useString("chipNdc")];
  const lines = [useString("linePixels"), useString("lineUv"), useString("lineNdc")];
  const slips = [useString("mistakeHalf"), useString("mistakeFlip")];
  const explorer = useString("demo");
  return (
    <Stage>
      <Inko x={230} y={380} scale={0.9} pose="cheer" reach={progress(demo, 14)} seed={13} lookAt={{ x: 800, y: 300 }} />
      <FadeOut t={demo}>
        {rows.map((t, i) => (
          <Pop key={i} t={t} x={800} y={ROW_Y[i]!}>
            <Box x={420} y={ROW_Y[i]! - 46} w={780} h={92} r={46} fill={pal.panel} />
            <Label x={600} y={ROW_Y[i]! + 12} size={34} halo={pal.panel}>{names[i]}</Label>
            <Label x={960} y={ROW_Y[i]! + 11} size={28} color={pal.textMuted} halo={pal.panel}>{lines[i]}</Label>
          </Pop>
        ))}
        {slips.map((text, i) => (
          <Pop key={text} t={slipsAt[i]!} x={660 + i * 280} y={500}>
            <Box x={560 + i * 280} y={462} w={200} h={76} r={38} fill={pal.panel} stroke={pal.warn} strokeWidth={6} />
            <Label x={660 + i * 280} y={512} size={34} halo={pal.panel}>{text}</Label>
          </Pop>
        ))}
      </FadeOut>
      {demo >= 10 ? (
        <Pop t={demo - 10} x={820} y={300}>
          <Box x={520} y={200} w={640} h={200} r={36} fill={pal.panel} stroke={pal.hero} strokeWidth={7} />
          <Shape d="M 580 262 L 580 338 L 646 300 Z" fill={pal.hero} strokeWidth={5} />
          <Label x={895} y={314} size={42} halo={pal.panel}>{explorer}</Label>
        </Pop>
      ) : null}
    </Stage>
  );
}

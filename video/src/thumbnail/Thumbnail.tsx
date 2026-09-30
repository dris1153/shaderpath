import { AbsoluteFill, Img, staticFile } from "remotion";
import { PAPER, ThemeContext } from "../kit/palette";
import { Box } from "../kit/shapes";
import { H, W } from "../kit/stage";
import { Code, Title } from "../kit/text";
import { Inko } from "../mascot/Inko";

export type ThumbnailProps = {
  // Path under public/, e.g. a generated background; the paper colour without one.
  background?: string;
  lines: string[];
  code?: string;
};

// A YouTube thumbnail: title lines stacked on the left, Inko on the right
// pointing at them, over an optional background. One thumbnail serves every
// audio track, so keep the words language-neutral (symbols, terms, math).
export function Thumbnail({ background, lines, code }: ThumbnailProps) {
  const pal = PAPER;
  const colors = [pal.text, pal.sky, pal.hero];
  // The block sits low-left: generated backgrounds keep their decorations in the corners.
  const top = 240 - (lines.length > 3 ? 120 : 0);
  return (
    <ThemeContext.Provider value={pal}>
      <AbsoluteFill style={{ backgroundColor: pal.bg }}>
        {background ? <Img src={staticFile(background)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {lines.map((line, i) => (
            <Title key={i} x={70} y={top + 48 + i * 124} size={124} anchor="start" weight={800}
              color={colors[i % colors.length]} halo="#FFFFFF">
              {line}
            </Title>
          ))}
          {code ? (
            <g>
              <Box x={70} y={top + 48 + lines.length * 124 - 64} w={code.length * 22 + 60} h={76} r={20} fill={pal.panel} strokeWidth={6} />
              <Code x={100} y={top + 48 + lines.length * 124 - 14} size={36}>{code}</Code>
            </g>
          ) : null}
          <Inko x={1010} y={400} scale={2} pose="point" pointAt={{ x: 690, y: 400 }} lookAt={{ x: 560, y: 300 }} seed={3} />
        </svg>
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
}

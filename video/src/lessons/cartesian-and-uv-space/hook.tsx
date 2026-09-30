import { Callout, PixelGrid } from "../../kit/diagram";
import { progress } from "../../kit/easing";
import { FadeOut, Pop } from "../../kit/motion";
import { usePalette } from "../../kit/palette";
import { Box } from "../../kit/shapes";
import { Stage } from "../../kit/stage";
import { Label, useString } from "../../kit/text";
import { Inko } from "../../mascot/Inko";
import { useCue } from "../../scene/cue";

const GRID = { x: 560, y: 130, cols: 8, rows: 5, cell: 60 };
const TARGET = { c: 5, r: 2 };
const INKO = { x: 300, y: 400 };
const CELL = { x: GRID.x + (TARGET.c + 0.5) * GRID.cell, y: GRID.y + (TARGET.r + 0.5) * GRID.cell };
const CHIP_Y = [220, 340, 460];
// Inko points toward the far cell without stretching a tentacle all the way there.
const d = Math.hypot(CELL.x - INKO.x, CELL.y - INKO.y);
const POINT_AT = { x: INKO.x + ((CELL.x - INKO.x) / d) * 260, y: INKO.y + ((CELL.y - INKO.y) / d) * 260 };

export function Hook() {
  const pal = usePalette();
  const t = useCue("in");
  const grid = useCue("grid");
  const where = useCue("where");
  const address = useCue("address");
  const chips = [useCue("pixels"), useCue("uv"), useCue("ndc")];
  const labels = [useString("chipPixels"), useString("chipUv"), useString("chipNdc")];
  // Point while the address matters; grid and callout stay until the first chip.
  const reach = progress(where, 14) * (1 - progress(chips[0]!, 14));
  return (
    <Stage>
      <Pop t={t} x={INKO.x} y={INKO.y}>
        <Inko x={INKO.x} y={INKO.y} scale={1.15} pose="point" pointAt={POINT_AT} reach={reach}
          lookAt={chips[0]! >= 0 ? { x: 840, y: 340 } : grid >= 0 ? CELL : { x: 840, y: 300 }} />
      </Pop>
      <FadeOut t={chips[0]!}>
        <PixelGrid t={grid} {...GRID}
          fillAt={(c, r) => (where >= 0 && c === TARGET.c && r === TARGET.r ? pal.hero : null)} />
        <Callout t={address} x={CELL.x - 110} y={GRID.y + GRID.rows * GRID.cell + 40} w={220} h={84}
          tx={CELL.x} ty={CELL.y} text={useString("address")} size={40} />
      </FadeOut>
      {chips.map((c, i) => (
        <Pop key={i} t={c} x={840} y={CHIP_Y[i]!}>
          <Box x={620} y={CHIP_Y[i]! - 44} w={440} h={88} r={44} fill={pal.panel} />
          <Label x={840} y={CHIP_Y[i]! + 13} size={40} halo={pal.panel}>
            {labels[i]}
          </Label>
        </Pop>
      ))}
    </Stage>
  );
}

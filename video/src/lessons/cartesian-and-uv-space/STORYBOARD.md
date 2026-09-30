# Storyboard: Cartesian and UV Space

The voice is Jessica on ElevenLabs, and the video runs 4:12. Cues come from
`content/lessons/00-math/cartesian-and-uv-space/video/script.en.md`.

Every scene keeps Inko on stage, which provides the ambient motion. On-screen
text comes from `strings.en.json` and stays language-neutral (symbols, formulas,
short English labels), because every language shares this one picture.

## 1. hook
The hero is the pixel grid, then the one addressed pixel.
- `in`: Inko pops in on the left.
- `grid`: an 8×5 `PixelGrid` pops in cell by cell on the right.
- `where`: Inko points toward cell (5, 2), which fills with `hero`.
- `address`: a callout under the grid reads `(5, 2)`.
- `pixels` / `uv` / `ndc`: the grid and callout fade out. Three chips pop in, one per word: "pixel coordinates", "UV", "NDC".

## 2. axes
The hero is the axes as they grow from 1D to 3D.
- `line`: a number line draws in, with ticks from −3 to 3. A small Inko sits bottom-left.
- `plane`: the y axis grows from the origin.
- `walk`: a dot walks 2 steps along x, then 1 step up, and lands on `(2, 1)` with dashed guides.
- `space`: a z axis draws toward the viewer (down-left).
- `assume`: a right-angle mark appears, the ticks pulse in turn (evenly spaced), and Inko switches to `think`.

## 3. conventions
- `in`: two empty panels pop in, with Inko hosting between them.
- `yup`: the left panel gets a y-up triad, "three.js · glTF". Inko looks left.
- `zup`: the right panel gets a z-up triad, "Blender", with a mini Inko standing. Inko looks right.
- `lies`: a mini Inko in the left panel tips over along z, and the host is `surprised`.
- `hand`: the panels fade. A right-handed triad appears, with Inko at its origin and tentacles reaching x, y and z.
  - `curl`: an arc sweeps from x to y.
  - `thumb`: z turns `hero`.
- `left`: a left-handed triad appears (z into the screen, `accent`).
- `canvas`: a math frame (y up) sits beside a canvas frame (origin top-left, y down). A small Inko watches.

## 4. uv
- `square`: two checker textures, "16 px" and "8192 px".
- `corners`: those fade, and the unit square pops in with its u and v arrows and the `(0, 0)` and `(1, 1)` corners.
- `why`: the `texture(tex, uv)` card.
- `swap`: a finer checker pops in over the square, and the card gets a ✓ (drawn as a path).
- `origin`: two squares, "image" (v = 0 at the top) and "WebGL texture" (v = 0 at the bottom). Each holds a mini Inko.
- `flipped`: the texture's Inko flips top to bottom.

## 5. pixel-to-uv
- `grid`: a 4×2 grid with column and row indices, and Inko underneath.
- `square`: cell (1, 0) gets a `hero` outline and an accent bar on its left edge. The card `x = 1` appears.
- `center`: a dot slides to the cell centre. The card `x + 0.5 = 1.5` appears.
- `formula`: the card `u = (x + 0.5) / W`, with an accent border.
- `paint`: Inko's eight tentacles reach every cell. **All eight fill at the same moment** (parallel), each showing its u above the tentacles. Then the tentacles retract.
- `shader`: a wide card, `gl_FragCoord.xy / uResolution`.

## 6. ndc
- `range`: a ruler from −1 to 1, with a [0, 1] bar.
- `wide`: the bar stretches and shifts to [−1, 1].
- `sign`: the halves turn `sky` (−) and `accent` (+).
- `stretch`: the card `x = 2u − 1`.
- `wrong`: a dashed `u − 0.5` bar covers only the middle half, with a ✗ (a path) in `warn`. Inko is `surprised`.
- `flip`: the card `y = 1 − 2v`, with v pointing down and y pointing up (`hero`).

## 7. recap
- `recap` / `uv` / `ndc`: three pills, each with a one-liner.
- `half` / `flipy`: the two slip chips, "+0.5" and "flip y", in `warn`.
- `demo`: the pills fade. Inko cheers, and a "UV Space Explorer" card appears.

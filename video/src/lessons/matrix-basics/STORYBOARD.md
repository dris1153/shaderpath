# Storyboard: Matrix Basics

The voice is Jessica on ElevenLabs, and the lesson runs 4:57 (the shared outro is
joined at packaging). Cues come from
`content/lessons/00-math/matrix-basics/video/script.en.md`.

Every scene keeps Inko on stage for ambient motion. On-screen text comes from
`strings.en.json` and stays language-neutral. Diagrams use the kit `Grid` +
`Vector` (world units, y up); `parts.tsx` adds the 2×2 helpers: `Mat` (columns
(a, c) and (b, d)), a transformed grid, the unit square, a matrix card with
tinted columns and the slime sprite under a matrix. Colours: `hero` for î,
`sky` for ĵ (the site demo's red and blue), `accent` for the vector being
transformed and the unit square, `warn` / `ok` for wrong / right. Matrix
products on screen use `*` (`R * S * v`), never `·` or `×`.

## 1. hook
The hero is the pair of transformed slimes. Inko hosts at the left edge.
- `in`: one slime pops in at the centre; Inko looks at it.
- `stretch`: the chip `S` / `x → 2x` pops in on the top left. `turn`: the chip `R` / `90°` on the top right.
- `left`: the slime splits in two. The left copy stretches ×2 along x, then turns 90°: it stands tall. The card `S → R` sits under it.
- `right`: the right copy turns first, then stretches: it lies wide. `R → S` under it.
- `same`: both slimes squash once; Inko is `surprised`.
- `question`: each chip turns into its matrix card (`2, 0; 0, 1` and `0, −1; 1, 0`). `answer`: the two order cards light up (`accent`); Inko `think`.

## 2. machine
The hero is the transformed grid. Host Inko at the left.
- `machine`: a machine box with `M` on it pops in at the centre. `feed`: the arrow v slides into its left slot, and `M{v}`, a longer, turned arrow, comes out on the right.
- `grid`: the machine shrinks into a badge on the top left; the grid and axes fade in, and the whole plane slides into the matrix's shape (unit square → parallelogram). From here the plane breathes slowly between identity and the matrix (the continuing verb).
- `straight` / `parallel`: two horizontal grid lines turn `accent` and stay straight and parallel as the plane breathes; labels `straight`, `parallel`.
- `origin`: a `hero` dot with a dashed ring at the origin, `origin`.
- `linear`: the title `linear` pops in above; the plane stops breathing and rests on the matrix.
- Two rule breakers on the same grid (no side panel), each undone before the next:
  - `bend`: the whole grid bulges like a fisheye lens, the `straight` line bows, `fisheye` top left. `bendx`: ✗ on the curve. The bulge relaxes just before `slide`.
  - `slide`: the plane slides; the dashed ring stays at the old origin, the dot moves with the plane, a dashed arrow joins them. `slidex`: the chip `2x2` with ✗. 70 frames later the plane slides home for the calm tail.

## 3. columns
Grid on the left, the matrix card on the right, host Inko bottom right.
- `even`: the grid and axes. `i`: î (`hero`) grows with `(1, 0)`. `j`: ĵ (`sky`) with `(0, 1)`.
- `land`: î and ĵ swing to new tips and the whole grid follows them (unit square → parallelogram), then holds.
- `columns`: the card `a, b; c, d` pops in; the grid eases back to identity. `col1`: column 1 tints `hero`, with î above it. `col2`: column 2 tints `sky`, with ĵ.
- `example`: the card becomes `2, 0; 0, 1`; column 1 pulses. `double`: î grows to (2, 0) and the grid stretches along x; `(2, 0)` at the tip.
- `second`: column 2 pulses. `stay`: a ring around ĵ's tip.
- `read`: the chip `x → 2x` under the card. `rows`: a `ok` column band with ✓ (`columns`) and a `warn` row band with ✗ (`rows`).

## 4. multiply
Stretched grid on the left (x to 6), card and sums on the right.
- `how`: grid, axes, the card `2, 0; 0, 1`; a small Inko waits at (5, 0). `mix`: î and ĵ at the origin.
- `v`: `{v} = (3, 4)` and v (`accent`); Inko walks to the origin, then three î steps along x and four ĵ up: a staircase to (3, 4). `3î + 4ĵ`.
- `keep`: the plane stretches by the matrix; the staircase stretches with it, v fades to a dashed ghost; the card's columns pulse in turn.
- `c1`: the three (2, 0) steps light up; Inko hops back and walks them; `3 * (2, 0)` on "Take three of it". `c2`: Inko climbs the four (0, 1) steps; `+ 4 * (0, 1)` on "Take four of it".
- `result`: `M{v}` (`accent`, drawn over Inko) grows to (6, 4); `= (6, 4)`; Inko cheers.
- `recipe`: the chip `(a * x + b * y, c * x + d * y)` with an `ok` border. `why`: the card's columns pulse.

## 5. rotate
Unit circle on the left (θ = 30° for the general case), card on the right.
- `build`: grid and axes; an `F` shape (`accent`) in the third quadrant, clear of î, ĵ and their labels. `turn`: the plane and the F turn by θ with the arc `θ`.
- `i`: the plane eases back; î at (1, 0), the unit circle draws. `iturn`: î turns to θ along the circle; dashed guides drop to the axes; `(cos θ, sin θ)`. `col1`: the rotation card with only column 1 filled.
- `j`: ĵ at (0, 1) with the arc `90°`. `jends`: ĵ turns on to 90° + θ, `90° + θ`; `jlands`: the label becomes `(−sin θ, cos θ)`. `col2`: column 2 fills in.
- `check`: the plane, the F and both arrows turn to 90° (by angle, so nothing shrinks); the card becomes `0, −1; 1, 0`, its columns filling on `iup` (`(0, 1)` at î) and `jleft` (`(−1, 0)` at ĵ).
- `trap`: the card becomes `0, 1; 1, 0` and the chip `(sin θ, cos θ)` (`warn` border, ✗). From "and the two axes", the plane slides into the swap: ĵ (now dashed) follows it through zero to (1, 0). `mirror`: a ✗ over the mirrored F; Inko is `surprised`.

## 6. scale-shear
One grid, the card on the right.
- `scale`: the card `sx, 0; 0, sy`. `sx`: column 1 tints, î stretches to 1.6. `sy`: column 2 tints, ĵ shrinks to 0.7. `own`: the two scales breathe out of phase; the rectangle follows.
- `shear`: the plane eases back; the card becomes `1, k; 0, 1`, column 1 filling on `istay` and column 2 on `jslide`. `istay`: a ring on î. `jslide`: ĵ slides to (k, 1) as k grows to 0.8, `(k, 1)`. `lean`: the unit square leans; its base turns `ok`.
- `looks`: a dashed rotated square overlays; the î/ĵ labels go. `keeps`: its bottom and right edges get `1`. `grows`: an `accent` line along the sheared edge and `√{k² + 1}` on its free side; k sways a little, then settles.

## 7. order
- `back`: the two slimes return with `S → R` and `R → S`.
- `chain`: a right-to-left arrow draws across the top. `closest`: `{v}` appears with an empty dashed slot beside it, badge `1`.
- `written` ("is written"): `R * S * {v}` fills in over the arrow; R gets `2`; the left card becomes `R * S`, the right `S * R`.
- `trap`: a dashed left-to-right `warn` arrow with ✗ over the formula.
- `watch`: the slimes fade; two small grids, each with î (`hero`) and the unit square.
- `rs`: left: î stretches to (2, 0), `(2, 0)`. `rs2`: then turns to (0, 2); the square ends tall.
- `sr`: right: î turns to (0, 1), `(0, 1)`. `cant`: the x-stretch arrows pull, î does not move; the square ends wide.
- `bug`: the muted chip `0 errors`; Inko `surprised`. `fix`: the formula comes back and S's badge `1` pulses; Inko looks at it.

## 8. recap
Pills on the right, Inko on the left.
- `recap`: `M{v}`. `linear`: `linear` (`ok` border). `cols`: the card `a, b; c, d` with tinted columns. `mul`: `x * (a, c) + y * (b, d)`.
- `kinds`: three small cards (rotation, scale, shear). `order`: `R * S * {v}` (`warn` border).
- `bigger`: `3x3 / 4x4`. `next`: a small box slides along an arrow beside it (translation, next lesson).
- `demo`: the pills fade; Inko cheers; the card "2x2 Matrix / Reading by Columns" with a slider marked `b`.

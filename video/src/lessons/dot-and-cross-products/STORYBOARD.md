# Storyboard: Dot, Cross & Normalize

The voice is Jessica on ElevenLabs, and the lesson runs 5:05 before the shared
outro (14 s). Cues come from
`content/lessons/00-math/dot-and-cross-products/video/script.en.md`.

Every scene keeps Inko on stage for ambient motion. On-screen text comes from
`strings.en.json` and stays language-neutral (symbols, formulas, short English
labels). Colours: `sky` for a, `accent` for b and the guard's facing, `hero` for
the result under discussion; signs use `ok` (+), `textMuted` (0) and `warn` (−).
2D diagrams use `Grid` + `Vector`; 3D uses `kit/iso.tsx` (y up, x right-down,
z left-down).

## 1. hook
A top-down hallway (faint floor grid). The slime guard faces right.
- `in`: the floor fades in; the guard pops in; Inko waits top-left, behind it.
- `cone`: a 60° `accent` vision cone sweeps out of the guard's eye and scans ±10°.
- `sneak`: Inko walks down behind the guard. `front`: Inko walks into the cone, ~19° below the facing.
- `spotted`: the cone turns `hero`, the guard freezes facing straight ahead, "!" pops, Inko is `surprised`.
- `question`: a ghost Inko appears where Inko was; arrows grow from the eye: the facing f (`accent`), to Inko (`hero`), to the ghost (dashed). "?" pops.
- `answer`: the hallway dims; "a · b" pops. `partner`: it slides left and "a × b" (muted) joins it.

## 2. multiply-add
a = (3, 1) in `sky`, b = (2, 2) in `accent` on a grid with axes (left); the column on the right.
- `number`: the grid and the arrows; "a · b" pops. `pairs`: `a · b = a.x·b.x + a.y·b.y`.
- `example`: the tuples pop at the tips.
- `xs`: the x legs light up under the axis; row `3 · 2 = 6`. `ys`: the y legs; row `1 · 2 = 2`.
- `sum`: a rule draws; `6 + 2 = 8` in `hero`.
- `threeD`: `+ a.z·b.z` (muted) joins the formula. `code`: the card `dot(a, b) = …`.
- `order`: the chip `a · b = b · a` (`ok` border); Inko cheers.

## 3. angle
a and b as plain arrows from one point; formulas stack on the right.
- `meaning`: the arrows grow; `a · b = 8`. `formula`: it is replaced by `a · b = |a| |b| cos θ`; the θ arc draws.
- `unit`: both arrows shrink onto the unit circle (labelled 1). `cos`: `a · b = cos θ` in `hero`.
- `sweep`: the readout card (θ, cos θ) pops; b swings onto a: `front` lands at 0° (1.00) and the chip `> 0`.
- `side`: b at 90° (0.00, grey), chip `= 0`. `behind`: b at 180° (−1.00, `warn`), chip `< 0`. The arc and the card's bar take the sign's colour.
- `sign`: the three chips pulse in turn. `noTrig`: `acos(x)` with a `warn` strike; Inko cheers.

## 4. vision
The guard at the origin of a grid (110 px per unit) faces +x; every number is computed from Inko's position.
- `back`: the grid, the guard and Inko at (3, −0.8). `facing`: f = (2, 0) in `accent`. `toPlayer`: d to Inko in `hero`, labelled `d = player − guard`.
- `norm`: f and d shrink to unit length on the unit circle; a dashed line keeps pointing at Inko; the chip `normalize(d)` (`ok`).
- `dot`: the card `f · d =` (live) and the θ arc. `cone`: the 60° cone, its 30° half-arc and "60°" (the d label leaves).
- `compare`: `cos 30° ≈ 0.87` joins the card; Inko steps out of the cone (0.78, `warn`, cone back to `accent`) and back in (0.97, `ok`, cone `hero`).
- `trap`: the chip gets a `warn` strike and d grows back to full length. `far`: Inko walks far and outside the cone; the raw dot reads 3.15 and the cone lights up (wrong). `near`: Inko close, in front; 0.78, not seen (wrong).
- `fix`: the strike lifts, d is unit again: 0.93, seen.

## 5. projection
a and b from one point (130 px per unit), b's whole line dashed; Inko sits at the origin from the start.
- `shadow`: a (`sky`) and b (`accent`). `drop`: the dashed perpendicular from a's tip with a right-angle mark. `length`: the shadow segment and `a · b̂` (hat drawn as a path).
- `speed`: the guard pops at the end of b's line; a's label becomes v; the shadow's label becomes its value. `toward`: v turns toward the guard (2.3, `ok`). `away`: v turns back (−1.5, `warn`); Inko is surprised.
- `longer`: b stretches; the shadow (−1.5) does not move.

## 6. cross
Isometric floor (x 0–4, z 0–3) and axes; a and b start at P = (1.6, 0, 0.6), off the axes.
- `threeD`: the floor and the axes. `cross`: a (`sky`) and b (`accent`) grow along the floor.
- `perp`: a × b rises straight up (`hero`) with right-angle marks to a and b.
- `two`: a dashed downward twin with "?". `hand`: an `ok` curl arc from a to b just above the floor. `thumb`: a × b swells; the twin fades.
- `axes`: the picture dims; x (`sky`), y (`accent`) and z (`hero`) trace over the axes; the chip `x × y = z`.
- `swap`: the curl runs back (dashed `warn`), b × a grows downward in `warn` while a × b steps back; the chip `b × a = −(a × b)`. `unlike`: the chip `a · b = b · a` (`ok`); Inko thinks.

## 7. normal
Triangle ABC on the iso floor; (B − A) × (C − A) points up, so A → B → C is counter-clockwise on screen.
- `out`: the triangle pops with a short normal. `corners`: A, B, C pop (the hint normal leaves). `ab` / `ac`: the edges `B − A` (`sky`) and `C − A` (`accent`).
- `crossEdges`: their cross rises from A, long. `normalize`: it shrinks to length 1, labelled N; the chip `normalize((B − A) × (C − A))`.
- `area`: the arrow grows back to the raw cross (its length is the area) and the parallelogram fills in `accent`; the chip `|a × b| = area`. `half`: the triangle darkens: half of it.
- `zero`: the `NaN` chip, then C slides onto AB; the triangle and the raw cross collapse to zero.
- (before `winding`) C returns and the arrow is normalized again.
- `winding`: C returns; `ok` arrows run A → B → C inside the triangle. `ccw`: the chip with a drawn counter-clockwise arrow and `front`.
- `flipped`: B and C trade places, the arrows reverse in `warn`, and N turns through the floor; Inko is surprised.

## 8. light
A ball lit by a far light in the picture plane: `max(0, N · L)` gives straight bands, and the far half is dark.
- `both`: "a · b" and "a × b". `sphere`: the ball and the lamp. `nl`: a rim point with N (`hero`) and L (`sky`).
- `lambert`: the card `max(0, N · L)`, the live `N · L =` and a 0–1 brightness meter.
- `facing`: the point turns to the light (1.00, full meter). `edge`: 90° (0.00, empty). `away`: round the bottom to 150° (−0.87, `warn`). `clamp`: a `warn` ring at the meter's zero end.
- `cull`: the point leaves, the lamp dims, a camera appears and the ball shows its facets with normals. `skip`: facets facing away from the camera fade and dash, the front ones turn `ok`; the chip `backface culling`; Inko cheers.

## 9. recap
Inko on the left; pills on the right.
- `dot` `a · b = a.x·b.x + a.y·b.y`; `sign` the three sign pills; `cos` `a · b = cos θ`; `cross` `a × b`; `order` `b × a = −(a × b)`; `normal` `normalize((B − A) × (C − A))`; `light` `max(0, N · L)`.
- `demo`: the pills fade; the card "Dot Product & Projection"; Inko cheers.

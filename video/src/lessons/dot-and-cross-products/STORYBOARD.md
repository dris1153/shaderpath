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

## 4. vision (phase 5)
The hook's hallway again, with the arrows: `facing` f, `toPlayer` `player − guard`, `norm` both shrink to unit length, `dot` the readout, `cone` the 60° wedge and 30° half-angle, `compare` `cos 30° ≈ 0.87` against the live dot. `trap`: skip normalize; `far` a distant Inko outside the cone reads above 0.87 (wrongly seen); `near` a close Inko in front reads below it. `fix`: normalize again, both answers right.

## 5. projection (phase 5)
a and b from one point. `drop`: a dashed perpendicular from a's tip onto b's line; `length` the shadow segment and `a · b̂` (the hat drawn as a path). `speed`: Inko's velocity and the direction to the guard; `toward` the shadow as closing speed; `away` it flips negative. `longer`: b stretches, the shadow stays put.

## 6. cross
Isometric floor (x 0–4, z 0–3) and axes; a and b start at P = (1.6, 0, 0.6), off the axes.
- `threeD`: the floor and the axes. `cross`: a (`sky`) and b (`accent`) grow along the floor.
- `perp`: a × b rises straight up (`hero`) with right-angle marks to a and b.
- (phase 5) `two`: a dashed downward twin. `hand`/`thumb`: Inko's tentacle curls from a to b and its tip rises along a × b. `axes`: x × y = z on the axes. `swap`: b × a points down; `unlike` the chip `b × a = −(a × b)`.

## 7. normal (phase 5)
An iso triangle ABC. `ab`/`ac` the two edges from A, `crossEdges` their cross, `normalize` it shrinks to unit length. `area` the parallelogram, `half` the triangle shades half, `zero` the edges fold flat and the normal becomes NaN. `winding` corner arrows; `ccw` front face; `flipped` swapping B and C flips the normal inside.

## 8. light (phase 5)
A shaded ball (2D disc with normals on its rim) and a lamp. `nl` N and L at one point; `lambert` `max(0, N · L)`; `facing`/`edge`/`away` the point moves round the rim with the value; `clamp` negatives read 0. `cull`/`skip`: triangles facing away from a camera fade out.

## 9. recap (phase 5)
Pills: `dot` `a · b = a.x·b.x + …`, `sign` the three sign chips, `cos` `a · b = cos θ`, `cross` `a × b`, `order` `b × a = −(a × b)`, `normal` `normalize((B − A) × (C − A))`, `light` `max(0, N · L)`. `demo`: the card "Dot Product & Projection"; Inko cheers.

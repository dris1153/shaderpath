# Storyboard: Vector Basics

The voice is Jessica on ElevenLabs, and the video runs 5:04. Cues come from
`content/lessons/00-math/vector-basics/video/script.en.md`.

Every scene keeps Inko on stage for ambient motion. On-screen text comes from
`strings.en.json` and stays language-neutral (keys, tuples, symbols, short
English labels), because every language shares this one picture. Diagrams use
the kit `Grid` + `Vector` (world units, y up). Colours: `hero` for the vector
being discussed, `sky` for a, `accent` for b and highlights.

## 1. hook
The hero is the gap between the two walks. Each start has a `sky` ring of radius
one "speed setting".
- `in`: both rings draw; two small Inkos pop in at the ring centres.
- `straight`: a D key pops in above the left ring and is held while the left Inko walks (1, 0) and lands on its ring.
- `diagonal`: W and D are held while the right Inko walks (1, 1) for the same time and ends √2 out, past its ring.
- `gap`: the overshoot past the ring lights up as a `hero` band, and the right Inko is `surprised`. `pct`: "+41%" pops in.
- `answer`: the dashed trails become arrows (`accent`, `hero`), the keys fade, and "vectors" pops in. Both Inkos look at it.

## 2. what
The hero is one arrow v = (3, 2) on a grid. The host Inko sits at the left edge.
- `arrow`: the grid fades in; a dot makes the move, leaving a dashed trail.
- `draw`: the arrow grows over the trail, labelled v.
- `size`: a length bracket draws along its right side.
- `head`: a ring pops around the arrowhead.
- `slide`: the arrow slides twice, leaving faded copies (all labelled v).
- `tuple`: the copies fade; the axes grow; the card `v = (3, 2)` pops in.
- `origin`: the arrow slides to the origin; dashed guides and the ticks 3 and 2 appear.
- `point`: an `accent` point (3, 2) pops in on the tip.
- `move`: the arrow slides away; the point stays.
- `zero`: the point and guides fade; the arrow shrinks to a dot with a dashed ring, "(0, 0)".
- `remember`: Inko switches to `think`.

## 3. add
The hero is the sum arrow. a = (3, 1) in `sky`, b = (−2, 4) in `accent`.
- `walk`: the grid and axes fade in; a small Inko stands at the origin.
- `a`: Inko walks a, and the arrow a grows with it.
- `then`: Inko walks b from a's tip, and b grows with it.
- `sum`: the `hero` arrow a + b grows from the origin to (1, 5).
- `swap`: dashed b, then dashed a, draw the other order to the same tip.
- `para`: the parallelogram fills in faint `accent`; the sum arrow swells once.
- `numbers`: a card pops in; `first` (3, 1), `second` + (−2, 4), `result` = (1, 5) under a rule.

## 4. subtract
The hero is the arrow between the slime (`enemy`) and Inko (`player`) on a bare grid.
- `chase`: the grid, the slime on the left and Inko on the right, each labelled.
- `formula`: the chip `player − enemy`.
- `arrow`: the arrow grows from the slime to Inko.
- `follow`: the slime hops along it part way; the arrow stays live (Inko minus the slime).
- `flip`: the chip turns `enemy − player` (`warn`); the arrow shrinks through zero and points away.
- `runs`: the slime turns, scared, and hops most of the way along it, short of the head; the arrow fades a little. Inko is `surprised`.
- `silent`: a ✓ (path) draws beside the wrong chip: the code still runs.
- `always`: the chip is `player − enemy` again (`ok`); a new arrow points the slime back at Inko and it turns round.

## 5. scale
One arrow on a grid with axes; the host Inko is at the left.
- `scale`: v = (2, 1) grows.
- `stretch` / `shrink` / `flip`: k goes 1 → 2 → 0.5 → −1 along the dashed line through v, with a dashed ghost of v; the label follows (2v, 0.5v, −v).
- `example`: (4, −2) in `sky` and the card `(4, −2) × −1.5`; `gives`: (−6, 3) grows and `= (−6, 3)` fades in.
- `engine`: the chips `add(a, b)`, `sub(a, b)`, `scale(v, k)`; Inko cheers.

## 6. length
v = (3, 4) on a grid; the card is on the right.
- `triangle`: v grows. `legs`: the x leg (`accent`) and y leg (`sky`), a right-angle mark, labels x and y.
- `formula`: the card `|v| = √(x² + y²)`. `example`: `√(9 + 16)`; the legs read 3 and 4. `five`: `= √25 = 5`.
- `threeD`: a muted line `3D: √(x² + y² + z²)`.
- `compare`: the card `a.lengthSq() < b.lengthSq()` (`ok`). `cheap`: a big √ with a `warn` slash.

## 7. normalize
Three parts, each cleared before the next.
- **Unit:** `divide`: v = (3, 4) and the card `v / |v|`. `unit`: v shrinks to (0.6, 0.8), leaving a dashed ghost; `= (0.6, 0.8)`. `circle`: the unit circle draws; a dot on the tip.
- **Race:** `replay`: a unit arc from one start. `w` (0, 1), `d` (1, 0), `sum` (1, 1) tip to tail. `root`: the overshoot band and `√2 ≈ 1.41`. `fix`: `+41%`. `norm`: the sum shrinks onto the arc, both tips get an `ok` dot, and the card `normalize(v) * speed`.
- **Trap:** `zero`: Inko and the slime; the slime hops onto Inko. `pz`: the chip `player − enemy = (0, 0)`. `nan`: `(0, 0) / 0 = (NaN, NaN)` (`warn`). `poof`: "NaN" beside Inko. `vanish`: the slime shrinks into a dust burst. `noError`: a muted `0 errors`. `check`: the cards clear, `if (len > 0) v = v / len;` (`ok`), and the slime is back.

## 8. roles
Three chips on top (`position`, `direction`, `velocity`); the active one has a `hero` border.
- `position`: axes; a dashed arrow from the origin to the point (3, 3).
- `direction`: a box with its top normal (0, 1). `box`: the box slides 6 units; the normal is still (0, 1).
- `velocity`: a small Inko walks with its velocity arrow v (1 unit/s). `twice`: the arrow grows to 2v and the speed doubles.
- `loop`: Inko starts again with a 2-unit arrow labelled velocity. `code`: the card `position += velocity * dt`; Inko steps once per tick, leaving dots. `names`: `+=` and `* dt` get underlines and the words add and scale.

## 9. recap
- `recap`: the pill `v = (x, y)` with an arrow icon.
- `add` / `sub` / `scale` / `length` / `unit`: one pill each (`a + b`, `player − enemy`, `k · v`, `√(x² + y²)`, `v / |v|`).
- `speed` / `order` / `zeroTrap`: the traps in `warn` (`+41%`, `enemy − player`, `NaN`).
- `demo`: the pills fade; Inko cheers; the card "Vector Addition / Tip-to-Tail".

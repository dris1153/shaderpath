# Storyboard: Homogeneous Coordinates

The voice is Jessica on ElevenLabs, and the lesson runs 4:38 (the shared outro is joined at
packaging). Cues come from `content/lessons/00-math/homogeneous-coordinates-4x4/video/script.en.md`.

Same look as `matrix-basics`: cream paper, kit `Grid`/`Vector`, the matrix card with tinted
columns, the slime as the game object, Inko hosting. Colours: `hero` for the point / the thing
that moves, `sky` for directions (the site demo's blue arrows), `accent` for the move t and the
w = 1 plane, `ok` / `warn` with ✓ / ✗ paths for right / wrong (never colour alone: `warn` is the
same red as `hero`). Products use `*`; vectors get arrows (`{t}`, `{0}`, `{n}`); code stays plain.

## 1. hook
Top-down game grid, the slime on the origin, host Inko at the left.
- `in`: grid and axes; the slime pops in on the origin. A small stretch, turn and shear on their words, back to rest by `try`.
- `try`: a dashed ghost slime at (5, 0) and a dashed arrow to it, chip `+ (5, 0)`.
- `push`: the plane runs through a stretch, a turn and a shear; every grid line moves except the origin. `stuck`: the slime only wobbles in place; Inko is `surprised`.
- `why`: chip `M * {0} = {0}`; a ring pulses on the origin, over the slime.
- `needs`: the arrow from the origin to the ghost; `{t}` on "by a vector, t"; chip `{0} → {t}` on "send the origin to t".
- `none`: a 3x3 card full of `?` with a ✗ beside it.
- `fix`: a big `w` pops; the tail holds.

## 2. extra
Cards on the right, a small game grid on the left (it gets the payoff at `lands`).
- `add`: chip `(x, y, z)`. `tuple`: it becomes `(x, y, z, 1)`, the 1 in `accent`. `name`: label `homogeneous`.
- `grow`: the 4x4 card `a … tz; 0 0 0 1`. `block`: the top-left 3x3 tints `sky`. `column`: the last column tints `accent`, `{t}` above it. `row`: the bottom row gets a muted band; each entry flashes on its "zero … one".
- `mix`: on "mix the columns" the weights `x y z w` appear under the four columns as each column flashes. `weight`: `w` and the last column pulse; chip `+ {t}`.
- `example`: the card becomes T (`… 5; … −2; … 0; 0 0 0 1`), chip `{t} = (5, −2, 0)`. `point`: the slime sits at (1, 1) with `(1, 1, 1, 1)`; the weights crossfade to `1 1 1 1`. `lands`: it slides to (6, −1), `(6, −1, 1, 1)`.
- `chain`: three chips `move`, `rotate`, `scale` slide in beside the card.

## 3. lift
One fixed isometric view (kit `iso.tsx`), w pointing up.
- `see`: the floor grid (w = 0) and the axes. `down`: Inko thinks.
- `plane`: a second grid (`accent` tint) appears on the floor with a small slime, then rises to height 1 on "floats on the plane at height one", dashed posts joining floor points to plane points; `w = 1` on "height one".
- `shear`: the 3x3 card `1, 0, tx; 0, 1, ty; 0, 0, 1` pops; its last column tints on "last column". `top`: the plane slides by t; the posts lean (the shear); the slime rides along.
- `floor`: the floor stays put; its points get a dot, `w = 0`.
- `moves`: `{t}` drawn on the plane from the old spot toward the slime; the last column glows again on "a plain matrix made a translation"; tail hold.

## 4. switch
Back to the top-down grid with the T card.
- `switch`: chips `w = 1` / `point` and `w = 0` / `direction`. `point`: the slime (point) slides by t.
- `direction`: a `sky` arrow; the card's last column gets the weight 0 on "multiplied by zero" and fades on "vanishes".
- `same`: chip `(1, 1, 1, 0)` and the weights `1 1 1` as it is read. `unchanged`: `→ (1, 1, 1, 0)` with ✓.
- `game`: the slime slides across the map; `arrows`: its velocity arrow (label `velocity` fades in) rides along, never turning.
- `bug`: a dashed copy of the velocity with w = 1 picks up the slime's offset and tilts, ✗. `drift`: the slime walks off its old ray from the origin and the dashed copy swings from about 21° to 59° off.

## 5. normals
A ball (circle) with eight normals.
- `catch`: the circle and its normals (`sky`). `stretch`: it stretches ×2 along x into an ellipse.
- `wrong`: the normals crossfade to M's (dashed `hero`) and lean toward x; chip `M * {n}`; a tangent shows they are not perpendicular, ✗. `light`: a sun, a dashed ray to the surface, ✗.
- `fix`: the correct normals (`ok`), a right-angle mark, chip `transpose(inverse(M)) * {n}` with ✓.
- `hide`: the ellipse eases to a uniform scale and turns: both sets agree again; the tangent and the mark fade.

## 6. trs
- `build`: the 4x4 layout card. `blocks`: the corner and the last column tint; chip `T * R * S`.
- `read`: a right-to-left arrow under the chip. `scale` (badge 1 under S): the slime grows in place. `rotate` (2 under R): it turns in place. `move` (3 under T): it slides out to its spot.
- `swap`: chip `R * T` with ✗; a ghost slime fades in and moves out first. `orbit`: the ghost swings around the world origin on a dashed circle while the real slime spins in place.

## 7. divide
Side view: a camera on the left, its lens on the axis, depth to the right.
- `last`: big `w`. `never`: T, R, S slide in on their words, then chips `w = 1` and `w = 0`.
- `projection`: the side view and a depth axis; a `w` marker runs out along it and settles at depth 5. `divide`: chip `x / w`.
- `near`: a slime at depth 5, height 2; its ray from the lens hits the screen at 0.4; `2 / 5 = 0.4`.
- `far`: a slime at depth 10, same height; its ray hits at 0.2; `2 / 10 = 0.2`.
- `smaller`: the two projections side by side in a screen panel, one half the other; tail hold.

## 8. recap
Pills on the right, Inko on the left.
- `recap`: `M * {0} = {0}` then `(x, y, z, 1)`. `layout`: the 4x4 layout card; the corner tints on "rotation and scale", the last column on "the move".
- `points` / `dirs`: `w = 1: point`, `w = 0: direction`. `normals`: `transpose(inverse(M)) * {n}`.
- `order`: `T * R * S`. `div`: `x / w`. `next`: `P * V * M`.
- `demo`: the pills fade; Inko cheers; the demo card with a t slider and two blue arrows that stay still while red dots slide.

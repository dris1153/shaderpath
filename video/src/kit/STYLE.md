# Video style guide

Approved at the style-frame checkpoint (2026-09-30):
- palette **paper**;
- **clean** lines, with **sketch** kept for annotations;
- Inko as rendered in `lessons/style`;
- display face **Baloo 2**. It replaced Fredoka, which has no Vietnamese.

Re-render `pnpm render style en` after any change to the kit or the mascot.

**Canvas.** 1280×720 at 30 fps, drawn in one full-frame SVG (`Stage`, which fills the composition).

**Safe areas** (`kit/stage.tsx` `SAFE`):
- Key content stays between x 60–1220 and y 40–610.
- The bottom 110 px belong to the player's subtitles.
- In the outro's last seconds, the end-screen regions (`END_SCREEN` in `lessons/outro/Outro.tsx`) stay empty: Studio places its elements there.

## Colour roles (`kit/palette.ts`)

Scenes ask for a role, never a hex value.

| Role | Use |
|---|---|
| `hero` | the one thing to look at — at most one hero per frame |
| `accent` | a supporting emphasis |
| `ok` / `warn` | right / wrong |
| `sky` | cool, neutral data (grids, UV cells) |
| `outline` / `text` / `textMuted` | lines and type |
| `inko` / `inkoShade` / `inkoLight` / `cheek` | the mascot only |
| `slime` / `slimeShade` | the slime only (enemy or guard) |

`night` stays in `palette.ts` for a possible dark variant, but lessons use `paper`.

## Type (`kit/fonts.ts`, OFL, bundled)

| Face | Component | Weights | Size | For |
|---|---|---|---|---|
| Baloo 2 | `Title` | 600–700 | 44–96 px | headings, big numbers |
| Nunito | `Label` | 700–900 | 24–40 px | labels, captions |
| JetBrains Mono | `Code` | 600 | 24–32 px | code |

- Each stack ends in bundled faces only. Symbols a face lacks (→ θ ≤ …) fall back to JetBrains Mono, never to a system font. `scripts/cmap.test.ts` checks the coverage for English, Vietnamese and the lesson symbols.
- `Title` and `Label` get a halo in the colour behind them (`halo`, the page by default), so they read over lines.
- On-screen words come from `strings.<locale>.json` via `useString`, never from scene code.

## Lines (`kit/shapes.tsx`)

- **clean** is the `Shape` default: crisp vector with round joins. Use it for all main shapes and diagrams.
- **sketch** is rough.js with a fixed, non-zero seed per element, so the lines never boil. Use it only for hand-drawn annotations: circling, a quick arrow, an underline.
- The outline is 5–7 px `outline`.

## Grids and vectors (`kit/grid.tsx`)

- A diagram in world units (y up) declares one `GridSpace` (`ox`, `oy`, `unit` px) and maps every point with `toStage`. Never convert units by hand.
- `Grid` draws faint `sky` unit lines; `axes` (a cue offset) grows the x and y axes through the origin.
- `Vector` is an arrow from tail to tip in world units:
  - `grow` (0–1) extends the tip out of the tail;
  - the label sits beside the shaft (`side` picks left or right);
  - `dashed` is for "the other way round" and ghost copies.
- The vector under discussion is `hero` and 7 px wide; axes stay 4 px `outline`.

## Angles and 3D (`kit/angle.tsx`, `kit/iso.tsx`)

- `angle.tsx` works in degrees, counter-clockwise from +x as on a y-up grid; `polar(at, deg, r)` gives the stage point.
  - `AngleArc`: a tinted wedge plus an arc between two directions, with an optional label (θ). Colour it by meaning (for a sign: `ok` / `textMuted` / `warn`).
  - `VisionCone`: a translucent sector with dashed edges; `grow` sweeps it out from the eye.
  - `ProjectionDrop`: a dashed perpendicular from a tip onto a line, a right-angle mark, and the shadow segment from the line's origin to the foot (it runs backward for a negative shadow).
- `iso.tsx` is one fixed isometric view of a right-handed world: y up, x right-down, z left-down (seen from the +x +y +z side), so x × y = z reads true.
  - Declare one `IsoSpace` and map with `toStage3`; `cross(a, b)` is the real cross product.
  - `FloorGrid` (the y = 0 floor, faint fill), `Axis3D`, `Vector3` (the 2D `ArrowPath` between projected points).
  - Keep vectors off the axes (start them at a floor point) when they would run along one.

## Math symbols

Each symbol keeps one meaning on screen, because viewers cannot tell two meanings apart at a glance. `pnpm video:lint` warns when a string breaks this.

| Symbol | Means | Never |
|---|---|---|
| `·` | the dot product, between two vectors: `a · b`, `N · L` | plain multiplication |
| `×` | the cross product, between two vectors: `a × b` | plain multiplication |
| `*` | every other multiplication, spaced, in `Code`: `3 * 2 = 6`, `a.x * b.x`, `k * v` | a vector product |
| `.` | member access inside a name: `a.x`, `a.lengthSq()` | next to a multiplication dot |

- **Vector arrow.** An arrow is math notation for a vector; names inside code stay plain. Write `{a}` in a string to draw an arrow over that letter (`{a} · {b} = a.x * b.x`, `|{v}|`, `2{v}`); `{AB}` spans both letters. `Title`, `Label` and `Code` draw it, so the string stays language-neutral. Never put it on code (`a.x`, `dot(a, b)`), on points (`A`, `B`) or on axes, and `b̂` keeps its own hat. Any `{` in a `Title`, `Label` or `Code` string is read as a marker, so code with braces needs another element. `pnpm video:lint` warns on a malformed marker, on `{a}.x`, and on a leading, trailing or doubled space in a marked string.
- **Radical bar.** Braces right after `√` are the radicand: `√{x² + y²}`, `√{25}`. `Title`, `Label` and `Code` draw the whole radical, its bar spanning the group, so the parentheses of `√(…)` go away. A bare `√` is for running text only; as a big icon the glyph reads as a check mark, so draw it as `√{x}`. `pnpm video:lint` warns on `√(…)`, `√25` and any `√` followed by a letter, digit or parenthesis without braces.
- Named quantities and functions in a standard formula stay implicit: `|a| |b| cos θ`, `2v`, `0.5v`.
- Decorative separators between words are fine in labels (`top-left · squares`), but prefer `/` in new videos.
- The spoken script says "times" for plain multiplication, so the script never changes with this.
- Lessons 1–2 predate the multiplication rule and keep their uploaded text. Lesson 2 (`vector-basics`) is re-uploaded with the vector arrows and the radical bar, and now follows this rule too (`k * v`, `(4, −2) * −1.5`).

## Motion (`kit/motion.tsx`, `kit/easing.ts`)

Everything takes `t` from `useCue`, never an absolute frame.

- **Entrances:**
  - `Pop`: spring overshoot.
  - `SlideIn`: the `settle` curve.
  - `draw={drawn(t)}` on any kit shape: stroke reveal, with the fill fading in alongside.
- **Exits:** `FadeOut`.
- **Groups:** stagger entrances 4–5 frames apart.
- **Hold:** after the last element of a scene lands, hold 30–45 frames before any exit. Any exit must finish at least 30 frames before the cut: `pnpm qc` requires every scene's last 30 frames to be calm.
- **Nothing static for more than 3 s.** Inko's idle motion and one "continuing verb" per scene cover this. Do not add floating motion just to beat a metric.
- **No nested `<Sequence>` inside a scene.** It shifts `useCurrentFrame`, which breaks `useCue` and Inko's clock. Offset with cue delays instead.

## Inko (`mascot/`)

- **Cast:** `Inko.tsx`; `Walker.tsx` (`stride` and a small walking Inko); `Slime.tsx` (the slime, enemy or guard, and its `Poof`).
- **Poses:** `idle`, `point`, `think`, `cheer`, `surprised`, `threads`.
- **Blending:** `reach` (0–1) blends from idle into the pose. Drive it from a cue with `progress()`; a pose must never snap in one frame.
- **Tentacles:** 8 procedural tentacles — 4 back in `inkoShade`, 4 front in `inko` with suckers.
- **`threads`:** pairs roots with targets by angle, so tentacles fan out without crossing (tested).
- **Looking:** `lookAt` steers the pupils.
- **Blinking:** seeded, every 70–160 frames.
- **Talking:** the mouth flaps only while a word of the current scene is being spoken (`timing.words`).
- **Motion clock:** ambient motion (bob, wave, blink) runs on the absolute frame, so Inko does not jump at scene cuts.
- **QC note:** Inko is never fully still. `pnpm qc` therefore counts "still" below Inko's ambient motion and "calm" (the tail hold) above it; see `scripts/qc-rules.ts`. A much larger Inko may need the `CALM` threshold re-calibrated.

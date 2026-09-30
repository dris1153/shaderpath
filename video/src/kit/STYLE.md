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

## Motion (`kit/motion.tsx`, `kit/easing.ts`)

Everything takes `t` from `useCue`, never an absolute frame.

- **Entrances:**
  - `Pop`: spring overshoot.
  - `SlideIn`: the `settle` curve.
  - `draw={drawn(t)}` on any kit shape: stroke reveal, with the fill fading in alongside.
- **Exits:** `FadeOut`.
- **Groups:** stagger entrances 4–5 frames apart.
- **Hold:** after the last element of a scene lands, hold 30–45 frames before any exit.
- **Nothing static for more than 3 s.** Inko's idle motion and one "continuing verb" per scene cover this. Do not add floating motion just to beat a metric.
- **No nested `<Sequence>` inside a scene.** It shifts `useCurrentFrame`, which breaks `useCue` and Inko's clock. Offset with cue delays instead.

## Inko (`mascot/`)

- **Poses:** `idle`, `point`, `think`, `cheer`, `surprised`, `threads`.
- **Blending:** `reach` (0–1) blends from idle into the pose. Drive it from a cue with `progress()`; a pose must never snap in one frame.
- **Tentacles:** 8 procedural tentacles — 4 back in `inkoShade`, 4 front in `inko` with suckers.
- **`threads`:** pairs roots with targets by angle, so tentacles fan out without crossing (tested).
- **Looking:** `lookAt` steers the pupils.
- **Blinking:** seeded, every 70–160 frames.
- **Talking:** the mouth flaps only while a word of the current scene is being spoken (`timing.words`).
- **Motion clock:** ambient motion (bob, wave, blink) runs on the absolute frame, so Inko does not jump at scene cuts.
- **QC note:** Inko is never fully still, so phase 4's calm-tail check has to mask Inko's bounding box or use a threshold above its ambient motion.

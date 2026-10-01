# Design system: Arcade

The visual rules every page follows. Tokens live in `app/globals.css`, the
primitives in `components/ui/`, and the mascot in `components/mascot/`. In
development, `/en/dev/style` renders all of them in one page, and both
themes can be checked there. In production that route returns 404.

## Colour roles

Use the shadcn token names in classes (`bg-primary`, `text-muted-foreground`,
…). Never put hex values in TSX. The only exception is `components/mascot`,
whose colours match the video mascot.

| Role | Light | Dark | Use for |
|---|---|---|---|
| `background` (ground) | #F4F0FF | #1B1730 | Page ground |
| `card` / `popover` | #FFFFFF | #26213A | Cards, panels, inputs |
| `foreground` (ink) | #26213A | #F3EEFF | Body text |
| `muted-foreground` | #625A78 | #A79FC0 | Metadata, captions |
| `border` / `input` (line) | #E3DAFA | #3A3357 | 2px borders and card edges |
| `secondary` / `muted` / `accent` | #EEE8FF | #2A2250 | Tints, hover, active nav, code surface |
| `primary` | #7A5BE0 | #9C7BFF | The main action; white text on light, ground text on dark |
| `primary-edge` | #5B3FC0 | #7A5BE0 | Press edge under `primary` |
| `link` | #5B3FC0 | #C7B6FF | Text links and coloured text (never `text-primary`) |
| `coral` / `coral-edge` | #FF6B57 / #D6432F | same | Streak, secondary call to action |
| `sun` / `sun-edge` | #FFC23D / #D99A10 | same | XP, rewards |
| `mint` / `mint-edge` | #3CCFB4 / #1FA58E | same | Done, success |
| `sky` | #4DA3FF | same | Info, the cold end of the track heat scale |
| `destructive` | #B8321E | #FF7A66 | Error text and tints |
| `ink` | #26213A | same | Text on coral / sun / mint fills in both themes |

Contrast:

| Text | Ratio |
|---|---|
| White on primary | 4.77:1 |
| Ink on coral | 5.5:1 |
| Ink on sun | 9.6:1 |
| Ink on mint | 7.9:1 |
| Muted on the ground | 5.8:1 |
| Muted on white | 6.5:1 |
| Link on the ground | 6.4:1 |
| Dark muted on the dark ground | 6.9:1 |

Two pairs fail. **Primary on the ground fails as text (4.3:1)**, which is why
coloured text uses `text-link`. **White fails on coral, sun and mint**, so
those fills always carry `text-ink`.

`chart-1..5` are primary, coral, sun, mint and sky, in that order. The track
heat scale (`--track-cold` / `--track-hot`) runs from sky to coral.

## Edges and press

- **`press`** is the 3D button: a 4px solid bottom edge in `--edge` that the
  button sinks into on `:active`. Set the edge per use with
  `[--edge:var(--coral-edge)]`. The filled `Button` variants (`default`,
  `secondary`, `coral`) already carry it.
- **`edge-card`** is a 2px line border plus a 4px bottom edge in the line
  colour. `Card` uses it.
- **`chunky-label`** sets uppercase, weight 800 and 0.05em tracking. Use it
  for buttons and nav only.
- **Only buttons and cards get edges.** Menus, inputs, tabs and the reading
  column stay flat. Overlays (dialog, popover, menu, select) take a 2px
  border and `shadow-overlay`, the only soft shadow in the system.
- Radius base is 14px:
  - `rounded-lg` (14px): buttons and inputs;
  - `rounded-xl` (≈20px): cards and overlays.

## Typography

| Face | Variable | Use |
|---|---|---|
| Baloo 2 | `font-heading` | `h1` / `h2` (applied in base), big numbers. Only at 24px or larger. |
| Nunito | `font-sans` | Everything else. Reading text is 17–18px with 1.7 line height, at 65–75ch. |
| JetBrains Mono | `font-mono` | Code, Monaco (`lib/monaco-font.ts`) |

All three load the `vietnamese` subset. Small titles (card, dialog, sheet)
use Nunito at weight 800, not Baloo.

## Inko

Use `<Inko pose size label />` from `components/mascot/inko.tsx`.

- **Poses:** `idle`, `wave`, `cheer`, `think`, `surprised` and `sleep`.
- **Accessibility:** pass `label` when Inko carries meaning. Without it the
  SVG is `aria-hidden`.
- **Changing the shapes:** the tentacle geometry is baked by
  `pnpm tsx scripts/gen-inko-poses.ts` into `inko-poses.generated.ts`.
  Change the generator and run it again; never compute trig at render time,
  because server and client floats can differ and break hydration.
- **Motion:** idle bob, blink and wave are CSS animations behind
  `motion-safe:`, so they are off under reduced motion.
- **Where:** empty states, celebrations, 404/500 and the dashboard greeting.
  Never inside lesson prose.

## Streak and XP

Both are derived on read from rows the app already stores (`lib/xp-read.ts`,
`GET /api/gamification`); nothing new is persisted. Signed-in readers only:
guests never request them and see no chips.

- **XP** (`lib/xp.ts`): 10 per completed lesson, 5 per completed exercise,
  2 per card review (`review_queue.review_count`).
- **Levels**: level L starts at 50 · (1 + 2 + … + (L − 1)) XP: 0, 50, 150,
  300, 500, …
- **Streak** (`computeStreaks` in `lib/date-buckets.ts`, shared with /stats):
  days with a study session. One missed day per ISO week (Mon–Sun) keeps the
  run alive but adds nothing; a second miss that week ends it. Today is never
  a miss.
- **Celebrations** (`components/celebrate/`):
  - a "+5 XP" chip on an exercise pass;
  - the lesson-complete card (Inko `cheer`, a +10 XP count-up, Next);
  - confetti when the completion finishes a module's core lessons.
- After anything that earns XP, call `useInvalidateGamification()`.

## Guard rails

- **The reading column stays calm.** No edges or press styles around prose,
  KaTeX or code. Demos and exercises are interactive chrome and may use
  `edge-card`.
- **Uppercase** is for buttons and nav only.
- **Copy is loss-neutral.** No hearts, leagues or leaderboards.
- **Celebrations** last at most 1.2s, are skipped under reduced motion, and
  never play sound.
- **Every interactive element shows `cursor: pointer`**, via the base rule in
  `globals.css`.

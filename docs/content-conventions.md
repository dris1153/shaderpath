# Content conventions — ground truths for lesson audits

Every factual audit pass judges lesson prose, figures and exercises against
this page. Each entry states the fact and the newbie confusion it guards
against. Version arbiters: the installed packages — three `0.185`, gsap
`3.15`, `@react-three/fiber` 9, WebGL2 / GLSL ES 3.00 in the playground.

## Coordinate systems

- **three.js world space is right-handed, +Y up.** +X right, +Y up, +Z toward
  the viewer; the default camera looks down **−Z**. Guard: newbies read "Z
  forward" in game-engine articles (Unity is left-handed, +Z forward) and
  mislabel the axis a mesh moves along.
- **Cross product follows the right-hand rule** in this system: x̂ × ŷ = ẑ.
  Order matters; a × b = −(b × a). Guard: swapped operands silently flip
  normals.
- **NDC after the perspective divide is x, y, z ∈ [−1, 1], +Z pointing into
  the screen** — NDC is left-handed even though view space is right-handed,
  because the projection matrix flips Z. Depth then maps to [0, 1] in window
  space. Guard: "everything is right-handed" is wrong one space too far.
- **Screen/window origin**: `gl_FragCoord` origin is **bottom-left**. CSS and
  pointer events use top-left. Guard: mouse-Y must be flipped once — exactly
  once — when fed to a shader.

## UV and textures

- **UV origin is bottom-left** in WebGL. (0,0) bottom-left, (1,1) top-right.
- **three.js flips DOM-sourced textures** (`Texture.flipY = true` by default)
  so image top ends up at V = 1. **glTF textures are NOT flipped** (glTF
  declares a top-left origin; loaders set `flipY = false`). Render targets are
  never flipped. Guard: "my texture is upside down" is almost always a flipY
  mismatch, not a UV bug.

## Matrices

- **GLSL matrices are column-major**: `m[0]` is the first **column**;
  `mat4(...)` consumes arguments column by column. `M * v` treats `v` as a
  column vector.
- **three.js `Matrix4.elements` is column-major storage, but `Matrix4.set()`
  takes arguments in row-major order** for readability. Translation lives in
  `elements[12..14]`. Guard: reading `elements` as if it matched `set()`
  argument order transposes the matrix.
- **Transform composition reads right-to-left**: `T * R * S` scales first,
  then rotates, then translates. three composes object matrices in exactly
  that order from `.position`, `.quaternion`, `.scale`.

## Rotation

- **Euler order default in three is `'XYZ'`**, applied as intrinsic rotations;
  changing `.order` changes the result. Gimbal lock: at ±90° on the middle
  axis, the first and third axes align and a degree of freedom is lost.
- **Quaternions do not gimbal-lock**; `slerp` interpolates rotation at
  constant angular velocity. Guard: lerping Euler angles through the wrap
  produces the "long way round" spin.

## Color spaces

- **Lighting math happens in linear space.** Since r152 the renderer default
  is `outputColorSpace = SRGBColorSpace`: three converts the final frame to
  sRGB for the display.
- **Color textures (albedo/diffuse) must be tagged sRGB**
  (`texture.colorSpace = SRGBColorSpace`); **data textures (normal, roughness,
  metalness, height, AO) stay linear** — they encode numbers, not colors.
  Guard: "washed out" or "too dark" renders are almost always a color-space
  tag, not a lighting bug.

## GLSL (playground / exercises)

- Playground and shader exercises compile **GLSL ES 3.00** with a fixed
  prelude: `uTime`, `uResolution`, `uMouse` uniforms and `out vec4 fragColor`
  (no `gl_FragColor`; `texture()` not `texture2D()`).
- Numeric literals: `float` needs the decimal point (`1.0`), int-to-float
  never happens implicitly. `normalize(vec3(0.0))` and `pow` with a negative
  base are undefined — prose must not present them as safe.

## Exercise kinds and starter visibility

- The UI renders `starterCode` only for `kind: "code" | "shader"`
  (`components/exercise/exercise-card.tsx`). `kind: "build"` shows no starter
  — **by design**: checkpoints are built from scratch.
- Therefore a build exercise's prompt (+ hints) must be self-contained: every
  required API, tuned constant, parts table, and step order the task depends
  on lives in the prompt text — never only in `starterCode`, TODO comments,
  or the solution. Prompts must not say "the starter already has X" or
  "fill in the N TODOs".
- A build exercise may still keep a `starterCode` field as author-side
  scaffolding; nothing user-facing may reference it.

## Demo hints

- Every `demo.tsx` must pass `hint` to `<Demo>`; `pnpm lint:content` fails
  otherwise. It renders as the Card description, under the title.
- The hint says **what to look for**, not what can be changed — the control
  labels already cover that, and the title already names the demo. "Drag the
  sliders to explore" is the failure case, not the shape.
- Prefer one concrete observation the controls do not imply: a specific
  setting to try, a counter that moves the wrong way, two things that agree
  where you expect them to differ.
- Author it in the demo's own `LABELS`, beside `title`. `L` is the union of
  both locale branches, so tsc rejects a hint added to only one.
- Interaction affordances ("drag to inject dye") are not hints. Those stay as
  an overlay on the canvas, where the pointer is, under a different key.

## Review cards

- Optional `review-cards.ts` beside `exercises.ts`, exporting
  `reviewCards: ReviewCard[]` (`{ id, q, a }`, both `Localized`). `/review`
  shows one per due review, rotating on the review count. A lesson without
  cards reviews its first concept exercise, then its objectives.
- Lint (`pnpm lint:content`): 2–5 cards, unique ids, `q` and `a` non-empty in
  both locales, no tags (PromptBody prints them literally), none on a
  checkpoint — checkpoints review their objectives.
- Text is the PromptBody subset: paragraphs, `code`, `$math$`, fences,
  `**bold**`, `*italic*`. No lists, links or MDX.
- One idea per card, answerable in ~30 seconds without scrolling. Ask for a
  consequence or a reason ("two unit vectors, dot = −1: where do they
  point?"), not a definition, and never yes/no.
- The answer states the reason, not only the result — a bare "−1" teaches
  nothing on a wrong guess.
- Do not restate a heading as a question, and do not duplicate the lesson's
  concept exercise: the exercise is practice, the card is a recall cue.
- The mistake callout is the best seam: a card that walks the learner into the
  wrong intuition and back out beats one that quotes the right one.

## Mind maps

- Every lesson renders a mind map above the theory, **auto-generated** from
  audited data: objectives, `##`/`###` headings (split `label: detail` at the
  first colon; heading slug = scroll anchor), the mistake-Callout items, and
  prerequisite/dependent links. The auto map cannot drift — never hand-fix it;
  fix the lesson.
- A lesson may ship a handwritten `mindmap.ts` exporting
  `mindMap: Localized<MindMapNode[]>` (one file, both locales — same
  convention as `exercises.ts`). The array is the root's branches; the root
  itself (title + summary) stays automatic. Override only when regrouping
  ideas teaches something the heading order cannot; restating the TOC in a
  different shape is not a reason.
- Override rules (enforced by `pnpm lint:content`, always errors): every
  `kind:"section"` node below the top level must use a real heading slug of
  that locale's MDX; every `kind:"link"` node must use an existing lesson
  slug; vi/en trees must be structurally identical (same kinds and nesting;
  labels/anchors translate); link nodes must reference the same lessons in
  both locales; node ids stay unique. Labels over 8 words warn — nodes are
  labels, not sentences.
- Since the Objectives card was absorbed into the map, an override should
  keep the objectives content reachable (its own branch or folded into
  thematic branches) — convention, not lint.
- Scope note: mind maps postdate the original platform spec (adopted
  2026-08-26, plan `260826-0005-lesson-mind-maps`); audits should treat them
  as in-scope content, judged against the lesson they summarize.

## API era

- **three 0.185**: `outputColorSpace` (not `outputEncoding`), `SRGBColorSpace`
  (not `sRGBEncoding`), physically-correct lighting is the only mode (no
  `useLegacyLights`), geometry is `BufferGeometry` everywhere (no
  `Geometry`/`faces`). Prose must not teach removed APIs.
- **GSAP 3**: `gsap.to/from/fromTo/timeline`, plugins via
  `gsap.registerPlugin(ScrollTrigger)`. No `TweenMax`/`TimelineMax`.
- **R3F 9**: hooks (`useFrame`, `useThree`, `useLoader`); the `uniforms` prop
  is copied per-instance — mutating the original object never reaches the GPU
  (verified in this repo; demos use refs / `useSharedUniforms`).

## Terminology (VI canonical)

- Keep established VI terms consistent across lessons; on first use introduce
  the EN term in parentheses, e.g. "tích vô hướng (dot product)". Formulas and
  KaTeX labels stay ASCII (lint enforces this).

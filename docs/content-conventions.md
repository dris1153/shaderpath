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

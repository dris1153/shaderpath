# Phase 7 Authoring Brief (shared by all content agents)

Work context: `D:\Workspace\Personal\Webs\learning-3d`. You own ONLY the lesson folders named in your task. Parallel agents author sibling folders — NEVER touch shared files.

## Read first (golden standards — match tone/structure/quality exactly)

- `content/lessons/00-math/cartesian-and-uv-space/` — theory/references/exercises/demo formats
- `content/lessons/00-math/dot-and-cross-products/theory.vi.mdx` — the prose bar
- `content/lessons/00-math/checkpoint-vector-clock/` — checkpoint pattern (brief theory + build exercise)
- `content/lessons/01-webgl/first-triangle-webgl2/demo.tsx` — the RAW-WebGL2 demo pattern (useDisposable + useVisibleRaf, no R3F)
- `content/tracks/00-math.ts` / `01-webgl.ts` — your lessons' title/summary/objectives: content MUST deliver exactly those objectives
- `prompt-webgl-learning-platform.md` §3.2 + §10 — mandatory quality rules
- `components/viz/` — Demo wrapper API; `scripts/lint-content.ts` — the gate

## Regular lesson = 5 files

`theory.vi.mdx`, `theory.en.mdx`, `references.ts`, `exercises.ts`, `demo.tsx`

**Theory (per locale):** 800–1200 words. Real prose explaining WHY; numbers sourced or labeled "ước lượng"/"estimate". Headings `##`/`###` only (no h1). vi first; en = natural REWRITE, IDENTICAL heading tree. ALL math in KaTeX (`$..$`, `$$..$$`) — never Vietnamese words inside `\text{}` (KaTeX lacks the glyphs; explain in prose instead). All code runnable. EXACTLY ONE `<Callout variant="mistake" title="Lỗi hay gặp">` / `title="Common mistakes"` with 2–3 concrete mistakes (mechanism, not platitude). End with one forward-reference paragraph to later tracks.

**References:** ≥2 citations with REAL working URLs + bilingual `note`. Books without URL only as extras. Import: `import type { Citation } from "../../../types";`

**Exercises (D9):** ≥2 — one `concept` + one `code` (or `shader`). Prompts stay in the renderer subset: paragraphs, `` `code` ``, `$katex$`, ```fences``` — NO lists/links/headings/bold. Each: 2 hints + 3 checklist items, bilingual. `code` kind: `starterCode` with TODO + fully working `solutionCode`.

**Demo:** bilingual `LABELS` + `useLocale`; controls via the `Demo` wrapper.
- R3F path (math lessons): `DemoCanvas` + JSX-created objects (auto-disposed); mutate memoized uniforms in `useEffect` + `invalidate()`.
- Raw-WebGL2 path (most Track 1 lessons — the track teaches the raw API): plain `<canvas>` + `useDemoContext().containerRef` + `useVisibleRaf` + `useDisposable`. NEVER call `loseContext()` in cleanup (Strict Mode kills the canvas permanently).
- Any GLSL goes in sibling `.vert`/`.frag` files imported raw — never inline strings.

## Checkpoint lesson = 4 files

`theory.vi.mdx` + `theory.en.mdx` (BRIEF: 150–300 words, headings like `## Mục tiêu`/`## Goal`, `## Yêu cầu`/`## Requirements`, NO Callout) + `exercises.ts` (≥1 `build` exercise, 3 hints, ≥5 checklist items, starterCode skeleton + solutionCode) — no references.ts, no demo.tsx needed.

## Shader-heavy lessons (Track 2 onward)

- Lessons with `hasPlayground: true` in the track metadata SHOULD lean on the embedded playground: prefer exercise kind `"shader"` (its `starterCode` opens in the GLSL playground editor with `uTime`/`uResolution`/`uMouse` available and `fragColor` as output — write starter/solution as fragment-shader BODIES exactly like `lib/glsl/assemble.ts` DEFAULT_FRAGMENT).
- Theory MDX may embed a live editor where hands-on tweaking teaches best: `<Playground source={"void main() {\n  ...\n}"} />` (one per lesson max; the string is a fragment body using the default uniforms).
- demo.tsx stays mandatory when `hasDemo: true` — for pure-shader lessons an R3F fullscreen plane with sibling `.vert`/`.frag` files (pattern: `content/lessons/02-glsl/shaping-functions-and-2d-sdf/demo.tsx`) is the norm.

## Vanilla-Three lessons (Track 3)

- Track 3 teaches Three.js WITHOUT React — demos must too: imperative `import * as THREE from "three"` on a plain `<canvas>` inside `useEffect` (`new THREE.WebGLRenderer({ canvas })`, manual scene setup), rendered via `useVisibleRaf`, cleaned up via `useDisposable` (dispose every geometry/material/texture you create + `renderer.dispose()`, NO `forceContextLoss`). The React shell is only the mount point — the lesson's code IS the vanilla API.
- `three/addons/*` imports are available (OrbitControls, GLTFLoader, …).
- No binary assets in the repo: textures are procedural (`THREE.DataTexture`/`CanvasTexture`); glTF demos embed a minimal glTF 2.0 JSON (a colored cube/triangle, ~60 lines in a sibling `.ts` data file) loaded through `GLTFLoader.parse()` — the loader pipeline is identical to loading real files. KTX2/Draco/meshopt are taught in theory + wiring code; demos state that real compressed assets arrive with real projects.

## GSAP lessons (Track 5)

- GSAP animates DOM here — demos may put styled `<div>` content inside the `Demo` wrapper instead of a canvas (the wrapper works fine without `DemoCanvas`). gsap is installed (v3.15, ALL plugins free — ScrollTrigger, Flip, Draggable, Observer, SplitText: `import { ScrollTrigger } from "gsap/ScrollTrigger"` + `gsap.registerPlugin(...)`, idempotent so safe under HMR).
- Cleanup: create tweens inside `gsap.context(...)` and `revert()` on unmount — the house hook `lib/hooks/use-gsap-context.ts` does exactly this; use it.
- ScrollTrigger inside an embedded demo card: give the demo its own scrollable `<div>` (fixed height, `overflow-y: auto`) and pass it as `scroller:` — never bind demo ScrollTriggers to the window (the lesson page's own scroll would fight it).
- The single-render-loop rule (spec §8.4) applies to any GSAP+R3F demo: tween plain objects, read them in `useFrame` — never `gsap.ticker.add(render)`.

## Custom-shader lessons (Track 6)

- Demos are R3F (`DemoCanvas`) with sibling `.vert`/`.frag` raw imports — the Track 2 fullscreen-plane pattern generalizes to meshes; uniforms are memoized containers mutated in `useFrame`/`useEffect` + `invalidate()`.
- `onBeforeCompile` demos: when a control toggles WHICH code gets injected, set `customProgramCacheKey` — otherwise Three reuses the cached program and the toggle silently does nothing.
- NEVER mutate `THREE.ShaderChunk` globally in a demo without restoring the original in cleanup — it leaks into every other demo on the page. Prefer per-material `onBeforeCompile` string replacement; if the lesson must demonstrate the global override, save & restore the chunk.
- Verify Three-version specifics (chunk names, TSL imports like `three/tsl` / `three/webgpu`) against `node_modules/three` before writing — chunk names shift between releases.

## GPGPU lessons (Track 9)

- Demos create render targets/FBOs — EVERY `WebGLRenderTarget`, `DataTexture`, and GPUComputationRenderer's internals MUST be disposed on unmount (drei `useFBO` handles its own; manual targets go through the effect-cleanup/dispose pattern). A leaked FBO per remount is the #1 failure mode here.
- `GPUComputationRenderer` imports from `three/addons/misc/GPUComputationRenderer.js` — verify the path and API against node_modules before writing.
- Float render targets: WebGL2 requires the `EXT_color_buffer_float` extension to RENDER INTO float textures. Use `HalfFloatType` as the safe default for state textures (GPUComputationRenderer does this on mobile detection — check its source) and mention the fallback in theory.
- Sim demos need a frame every visible tick: keep the established R3F pattern (`useFrame` + demand-frameloop with `invalidate()` per frame while visible) so hidden demos cost nothing. Keep demo particle counts modest (≤65k = 256² state texture) — the THEORY can talk about millions; the embedded demo must not cook laptops. One 256² sim per demo max.
- Transform-feedback lesson: Three.js does not expose TF — that demo uses the raw-WebGL2 canvas pattern (Track 1 style: useVisibleRaf + useDisposable).
- Mouse interaction: reuse the `uMouse` conventions from `DemoCanvas`/existing demos (pointer in plane coords), never window listeners.

## Post-processing lessons (Track 10)

- Theory anchors on Three's own `EffectComposer` (`three/addons/postprocessing/*`) — that's the architecture the track metadata teaches (RenderPass, ShaderPass, ping-pong read/write buffers). `@react-three/postprocessing` (pmndrs, installed ^3.0.5) is the production wrapper — mention it honestly (it MERGES effects into fewer passes, different architecture) where relevant; verify any API claims against node_modules.
- Demo pattern for manual composer in R3F: build the composer in an effect/memo from `useThree` gl/scene/camera, take over rendering with `useFrame(({gl}) => { composer.render(); }, 1)` (priority 1 suppresses R3F's default render), `composer.setSize` on size changes, dispose composer render targets + passes on unmount. Respect demand-frameloop: call `invalidate()` per visible frame as established.
- Half-float composer targets for HDR lessons (`new EffectComposer(gl, new WebGLRenderTarget(w, h, { type: HalfFloatType }))` — verify constructor signature in node_modules; bloom-on-HDR claims must match what the installed UnrealBloomPass actually does).
- Keep demo scenes light (a few meshes + lights) — the EFFECT is the subject; embedded pass chains cap at ~3 passes; use half-resolution internal targets where the technique allows.

## PBR lessons (Track 11)

- EVERY formula in KaTeX with derivation steps shown; every physical number (F0 values, IOR, albedo ranges) verified against a cited reference (Real-Time Rendering / learnopengl PBR / Filament docs / Karis's UE4 course notes — all citable URLs). No un-sourced constants.
- No binary HDRI assets: IBL demos build environments procedurally — `RoomEnvironment` from `three/addons/environments/RoomEnvironment.js` through `PMREMGenerator` (verify in node_modules), or a generated equirect `DataTexture`/CanvasTexture gradient-sky. `scene.environment` from PMREM output. Theory teaches real HDRI loading (RGBELoader) as code-in-prose; demos state real HDRIs arrive with real projects.
- PMREM render targets and generated env textures are disposables — same discipline as Track 9/10.
- R3F Canvas defaults ACES tone mapping — lessons manipulating exposure/tonemapping set `gl.toneMapping`/`toneMappingExposure` explicitly and restore on unmount (renderer is shared across demos on the page!).

## Self-verify (parallel-safe)

1. `pnpm lint:content --require math` (or `webgl`) — YOUR lessons must contribute zero errors; missing-folder errors for lessons you don't own are expected.
2. `pnpm typecheck` — fix errors in YOUR files only; transient errors in sibling agents' half-written folders are expected — ignore them.
3. Do NOT run `pnpm gen:registry`, `pnpm build`, or `pnpm test:e2e` (the orchestrator runs them once after all agents finish).

End with: **Status:** DONE|BLOCKED, **Summary:**, **Concerns:**.

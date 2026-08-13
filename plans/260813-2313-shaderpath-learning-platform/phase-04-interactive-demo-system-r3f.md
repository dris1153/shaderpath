# Phase 4 — Interactive Demo System (`<Demo>` + R3F)

## Context Links

- Spec: §6.1.4 (demo + control panel), §7 (Card + AspectRatio + Skeleton), §8.2 (no leaks / `useDisposable`), §8.3 (IntersectionObserver pause), §8.4 (single GSAP+R3F loop), §8.5/§8.6, §9 phase 4
- Decisions: [D1](reports/spec-decisions.md) `.glsl` raw import, [D6](reports/spec-decisions.md) Track 0 lessons as golden sample
- Depends on: [Phase 3](phase-03-lesson-page-toc-progress-tracking.md)

## Overview

- **Priority:** P1
- **Status:** ✅ Complete (2026-08-14)
- **Effort:** ~10h
- **Description:** Reusable `<Demo>` wrapper hosting R3F canvases inside MDX, with a shadcn control panel for live parameters, viewport-gated render loop, and guaranteed GPU resource disposal.

## Key Insights

- §8.3 is a hard requirement, not an optimization: off-screen canvases must consume zero GPU. Implement as `frameloop="never"` + manual `invalidate()`, or `setAnimationLoop(null)` on exit.
- Leak surface is geometry / material / texture / render target / RAF / event listeners. A single `useDisposable` hook is mandated (§8.2) — everything demo-side registers through it.
- GSAP and R3F must share one loop (§8.4): `gsap.ticker` drives nothing 3D directly; `useFrame` reads GSAP-tweened plain objects. Never call `gsap.ticker.add(renderFn)` alongside R3F's loop.
- Demos live in `content/lessons/**/demo.tsx` and are imported by the lesson page as client components — the MDX body stays RSC.
- Control panel state is ephemeral UI state → zustand or local `useState`, never DB (§1 state rules). Leva stays a Track 4 teaching topic, not the platform's control UI (§7 says shadcn only).

## Requirements

**Functional**
- `<Demo title controls?>` renders: shadcn `Card` + `AspectRatio` + `Skeleton` while loading + error `Alert` on WebGL failure.
- Control panel: `Slider`, `Switch`, `Select`, `ToggleGroup` bound to typed params; reset-to-defaults button.
- Canvas renders only while intersecting viewport; resumes on re-entry with no visual glitch.
- Full cleanup on unmount: dispose all GPU resources, cancel loops, remove listeners.
- 3 sample demos shipped, one each in Track 0 / 1 / 2 (§9 phase 4 DoD).
- `hasDemo` in `LessonMeta` gates the demo slot in the lesson body.

**Non-functional**
- WebGL context count stays ≤ browser limit (~16): demos on one page must not each hold a live context indefinitely — cap concurrent contexts, release on far-off-screen.
- DPR clamped (`dpr={[1, 2]}`) with a `quality` prop; full auto-detection lands in Phase 10 (A4).
- No SSR of canvas: client component + `dynamic(..., { ssr: false })` where needed (§8.6).

## Architecture

```
lesson MDX ──<Demo>──┐
                     ├─ Card > AspectRatio > Suspense(Skeleton) > <DemoCanvas>
                     │     └─ 'use client' R3F <Canvas frameloop="never">
                     │            ├─ useDisposable() registry → dispose on unmount
                     │            ├─ useVisibleFrameloop(ref) → IntersectionObserver → invalidate loop on/off
                     │            └─ scene reads params from ControlContext
                     └─ ControlPanel (shadcn) ──> ControlContext (React context + useState)

GSAP path: tween a plain params object → useFrame reads it → invalidate() → single render per frame
Shaders: import frag from './x.glsl' (D1) → ShaderMaterial uniforms
```

Data in: control params, time, pointer. Data out: pixels only — demos never write to the DB.

## Related Code Files

**Create**
- `components/viz/demo.tsx` (wrapper), `demo-canvas.tsx`, `demo-controls.tsx`, `demo-error-boundary.tsx`
- `components/viz/control-schema.ts` (typed control descriptors: number/boolean/enum → widget)
- `lib/hooks/use-disposable.ts`, `lib/hooks/use-visible-frameloop.ts`, `lib/hooks/use-gsap-context.ts`
- `content/lessons/00-math/*/demo.tsx` (Track 0 sample — vector/dot-product visualizer)
- `content/lessons/01-webgl/*/demo.tsx` (Track 1 sample — pipeline / raw-WebGL2 triangle)
- `content/lessons/02-glsl/*/demo.tsx` + `.glsl` (Track 2 sample — `smoothstep`/SDF playground-lite)
- `tests/unit/use-disposable.test.ts`, `tests/e2e/demo-viewport-pause.spec.ts`

**Modify**
- `components/lesson/lesson-shell.tsx` / MDX components map (register `Demo` for MDX usage)
- `content/lessons/**/meta.ts` (set `hasDemo: true` for the three samples)
- `package.json` (`three @react-three/fiber @react-three/drei @react-three/postprocessing gsap`)

**Delete** — remove the Phase 2 `Demo` placeholder from `mdx-components.tsx`.

## Implementation Steps

1. Install three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, gsap.
2. `use-disposable.ts`: registry with `register(obj)` / `registerFn(cb)`; on unmount, walk registry calling `dispose()`; traverse scene for stragglers; `renderer.dispose()` + `forceContextLoss()` when the demo owns the canvas.
3. `use-visible-frameloop.ts`: IntersectionObserver (threshold 0.01) on the canvas container → sets a ref consumed by an `useFrame`-driven `invalidate()` pump; when hidden, stop invalidating (frameloop `never` → zero GPU work).
4. `demo.tsx`: `Card` (header = title + reset + optional "fullscreen" `Dialog`), `AspectRatio` 16/9, `Suspense` + `Skeleton`, error boundary → `Alert` with WebGL-unsupported copy (bilingual keys).
5. `control-schema.ts` + `demo-controls.tsx`: descriptor array → widget mapping; typed params generic so scenes get compile-time-safe props; values in React context, no prop drilling.
6. GSAP integration helper `use-gsap-context.ts`: `gsap.context()` scoped to the demo, tweening a mutable params object; `useFrame` reads it and calls `invalidate()`. Document the "two loops" anti-pattern inline (one short comment).
7. Sample demo A (Track 0): 2D vector add / dot / cross visualizer with sliders — pure R3F, orthographic camera.
8. Sample demo B (Track 1): rendering-pipeline visual — raw WebGL2 triangle in a plain `<canvas>` (no R3F) to prove the wrapper works for both paths; still uses `useDisposable` + visibility gate.
9. Sample demo C (Track 2): fullscreen quad + `.glsl` fragment shader with `uTime`/`uResolution` uniforms, sliders for `smoothstep` edges (D1 import path exercised).
10. Register `Demo` in `mdx-components.tsx`; render the demo slot in the lesson body when `meta.hasDemo`.
11. Tests: unit for disposable registry ordering; e2e asserting a demo below the fold does not tick (spy on a frame counter exposed via `data-frames` attribute in dev).

## Todo List

- [x] Install 3D + animation deps
- [x] `useDisposable` hook + unit test
- [x] `useVisibleFrameloop` IntersectionObserver gate
- [x] `<Demo>` wrapper: Card/AspectRatio/Skeleton/error boundary
- [x] Typed control schema → shadcn widgets + reset
- [x] GSAP↔R3F single-loop helper
- [x] Track 0 demo (vectors)
- [x] Track 1 demo (raw WebGL2 triangle)
- [x] Track 2 demo (GLSL smoothstep, `.glsl` import)
- [x] Register `Demo` in MDX components + `hasDemo` slot
- [x] Viewport-pause e2e + disposal unit tests

## Success Criteria

- **§9 phase 4 DoD:** 3 sample demos run in Tracks 0–2.
- Scrolling a page with 3 canvases: only the in-viewport one consumes GPU (§11.4) — verified via frame counter + DevTools performance trace.
- Opening/closing a lesson with demos 20× shows no linear growth in `performance.memory` (§11.3, pre-check here; full sweep Phase 10).
- Every control change is reflected within one frame, no re-mount of the scene.
- Loading and WebGL-error states both render UI, never a blank Card (§7).
- Demo components typecheck with no `any`; `.glsl` import returns `string`.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Memory leak from undisposed geometry/material/texture | H×H | Mandatory `useDisposable` in every demo; unit test + manual 20-open check; code review gate on each new demo |
| WebGL context exhaustion (many demos per lesson) | M×H | ≤2 demos per lesson by content rule; release context when far off-screen (`rootMargin` staged: pause at 0px, dispose at 200% away) |
| GSAP ticker + R3F loop double-render | M×H | Single documented pattern in `use-gsap-context.ts`; no `gsap.ticker.add` for rendering; review checklist item |
| Canvas SSR crash / hydration mismatch | M×M | Client components only, `ssr: false` where needed; e2e catches |
| Frame-counter test flakiness | M×L | Dev-only instrumentation attribute; assert monotonic non-increase over 1s window, not exact numbers |
| Demo code drifting from lesson prose | M×M | Demo lives in the lesson folder and is authored with the lesson (Phase 7 rule) |

## Security Considerations

- Demos are repo-authored code, no user input executed. Control params are numeric/enum, clamped to declared ranges before hitting uniforms.
- No network access from demos; textures/models are repo-local assets.
- Guard against pathological params (e.g. instance count sliders) with hard max in the control schema — a runaway demo can hang the GPU process.

## Rollback

Revert phase commit; MDX `Demo` placeholder returns. Lesson pages still render (demo slot no-ops when `hasDemo` false).

## Notes (post-implementation, 2026-08-14)

**Resolved versions:** three 0.185.1 · @react-three/fiber 9.7.0 (React 19) · drei 10.7.8 · @react-three/postprocessing 3.0.5 · gsap 3.15.0. `aspect-ratio` shadcn component added (was missing from the §7 install list).

**Deviations / gotchas:**
- Params flow via a render-prop-free context (`DemoContextProvider` carries `{values, containerRef}`); controls talk to `Demo` state directly — no zustand, no prop drilling.
- Frameloop gate: `frameloop="demand"` + a RAF pump (`useVisibleRaf`) that only runs while the container intersects the viewport. `data-frames` counts pump ticks for the e2e assertion. Raw-canvas demos reuse `useVisibleRaf` directly.
- `Demo` NOT registered in `mdx-components` — demos load from `DEMO_REGISTRY` (registry v3) and render in the lesson page's demo slot. MDX stays RSC.
- **`loseContext()` removed from per-demo cleanup:** Strict Mode remounts reuse the same canvas element, and `getContext("webgl2")` then returns the permanently-lost context → demo dies in dev. Deleting buffers/program/VAO is the leak-relevant cleanup; the browser reclaims the context when the canvas leaves the DOM.
- New react-hooks compiler-era lint rules reject the standard Three "mutate memoized uniforms in effects/useFrame" idiom — `react-hooks/immutability` scoped OFF for `content/lessons/**/demo.tsx` + `components/viz/**` only. `useDisposable` returns a `useState`-held registry (rule-compliant lazy init).
- Demo titles/labels are bilingual via a local `LABELS` object + `useLocale()` (content pattern for Phases 7/9), not global i18n keys.
- Track 1 sample lives in `first-triangle-webgl2`, Track 2 in `shaping-functions-and-2d-sdf` (lessons without theory yet render header + coming-soon + demo).

**Verification run:** typecheck ✓ · eslint ✓ · vitest 19/19 (4 new: disposal LIFO order, fn-before-object, failure isolation, idempotency) ✓ · `next build` ✓ · e2e 11/11 — incl. **below-fold demo frozen at 0 ticks until scrolled into view (§8.3/§11.4)**, raw WebGL2 + GLSL `.glsl`-import demos render with working controls ✓.

## Next Steps

→ [Phase 5](phase-05-glsl-playground-monaco.md): the shader demo path grows an editor.

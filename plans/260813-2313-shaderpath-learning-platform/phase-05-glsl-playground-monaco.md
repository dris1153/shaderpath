# Phase 5 — GLSL Playground (Monaco + live compile + error mapping)

## Context Links

- Spec: §1 (Monaco), §5 (`playground_snippets`), §6.1.5 (playground), §7 (Resizable panel), §8.5, §9 phase 5, §11.5
- Decisions: [D4](reports/spec-decisions.md) custom Monarch GLSL grammar, [D1](reports/spec-decisions.md) `.glsl` raw import, [D6](reports/spec-decisions.md) default snippet + embedded usage validated against the Track 0/2 sample lessons (real content, not fixtures)
- Depends on: [Phase 1](phase-01-scaffold-nextjs-shadcn-intl-drizzle.md), [Phase 4](phase-04-interactive-demo-system-r3f.md)

## Overview

- **Priority:** P1
- **Status:** Not Started
- **Effort:** ~12h
- **Description:** Standalone `/playground` (and embeddable variant) with Monaco GLSL editing, live-compiled fullscreen-quad preview, precise error line mapping, default uniforms, and snippet persistence in SQLite.

## Key Insights

- Monaco has **no** GLSL language (spec §1 is wrong) → register a Monarch tokenizer + completions ourselves (D4).
- Error line mapping is the whole feature: the compiler reports lines of the *assembled* source (`#version` + precision + injected uniforms + user code). Line numbers must be shifted back by the prelude length or the markers point at the wrong code — §11.5 explicitly checks this.
- A failed compile must never blank the canvas: keep the last successfully linked program and render it while showing errors.
- Recompiling on every keystroke thrashes the GPU driver → debounce ~300ms + compile off the render path; always delete the old program/shaders.
- Monaco cannot SSR: `@monaco-editor/react` loaded client-side only.

## Requirements

**Functional**
- `/[locale]/playground`: `Resizable` two-pane (editor | preview) per §7.
- Fragment shader editable; vertex shader optional (advanced toggle) — schema stores both (§5).
- Default uniforms available: `uTime`, `uResolution`, `uMouse` (§6.1.5).
- Compile errors: parsed from `getShaderInfoLog`, shown as Monaco markers on the correct line + a readable list below; app never crashes (§11.5).
- Snippets: save / rename / list / load / delete; `forkedFromLesson` set when opened from a lesson.
- Embeddable `<Playground>` for lessons where `hasPlayground` is true, and for `shader` exercises (Phase 6).
- Uniform panel: user-declared extra uniforms via `uniformsJson` (number/color/vec2 sliders).

**Non-functional**
- Preview honors the Phase 4 visibility gate + DPR clamp.
- Editor bundle lazy-loaded; playground route must not bloat lesson pages.
- Full keyboard operability outside the editor; editor's own keymap is Monaco's.

## Architecture

```
/playground (RSC shell: loads snippet list via server action)
  └─ <PlaygroundClient> ('use client')
       ├─ ResizablePanelGroup
       │    ├─ <GlslEditor> @monaco-editor/react, language 'glsl' (D4 registration on mount)
       │    └─ <ShaderPreview> R3F fullscreen quad, ShaderMaterial
       ├─ compile pipeline: source ──assemble(prelude + user)──> gl.compileShader
       │        success → swap material.fragmentShader, dispose old program
       │        failure → parseGlslLog() → shift lines by PRELUDE_LINES → editor.setModelMarkers
       └─ snippet bar: save/load/delete → Server Actions → playground_snippets

Uniform feed each frame: uTime = clock.elapsedTime, uResolution = drawingBufferSize, uMouse = pointer (normalized)
```

Data in: editor text, uniform values, saved snippets. Data out: markers, pixels, DB rows.

## Related Code Files

**Create**
- `app/[locale]/playground/page.tsx`, `loading.tsx`, `error.tsx`
- `components/playground/playground-client.tsx`, `glsl-editor.tsx`, `shader-preview.tsx`, `error-list.tsx`, `uniform-panel.tsx`, `snippet-bar.tsx`
- `components/playground/glsl-language.ts` (D4: Monarch tokenizer + completions + language config)
- `lib/glsl/assemble.ts` (prelude constants + `PRELUDE_LINES`), `lib/glsl/parse-error.ts`, `lib/glsl/compile.ts`
- `lib/playground.ts` (`'use server'`: list/save/update/delete snippets)
- `lib/stores/playground-store.ts` (zustand: source, dirty flag, uniform values)
- `content/shaders/default.frag.glsl`, `content/shaders/fullscreen.vert.glsl`
- `tests/unit/parse-error.test.ts`, `tests/e2e/playground-compile-error.spec.ts`

**Modify**
- `content/i18n/{vi,en}.json`, `components/shell/app-header.tsx` (nav entry)
- `mdx-components.tsx` (expose embeddable `Playground`)

**Delete** — none.

## Implementation Steps

1. Install `@monaco-editor/react`.
2. `glsl-language.ts` (D4): `monaco.languages.register({ id: 'glsl' })`, Monarch rules (types, qualifiers, built-ins, preprocessor, swizzle, numbers, comments), `setLanguageConfiguration` (brackets, autoClosing, comments), `registerCompletionItemProvider` for built-ins + `uTime/uResolution/uMouse`. Register once per page (guard against double registration under HMR).
3. `assemble.ts`: exported `FRAG_PRELUDE` (`#version 300 es`, `precision highp float`, uniform declarations, `out vec4 fragColor`) and `PRELUDE_LINES = FRAG_PRELUDE.split('\n').length`. Single source of truth for the offset.
4. `compile.ts`: create shader → compile → on failure return `{ ok: false, log }`, on success link program and return handles; always `deleteShader`/`deleteProgram` for replaced artifacts.
5. `parse-error.ts`: regex `ERROR: <col>:<line>: <message>` (ANGLE/Chrome) plus Firefox/Safari variants; map `line - PRELUDE_LINES` clamped ≥1; return `{ line, column, message, severity }[]`. Unit-test with captured logs from all three formats.
6. `shader-preview.tsx`: R3F `<Canvas>` + fullscreen triangle/quad, `ShaderMaterial` with `uTime/uResolution/uMouse`; on new valid source, rebuild material and dispose old; on invalid, keep previous.
7. `glsl-editor.tsx`: dynamic import, `ssr: false`, theme synced with next-themes (`vs-dark`/`vs`), debounce 300ms → compile; `setModelMarkers` from parse output.
8. `error-list.tsx`: `Alert` list, click → jump to line; empty state = "compiled ✓" badge with compile time.
9. `uniform-panel.tsx`: parse `uniform` declarations from user source (simple regex over top-level lines) → render sliders/color pickers for supported types (`float`, `vec2`, `vec3` as color, `bool`, `int`); values stored in `uniformsJson`.
10. `lib/playground.ts` server actions + `snippet-bar.tsx` (`Select` list + save `Dialog` + delete confirm). Validate title length and shader source size (cap, e.g. 64KB) server-side.
11. Embeddable variant: same client component with `compact` layout for MDX/exercises; respects visibility gate from Phase 4.
12. Tests: unit on `parse-error` (3 log formats, off-by-one boundary at line 1), e2e (type a syntax error → marker on the expected line, canvas still rendering, no console error escalation).

## Todo List

- [ ] Install `@monaco-editor/react`
- [ ] GLSL Monarch tokenizer + completions + language config (D4)
- [ ] Prelude assembly with single-source `PRELUDE_LINES`
- [ ] Compile + link with strict resource disposal
- [ ] Error log parser (Chrome/Firefox/Safari) + unit tests
- [ ] Shader preview (fullscreen quad, default uniforms)
- [ ] Editor pane, theme sync, 300ms debounce, markers
- [ ] Error list with jump-to-line
- [ ] Uniform panel from parsed declarations
- [ ] Snippet CRUD server actions + UI (`playground_snippets`)
- [ ] `Resizable` layout per §7
- [ ] Embeddable compact playground for lessons/exercises
- [ ] e2e: syntax error shows correct line, app alive

## Success Criteria

- **§9 phase 5 DoD:** editing a shader updates the preview immediately; errors show on the correct line.
- **§11.5:** syntax error → error message with line number, app does not crash, previous frame keeps rendering.
- Deliberate error on user line 1 and on the last line both map exactly (prelude offset correct).
- Save snippet → reload page → snippet loads with identical source and uniform values.
- Recompiling 100× shows no growth in WebGL program count (leak check via `WEBGL_debug` counters or manual instrumentation).
- Playground pane resizes via keyboard (Resizable handle focusable).

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Line offset wrong → wrong marker (violates §11.5) | H×H | `PRELUDE_LINES` derived from the prelude string itself, never hardcoded; boundary unit tests |
| Browser-specific info-log formats unparsed | H×M | Parser handles 3 formats + fallback "show raw log" so the user always sees something |
| Monaco SSR/bundle failure | M×M | `dynamic(..., { ssr: false })`, loading `Skeleton`; route-level code split |
| GPU hang from pathological shader (huge loop) | M×H | Cannot fully prevent; mitigate with a compile-time heuristic warning on large literal loop bounds + docs note; browser resets context, app shows recovery `Alert` on `webglcontextlost` |
| Program/shader leak on rapid edits | M×H | Explicit delete of previous shaders/program each compile + counter assertion in test |
| Monaco language registered twice under HMR | M×L | Idempotent registration guard |
| Editor keybindings trap keyboard users | L×M | Documented `Esc` to leave editor focus; skip-link around the editor pane |

## Security Considerations

- Shader source is user-authored but runs only in the local browser's GL context — no server-side eval. Still: cap source size and snippet count server-side to avoid unbounded DB growth.
- Validate `forkedFromLesson` against `LESSON_SLUGS`; sanitize snippet titles on render (React escaping is sufficient — no `dangerouslySetInnerHTML`).
- `uniformsJson` parsed with a schema validator before use; malformed JSON must not throw at render.

## Rollback

Revert phase commit; `/playground` route disappears; lessons with `hasPlayground` degrade to theory+demo. `playground_snippets` rows remain (harmless).

## Next Steps

→ [Phase 6](phase-06-exercise-system.md): `shader`-kind exercises embed this playground with starter code.

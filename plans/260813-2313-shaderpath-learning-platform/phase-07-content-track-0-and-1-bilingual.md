# Phase 7 — Real Content: Track 0 + Track 1, Fully Bilingual (Golden Sample)

## Context Links

- Spec: §0 (4 mandatory parts per lesson), §3.1 (types), **§3.2 (writing rules)**, §4 Track 0 + Track 1, **§10 (content quality)**, §9 phase 7, §11 last item
- Decisions: [D6](reports/spec-decisions.md) golden sample, [D9](reports/spec-decisions.md) granularity/checkpoints/exercise rule, [A3](reports/spec-decisions.md) `scripts/lint-content.ts`
- Depends on: [Phase 4](phase-04-interactive-demo-system-r3f.md), [Phase 5](phase-05-glsl-playground-monaco.md), [Phase 6](phase-06-exercise-system.md)

## Overview

- **Priority:** P1 (defines the quality bar for all remaining content)
- **Status:** Not Started
- **Effort:** ~45h (≈2h/regular lesson, checkpoints lighter; exact unit counts locked in Phase 2 metadata)
- **Description:** Author Track 0 (math foundations, ~3 modules) and Track 1 (raw WebGL, ~3–4 modules) completely in vi + en per D9: regular lessons (theory, ≥2 verifiable citations, demo, ≥2 exercises) + one checkpoint mini-build per module. This is the reference standard every later track is measured against.

## Key Insights

- This is the phase most likely to be done lazily. Mechanical rules (§3.2/§10) are enforced by a lint script (A3) so "looks fine" is not the gate.
- English is a **rewrite, not a translation** (§3.2) but must keep an identical heading structure so vi/en are diffable — the lint checks heading parity.
- Every number needs a source or an explicit "estimate" label (§10). Prefer primary sources: Khronos WebGL/GLSL ES specs, Real-Time Rendering, The Book of Shaders, Inigo Quilez, three.js docs/source, GPU Gems, pbr-book.org.
- Each lesson carries a **"Lỗi hay gặp" / "Common mistakes"** callout (§10) — concrete failure, not generic advice.
- Track 1 demos should include at least one **raw WebGL2** path (no three.js) — the track's whole point is understanding the API underneath (§4 Track 1).
- Author in vertical slices: one lesson fully finished (both locales, demo, exercises, citations) before starting the next. Half-finished lessons in both languages are worse than fewer complete ones.

## Requirements

**Per-lesson mandatory artifacts** (folder `content/lessons/<track>/<lesson>/`)
- `meta.ts` — complete `LessonMeta`: bilingual title/summary/objectives, difficulty, minutes, tags, prerequisites, `hasDemo`, `hasPlayground`.
- `theory.vi.mdx` + `theory.en.mdx` — real prose explaining *why*, KaTeX for every formula, runnable code (no pseudo-code), same headings both locales, one "Lỗi hay gặp" callout.
- `references.ts` — ≥2 `Citation` with working URLs and a bilingual `note` explaining why to read it (regular lessons; optional for checkpoints — D9).
- `exercises.ts` — per D9: regular lesson ≥2 `Exercise` (one `concept` + one `code`); checkpoint lesson ≥1 `build` with checklist; each with hints, bilingual.
- `demo.tsx` — interactive demo where `hasDemo: true` (target: every Track 0/1 regular lesson).

**Topic coverage (§4 bullets — chunked into modules/lessons per D9 in the Phase 2 metadata; Track 0 ≈ 3 modules + 3 checkpoints incl. 1 elective quaternion lesson, Track 1 ≈ 3–4 modules + checkpoints)**

Track 0 — math foundations: 1) cartesian coords & UV space · 2) vectors: add/dot/cross/normalize + geometric meaning · 3) matrices 2×2/3×3/4×4 + homogeneous coords · 4) model→view→projection pipeline · 5) Euler angles & gimbal lock · 6) quaternions (when needed, when not) · 7) trigonometry for animation (sin/cos/atan2) · 8) interpolation: lerp/slerp/smoothstep/easing · 9) color spaces: sRGB vs linear, gamma.

Track 1 — raw WebGL: 1) what WebGL is and isn't · 2) rendering pipeline end-to-end · 3) `getContext`, canvas sizing, devicePixelRatio · 4) VBO, VAO, `bufferData` · 5) vertex/fragment shaders & rasterization · 6) attribute vs uniform vs varying · 7) first triangle in raw WebGL2 · 8) textures: upload, sampler, wrap, mipmap · 9) framebuffer objects & render-to-texture · 10) depth buffer & z-fighting · 11) blending & alpha · 12) WebGL2 vs WebGL1 vs WebGPU (context).

## Architecture

```
content/lessons/00-math/<slug>/{meta.ts, theory.vi.mdx, theory.en.mdx, exercises.ts, references.ts, demo.tsx, *.glsl}
content/lessons/01-webgl/<slug>/{…}
        │
        ├─ curriculum metadata (Phase 2) must already list the slug — meta.ts is the detail record
        ├─ pnpm gen:registry → registry entries appear as MDX files land
        └─ scripts/lint-content.ts → CI/precommit gate
```

Authoring loop per lesson: outline (headings, both locales) → vi theory → demo → exercises → citations → en rewrite → lint → self-review → commit.

## Related Code Files

**Create**
- 21 lesson folders × ~5–6 files (≈120 files) under `content/lessons/00-math/` and `content/lessons/01-webgl/`
- `scripts/lint-content.ts` (A3)
- `content/lessons/_template/` — skeleton files for a new lesson (copy-to-start)
- `tests/unit/content-lint.test.ts`

**Modify**
- `content/tracks/00-math.ts`, `content/tracks/01-webgl.ts` (final minutes/difficulty/prereqs after authoring)
- `content/lesson-registry.generated.ts` (regenerated)
- `package.json` (`lint:content` script; add to precommit)

**Delete** — placeholder/demo-only files from Phases 3–6 that were superseded (only if fully replaced by real lesson content).

## Implementation Steps

1. Build `scripts/lint-content.ts` first (A3), rules split by `kind` (D9). Regular lesson: both locale files exist · heading text-tree parity vi/en (same depth + count) · ≥2 citations, each with `url` · ≥2 exercises incl. kinds `concept`+`code` · "Lỗi hay gặp"/"Common mistakes" callout present in both locales. Checkpoint: ≥1 `build` exercise with ≥3 checklist items · brief theory (goal/requirements) both locales. Both kinds: every exercise has ≥1 hint and ≥1 checklist item · `hasDemo` ⇔ `demo.tsx` exists · `meta.slug` matches folder + exists in `LESSON_SLUGS` · no duplicate `exerciseId`.
2. Create `_template` lesson folder; verify lint fails on the template (proves the gate works).
3. Author Track 0 lesson-by-lesson in curriculum order (lesson 2 "vectors" and any lesson already partially built in Phases 3/4/6 get finished first).
4. For each math lesson: KaTeX for every formula (e.g. write the full $\mathbf{p}_{clip}=P\,V\,M\,\mathbf{p}_{model}$ chain, not prose hand-waving, per §3.2); demo visualizes the formula, not decorative.
5. Author Track 1 in order; lesson 7 ("first triangle") must be raw WebGL2 with complete runnable source; lessons 8–11 reuse the demo wrapper with real GL state changes.
6. Citations: verify each URL resolves at authoring time; record `year`/`authors` where applicable; add a bilingual `note` on why it's worth reading.
7. Common-mistakes callouts: use concrete instances (e.g. missing `texture.needsUpdate`, matrix multiply order, `THREE.Color` color-space misuse, forgetting `gl.viewport` after resize).
8. English pass: rewrite naturally from the vi outline; do not machine-translate; keep heading structure identical.
9. Run `pnpm lint:content` + `pnpm typecheck` + `pnpm build`; fix all findings.
10. Read-through review of 3 random lessons for §10 compliance (no generic filler, numbers sourced, code runnable).
11. Update track metadata (`estimatedMinutes`, `difficulty`, `prerequisites`) to reflect the finished lessons.

## Todo List

- [ ] `scripts/lint-content.ts` + `_template` lesson
- [ ] Track 0: ~3 modules (regular lessons: theory vi+en, demo, ≥2 citations, ≥2 exercises; + checkpoint build per module) — one checkbox per unit when executing
- [ ] Track 1: ~3–4 modules incl. raw WebGL2 triangle lesson + checkpoints
- [ ] All citation URLs verified live
- [ ] Common-mistakes callout in all 21 lessons, both locales
- [ ] Registry regenerated; roadmap shows Tracks 0–1 as authored
- [ ] `lint:content` green; typecheck/build clean
- [ ] Track metadata finalized

## Success Criteria

- **§9 phase 7 DoD (as amended by D9):** every regular lesson has all 4 parts, ≥2 citations, ≥2 exercises (concept+code); every module ends in a checkpoint build.
- **§11 last item (amended by D9):** every Track 0/1 regular lesson has objectives, theory in both languages, ≥2 citations, ≥2 exercises.
- `pnpm lint:content` exits 0 across both tracks.
- vi and en heading trees are identical per lesson (lint-enforced); en reads as native prose, not translationese (spot-checked).
- Every formula rendered by KaTeX; no formula written as plain ASCII prose.
- Every code block in Track 1 is runnable as-is or explicitly labelled with its surrounding context (§10).
- All 21 lessons reachable from roadmap; each demo runs and pauses off-screen; each exercise flow persists.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Quality drift / generic filler under volume pressure | H×H | Lint gate (A3) + one-lesson-at-a-time vertical slices + read-through review of random lessons |
| en becomes machine translation | H×M | Author from the outline, not the vi sentences; heading parity checked mechanically, tone checked by review |
| Citation URL rot | M×M | Prefer stable sources (Khronos spec, pbr-book, iquilezles.org); verify at authoring; record year/author so a dead link is still traceable |
| Scope creep per lesson (2h → 6h) | H×M | Time-box: theory ≤1200 words per locale, demo ≤1 canvas, 3–4 exercises. Deeper material goes into the citation notes |
| Math errors in Track 0 propagate everywhere | M×H | Verify each formula numerically inside its demo (demo output is the proof) |
| Raw WebGL2 sample rots vs the wrapper abstractions | L×M | Keep the raw lesson self-contained; no shared helpers |
| Build time grows with MDX volume | M×L | Measure at end of phase; revisit shiki config if >2 min |

## Security Considerations

- No user-generated content; all MDX is repo-authored → no injection surface.
- External URLs in citations are links only, never fetched at build/runtime; add `rel="noopener noreferrer"` for external anchors in `mdx-components.tsx`.
- Reference images stored locally under `public/` — no hotlinking to third-party assets.

## Rollback

Content is additive: revert per-lesson commits independently. Registry regeneration makes removed lessons disappear cleanly; curriculum metadata entry must be removed in the same commit to avoid dangling registry keys.

## Next Steps

→ [Phase 8](phase-08-notes-command-palette-stats-srs.md): with real prose available, build search/notes/stats/SRS on top.
Track 0/1 folders become the copy-source template for [Phase 9](phase-09-content-tracks-2-to-13.md).

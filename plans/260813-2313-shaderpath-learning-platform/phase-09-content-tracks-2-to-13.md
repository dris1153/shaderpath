# Phase 9 — Remaining Content: Tracks 2 → 13

## Context Links

- Spec: §3.2 (writing rules), §4 Tracks 2–13, §10 (content quality), §9 phase 9, §11 last item
- Decisions: [D6](reports/spec-decisions.md) one-track-per-session marathon, [D9](reports/spec-decisions.md) granularity/checkpoints/exercise rule, [A3](reports/spec-decisions.md) content lint as per-track gate
- Depends on: [Phase 7](phase-07-content-track-0-and-1-bilingual.md) (golden sample + lint script + `_template`)

## Overview

- **Priority:** P2 (highest volume, lowest per-unit risk — the platform already works)
- **Status:** ✅ Complete (2026-08-14) — all 12 tracks (133 units) authored, gated & committed; full curriculum now 162/162 units
- **Effort:** ~220h (~110 lessons × ~2h; capstones larger)
- **Description:** Author the remaining 12 tracks (~110 bilingual lessons) to the Track 0/1 standard. Executed as 12 independent sub-iterations, one track per session.

## Key Insights

- §9 phase 9 gives no "definition of done" — it inherits Track 0/1's bar. The lint script (A3) is the mechanical gate; a per-track review is the judgment gate.
- **Never author more than one track in a sitting** (D6). Quality drift, not technical failure, is what kills this phase.
- Tracks 8, 9, 11 must keep mathematical rigor — simplification that becomes *wrong* is a defect (§10). Verify formulas numerically in the demo where possible.
- Tracks 9 and 13 demos are heavy (GPGPU, 1M particles, full scenes) — they stress the Phase 4 disposal/pause guarantees more than anything before. Expect to find leaks here; fix them in the wrapper, not per-demo.
- Track 13 capstones are checkpoint-shaped lessons (D9): the project *is* the `build` exercise, but theory + citations + common-mistakes rules still apply.

## Requirements

**Per lesson** — identical to Phase 7 (as amended by D9): `meta.ts`, `theory.vi.mdx` + `theory.en.mdx` (same heading tree), regular lesson: ≥2 verifiable citations with bilingual notes + ≥2 exercises (`concept`+`code`); checkpoint per module: ≥1 `build` exercise with checklist; demo where `hasDemo`, one "Lỗi hay gặp"/"Common mistakes" callout, KaTeX for all formulas, runnable code only.

**Track breakdown (pre-D9 bullet counts — final module/lesson split per D9 is locked in the Phase 2 metadata; expect ±20% after merges/splits plus ~2–3 checkpoints and ~1–2 electives per track)**

| Track | Topic | Lessons | Notes |
|---|---|---|---|
| 2 | GLSL Fundamentals | 8 | Demos reuse the embedded playground heavily |
| 3 | Three.js Core (vanilla) | 11 | Includes a source-reading lesson (`WebGLRenderer`, `Object3D`) |
| 4 | React Three Fiber | 10 | Disposal/leak lesson must reference the platform's own `useDisposable` |
| 5 | GSAP & advanced animation | 10 | Includes the ScrollTrigger↔R3F single-loop lesson (§8.4) |
| 6 | Custom shaders in Three.js | 9 | `onBeforeCompile`, chunk overrides, TSL context |
| 7 | Procedural & noise | 8 | Cite Inigo Quilez, The Book of Shaders |
| 8 | Raymarching & SDF | 10 | Math rigor critical; heavy fragment shaders → quality tier |
| 9 | GPGPU, particles, simulation | 10 | Heaviest demos; FBO ping-pong, instancing |
| 10 | Post-processing | 10 | Pass order + fillrate cost lessons |
| 11 | PBR & lighting theory | 9 | Rendering equation, BRDF — highest math density |
| 12 | Performance & production | 11 | Includes Next.js SSR/hydration + canvas lesson |
| 13 | Capstone projects | 4 | Scroll product showcase · raymarched landscape · GPU particles · 3D-hero portfolio (Lighthouse >90) |

Total ≈ 110 content lessons → ≈ 130–140 units after D9 (checkpoints + electives).

## Architecture

```
Per-track sub-iteration (one session):
  read track bullets (§4) → confirm slugs in content/tracks/NN-*.ts
    → copy content/lessons/_template per lesson
    → author vi → demo → exercises → citations → en rewrite
    → pnpm gen:registry && pnpm gen:search && pnpm lint:content
    → review pass (2 random lessons, §10 checklist)
    → typecheck + build + commit "content(track-NN): …"
    → STOP
```

No cross-track dependencies in code; only curriculum `prerequisites` link them. Each track's folder is disjoint → tracks could be parallelized across sessions without file conflicts (only `content/lesson-registry.generated.ts` and `search-index.generated.json` are shared → regenerate, don't hand-merge).

## Related Code Files

**Create**
- `content/lessons/02-glsl/…` … `content/lessons/13-capstone/…` — ~110 folders × 5–6 files (~600 files)
- Per-track shader assets under the lesson folders (`*.glsl`), reference images under `public/reference/<track>/`

**Modify**
- `content/tracks/02-*.ts` … `content/tracks/13-*.ts` (final minutes/difficulty/prereqs per track)
- `content/lesson-registry.generated.ts`, `content/search-index.generated.json` (regenerated each track)

**Delete** — none.

## Implementation Steps

1. Per track, re-read the §4 bullet list and lock the lesson slug list before writing prose (slug churn later breaks notes/bookmarks anchors).
2. Author lessons in order; keep each lesson a complete vertical slice (both locales finished before moving on).
3. Track 2: lean on the embedded playground — most exercises are `shader` kind with starter code.
4. Track 3–4: pair each vanilla-three lesson concept with its R3F counterpart in Track 4 (cross-link via citations/`prerequisites`, no duplicated prose — DRY).
5. Track 5: the ScrollTrigger↔R3F lesson must demonstrate the single-loop rule the platform itself enforces (§8.4).
6. Tracks 7–9: shader-heavy demos — set `hasPlayground: true` where the reader should tweak the shader; cap concurrent canvases per lesson at 2.
7. Track 9 + 13: profile each demo before committing (frame time, GPU memory, dispose check across 20 mounts).
8. Track 11: every formula in KaTeX, derivation steps shown; verify Fresnel/BRDF numbers against a cited reference.
9. Track 12: reuse real measurements from this app (build size, frame times) as examples — label them as measured on the dev machine (§10 "numbers need a source or estimate label").
10. Track 13: each capstone gets a checklist-driven build lesson + a runnable reference demo; the Lighthouse>90 capstone doubles as validation for Phase 10.
11. Run the gate after every track: `pnpm lint:content && pnpm typecheck && pnpm build`; commit; stop.

## Todo List

- [x] Track 2 — GLSL Fundamentals (10 units per D9) → lint + review + commit ✅
- [x] Track 3 — Three.js Core (15 units) ✅
- [x] Track 4 — React Three Fiber (13 units) ✅
- [x] Track 5 — GSAP & animation (13 units) ✅ ef2ff28
- [x] Track 6 — Custom shaders (10 units) ✅ 2993269
- [x] Track 7 — Procedural & noise (10 units) ✅ 079ebf8
- [x] Track 8 — Raymarching & SDF (13 units) ✅ 3fff912
- [x] Track 9 — GPGPU & particles (12 units) ✅ e6e1590
- [x] Track 10 — Post-processing (10 units) ✅ 9c00add
- [x] Track 11 — PBR & lighting (11 units) ✅ 3f48025
- [x] Track 12 — Performance & production (13 units) ✅ d3c515e
- [x] Track 13 — Capstones (4 units) ✅ 4b68544

## Notes (post-implementation, 2026-08-14)

- Executed as sequential per-track waves of 2–6 parallel fullstack-developer agents (2–2.5 units each) reading the shared brief (`reports/phase7-authoring-brief.md`, extended per track: GSAP DOM demos + internal scroller, Track 6 cache-key/ShaderChunk rules, Track 9 FBO-dispose + 256² cap, Track 10 composer takeover pattern, Track 11 KaTeX+cited-constants + procedural environments, Track 12 platform-as-case-study).
- Gate per track: gen:registry → cumulative `lint:content --require` → typecheck → eslint → vitest (53/53) → build → e2e (18/18) → spot-read → commit. Every gate green on first or second run; only 2 manual fixes across 12 tracks (Track 4 memoizing demo hooks, Track 10 two eslint warnings).
- Agents verified claims against installed sources (three 0.185.1, R3F 9.7.0, drei 10.7.8, gsap 3.15, Next 16 docs in node_modules); several corrected the brief itself (GPUComputationRenderer.dispose exists; PCFSoftShadowMap deprecated → remaps to PCF; sRGB-decode-skip washes out albedo, not darkens; actual hook filename `use-visible-frameloop.ts`).
- Final registry: 162 theory / 128 references / 124 demos / 162 exercises; content lint 0 errors, 15 soft word-count warnings (1500+ vi theories — acceptable, revisit in Phase 10 only if desired).
- Known Phase-10 sweep items: legacy exercise prompts using `**bold**` (renderer strips nothing — shows literal asterisks; includes checkpoint-waving-flag, checkpoint-raymarched-vista); `build`-kind checkpoint solutions highlight as TS even when GLSL (exercise-section.tsx limitation).
- [ ] Final full-content lint + registry/search regen + build

## Success Criteria

- **§9 phase 9:** Tracks 2–13 authored (no DoD in spec → inherits Phase 7's bar).
- **§11 last item (amended by D9):** every unit in the app satisfies its kind's rules (regular: objectives, bilingual theory, ≥2 citations, ≥2 exercises; checkpoint: build + checklist) — `pnpm lint:content` exits 0 over all ~160 units.
- Roadmap shows 13 tracks fully populated; no lesson slug without content; no content folder without a curriculum entry.
- Every demo in Tracks 8/9/13 survives a 20× mount/unmount cycle without linear memory growth (§11.3).
- Capstone 4 (portfolio hero) reaches Lighthouse > 90 as specified in §4 Track 13 — corroborates Phase 10.
- Random spot-check of 5 lessons across tracks passes the §10 review: no generic filler, sourced numbers, runnable code, real common-mistakes callout.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Burnout / quality collapse over ~110 lessons | H×H | Strict one-track-per-session (D6); lint gate + review gate per track; stop at track boundary, never mid-track |
| Over-simplification becomes factually wrong (T8/9/11) | M×H | Verify against cited primary sources; numeric verification inside demos; do not paraphrase math from memory |
| Heavy demos (GPGPU/1M particles) leak or hang | M×H | Profile before commit; fixes go into the Phase 4 wrapper so all demos benefit; quality tier fallback |
| Slug churn breaks existing notes/bookmarks anchors | M×M | Lock slugs before authoring a track; if a rename is unavoidable, ship a data migration for `notes`/`bookmarks`/`progress` rows |
| Build/CI time growth (~260 MDX files) | M×M | Measure per track; if >3 min, restrict shiki langs / cache highlighter |
| Scope creep in capstones (they are real projects) | H×M | Capstone = guided build with checkpoints + reference demo, not a production app; time-box each to ~8h |
| Registry/search-index merge conflicts if tracks are parallelized | M×L | Never hand-edit generated files; regenerate after merge |

## Security Considerations

- Same as Phase 7: repo-authored content only, no runtime MDX evaluation, external citations are links (`rel="noopener noreferrer"`), assets stored locally.
- Track 12 lessons must not include real machine identifiers, paths with usernames, or captured tokens in profiling screenshots/outputs.

## Rollback

Per-track commits are independent — revert a track's commit plus its curriculum entries and regenerate the registry/search index. Content removal never touches schema.

## Next Steps

→ [Phase 10](phase-10-polish-a11y-performance-export.md): final a11y/performance/export sweep against the complete content set.

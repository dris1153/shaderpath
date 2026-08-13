# Brainstorm Report — Lesson Granularity & Curriculum Structure

**Date:** 2026-08-13 · **Status:** APPROVED by user · **Outcome:** Decision D9 in [spec-decisions.md](spec-decisions.md)

## Problem

Spec §4 lists ~131 topic bullets across 13 tracks. Open question: how to chunk into lessons so a solo learner with **irregular session lengths** (20min–2h) is never overwhelmed, yet reaches senior-level depth. "1 bullet = 1 lesson" was the placeholder assumption.

## Research inputs

- [researcher-01-benchmark-curriculum-structures.md](../research/researcher-01-benchmark-curriculum-structures.md) — Three.js Journey (66 lessons, project every ~10 lessons), Book of Shaders (1 concept/chapter, live editing), WebGL Fundamentals, LearnOpenGL, Heckel, Quilez, Frontend Masters.
- [researcher-02-learning-science-chunking.md](../research/researcher-02-learning-science-chunking.md) — cognitive load (4±1 chunks/lesson), 15–45min ceiling for high element-interactivity content, worked-example + faded scaffolding, SRS offloads retention, module-level progress display prevents big-number overwhelm.

Key reconciliation: benchmarks say module = 3–5 lessons; learning-science generic heuristic said 8–12 — rejected the latter (calibrated for drill-style content, not 30–45min deep lessons).

## User constraints (asked 2026-08-13)

1. Session length: irregular → lessons must complete in short sessions; exercises separable to later session.
2. Mini-build checkpoint at end of every module: YES.
3. Core/elective tiering: YES.

## Options evaluated

| Option | Shape | Verdict |
|---|---|---|
| A — Few big lessons (Three.js Journey style) | ~55–65 × 60–90min | ❌ Conflicts with irregular sessions; >4±1 concepts/lesson in math tracks |
| B — 1 mental model/lesson, modules with checkpoint builds | ~160 units in ~40 modules | ✅ **CHOSEN** |
| C — Spiral 2-pass (shallow all tracks, then deep) | 2 versions per topic | ❌ Rewrites spec §4 entirely; ~1.5× authoring cost; elective tier + SRS already give partial spiral effect |

## Decision (Option B) — see D9 for normative rules

- Lesson = 1 mental model, 20–45min. Merge bullets <10min sharing a worked example; split on intrinsic-load jumps.
- Module = 3–5 lessons + 1 **checkpoint** (mini-build, no new theory). Track = 2–4 modules.
- `tier: core | elective` (elective ~15–20%, never gates unlock). `kind: lesson | checkpoint`.
- Roadmap displays **modules** (progress rings); lessons visible on expand — learner never faces a flat 160-item list.
- Exercise rule amended (was: every lesson ≥3 incl. build): regular lesson ≥2 (concept + code); **build work concentrates in checkpoints**. Net authoring ≈ neutral (~35 checkpoint builds replace ~131 per-lesson builds).
- Insight that reframed the problem: chunking doesn't reduce knowledge volume; overwhelm is managed by session fit + visibility + apply-checkpoints, NOT by cutting content. Total units grow (~131 → ~160) while perceived size shrinks (~40 modules).

## Implications

- Phase 2: `LessonMeta` gains `tier` + `kind`; per-track metadata applies split/merge rules; roadmap renders module-first; unlock counts core only. Final counts locked in Phase 2 (slug churn later breaks notes/bookmarks anchors).
- Phase 7/9: per-lesson artifact rules change per D9 (checkpoint lessons: 1 build exercise + checklist, citations optional); content lint (A3) encodes both variants.
- No DB schema change.

## Risks

- Checkpoint builds ~35 extra authored units — mitigated by dropping per-lesson build requirement.
- Merge/split judgment calls per track — resolved during Phase 2 metadata authoring, validated against 20–45min target.

## Success metrics

- Every regular lesson completable (theory+demo+1 exercise) in ≤45min.
- Roadmap first paint shows ≤45 visible units (tracks/modules), never the flat lesson list.
- Core path completable without any elective; electives cover full senior-depth topics.

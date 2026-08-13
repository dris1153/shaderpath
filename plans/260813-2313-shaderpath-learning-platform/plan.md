---
title: "Shaderpath — Self-Hosted 3D/Shader Learning Platform"
description: "Next.js single-user platform teaching Three.js/WebGL/GLSL/GSAP: 13 tracks, bilingual MDX lessons, interactive demos, GLSL playground, SQLite progress."
status: pending
priority: P2
effort: ~350h (~130h platform + ~220h content)
branch: main
tags: [nextjs, threejs, webgl, glsl, mdx, sqlite, i18n, learning-platform]
created: 2026-08-13
---

# Shaderpath — Implementation Plan

**Spec (source of truth):** `../../prompt-webgl-learning-platform.md` (Vietnamese)
**Decisions overriding spec:** [reports/spec-decisions.md](reports/spec-decisions.md) (D1–D9 + A1–A4)

## Goal

Self-hosted, single-user Next.js app: structured path from zero → proficient in Three.js, WebGL, GLSL, GSAP.
Content hardcoded in repo (TS/MDX), SQLite stores progress only, UI = stock shadcn/ui, bilingual (vi default + en) from day one.
Every lesson = Theory → Citations → Interactive demo → Exercises.

## Phases (sequential, each independently runnable — spec §9)

| # | Phase | Status | Effort | Doc |
|---|-------|--------|--------|-----|
| 1 | Scaffold Next.js + shadcn + next-intl + Drizzle; layout, theme, language switcher | ✅ Complete (2026-08-13) | 8h | [phase-01](phase-01-scaffold-nextjs-shadcn-intl-drizzle.md) |
| 2 | Content pipeline: MDX + KaTeX + shiki, `LessonMeta`, `curriculum.ts` (14 tracks, metadata only) | ✅ Complete (2026-08-14) | 10h | [phase-02](phase-02-content-pipeline-mdx-katex-shiki-curriculum.md) |
| 3 | Lesson page + TOC + progress tracking + SQLite read/write | ✅ Complete (2026-08-14) | 10h | [phase-03](phase-03-lesson-page-toc-progress-tracking.md) |
| 4 | Demo system: `<Demo>` wrapper, control panel, IntersectionObserver pause | ✅ Complete (2026-08-14) | 10h | [phase-04](phase-04-interactive-demo-system-r3f.md) |
| 5 | GLSL Playground: Monaco + live compile + error mapping + snippet save | ✅ Complete (2026-08-14) | 12h | [phase-05](phase-05-glsl-playground-monaco.md) |
| 6 | Exercise system: hints, checklist, solution reveal, code persistence | Not Started | 8h | [phase-06](phase-06-exercise-system.md) |
| 7 | Real content: Track 0 + Track 1 fully bilingual (golden sample) | Not Started | 45h | [phase-07](phase-07-content-track-0-and-1-bilingual.md) |
| 8 | Notes, bookmarks, command palette, stats + heatmap, SRS | Not Started | 14h | [phase-08](phase-08-notes-command-palette-stats-srs.md) |
| 9 | Remaining content: Tracks 2 → 13 (~110 lessons, one track per session) | Not Started | 220h | [phase-09](phase-09-content-tracks-2-to-13.md) |
| 10 | Polish: a11y, performance audit, export/import, acceptance sweep | Not Started | 14h | [phase-10](phase-10-polish-a11y-performance-export.md) |

## Dependency Graph

```
1 ──> 2 ──> 3 ──> 4 ──> 5 ──> 6 ──> 7 ──> 8 ──> 9 ──> 10
      │     │           │     │           │
      │     └───────────┴─────┴──> 6 (lesson page + playground host exercises)
      └──> 9 (curriculum metadata must exist before any lesson content)
      7 ──> 8 (command palette needs indexable content)
```

Hard blockers:
- 2 blocked by 1 (next.config MDX + `.glsl` rules, i18n routing).
- 3 blocked by 2 (curriculum + lesson import registry) and 1 (DB schema, full §5 set defined once — A1).
- 4 blocked by 3 (demo renders inside lesson body); 5 blocked by 1 (`.glsl` raw import) + 4 (canvas wrapper).
- 6 blocked by 3 + 5 (`shader` exercises embed playground).
- 7 blocked by 4/5/6 (all four lesson parts must render before authoring at scale).
- 8 blocked by 3 (progress/session data) + 7 (search index needs prose).
- 9 blocked by 7 (Track 0/1 are the quality template + content lint gate).
- 10 blocked by 9 (final acceptance runs against complete content).

Cross-phase shared files (sequential execution, so no parallel ownership conflict): `next.config.ts` (1,2), `app/[locale]/layout.tsx` (1,2,3,8), `db/schema.ts` (1 only — later phases read).

## Key Constraints (spec §7, §8)

- shadcn components only; no new CSS file beyond generated `globals.css`; no hex colors.
- TS strict, no `any`, no `@ts-ignore`; curriculum slugs type-safe (bad prerequisite = compile error).
- No memory leaks; canvases pause outside viewport (mandatory, not an optimization).
- Single render loop for GSAP + R3F; shaders live in `.glsl` files.
- better-sqlite3 only in Server Actions / Route Handlers, WAL mode, auto-migrate on boot.

## Out of Scope (spec §6.3)

Auth, multi-user, cloud sync, comments, leaderboard, AI chatbot, gamification badges.

# Phase 3 — Lesson Page + TOC + Progress Tracking + SQLite I/O

## Context Links

- Spec: §5 (`lesson_progress`, `study_sessions`), §6.1.2 (3-col layout), §6.1.3 (auto-save), §7 (responsive Sheet/Drawer), §8.6–8.7, §9 phase 3
- Decisions: [D2](reports/spec-decisions.md) typed lesson registry, A1 schema already migrated
- Depends on: [Phase 1](phase-01-scaffold-nextjs-shadcn-intl-drizzle.md), [Phase 2](phase-02-content-pipeline-mdx-katex-shiki-curriculum.md)

## Overview

- **Priority:** P1
- **Status:** ✅ Complete (2026-08-14)
- **Effort:** ~10h
- **Description:** Render a lesson from the registry in a 3-column layout with sticky auto-highlighting TOC, and persist reading progress (scroll %, time spent, status) to SQLite with resume-on-reload.

## Key Insights

- TOC must come from the MDX at build time, not DOM scraping — a remark plugin exports `toc` from each lesson module, so RSC can render the TOC without hydrating the body.
- Time tracking must stop when the tab is hidden (`visibilitychange`) or the app will report fantasy hours (§6.1.3).
- Scroll restore after hydration: restoring before content height stabilizes lands at the wrong offset — restore after MDX + images settle, and only if `scrollPercent > 2%`.
- Debounced 5s writes + a `sendBeacon`/`pagehide` flush; without the flush, the last segment of every session is lost.
- Progress writes go through Server Actions only; better-sqlite3 is sync and must never appear in a client bundle (§8.7).

## Requirements

**Functional**
- `/[locale]/lesson/[lessonSlug]` renders: left module sidebar (`ScrollArea` + `Accordion`), center MDX body (theory → demo slot → exercises slot → references), right sticky TOC (§6.1.2).
- TOC highlights the active heading on scroll; clicking scrolls with anchors.
- Progress: `status` transitions `not_started → in_progress` on open, `completed` on explicit "Mark complete" (+ optional 1–5 confidence, §5).
- `scrollPercent` and `timeSpentSeconds` persist; reopening resumes at saved position.
- A `study_sessions` row opens on lesson entry and closes on exit/hide with `durationSeconds`.
- Mobile: sidebar → `Sheet`, TOC → `Drawer`/`Sheet` (§7).
- Prev/next lesson navigation; locked lessons show "learn anyway" (§6.1.1).

**Non-functional**
- No layout shift on TOC highlight; no re-render storm (scroll handler rAF-throttled).
- Loading + error states for every async surface — no white screens (§7).
- Locale switch on a lesson keeps position (§11.1).

## Architecture

```
RSC page
  ├─ getLesson(slug) from lib/curriculum
  ├─ registry[slug][locale]() → { default: MDXContent, toc, frontmatter? }
  ├─ getProgress(slug) → server read (drizzle)
  └─ renders Sidebar(RSC) + <LessonBody> + <LessonToc toc>

Client island <ProgressTracker slug initial>
  scroll (rAF throttle) ─┐
  visibilitychange ──────┼─> zustand ephemeral store ─> debounce 5s ─> useMutation
  interval tick (1s, only when visible) ─┘                                │
  pagehide/beforeunload ─> flush (keepalive fetch to Route Handler)       │
                                                                          v
                                       Server Action lib/progress.ts → drizzle upsert
```

`scrollPercent = scrollTop / (scrollHeight - clientHeight)` on the content container, clamped 0–1 (stored as `real`, §5).
TanStack Query holds the progress cache; optimistic update on write, invalidate roadmap/dashboard queries.

## Related Code Files

**Create**
- `app/[locale]/lesson/[lessonSlug]/page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- `components/lesson/lesson-shell.tsx` (3-col grid), `lesson-sidebar.tsx`, `lesson-toc.tsx`, `lesson-header.tsx` (title, difficulty, minutes, objectives), `lesson-footer-nav.tsx`, `mark-complete.tsx` (confidence 1–5)
- `components/lesson/progress-tracker.tsx` (`'use client'`)
- `components/lesson/references.tsx` (renders `Citation[]`)
- `lib/mdx/remark-extract-toc.ts` (exports `toc: TocItem[]` from each MDX module)
- `lib/progress.ts` (`'use server'`: `getProgress`, `upsertProgress`, `markComplete`, `openSession`, `closeSession`)
- `lib/hooks/use-active-heading.ts`, `lib/hooks/use-scroll-progress.ts`, `lib/hooks/use-page-visibility.ts`
- `lib/stores/reader-store.ts` (zustand: ephemeral scroll/time state)
- `app/api/progress/flush/route.ts` (keepalive beacon endpoint)
- `tests/unit/progress.test.ts`, `tests/e2e/lesson-resume.spec.ts`

**Modify**
- `next.config.ts` (register `remark-extract-toc` in the MDX chain)
- `app/[locale]/roadmap/page.tsx`, `app/[locale]/page.tsx` (real progress instead of empty map)
- `content/i18n/{vi,en}.json`

**Delete** — none.

## Implementation Steps

1. `lib/mdx/remark-extract-toc.ts`: walk headings h2–h4, slugify (match `rehype-slug`), inject `export const toc = [...]`. Register in MDX chain.
2. Author one temporary real lesson (Track 0, first lesson — becomes permanent content per D6) so the page has something to render.
3. RSC lesson page: resolve locale + slug, 404 on unknown slug, load module from registry (D2), fetch progress row, render shell.
4. `lesson-shell.tsx`: desktop `grid-cols-[260px_minmax(0,1fr)_240px]`, `lg:` breakpoints; mobile collapses sidebar→`Sheet`, TOC→`Sheet` triggered from a sticky toolbar.
5. `lesson-toc.tsx` (`'use client'`): IntersectionObserver over heading ids with `rootMargin: '0px 0px -70% 0px'`, highlight active, smooth-scroll on click, `aria-current`.
6. `lib/progress.ts` Server Actions: upsert on `lessonSlug` unique index; `markComplete` sets `completedAt`, `status`, `confidence`; session open/close writes `study_sessions`.
7. `progress-tracker.tsx`: rAF-throttled scroll → store; 1s interval increments time only while `document.visibilityState === 'visible'`; debounce 5s → mutation; flush on `pagehide` via `navigator.sendBeacon` to the Route Handler.
8. Resume: after mount + `requestAnimationFrame` × 2 (post-hydration/layout), scroll to `scrollPercent × scrollHeight`; skip if user already scrolled or percent < 2%.
9. Status transition: on first meaningful engagement (5s visible or 5% scroll) set `in_progress` — avoids marking every accidental open.
10. Wire dashboard + roadmap to real progress; show per-track rings.
11. Loading/error/empty UI with `Skeleton` and `Alert`.
12. Tests: unit (percent clamp, time accumulation with hidden gaps, status transitions); e2e (open lesson → scroll 50% → reload → restored; time > 0 persisted).

## Todo List

- [x] remark TOC extraction plugin + registered in MDX chain
- [x] First Track 0 lesson authored as render target (D6)
- [x] Lesson RSC page + loading/error/not-found
- [x] 3-col shell + mobile Sheet/Drawer fallbacks
- [x] Sticky TOC with scroll-spy + a11y attrs
- [x] Sidebar module nav (ScrollArea + Accordion)
- [x] `lib/progress.ts` server actions + session open/close
- [x] Progress tracker island: scroll %, visible-time, 5s debounce, pagehide flush
- [x] Scroll restore on revisit
- [x] Mark complete + confidence rating
- [x] Dashboard/roadmap consume real progress
- [x] Unit + e2e tests

## Success Criteria

- **§9 phase 3 DoD:** read a lesson, reload → position and percentage remembered.
- Hidden tab for 60s adds ≤2s to `timeSpentSeconds`.
- Killing the tab mid-read still persists the last ≤5s of progress (beacon flush).
- Locale switch mid-lesson keeps scroll position and shows the `en` body, no hydration error (§11.1).
- Whole lesson page is keyboard navigable: sidebar → body → TOC, visible focus ring (§11.6 — full sweep in Phase 10).
- No `better-sqlite3` symbol in any client chunk (`pnpm build` output inspection).

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Scroll restore lands wrong (images/canvas change height) | H×M | Restore after 2 rAFs + `ResizeObserver` settle; cap one restore attempt; abort if user scrolled |
| Write amplification (every scroll → DB) | M×M | Debounce 5s + only write when percent delta > 1% or time delta ≥ 5s |
| Two tabs on same lesson double-count time | L×M | Session row per tab; on write use `MAX(scrollPercent)` and additive time — accept minor overcount, document it |
| Server Action latency blocks UI | L×M | Optimistic TanStack update; failures surface via `sonner`, never block reading |
| TOC slug mismatch between remark plugin and `rehype-slug` | M×M | Share one slugify implementation (github-slugger) in both |
| `params` is async in current Next major | M×L | Await `params` per the resolved version's API (recorded in Phase 1) |

## Security Considerations

- Server Actions validate `lessonSlug` against `LESSON_SLUGS` before any DB write — reject unknown slugs (prevents junk-row injection from a crafted client call).
- Clamp `scrollPercent` to [0,1] and `timeSpentSeconds` deltas to a sane max (e.g. ≤ 120s per write) server-side; client is untrusted even in single-user.
- Beacon Route Handler accepts same-origin POST only; no CORS.

## Rollback

Revert phase commit; DB tables stay (created in Phase 1) — orphan rows are harmless. No migration to undo.

## Notes (post-implementation, 2026-08-14)

**Deviations:**
- TOC extracted in `scripts/gen-lesson-registry.ts` (parse `##`–`####` headings + github-slugger), NOT a remark plugin — Turbopack requires MDX plugins in serializable string form; injecting `export const toc` via estree was far heavier. `TOC_REGISTRY` + `REFERENCES_REGISTRY` join `LESSON_REGISTRY` in the generated file.
- No zustand reader store — the single `ProgressTracker` island keeps state in an effect-local closure (zustand reserved for the playground, its actual spec §1 role).
- No per-lesson `meta.ts` (spec §2 tree) — metadata single-sourced in `content/tracks/*` since Phase 2.
- Missing translation → renders the other locale + notice Alert; missing content (155 lessons) → "coming soon" Alert. No white screens (§7).
- All progress-reading pages `export const dynamic = "force-dynamic"` — otherwise `next build` freezes DB state into prerendered pages.
- Base UI gotcha: `Button render={<Link/>}` needs `nativeButton={false}`.
- Confidence rating = 5 plain buttons with `role="radio"` (skipped ToggleGroup API uncertainty).
- `db/client.ts` honors `SHADERPATH_DB` env — unit tests use a tmp DB; e2e web server gets a per-run `data/e2e-<ts>.db` with `reuseExistingServer: false` (a reused server would keep a previous run's DB env). Orphaned `next dev` processes on Windows must be killed before e2e (Next 16 single-server lock).
- First real lesson authored (D6): `cartesian-and-uv-space` — vi 1249 / en 1223 words (~3% over the 1200 guideline, kept for §10 depth), 4 verified citations, canvas-2D runnable code, one mistake-callout per locale.
- Time tracking hidden-tab rule enforced by the 1s interval checking `document.visibilityState` — verified by code review; e2e does not simulate tab-hiding.

**Verification run:** typecheck ✓ · eslint ✓ (after fixing react-hooks/refs rule in tracker) · vitest 15/15 (5 progress: slug validation, clamps, accumulation, completed-stickiness, sessions; 10 curriculum) ✓ · `next build` ✓ · e2e 8/8: theory+KaTeX+shiki+TOC+references render, **scroll % + time persist across reload (§9 DoD)**, mark-complete + confidence persists ✓.

## Next Steps

→ [Phase 4](phase-04-interactive-demo-system-r3f.md): the demo slot in the lesson body gets a real `<Demo>` system.

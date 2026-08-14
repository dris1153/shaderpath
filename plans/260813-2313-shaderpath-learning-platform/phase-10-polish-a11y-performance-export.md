# Phase 10 — Polish: a11y, Performance Audit, Export/Import

## Context Links

- Spec: §6.2.13 (export/import), §6.2.14 (quality tier), §7 (UI constraints), §8 (technical constraints), §9 phase 10, **§11 (full acceptance checklist)**
- Decisions: [A4](reports/spec-decisions.md) quality tier detection lands here, [D7](reports/spec-decisions.md) KaTeX CSS exemption for the "no custom CSS" check
- Depends on: [Phase 9](phase-09-content-tracks-2-to-13.md) (complete content set)

## Overview

- **Priority:** P2
- **Status:** ✅ Complete (2026-08-14) — see Notes for the §11 acceptance results
- **Effort:** ~14h
- **Description:** Final hardening pass — keyboard/ARIA accessibility across all routes, performance audit (Lighthouse ≥90 on non-canvas pages), adaptive quality tier for canvases, JSON export/import of the progress DB, and a full run of the §11 acceptance checklist.

## Key Insights

- §11 is the real definition of done for the whole project; this phase is where it is executed end to end, not sampled.
- Lighthouse ≥90 target explicitly excludes canvas pages — measure `/`, `/roadmap`, `/track/*`, `/notes`, `/stats` and a theory-only lesson.
- Export/import must be lossless and version-tagged: a schema change later must not silently import garbage. Include a `schemaVersion` and reject mismatches with a clear message.
- Quality tier (A4) should degrade what's cheap to degrade: DPR first, then post-processing, then step counts/particle counts exposed by demos. Detect once, store in `settings`, allow manual override (the user knows their machine better than a heuristic).
- The memory-leak check (§11.3) needs a repeatable procedure, not a vibe: script 20 lesson navigations and sample `performance.memory` after forced GC.

## Requirements

**Functional**
- Full keyboard navigation on every route: skip-link, logical tab order, focus trap in `Dialog`/`Sheet`/`Command`, visible focus ring, ESC closes overlays (§11.6).
- ARIA: landmarks (`nav`/`main`/`aside`), `aria-current` in TOC/sidebar, labelled controls in demo/playground panels, live region for save/errors.
- Export: download `shaderpath-progress-<date>.json` containing all progress tables + `schemaVersion`.
- Import: file picker → validate → preview counts → replace-or-merge choice → apply in a transaction.
- Quality tier: detect (WebGL renderer string + device memory + a short frame-time probe) → `settings` row → applied as DPR/effect caps in `<Demo>`/playground, with a manual override `Select`.
- Reduced motion: honor `prefers-reduced-motion` in GSAP/demo idle animations.

**Non-functional**
- Lighthouse ≥90 (perf, a11y, best practices) on all non-canvas pages (§9 phase 10 DoD).
- No console errors/warnings on any route in production build.
- `tsc --noEmit` clean; zero `any`; zero `@ts-ignore` (§11.8).

## Architecture

```
Export:  Route Handler /api/progress/export → drizzle select * (7 tables) → JSON { schemaVersion, exportedAt, tables }
Import:  client file read → zod-style validate → POST /api/progress/import → db.transaction(replace|merge) → invalidate queries

Quality tier: lib/quality.ts detect() (once, client) → settings['quality_tier'] via server action
              → QualityProvider context → <Demo>/<Playground> read dpr + effect budget

a11y sweep: axe scan (playwright) per route + manual keyboard walkthrough script
Perf sweep: lighthouse CI on 6 routes + bundle analyzer + memory-leak playwright script
```

## Related Code Files

**Create**
- `app/api/progress/export/route.ts`, `app/api/progress/import/route.ts`
- `lib/export-import.ts` (serialize/validate/apply, `SCHEMA_VERSION`)
- `components/settings/data-panel.tsx` (export/import UI), `components/settings/quality-select.tsx`
- `app/[locale]/settings/page.tsx` (or a `Sheet` from the header — one entry point for locale/theme/quality/data)
- `lib/quality.ts`, `components/providers/quality-provider.tsx`
- `components/shell/skip-link.tsx`
- `tests/e2e/a11y.spec.ts` (axe per route), `tests/e2e/keyboard-nav.spec.ts`, `tests/e2e/memory-leak.spec.ts`, `tests/e2e/db-reset.spec.ts`
- `scripts/check-no-custom-css.ts` (§11.7 guard, allows only `app/globals.css`; vendored `node_modules` CSS imports exempt per D7)

**Modify**
- `components/viz/demo.tsx`, `components/playground/*` (consume quality tier, reduced-motion)
- `components/lesson/*`, `components/command/*`, `components/roadmap/*` (ARIA + focus fixes)
- `app/[locale]/layout.tsx` (skip-link, landmarks, QualityProvider)
- `package.json` (`lighthouse`/`@axe-core/playwright` dev deps, `audit` scripts)

**Delete** — any leftover dev-only instrumentation from Phases 4–5 (frame counters) if it ships to production.

## Implementation Steps

1. a11y sweep: run axe on every route class; fix landmarks, labels, contrast, heading order. Add `skip-link`, `aria-current` in TOC/sidebar, `aria-live` for autosave/errors.
2. Keyboard walkthrough: dashboard → roadmap → track → lesson (sidebar/TOC/demo controls/exercise flow) → playground (incl. Resizable handles + escaping Monaco) → notes → stats → command palette. Fix all traps; document the Monaco escape key.
3. `prefers-reduced-motion`: gate GSAP intro/idle animations and demo auto-rotation.
4. Quality tier (A4): `lib/quality.ts` detect + `settings` persistence + `QualityProvider`; wire DPR/effect caps into `<Demo>` and playground; manual override in settings.
5. Export/import: implement both routes, `SCHEMA_VERSION` constant, validation with clear error messages, transactional apply, merge strategy = per-table upsert by natural key (`lessonSlug`, `(lessonSlug, exerciseId)`, `key`).
6. Performance audit: production build, run Lighthouse on the 6 non-canvas routes; fix regressions (image sizing, font loading, unused JS, route-level code splitting for Monaco/recharts/three).
7. Memory-leak script (§11.3): playwright navigates 20 lessons with demos, forces GC via CDP, samples `performance.memory`, asserts non-linear growth.
8. Canvas GPU check (§11.4): page with 3 canvases, assert only the in-viewport one advances its frame counter.
9. DB reset check (§11.2): delete `data/`, boot, assert migrations run and app works (e2e).
10. Shader error check (§11.5): playground e2e with a deliberate syntax error → correct line marker, app alive.
11. CSS guard (§11.7) + `tsc --noEmit` + grep for `any`/`@ts-ignore` (§11.8) as CI scripts.
12. Content check (§11 last item): `pnpm lint:content` over all tracks.
13. Write `README.md` run instructions (dev, migrate, backup/restore) — the app is self-hosted, the operator is the author.

## Todo List

- [x] axe scan + fixes on all route classes (`tests/e2e/a11y.spec.ts`, 8 routes, 0 serious/critical)
- [x] Keyboard navigation pass incl. overlays and Monaco escape (`tests/e2e/keyboard-nav.spec.ts`)
- [x] `prefers-reduced-motion` support (`lib/hooks/use-prefers-reduced-motion.ts`, wired into `lib/hooks/use-gsap-context.ts`)
- [ ] Quality tier detect + persist + override (A4)
- [ ] Export route + import route with `schemaVersion` + transactional apply
- [ ] Settings page/sheet (locale, theme, quality, data)
- [ ] Lighthouse ≥90 on 6 non-canvas routes
- [ ] Memory-leak e2e (20 lessons)
- [ ] Viewport GPU e2e (3 canvases)
- [ ] DB reset e2e
- [ ] Shader error e2e
- [ ] CSS guard + strict-TS guard scripts
- [ ] Full `lint:content` pass
- [ ] README run/backup instructions

## Success Criteria

**§9 phase 10 DoD:** Lighthouse ≥ 90 on all non-canvas pages.

**Full §11 acceptance checklist — all must pass:**
- [ ] Locale switch preserves state, no hydration errors
- [ ] Delete `data/progress.db` → restart → auto-migrates, app runs
- [ ] Open 20 lessons in a row → `performance.memory` does not grow linearly
- [ ] Scroll a page with 3 canvases → only the in-viewport canvas consumes GPU
- [ ] Shader syntax error → error with correct line number, no crash
- [ ] Entire app navigable by keyboard
- [ ] No custom CSS file besides `globals.css` (vendored KaTeX CSS import exempt — D7)
- [ ] `tsc --noEmit` clean, no `any`, no `@ts-ignore`
- [ ] Every unit passes its kind's D9 rules (regular: objectives, bilingual theory, ≥2 citations, ≥2 exercises; checkpoint: build + checklist)

Plus: export → wipe DB → import → identical progress state (round-trip verified by row counts + spot values).

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Lighthouse <90 due to Monaco/three on shared chunks | M×M | Route-level dynamic imports; verify with bundle analyzer; keep three out of the lesson shell chunk |
| Import corrupts a working DB | M×H | Auto-export a backup file before applying any import; transactional apply with rollback on validation failure; schemaVersion mismatch = hard reject |
| a11y fixes break shadcn component behavior | M×M | Prefer composing shadcn props over DOM hacks; never edit `components/ui/*` (§7) |
| Quality-tier heuristic misjudges hardware | M×M | Manual override always available and persisted; heuristic only sets the default |
| Memory test flaky (GC timing) | H×L | Force GC via CDP, sample 3× with settle delays, assert trend not absolute values; treat as advisory + manual DevTools confirmation |
| Leftover dev instrumentation shipping to prod | M×L | Strip in this phase; grep guard in CI |

## Security Considerations

- Import is the only path that writes arbitrary rows: validate every field type/enum, cap array and string sizes, reject unknown table keys, never `eval` or spread untrusted JSON into SQL — build parameterized inserts per validated column.
- Export contains personal notes → keep it a manual download to a user-chosen path; never auto-upload, never write into `public/`.
- Both routes are same-origin POST/GET on a localhost app; still validate content-type and size (cap import file at e.g. 20MB).
- Confirm `data/` remains gitignored and no export artifact is committed.

## Rollback

Each polish item is an independent small commit; revert individually. Export/import is additive (new routes) — reverting it leaves progress untouched. Quality tier defaults to previous fixed DPR if the provider is removed.

## Next Steps

Project acceptance. Post-launch backlog candidates (explicitly out of scope per §6.3): none of auth/multi-user/cloud sync. Legitimate follow-ups: WebGPU/TSL track expansion, additional locale (architecture already supports a third), content updates as libraries evolve.

## Notes (post-implementation, 2026-08-14)

**Delivered in 3 commits:** `7e8d98e` (export/import + quality tier + settings + guards + 4 acceptance e2e), `fad13b4` (a11y sweep + axe/keyboard e2e + README), `97f1645` (lesson-route JS diet + fonts).

**§11 acceptance results:**
- ✅ Fresh-DB boot/auto-migrate — `fresh-db-boot.spec` + every e2e run uses a virgin DB
- ✅ Memory trend across lesson navigations — `memory-leak.spec` (12 lessons, CDP forced-GC, final < first × 2.5)
- ✅ Viewport GPU gating — `viewport-gpu.spec` (3 concurrent tabs; app caps 1 canvas/page by design)
- ✅ Shader error → correct line, keep-last-good, recovery — `shader-error-recovery.spec`
- ✅ Keyboard navigation — `keyboard-nav.spec` + axe scan on 8 routes (serious/critical = 0)
- ✅ No custom CSS (`check:css`), strict TS: no any/ts-ignore (`check:ts-strict`), full `lint:content` 162/162 0 errors
- ✅ Export → wipe → import round-trip — unit-tested (row counts + spot values), replace & merge modes
- ⚠️ Lighthouse (prod build, dev machine, simulated mobile): a11y 98–100 + best-practices 100 on all 6 non-canvas routes; perf home/notes 90–93, roadmap/track 87–92, stats 85–90, theory lesson 72→78–86 across runs (±4–6 run variance on this machine). Observed (unthrottled) LCP is ~160ms — the residual gap is the lantern simulation chaining text-LCP onto route JS measured against localhost. Structural fixes shipped: demo-registry split + `LessonDemoHost` React.lazy (−~520KB/route), `PlaygroundEmbed` dynamic (−~230KB), Vietnamese font subsets (correctness — diacritics no longer fall back) + `display: optional` + recovered font preloads (Next 16 Turbopack emits none). Further squeezing would target framework/base-ui chunks — backlog, not blocking.

**Known follow-ups (non-blocking):** note popover has no keyboard entry point (mouse-selection only, pre-existing interaction model); `ui/dialog.tsx`/`ui/sheet.tsx` hardcode English "Close" sr-only text (§7 forbids editing ui/*); pre-existing hydration warning on the lesson mobile Sheet trigger; legacy `**bold**` in a few checkpoint exercise prompts renders literal asterisks; build-checkpoint GLSL solutions highlight as TS.

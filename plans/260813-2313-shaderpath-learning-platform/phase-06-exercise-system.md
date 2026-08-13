# Phase 6 — Exercise System (hints, checklist, solution reveal, code persistence)

## Context Links

- Spec: §3.1 (`Exercise`), §3.2 (exercise rule as amended by [D9](reports/spec-decisions.md)), §5 (`exercise_attempts`), §6.1.6 (exercise flow), §9 phase 6
- Decisions: [D6](reports/spec-decisions.md) Track 0 lessons as sample content, A1 table already migrated
- Depends on: [Phase 3](phase-03-lesson-page-toc-progress-tracking.md), [Phase 5](phase-05-glsl-playground-monaco.md)

## Overview

- **Priority:** P1
- **Status:** Not Started
- **Effort:** ~8h
- **Description:** Render `Exercise[]` at the bottom of a lesson with the full flow: attempt → sequential hints (counted) → self-assessment checklist → solution reveal, all persisted per exercise.

## Key Insights

- Solution is gated behind an explicit "I tried it" action (§3.1 `solutionCode` comment) — the gate is pedagogical, not security; keep it honest but not annoying (one click, undoable state recorded).
- Hints reveal one at a time and `hintsRevealed` is monotonic — used later by SRS/stats as a difficulty signal.
- `checklistState: boolean[]` is positional; if content later adds/removes a checklist item the stored array desyncs → store length alongside and reset (with a toast) on mismatch. Silent misalignment would show wrong ticks forever.
- `code`/`shader` exercises persist `userCode`; `shader` reuses the Phase 5 embedded playground with `starterCode` seeded, `solutionCode` shown side-by-side on reveal.
- Exercise prompts are MDX strings (§3.1) — compile them through the same pipeline, not a separate renderer (DRY).

## Requirements

**Functional**
- Exercise list rendered per lesson from `content/lessons/**/exercises.ts`, grouped/ordered as authored, each in a `Collapsible`/`Card` with kind `Badge` and status.
- Statuses per §5: `not_started | attempted | completed | skipped`; user can mark attempted/skipped/completed.
- Hints: "Show hint" reveals the next hint only; counter persisted; hint text is `Localized`.
- Checklist: per-item `Checkbox`/`Switch` self-assessment; completion suggested when all ticked.
- Solution: hidden until `attempted`; revealing sets `solutionRevealed = true` permanently (visible in stats).
- `userCode` autosaved (debounced) for `code`/`shader` kinds; restored on revisit.
- `referenceImage` (if present) shown next to the user's output for eye comparison (§3.1).
- Lesson-level exercise progress summary in the lesson header/footer.

**Non-functional**
- All state survives reload (§9 phase 6 DoD).
- Optimistic UI; write failures surfaced via `sonner`, never lose local edits.
- Bilingual prompts/hints/checklists follow the active locale.

## Architecture

```
lesson page (RSC)
  ├─ exercises.ts (typed Exercise[]) + attempts rows (server read, keyed by lessonSlug)
  └─ <ExerciseList> ('use client')
        └─ <ExerciseCard> per exercise
             ├─ prompt (pre-compiled MDX)
             ├─ HintStack     → revealHint()      → hintsRevealed += 1
             ├─ CodePane      → embedded Playground / Monaco (kind: shader|code) → debounce 2s → saveUserCode()
             ├─ Checklist     → toggle(i)         → checklistState[i]
             └─ SolutionPane  → reveal()          → solutionRevealed = true
                       all mutations → TanStack useMutation → lib/exercises.ts server actions
                                          → upsert exercise_attempts (lessonSlug + exerciseId unique)
```

Read path on load: one query per lesson (`WHERE lesson_slug = ?`, indexed per §5) → map by `exerciseId`.

## Related Code Files

**Create**
- `components/exercise/exercise-list.tsx`, `exercise-card.tsx`, `hint-stack.tsx`, `checklist.tsx`, `solution-pane.tsx`, `code-pane.tsx`, `exercise-status-badge.tsx`
- `lib/exercises.ts` (`'use server'`: `getAttempts`, `setStatus`, `revealHint`, `revealSolution`, `saveUserCode`, `setChecklistItem`)
- `lib/exercise-prompt.ts` (compile `Localized<string>` MDX prompts — build-time where possible)
- `content/lessons/00-math/*/exercises.ts` (Track 0 sample set: concept + code + build, per §3.2)
- `tests/unit/exercise-state.test.ts`, `tests/e2e/exercise-flow.spec.ts`

**Modify**
- `components/lesson/lesson-shell.tsx` (exercise section slot after demo)
- `content/lessons/**/meta.ts` (no schema change; exercise count validated in Phase 7 lint)
- `content/i18n/{vi,en}.json`

**Delete** — none.

## Implementation Steps

1. `lib/exercises.ts` server actions; enforce unique `(lessonSlug, exerciseId)` via upsert; validate `lessonSlug ∈ LESSON_SLUGS` and `exerciseId` exists in that lesson's `exercises.ts` (reject unknown ids).
2. `exercise-list.tsx`: fetch attempts once per lesson via TanStack Query, provide via context, render cards.
3. `exercise-card.tsx`: header (index, kind `Badge`, status, hint count), body `Collapsible`; prompt rendered through the MDX pipeline.
4. `hint-stack.tsx`: renders `hints.slice(0, hintsRevealed)`; button disabled at the end; each reveal is a mutation (monotonic, never decrements).
5. `checklist.tsx`: positional booleans + stored length guard; on mismatch reset to all-false and toast "checklist updated".
6. `code-pane.tsx`: `kind: 'shader'` → embedded Phase 5 playground seeded with `starterCode`; `kind: 'code'` → Monaco (ts/js) read-write; debounce 2s → `saveUserCode`; "reset to starter" button with confirm `Dialog`.
7. `solution-pane.tsx`: locked `Alert` until status ≥ `attempted`; on reveal, show `solutionCode` (shiki-highlighted) and, if present, `referenceImage` beside the live output.
8. Status transitions: opening card → `attempted` after first interaction; all checklist items ticked → suggest `completed` (`Button`, not automatic); `skipped` available explicitly.
9. Lesson footer summary: `N/M exercises completed`, feeds Phase 8 SRS signal and Phase 3 completion UX.
10. Author the Track 0 sample exercise sets (D6) covering concept/code/build so the flow is exercised end-to-end.
11. Tests: unit (checklist length-mismatch reset, hint monotonicity, solution gating); e2e (complete one exercise fully → reload → hints count, checklist, code, solution state all preserved — §9 phase 6 DoD).

## Todo List

- [ ] `lib/exercises.ts` server actions + id validation
- [ ] Exercise list/card shell with kind badges + statuses
- [ ] MDX prompt rendering (shared pipeline)
- [ ] Sequential hint stack with persisted counter
- [ ] Checklist with positional-drift guard
- [ ] Code pane (Monaco / embedded playground) + debounced `userCode` save + reset
- [ ] Solution reveal gate + `referenceImage` comparison
- [ ] Status transitions incl. skip
- [ ] Lesson-level exercise summary
- [ ] Track 0 sample exercises (concept/code/build)
- [ ] Unit + e2e tests

## Success Criteria

- **§9 phase 6 DoD:** complete one exercise end-to-end, reload → state preserved (status, hints revealed, checklist, code, solution flag).
- Solution cannot be opened before `attempted`.
- Editing content's checklist length does not corrupt displayed state (guard triggers, no wrong ticks).
- `userCode` for a shader exercise reopens in the embedded playground and compiles.
- Whole flow operable by keyboard; all interactive controls show pointer cursor and focus ring.
- Sample regular lesson satisfies D9: ≥2 exercises (concept + code); sample checkpoint exercises the `build` flow end-to-end.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Checklist positional drift after content edits | M×M | Store expected length; reset + toast on mismatch (explicit, visible) |
| Autosave races with reset-to-starter | M×M | Cancel in-flight debounce on reset; reset writes synchronously before re-enabling autosave |
| Duplicate `exerciseId` inside a lesson | M×M | Dev-time invariant check + Phase 7 content lint rule |
| Exercise attempts table growth from autosave churn | L×L | Upsert single row per exercise, not append-only |
| Embedded playground inside a long lesson hurts perf | M×M | Lazy-mount the code pane only when the card is expanded |
| Solution leak via network payload before reveal | L×L | Accepted: single-user local app; solutions ship in the bundle by design. Do not build server gating |

## Security Considerations

- Server actions validate `lessonSlug` + `exerciseId` against static content; cap `userCode` size (e.g. 128KB) to bound DB growth.
- `checklistState` JSON validated as `boolean[]` before write and after read.
- User code is never executed server-side; `code`-kind exercises are edited, not evaluated (no sandbox needed — do not add an eval runner).

## Rollback

Revert phase commit; lesson pages lose the exercise section only. `exercise_attempts` rows persist harmlessly.

## Next Steps

→ [Phase 7](phase-07-content-track-0-and-1-bilingual.md): with all four lesson parts working, author real content for Tracks 0 and 1.

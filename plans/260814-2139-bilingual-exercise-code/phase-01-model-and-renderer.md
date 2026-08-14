# Phase 1 — Model + Renderer for `solutionNote`

## Context Links

- [plan.md](plan.md) — measured scope and decisions D1–D3
- Backlog origin: `plans/260813-2313-shaderpath-learning-platform/phase-10-polish-a11y-performance-export.md`
- Prior art: `content/playground-presets/comments.ts` (marker approach — deliberately NOT reused here, see D1)

## Overview

- **Priority:** P1 (blocks phase 2)
- **Status:** Not Started
- **Effort:** ~1h
- **Description:** Add a bilingual prose field for exercise solutions and render
  it with the existing minimal renderer, so the 81 concept lessons have somewhere
  correct to move their answers to.

## Key Insights

- `solutionCode` is displayed for EVERY kind (`exercise-section.tsx:56` builds
  `solutionHtml` unconditionally), while the editable code pane renders only for
  `code`/`shader` (`exercise-card.tsx:138`). That asymmetry is why prose ended up
  in `solutionCode`: it was the only field that always showed.
- `PromptBody` already renders the exact subset these answers need — paragraphs,
  `` `code` ``, `$katex$`, ```` ```fences``` ```` — and is already used for
  `prompt`. No new renderer, no new dependency.
- `Localized<T>` requires both locales at the type level, so TypeScript itself
  enforces that a migrated answer has vi AND en.

## Requirements

**Functional**
- `Exercise.solutionNote?: Localized<string>` in `content/types.ts`.
- `exercise-section.tsx` passes `solutionNote: ex.solutionNote ? <PromptBody text={ex.solutionNote[locale]} /> : null`.
- `exercise-card.tsx` renders the note in the revealed-solution area; when both
  `solutionNote` and `solutionHtml` exist, the note comes first, then the code.
- An exercise with only `solutionNote` (no `solutionCode`) reveals correctly —
  the current guard is `solutionHtml && (...)`, which would render nothing.

**Non-functional**
- No change to `components/ui/*` (spec §7); no new CSS.
- `tsc --noEmit` clean; no `any`.

## Related Code Files

**Modify**
- `content/types.ts` — add the field
- `components/exercise/exercise-section.tsx` — build the node
- `components/exercise/exercise-card.tsx` — accept prop + render, fix the
  `solutionHtml &&` guard so a note-only solution still shows
- `components/exercise/types.ts` — extend the view-model if the note flows through it

## Implementation Steps

1. Add `solutionNote?: Localized<string>` to `Exercise`.
2. Thread it through `exercise-section.tsx` as a rendered `PromptBody` node.
3. Render in `exercise-card.tsx`: note above code, and reveal when EITHER exists.
4. Pick one lesson (e.g. `00-math/dot-and-cross-products`) and migrate it by hand
   as the reference sample for phase 2's agents — commit it in this phase so the
   sweep brief can point at a real example.
5. Verify the sample renders as prose in both locales, and that untouched
   lessons are unaffected.

## Todo List

- [ ] `solutionNote` on the `Exercise` type
- [ ] Renderer wiring (section + card), note-only reveal works
- [ ] One hand-migrated reference lesson
- [ ] typecheck / lint / unit / e2e green

## Success Criteria

- A concept exercise with `solutionNote` shows prose (not a TS-highlighted code
  block) in vi and en.
- Every existing exercise still renders exactly as before.
- `pnpm typecheck`, `pnpm lint`, `pnpm vitest run`, `pnpm test:e2e` all green.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Reveal logic regresses for code-only solutions | M×H | e2e `exercise-flow.spec.ts` covers the existing path; extend it to a note-only case |
| View-model drift between server and client components | L×M | Keep the note as a pre-rendered node like `prompt`, not raw text |

## Next Steps

Phase 2 cannot start until the field exists and the reference lesson is committed.

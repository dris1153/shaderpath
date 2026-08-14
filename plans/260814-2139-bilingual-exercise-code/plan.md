---
status: pending
created: 2026-08-14
---

# Bilingual Exercise Code & Solutions

Close the backlog item raised in phase-10: the `en` locale shows Vietnamese text
inside exercise code panes and solution blocks, because `Exercise.starterCode`
and `solutionCode` are plain `string`, not `Localized<string>`.

## Measured scope (not estimated)

Counted by loading every `exercises.ts` and inspecting each exercise object —
the earlier "1,103 lines" figure was a raw regex that also matched `*`
multiplication.

| Bucket | Lines | Lessons | Nature |
|---|---|---|---|
| `concept.solutionCode` | 597 | 81 | **Prose**, not code — Vietnamese worked answers written as `//` lines so they render in the solution block (and get highlighted as TypeScript) |
| `code.starterCode` | 129 | 48 | Real code comments |
| `build.starterCode` | 116 | 14 | Real code comments — currently never rendered |
| `build.solutionCode` | 67 | 5 | Real code comments |
| `shader.starterCode` | 31 | 11 | Real code comments |
| `code.solutionCode` | 29 | 14 | Real code comments |
| `shader.solutionCode` | 1 | 1 | Real code comments |

`theory.en.mdx` code fences: **0 Vietnamese lines** — theory is already correct
(separate file per locale) and is out of scope.

## Decisions (2026-08-14, user-approved)

- **D1 — Prose answers get their own field.** Add `solutionNote?: Localized<string>`;
  migrate the 597 prose lines out of `solutionCode` and render them with the
  existing `PromptBody` renderer instead of a fake syntax-highlighted code block.
  Markers (the playground-preset mechanism) were rejected here: one dictionary
  entry per sentence is absurd.
- **D2 — Real code comments become English.** 257 visible + 116 hidden lines are
  translated in place. `starterCode`/`solutionCode` stay single-string. Rejected:
  `Localized` code (duplicates real GLSL/TS → the exact drift class fixed in the
  KaTeX sweep) and per-lesson marker dictionaries (permanent tax on every future
  exercise author).
- **D3 — The never-rendered 116 lines are included**, so the lint rule can be
  absolute instead of carrying a per-kind exception.

## Phases

| # | Phase | Status | File |
|---|---|---|---|
| 1 | Model + renderer: `solutionNote`, PromptBody wiring | ✅ Complete (2026-08-14) | [phase-01](phase-01-model-and-renderer.md) |
| 2 | Content sweep: 118 prose migrations + all comment lines | ✅ Complete (2026-08-14) | [phase-02](phase-02-content-sweep.md) |
| 3 | Lint guard + full acceptance | Not Started | [phase-03](phase-03-guard-and-acceptance.md) |

Phase 1 must land before phase 2 — the sweep agents write into a field that has
to exist first. Phase 3's lint rule is added last, otherwise it fails the gate
on every file the sweep has not reached yet.

## Key dependencies

- `content/types.ts` (`Exercise`), `components/exercise/exercise-section.tsx`,
  `components/exercise/exercise-card.tsx`
- `scripts/lint-content.ts` — the mechanical gate that keeps this from drifting
  back, same pattern as the KaTeX `\text{}` rule
- 139 `content/lessons/**/exercises.ts` files

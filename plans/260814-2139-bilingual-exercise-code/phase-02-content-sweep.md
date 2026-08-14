# Phase 2 — Content Sweep (139 lessons)

## Context Links

- [plan.md](plan.md) — bucket table, decisions D1–D3
- [phase-01](phase-01-model-and-renderer.md) — must be complete; provides the field and the reference lesson
- Process precedent: `plans/260813-2313-shaderpath-learning-platform/phase-09-content-tracks-2-to-13.md` (agent waves + per-track gate)

## Overview

- **Priority:** P1
- **Status:** Not Started
- **Effort:** ~6h across agent waves
- **Description:** One pass per `exercises.ts`: move prose answers into
  `solutionNote`, translate genuine code comments to English.

## Key Insights

- **One pass per file, both transformations.** 81 prose lessons and ~92
  comment lessons overlap; splitting into two sweeps would touch many files twice
  and double the review surface.
- Not every `//` line is prose. A concept answer is prose; `// TODO 1: ...` in a
  starter is a real instruction that must stay a comment (translated). The agent
  decides per exercise, using the phase-1 reference lesson as the model.
- Prose answers carry math written as plain text (`n·L = (0)(0.6) + ...`,
  `theta = arccos(0.8) ≈ 36.87°`). `PromptBody` supports `$katex$` and
  `` `code` `` but NOT bold or lists — converting formulas to KaTeX is a judgment
  call; wrapping them in backticks is the safe default.
- Vietnamese diacritics inside `\text{}` are forbidden (KaTeX has no glyphs) —
  the rule added in commit `751131c` still applies to anything converted to KaTeX.

## Requirements

- After the sweep: zero Vietnamese diacritics in any `starterCode` or
  `solutionCode`, including the never-rendered `build.starterCode` (D3).
- Every migrated answer exists in BOTH locales (enforced by `Localized<string>`).
- No content lost: an answer that explained three points still explains three.
- Code itself unchanged — only comments and prose move/translate.

## Architecture

```
wave of N agents, each owning a disjoint slice of lessons:
  read exercises.ts
    ├── concept solutionCode that is pure // prose  → solutionNote.vi + .en, drop solutionCode
    ├── real code comments (any kind/field)         → translate to English in place
    └── code lines                                  → untouched
  self-verify: pnpm typecheck + pnpm lint:content
orchestrator: gate + commit per wave
```

## Implementation Steps

1. Write the shared sweep brief (mirrors `reports/phase7-authoring-brief.md`):
   the reference lesson, the prose-vs-comment test, the PromptBody subset, the
   KaTeX `\text{}` rule, "never touch the code itself".
2. Split the 139 lessons into ~8 disjoint slices by track; launch one agent per
   slice with explicit file ownership.
3. Per wave: `pnpm typecheck` → `pnpm lint:content` → `pnpm vitest run` →
   spot-read two migrated lessons → commit.
4. Re-run the measurement script from the brainstorm to confirm the remaining
   count drops to 0 (it is the acceptance number, not a vibe).

## Todo List

- [ ] Sweep brief written, reference lesson linked
- [ ] Slices assigned (disjoint, by track)
- [ ] Wave commits, one per slice group
- [ ] Measurement re-run shows 0 Vietnamese lines in code fields

## Success Criteria

- 0 Vietnamese diacritics across all `starterCode`/`solutionCode`.
- 81 concept lessons render prose answers in both locales.
- `pnpm lint:content` 0 errors; unit + e2e unchanged and green.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Agent rewrites working GLSL/TS while "translating comments" | M×H | Brief forbids touching non-comment lines; spot-read diffs; e2e compiles shader exercises |
| Prose loses meaning in translation | M×M | Require the en text to carry the same number of explanatory points; spot-read |
| Two agents edit the same file | L×H | Disjoint slices by track, explicit ownership in each prompt |
| KaTeX conversion introduces `\text{}` with diacritics | M×M | Existing lint rule from `751131c` catches it |

## Security Considerations

None — content-only edits, no new inputs or IO paths.

## Next Steps

Phase 3 adds the lint rule that makes the result permanent.

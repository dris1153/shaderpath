# Phase 3 — Lint Guard + Acceptance

## Context Links

- [plan.md](plan.md), [phase-02](phase-02-content-sweep.md) (must be complete)
- Precedent: the KaTeX `\text{}` rule in `scripts/lint-content.ts` (commit `751131c`) — a written rule that nothing enforced is a rule that drifts

## Overview

- **Priority:** P1
- **Status:** Not Started
- **Effort:** ~1h
- **Description:** Make the sweep permanent with a mechanical gate, then run the
  full acceptance set.

## Key Insights

- This whole backlog item exists because the Phase 7 brief said "code comments in
  the learner's language" without a gate. 162 lessons drifted. The rule is the
  deliverable; the sweep is just cleanup.
- The rule must run BEFORE any future content wave, i.e. inside the existing
  `pnpm lint:content` that `audit:guards` already chains.
- Because D3 included the never-rendered `build.starterCode`, the rule needs no
  per-kind exception — it is simply "no Vietnamese in code fields".

## Requirements

- `lint:content` reports an ERROR (via the existing `report()` helper, which is
  strict for required tracks) for any Vietnamese diacritic in `starterCode` or
  `solutionCode`.
- Message names the lesson, the field, and points at `solutionNote` for prose.
- The rule is verified by a deliberate negative test — inject a violation, see it
  fail with exit 1, restore. Restore with `git checkout --`, never with
  PowerShell `Set-Content -Encoding utf8` (it writes a BOM and corrupts the file).

## Related Code Files

**Modify**
- `scripts/lint-content.ts` — new check alongside the KaTeX one
- `plans/260813-2313-shaderpath-learning-platform/phase-10-polish-a11y-performance-export.md` — mark the backlog item resolved, link here

## Implementation Steps

1. Add the diacritics check over both code fields, reusing the `VN_DIACRITICS`
   pattern already in the script.
2. Negative-test it, then restore.
3. Full acceptance: `pnpm audit:guards`, `pnpm vitest run`, `pnpm build`,
   `pnpm test:e2e` (39 specs).
4. Re-run the bucket measurement one last time and record the final numbers in
   this file's Notes section.
5. Update the phase-10 backlog entry to "resolved (see 260814-2139 plan)".

## Todo List

- [ ] Lint rule added and negative-tested
- [ ] `audit:guards` 0 errors
- [ ] unit + build + e2e green
- [ ] Measurement recorded, phase-10 backlog closed

## Success Criteria

- `pnpm lint:content` fails on a planted Vietnamese comment in `starterCode`.
- Full suite green: guards, unit, build, 39 e2e specs.
- Final measurement: 0 Vietnamese lines in `starterCode`/`solutionCode`; 81
  lessons carrying bilingual `solutionNote`.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Rule fires on legitimately Vietnamese content (e.g. a string literal in sample code) | L×M | If a real case appears, scope the check to comment lines rather than whole fields |
| e2e flake masks a real regression | M×M | A single failure seen in this codebase before; re-run twice before concluding |

## Next Steps

Backlog item closed. Remaining phase-10 follow-ups (keyboard-less note popover,
hardcoded "Close" in `ui/dialog.tsx`) stay open and unrelated.

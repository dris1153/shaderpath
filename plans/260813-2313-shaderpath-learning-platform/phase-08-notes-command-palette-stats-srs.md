# Phase 8 — Notes, Bookmarks, Command Palette, Stats + Heatmap, SRS

## Context Links

- Spec: §5 (`notes`, `bookmarks`, `study_sessions`, `review_queue`), §6.1.9 (Cmd+K), §6.2.10–12 (notes, SRS, stats), §9 phase 8
- Decisions: [D5](reports/spec-decisions.md) bookmarks schema, A1 tables already migrated
- Depends on: [Phase 3](phase-03-lesson-page-toc-progress-tracking.md) (progress/sessions), [Phase 7](phase-07-content-track-0-and-1-bilingual.md) (searchable prose)

## Overview

- **Priority:** P2
- **Status:** ✅ Complete (2026-08-14)
- **Effort:** ~14h
- **Description:** Personal-knowledge layer on top of reading: highlight→note, bookmarks, Cmd+K search across lessons, stats page (heatmap/streak/hours/track distribution), and SM-2-lite spaced repetition feeding the dashboard.

## Key Insights

- Anchoring notes to DOM offsets is fragile across content edits — anchor to the nearest heading id (`anchorId`) plus store `selectedText` for context. Accept "note is attached to a section", not "to a character range".
- Streak computation is a timezone trap: timestamps are stored UTC (§5 `mode: 'timestamp'`), but "today" is local. Compute day buckets in the browser's timezone consistently in one helper, used by both heatmap and streak.
- Command palette search needs prose, hence the Phase 7 dependency. Build a static index at build time (title/summary/tags/objectives + plaintext excerpt) — no runtime MDX parsing, no full-text DB search.
- SM-2-lite: on completion, `interval = 1`; on review with quality q∈{again, hard, good, easy} adjust `easeFactor` (clamp ≥1.3) and `intervalDays`; `dueAt = now + intervalDays`. Keep it in `lib/srs.ts`, pure and unit-tested.
- Session data already written in Phase 3 — this phase only reads/aggregates it. Do not add a second timing mechanism.

## Requirements

**Functional**
- Notes: select text in the lesson body → `Popover` → write note → saved with `lessonSlug` + `anchorId` + `selectedText`; list/edit/delete on `/[locale]/notes`; jump back to the anchor.
- Bookmarks: bookmark a lesson or a specific heading (D5 fields); listed alongside notes; toggle from the lesson TOC/header.
- Command palette (`Cmd/Ctrl+K`): shadcn `Command`, searches lessons by title, tag, and content excerpt; also exposes quick actions (toggle theme, switch locale, go to playground/stats/notes); keyboard-first.
- Stats page: GitHub-style heatmap of `study_sessions` (recharts/shadcn chart), current streak, longest streak, total hours, distribution by track, exercises completed.
- SRS: on lesson completion, upsert `review_queue` row; `/` dashboard shows "N lessons due today" with a review flow (open lesson → grade → reschedule).

**Non-functional**
- Palette opens in <100ms with the index preloaded; index size kept small (excerpt ≤ 300 chars/lesson).
- Stats page is RSC-rendered with client-only chart islands; no white flash.
- Notes/bookmarks lists paginate or virtualize past 200 rows.

## Architecture

```
build: scripts/gen-search-index.ts → content/search-index.generated.json (slug, locale, title, tags, summary, excerpt)
                                          │
Cmd+K <CommandPalette> (client, lazy) ────┘  fuzzy match (small local matcher, no server call)

lesson body selection → useTextSelection() → Popover → createNote() ──┐
TOC/header bookmark toggle → toggleBookmark() ───────────────────────┤ Server Actions (lib/notes.ts)
                                                                      v
                                                             notes / bookmarks tables

/stats (RSC) → lib/stats.ts aggregate queries (study_sessions, lesson_progress, exercise_attempts)
        → day-bucketing in local tz (lib/date-buckets.ts) → <Heatmap>, <TrackDistribution> (client chart islands)

lesson completed (Phase 3 markComplete) → lib/srs.ts scheduleInitial() → review_queue
dashboard → dueToday() (WHERE due_at <= now, indexed) → review flow → grade → sm2Update()
```

## Related Code Files

**Create**
- `lib/notes.ts`, `lib/bookmarks.ts`, `lib/stats.ts`, `lib/srs.ts`, `lib/date-buckets.ts`
- `lib/hooks/use-text-selection.ts`
- `components/notes/note-popover.tsx`, `note-list.tsx`, `note-item.tsx`, `bookmark-toggle.tsx`
- `components/command/command-palette.tsx`, `command-provider.tsx` (global `Cmd+K` listener), `search-match.ts`
- `components/stats/heatmap.tsx`, `streak-cards.tsx`, `track-distribution.tsx`
- `components/dashboard/due-today.tsx`, `components/srs/review-grade.tsx`
- `app/[locale]/notes/page.tsx`, `app/[locale]/stats/page.tsx`
- `scripts/gen-search-index.ts`, `content/search-index.generated.json`
- `tests/unit/srs.test.ts`, `tests/unit/date-buckets.test.ts`, `tests/e2e/command-palette.spec.ts`

**Modify**
- `app/[locale]/layout.tsx` (mount `CommandProvider`), `app/[locale]/page.tsx` (dashboard: due-today + streak)
- `components/lesson/lesson-shell.tsx` (selection popover host), `lesson-toc.tsx` (bookmark toggle)
- `lib/progress.ts` (`markComplete` → `scheduleInitial`)
- `package.json` (`gen:search`, `recharts` dep if not pulled by shadcn chart)

**Delete** — none.

## Implementation Steps

1. `lib/date-buckets.ts`: UTC-timestamp → local day key (`YYYY-MM-DD`), streak from a sorted day-key set, week grid for the heatmap. Unit-test across DST and midnight boundaries.
2. `lib/srs.ts`: `scheduleInitial(slug)`, `sm2Update({ easeFactor, intervalDays, reviewCount }, quality)` — pure functions, clamp `easeFactor ≥ 1.3`, cap `intervalDays` (e.g. ≤ 365). Unit-test the schedule sequence.
3. Server actions for notes/bookmarks (validate slug; cap note body length e.g. 8KB).
4. `use-text-selection.ts`: `selectionchange` listener scoped to the lesson body; resolve nearest preceding heading id as `anchorId`; show `Popover` anchored to the selection rect.
5. `/notes` page: grouped by lesson, filter by track, click → navigate to `lesson#anchorId`; edit/delete with confirm.
6. `bookmark-toggle.tsx`: heading-level (from TOC) and lesson-level; optimistic toggle; label defaults to heading text (D5 `label` nullable).
7. `scripts/gen-search-index.ts`: strip MDX to plaintext, first ~300 chars after the first heading as excerpt, per locale; emit JSON; wire `gen:search` into build.
8. `command-palette.tsx`: shadcn `Command` + `Dialog`, groups (Lessons / Actions / Notes), simple ranked substring+token matcher; `Cmd+K` and `Ctrl+K`; ESC closes; arrow keys navigate.
9. `/stats`: aggregate queries in `lib/stats.ts` (sum durations by day, by track; completion counts); heatmap + streak cards + distribution chart via shadcn chart primitives.
10. Dashboard: "N due today" card linking into the review flow; after review, grade buttons call `sm2Update` and re-schedule.
11. Tests: unit (srs sequence, streak with gaps, day bucketing), e2e (Cmd+K → search → navigate; create note → reload → note listed and anchor jumps).

## Todo List

- [x] `lib/date-buckets.ts` + tests (DST/midnight)
- [x] `lib/srs.ts` SM-2-lite + tests
- [x] Notes server actions + selection popover + `/notes` page
- [x] Bookmarks (D5) toggle + listing
- [x] Search index generator + build wiring
- [x] Command palette (lessons, tags, content, quick actions)
- [x] Stats page: heatmap, streak, hours, track distribution
- [x] Dashboard due-today + review grading flow
- [x] e2e: palette navigation, note persistence

## Success Criteria

- **§9 phase 8 DoD:** dashboard shows the correct streak and the correct set of lessons due for review.
- Streak matches a hand-computed value from `study_sessions` across a 3-day gap and a same-day multi-session case.
- Note survives reload, appears on `/notes`, and its anchor link scrolls to the right heading.
- `Cmd+K` finds a lesson by a word that appears only in its body prose (proves the content index works).
- Heatmap renders with zero sessions (empty state) without error.
- SRS: completing a lesson creates a `review_queue` row due in 1 day; grading "good" twice grows the interval monotonically.
- Everything reachable by keyboard (palette especially).

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| Note anchors break when lesson content is edited | H×M | Anchor to heading id + store `selectedText`; on missing anchor, fall back to lesson top with a "section changed" badge |
| Timezone/DST errors in streak | M×M | One shared bucketing helper + explicit DST unit tests; never compute day keys inline |
| Search index bloat / stale after content edits | M×M | Excerpt cap; regenerate in `prebuild` + precommit; test asserts index covers all authored lessons |
| SM-2 misapplied → nonsense intervals | M×M | Pure function + fixed test vectors; clamp ease and interval |
| recharts bundle weight on stats route | M×L | Route-level code split; chart islands only |
| Selection popover fights mobile text selection | M×L | Desktop-only trigger; mobile uses a "note" button in the section header |

## Security Considerations

- All note/bookmark writes validate `lessonSlug` against `LESSON_SLUGS`; body length capped; stored as text and rendered as text (no MDX/HTML evaluation of user notes — do not render notes through the MDX pipeline).
- Export of notes (Phase 10) must escape content; no `dangerouslySetInnerHTML` anywhere in the notes path.
- Search index is build-time and repo-local; no user query leaves the machine.

## Rollback

Revert phase commit; dashboard falls back to progress-only. Tables persist (Phase 1) — orphan notes/bookmarks stay readable after re-enabling.

## Notes (post-implementation, 2026-08-14)

**Deviations:**
- Heatmap = plain CSS grid divs (GitHub-style isn't a recharts chart type); track distribution uses recharts via the shadcn `ChartContainer` as spec'd.
- Selection popover is a manually-positioned floating Card (fixed at the selection rect) — shadcn Popover's anchor model doesn't fit arbitrary text ranges.
- Heading-level bookmarks ride the selection popover ("Bookmark section") instead of TOC buttons; lesson-level toggle sits beside the header.
- Review grading happens inline on the dashboard card (Quên/Khó/Nhớ/Dễ per lesson) — no separate review route.
- Notes/bookmarks list is a plain grouped list (`ponytail`: virtualize if it ever passes a few hundred rows).
- `build` script now regenerates the lesson registry + search index before `next build` — generated artifacts can't go stale.
- CommandDialog (shadcn) wraps only the Dialog — `Command shouldFilter={false}` nests inside; palette does its own diacritic-folded ranking (`fold("Toạ độ") = "toa do"`).

**E2E lesson:** Ctrl+K and selection listeners attach post-hydration — tests wrap the trigger in `expect().toPass` retries (same family as the Monaco lesson from Phase 5).

**Verification run:** typecheck ✓ · eslint ✓ · vitest 53/53 (19 new: SM-2 sequence/clamps, streaks incl. DST + 3-day gap + same-day sessions, weeksGrid, search fold/ranking) ✓ · build ✓ (`/stats` + `/notes` routes live) · e2e 18/18 (palette search→navigate, selection→note→/notes roundtrip, stats empty-state) ✓. §9 DoD: dashboard đọc đúng streak (qua stats helpers dùng chung) và danh sách bài đến hạn ôn từ `review_queue`.

## Next Steps

→ [Phase 9](phase-09-content-tracks-2-to-13.md): the remaining ~110 lessons, one track per session.

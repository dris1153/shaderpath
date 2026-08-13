# Phase 2 — Content Pipeline: MDX + KaTeX + shiki + Curriculum

## Context Links

- Spec: §2 (tree), §3.1 (types), §4 (13 tracks), §6.1.1 (roadmap), §8.1 (type-safe curriculum), §9 phase 2
- Decisions: [D2](reports/spec-decisions.md) `@next/mdx` + typed import registry, [D7](reports/spec-decisions.md) KaTeX CSS, [D9](reports/spec-decisions.md) granularity/modules/tiers
- Depends on: [Phase 1](phase-01-scaffold-nextjs-shadcn-intl-drizzle.md)

## Overview

- **Priority:** P1
- **Status:** Not Started
- **Effort:** ~10h
- **Description:** Stand up the MDX toolchain (math + code highlight) and the typed curriculum tree covering all 13 tracks — metadata only, no lesson prose yet. Roadmap and track pages render the full tree with locked/unlocked state.

## Key Insights

- Curriculum is the type backbone: `LessonSlug` union derives from a single `as const` slug tuple, so a typo in `prerequisites` is a compile error (§8.1).
- ~160 units of metadata (D9: ~100 core + ~20 elective + ~35–40 checkpoints) cannot live in one file (200-line rule) → one file per track under `content/tracks/`, aggregated by `content/curriculum.ts`.
- MDX registry (D2) must be generated, not template-string-dynamic — turbopack needs static import graph, and TS needs the union.
- Unlock logic is pure and testable: `status(lesson) = locked if any prerequisite ≠ completed`, with a "learn anyway" escape hatch (§6.1.1 — never hard-block). Only `tier: 'core'` lessons act as prerequisites (D9).
- shiki must render both light and dark variants at build time (dual-theme CSS vars) since theme is client-toggled.

## Requirements

**Functional**
- `.mdx` files compile with `$…$`/`$$…$$` math rendered by KaTeX and fenced code highlighted by shiki (incl. `glsl`).
- `content/curriculum.ts` exposes all 13 tracks → modules → lesson metadata per §3.1 `LessonMeta`.
- `lib/curriculum.ts`: get track/module/lesson, next/prev, prerequisites resolution, unlock state, per-track and global completion %.
- Roadmap page (`/[locale]/roadmap`) renders full tree with progress rings; track page lists modules + lessons.

**Non-functional**
- Invalid prerequisite slug = compile error, not runtime error.
- Curriculum modules are RSC-safe (no client-only imports).
- Every track/module/lesson title + summary + objectives bilingual (`Localized<T>`).

## Architecture

```
content/slugs.ts ──(as const tuple)──> type LessonSlug
        │
content/tracks/00-math.ts … 13-capstone.ts  (TrackDef[], typed by LessonSlug)
        │
content/curriculum.ts  (aggregate + freeze)
        │            └──> scripts/gen-lesson-registry.ts ──> content/lesson-registry.generated.ts
        │                        (slug × locale → () => import('…/theory.vi.mdx'))
lib/curriculum.ts  (pure query/unlock/percent helpers — no DB)
        │
app/[locale]/roadmap/page.tsx (RSC) ── reads curriculum + progress rows (Phase 3 wires DB; Phase 2 uses empty-progress default)
```

MDX compile chain: `@next/mdx` → remark: `remark-gfm`, `remark-math` → rehype: `rehype-katex`, `rehype-slug`, `@shikijs/rehype` (dual theme).

## Related Code Files

**Create**
- `content/types.ts` (`Locale`, `Localized<T>`, `LessonMeta`, `Citation`, `Exercise`, `TrackDef`, `ModuleDef`)
- `content/slugs.ts`, `content/tracks/00-math.ts` … `content/tracks/13-capstone.ts` (14 files), `content/curriculum.ts`
- `scripts/gen-lesson-registry.ts`, `content/lesson-registry.generated.ts`
- `mdx-components.tsx` (root, required by `@next/mdx`) — maps MDX elements to shadcn primitives (`Alert` for callouts, `Card`, `Separator`, typographic classes)
- `lib/curriculum.ts`
- `components/lesson/callout.tsx` (Alert-based; hosts the mandatory "Lỗi hay gặp" callout)
- `app/[locale]/roadmap/page.tsx`, `app/[locale]/track/[trackSlug]/page.tsx`
- `components/roadmap/track-card.tsx`, `components/roadmap/lesson-row.tsx`
- `tests/unit/curriculum.test.ts`

**Modify**
- `next.config.ts` (wrap `createMDX`, `pageExtensions` += `mdx`)
- `app/[locale]/layout.tsx` (KaTeX CSS import — D7)
- `content/i18n/{vi,en}.json` (roadmap/track strings)
- `package.json` (`gen:registry` script)

**Delete** — none.

## Implementation Steps

1. Install: `@next/mdx @mdx-js/react @types/mdx remark-math remark-gfm rehype-katex rehype-slug katex shiki @shikijs/rehype`.
2. `next.config.ts`: compose `createMDX({ options: { remarkPlugins, rehypePlugins } })` with the existing next-intl plugin; add `mdx` to `pageExtensions` only if MDX routes are used (lessons are imported, not routed — prefer keeping pageExtensions unchanged).
3. `app/[locale]/layout.tsx`: `import 'katex/dist/katex.min.css'` (D7).
4. shiki via `@shikijs/rehype` with `themes: { light: 'github-light', dark: 'github-dark' }` and `langs` incl. `glsl`, `ts`, `tsx`, `js`, `bash`; verify dark variant switches with next-themes `class` strategy.
5. `content/types.ts`: transcribe §3.1, extended per D9 — `LessonMeta` gains `tier: 'core' | 'elective'` and `kind: 'lesson' | 'checkpoint'`; add `TrackDef { id, order, title, summary, moduleIds }`, `ModuleDef { id, trackId, order, title, lessonSlugs }`.
6. `content/slugs.ts`: `export const LESSON_SLUGS = [...] as const; export type LessonSlug = typeof LESSON_SLUGS[number];`
7. Per-track metadata files: one per §4 track, chunked per D9 — lesson = 1 mental model 20–45min (merge <10min bullets sharing a worked example, split on load jumps), module = 3–5 lessons + 1 checkpoint, track = 2–4 modules, elective ≈15–20%. Fill `title`, `summary`, `difficulty`, `estimatedMinutes`, `tags`, `tier`, `kind`, `prerequisites: LessonSlug[]`, `objectives`, `hasDemo`, `hasPlayground`. Bilingual strings required now (they drive roadmap UI). **Slugs freeze here** — churn later breaks notes/bookmarks anchors.
8. `content/curriculum.ts`: aggregate, assert uniqueness of slugs + order at module load (dev-only invariant check), export `CURRICULUM`.
9. `lib/curriculum.ts` pure helpers: `getLesson`, `getTrack`, `getModule`, `getNeighbors`, `isUnlocked(slug, progressMap)` (core prerequisites only — D9), `trackCompletion(trackId, progressMap)` (core-based %, electives reported separately), `overallCompletion`. No DB import.
10. `scripts/gen-lesson-registry.ts`: read `CURRICULUM`, emit `content/lesson-registry.generated.ts` with explicit `import()` per slug × locale, typed `Record<LessonSlug, Record<Locale, LessonModuleLoader>>` (D2). Add `pnpm gen:registry`; emit only entries whose MDX file exists (Phase 2 → mostly empty; grows in 7/9).
11. `mdx-components.tsx`: map `h1..h4` (anchor-friendly), `p`, `ul`, `code`, `pre`, `blockquote`, `table` to shadcn/Tailwind classes; expose `Callout`, `Demo` (placeholder until Phase 4), `Figure`.
12. Roadmap page (RSC): **module-first display** (D9) — 13 tracks as `Card`, each module with its own `Progress` ring in `Accordion` (collapsed by default ⇒ learner sees ~40 modules, never the flat unit list), lessons as rows on expand with lock/elective/checkpoint `Badge` + difficulty + minutes. Progress source stubbed to empty map (Phase 3 injects real data).
13. Track page: breadcrumb, module list, lesson list, prerequisites shown per lesson.
14. Unit tests: unlock logic, completion math, slug uniqueness, prerequisite-resolves-to-existing-slug.

## Todo List

- [ ] Install MDX/KaTeX/shiki deps
- [ ] Wire `@next/mdx` + remark/rehype chain in `next.config.ts`
- [ ] KaTeX CSS import in locale layout (D7)
- [ ] shiki dual theme + glsl grammar verified
- [ ] `content/types.ts` per §3.1
- [ ] `content/slugs.ts` + `LessonSlug` union
- [ ] 14 track metadata files covering all 13 tracks (§4)
- [ ] `content/curriculum.ts` aggregate + invariants
- [ ] `lib/curriculum.ts` query/unlock/percent helpers
- [ ] `scripts/gen-lesson-registry.ts` + generated registry (D2)
- [ ] `mdx-components.tsx` mapped to shadcn primitives
- [ ] Roadmap page + track page
- [ ] Unit tests for curriculum helpers
- [ ] typecheck/lint/build clean

## Success Criteria

- **§9 phase 2 DoD:** roadmap page renders the complete curriculum tree (13 tracks, all modules, all lessons).
- Changing a `prerequisites` entry to a non-existent slug fails `tsc --noEmit`.
- A scratch `.mdx` with `$$\mathbf{p}_{clip} = P V M \mathbf{p}_{model}$$` and a ```glsl block renders math + highlighted GLSL in both themes.
- Track/lesson titles render in vi and en; no untranslated key leaks.
- `pnpm gen:registry` is idempotent; regenerating produces no diff.
- Unit tests green: unlock, completion %, slug uniqueness.

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| `LessonSlug` union causes circular type inference (tracks import slugs, slugs derived from tracks) | M×H | Break the cycle: slugs declared standalone in `content/slugs.ts`; tracks consume the union. Never derive slugs from track files |
| ~160 unit metadata entries → oversized files | H×M | One file per track (~12 units each), stays under 200 lines |
| shiki build-time cost on ~260 MDX files (Phase 7/9) | M×M | Use a single shared highlighter instance + restricted `langs` list; measure build time at Phase 7 and revisit if >2min |
| `@next/mdx` + next-intl plugin composition order | L×M | Compose `withNextIntl(withMDX(config))`; verify `pnpm build` |
| Registry drifts from filesystem after content phases | M×M | `pnpm gen:registry` in precommit + a test asserting registry ⊇ curriculum entries with existing files |
| Roadmap perf with ~160 nodes | L×L | RSC render, no client state; Accordion collapsed by default (module-first, D9) |

## Security Considerations

- MDX is compiled at build time from repo-local files only — no user-supplied MDX, no runtime eval, no `rehype-raw`.
- `mdx-components.tsx` must not expose `dangerouslySetInnerHTML`.
- Curriculum is static data; no DB access in this phase (no injection surface).

## Rollback

Self-contained: revert the phase commit. Phase 1 shell keeps working since `next.config.ts` MDX wrapper is the only shared-file edit.

## Next Steps

→ [Phase 3](phase-03-lesson-page-toc-progress-tracking.md): lesson page consumes the registry + curriculum helpers and wires real progress.

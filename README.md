# Shaderpath

A self-hosted, single-user learning platform for Three.js / WebGL / GLSL / GSAP — from zero to senior. 14 tracks, 162 bilingual units (Vietnamese default, English), interactive demos, a GLSL playground, exercises with spaced repetition, notes, and progress tracking. All progress lives in a local SQLite file; nothing leaves your machine.

## Requirements

- Node.js 20+ and pnpm 9+
- Windows, macOS, or Linux (better-sqlite3 ships prebuilt binaries; no build tools needed)

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

First boot creates `data/progress.db` and applies migrations automatically (via `instrumentation.ts`). No setup step.

Production:

```bash
pnpm build      # regenerates lesson registry + search index, then next build
pnpm start
```

## Database & migrations

- SQLite (WAL) at `data/progress.db` — gitignored, contains only your progress/notes/settings. Lesson content lives in code (`content/`), never in the DB.
- Migrations in `drizzle/` are applied automatically on boot. Deleting `data/` entirely is safe: the next boot recreates and migrates a fresh DB.
- `SHADERPATH_DB=<path>` overrides the DB location (tests use this).

## Backup & restore

Two options:

1. **In-app (recommended):** Settings (gear icon) → Data → *Export* downloads `shaderpath-progress-<date>.json` (version-tagged). *Import* validates the file, previews row counts, auto-downloads a backup of the current state, then applies as replace or merge — all in one transaction.
2. **File copy:** stop the app, copy `data/progress.db` (and `-wal`/`-shm` siblings if present). Restore by copying back.

Imports with a mismatched `schemaVersion` are rejected outright — re-export from the same app version instead of hand-editing the JSON.

## Content authoring

- `content/tracks/*.ts` — track/module/lesson metadata (slugs are frozen; renaming breaks notes/bookmarks).
- `content/lessons/<track>/<slug>/` — `theory.vi.mdx`, `theory.en.mdx`, `references.ts`, `exercises.ts`, `demo.tsx` (+ sibling `.vert`/`.frag`).
- `pnpm gen:registry` regenerates the typed registry after adding files; `pnpm lint:content` is the quality gate (bilingual heading parity, citations, exercise rules).

## Checks

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm vitest run       # unit tests
pnpm test:e2e         # playwright (boots its own server on :3100, fresh DB per run)
pnpm audit:guards     # no-custom-css + strict-TS guards + full content lint
```

## Quality tiers

Demos auto-detect a quality tier (GPU string + device memory + a short frame probe) on first visit and cap canvas DPR/effects accordingly. Override it any time in Settings — the manual choice is persisted and always wins.

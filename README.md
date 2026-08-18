# Shaderpath

A single-user learning platform for Three.js / WebGL / GLSL / GSAP — from zero to senior. 14 tracks, 162 bilingual units (Vietnamese default, English), interactive demos, a GLSL playground, exercises with spaced repetition, notes, and progress tracking. Progress lives in Postgres; lesson content lives in code and never enters the database.

## Requirements

- Node.js 20+ and pnpm 9+
- A Postgres database (Supabase in production)
- Docker — only to run the test suites, which spin up a throwaway Postgres

## Run

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and DIRECT_URL
pnpm db:migrate              # creates the schema
pnpm dev                     # http://localhost:3000
```

Migrations do not run on boot. They are a deliberate step because the app is
deployed to serverless functions, where a boot hook fires on every cold start
and DDL does not belong on the request path.

Production:

```bash
pnpm build      # regenerates lesson registry + search index, then next build
pnpm start
```

## Database & migrations

- Postgres. `DATABASE_URL` is the runtime connection; on Supabase use the
  **transaction pooler** (port 6543). Serverless functions each open their own
  connection, and the direct connection runs out under light traffic.
  `db/client.ts` detects `:6543` and switches to one connection with prepared
  statements off, which that pooler requires.
- `DIRECT_URL` (port 5432) is used only by `pnpm db:migrate`. DDL through the
  transaction pooler is not safe.
- Migrations live in `db/migrations/`. Generate with `pnpm db:generate` after
  changing `db/schema.ts`, apply with `pnpm db:migrate`.
- The database holds progress, notes, bookmarks, review scheduling and
  settings — never lesson content.

## Deploy (Vercel + Supabase)

1. Create a Supabase project. Copy both connection strings from
   *Project Settings → Database → Connection string*.
2. In Vercel *Settings → Environment Variables*, set `DATABASE_URL` to the
   transaction pooler URL (6543). `DIRECT_URL` is only needed there if you
   intend to migrate from CI.
3. Apply the schema once from your machine:
   `DIRECT_URL=... pnpm db:migrate`
4. Deploy. Re-run step 3 whenever a migration is added — the app will not
   create tables for you.

## Backup & restore

Two options:

1. **In-app (recommended):** Settings (gear icon) → Data → *Export* downloads `shaderpath-progress-<date>.json` (version-tagged). *Import* validates the file, previews row counts, auto-downloads a backup of the current state, then applies as replace or merge — all in one transaction.
2. **Database-side:** Supabase's own backups, or `pg_dump` against `DIRECT_URL`.

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

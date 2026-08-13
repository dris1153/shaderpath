# Phase 1 — Scaffold: Next.js + shadcn + next-intl + Drizzle

## Context Links

- Spec: `../../prompt-webgl-learning-platform.md` §1 (stack), §2 (tree), §5 (schema), §7 (UI), §8 (tech constraints), §9 phase 1
- Decisions: [D1](reports/spec-decisions.md) glsl raw import, [D3](reports/spec-decisions.md) Next `@latest`, [D5](reports/spec-decisions.md) bookmarks, [D8](reports/spec-decisions.md) pnpm/root/WAL, A1 full schema, A2 test harness
- Overview: [plan.md](plan.md)

## Overview

- **Priority:** P1 (blocks everything)
- **Status:** ✅ Complete (2026-08-13)
- **Effort:** ~8h
- **Description:** Bring up the app shell: Next.js App Router (TS strict) at repo root, Tailwind v4 + shadcn/ui components, next-intl `/[locale]/` routing with vi default, next-themes dark/light, Drizzle + better-sqlite3 with the complete §5 schema and auto-migration, `.glsl` raw-import plumbing, test harness.

## Key Insights

- Repo root already git-inited, contains only the spec `.md`, `.claude/`, `plans/` → scaffold **into** root (D8), no nested folder.
- better-sqlite3 is a native module: must be in `serverExternalPackages`, must never reach a client bundle, and Windows may need build tools if no prebuilt binary matches the Node version.
- Full DB schema now (A1) = one migration, one reset path, §11 "delete db → boot → migrate" testable immediately.
- Locale + theme must be resolved server-side (cookie/`[locale]` segment) or first paint flashes and hydration mismatches — §11 item 1.
- shadcn CLI writes `components/ui/*` — treat as generated, never hand-edit (§7).

## Requirements

**Functional**
- `pnpm dev` boots; `/` redirects to `/vi`; `/en` renders same shell.
- Language switcher: swaps locale, keeps route + scroll position (§6.1.7).
- Theme toggle: light/dark/system via next-themes, honors `prefers-color-scheme` (§6.1.8).
- Deleting `data/progress.db` and restarting recreates + migrates it (§11.2).

**Non-functional**
- TS strict, `tsc --noEmit` clean, no `any`, no `@ts-ignore` (§11.8).
- No CSS file besides shadcn-generated `app/globals.css` (§7, §11.7).
- No hex colors — semantic tokens only (`bg-background`, `text-muted-foreground`, …).

## Architecture

```
Request → middleware (next-intl) → /[locale]/layout.tsx (RSC)
            │                          ├─ NextIntlClientProvider (messages: content/i18n/{locale}.json)
            │                          ├─ ThemeProvider (next-themes, class strategy)
            │                          └─ QueryProvider (TanStack Query, client)
            └─ locale from path; cookie NEXT_LOCALE persists choice

Server Action / Route Handler → db/client.ts (singleton, WAL) → better-sqlite3 → data/progress.db
Boot: instrumentation.ts / first db import → migrate(db, { migrationsFolder: 'db/migrations' })
```

Data in: locale segment, cookies (locale/theme). Data out: rendered shell, DB file on disk.
Client bundle must contain **zero** db imports — enforced by keeping `db/*` imports inside `'use server'` files only.

## Related Code Files

**Create**
- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- `.gitignore` (`node_modules`, `.next`, `data/`, `playwright-report/`, `test-results/`)
- `app/layout.tsx` (root, html lang via locale), `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` (dashboard placeholder), `app/globals.css` (generated)
- `middleware.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- `content/i18n/vi.json`, `content/i18n/en.json`
- `components/providers/theme-provider.tsx`, `components/providers/query-provider.tsx`
- `components/shell/locale-switcher.tsx`, `components/shell/theme-toggle.tsx`, `components/shell/app-header.tsx`
- `components/ui/*` (shadcn CLI output)
- `db/schema.ts`, `db/client.ts`, `db/migrate.ts`, `db/migrations/0000_*.sql` + `meta/`
- `drizzle.config.ts`, `instrumentation.ts`
- `types/glsl.d.ts`
- `vitest.config.ts`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `tests/unit/setup.ts`

**Modify** — none (greenfield).
**Delete** — none (`prompt-webgl-learning-platform.md` stays).

## Implementation Steps

1. `pnpm create next-app@latest .` — TS, App Router, Tailwind, ESLint, no `src/`, alias `@/*`. Record resolved Next version in this file's Notes (D3). Set package name `shaderpath`.
2. `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `noEmit` script `pnpm typecheck`.
3. `.gitignore`: add `data/` and test artifacts (D8).
4. `pnpm dlx shadcn@latest init`, then add all §7 components: `button card tabs accordion scroll-area separator badge progress slider switch select dialog sheet popover tooltip command sonner skeleton alert collapsible breadcrumb dropdown-menu avatar chart resizable toggle-group`. Install `@tabler/icons-react`.
5. Install runtime deps: `next-intl next-themes drizzle-orm better-sqlite3 @tanstack/react-query zustand`; dev: `drizzle-kit @types/better-sqlite3 vitest @vitejs/plugin-react @playwright/test`.
6. next-intl wiring: `i18n/routing.ts` (`locales: ['vi','en']`, `defaultLocale: 'vi'`, `localePrefix: 'always'`), `i18n/request.ts` loading `content/i18n/{locale}.json`, `middleware.ts` with matcher excluding `/_next`, `/api`, static assets. Wrap `next.config.ts` with `createNextIntlPlugin`.
7. `next.config.ts`: `serverExternalPackages: ['better-sqlite3']`; webpack rule `{ test: /\.glsl$/, type: 'asset/source' }` + turbopack equivalent; create `types/glsl.d.ts` (D1).
8. `db/schema.ts`: transcribe §5 verbatim — `lessonProgress`, `exerciseAttempts`, `notes`, `bookmarks` (per D5), `studySessions`, `reviewQueue`, `playgroundSnippets`, `settings`; add §5 indexes: `lesson_progress(status)`, `exercise_attempts(lesson_slug)`, `review_queue(due_at)`, `study_sessions(started_at)`, plus `bookmarks(lesson_slug)`, `notes(lesson_slug)`.
9. `db/client.ts`: `globalThis` singleton, `new Database('data/progress.db')` (mkdir `data/` if missing), `pragma('journal_mode = WAL')`, `pragma('foreign_keys = ON')`, export typed `db`.
10. `drizzle.config.ts` + `pnpm db:generate` → commit `db/migrations/` (§8.8). `db/migrate.ts` runs migrations idempotently; call from `instrumentation.ts` (server runtime only).
11. Layout: `app/[locale]/layout.tsx` sets `<html lang={locale}>`, `suppressHydrationWarning` for next-themes, mounts providers, renders `app-header` (breadcrumb + locale switcher + theme toggle).
12. `locale-switcher.tsx`: next-intl `usePathname`/`useRouter` to swap prefix — same route, no full reload, no scroll reset (§6.1.7). Uses shadcn `Select` or `DropdownMenu`.
13. Seed `content/i18n/{vi,en}.json` with shell strings only (nav, theme labels, locale names).
14. Test harness (A2): `vitest.config.ts` (node env + jsdom project), `playwright.config.ts` (webServer `pnpm dev`), `tests/e2e/smoke.spec.ts` asserting `/vi` 200 + locale switch to `/en`.
15. `pnpm typecheck && pnpm lint && pnpm build` clean → commit.

## Todo List

- [x] Scaffold next-app at repo root, package `shaderpath`, strict TS
- [x] `.gitignore` with `data/`
- [x] shadcn init + 27 components + tabler icons
- [x] Install runtime + dev deps (pnpm)
- [x] next-intl routing/middleware/messages, `/` → `/vi`
- [x] `next.config.ts`: serverExternalPackages, glsl webpack + turbopack rules
- [x] `types/glsl.d.ts`
- [x] `db/schema.ts` full §5 + D5 bookmarks + indexes
- [x] `db/client.ts` singleton + WAL + foreign_keys
- [x] Generate + commit initial migration; auto-migrate on boot
- [x] Locale layout + providers (intl, theme, query)
- [x] Locale switcher (route + scroll preserved) + theme toggle
- [x] vitest + playwright configs + smoke test
- [x] typecheck / lint / build clean

## Success Criteria

- **§9 phase 1 DoD:** `pnpm dev` runs; language and theme can both be switched.
- `/` → `/vi`; `/en/…` mirrors; switching locale keeps path and scroll (§11.1) with no hydration warning in console.
- `rm -rf data/` → restart → DB recreated and migrated, app works (§11.2).
- `tsc --noEmit` clean, zero `any`/`@ts-ignore` (§11.8).
- Only `app/globals.css` exists as CSS (§11.7).
- `pnpm test:e2e` smoke passes.
- `import shader from './x.glsl'` typechecks and yields a string (verified by a throwaway typecheck, not committed).

## Risk Assessment

| Risk | L×I | Mitigation |
|---|---|---|
| better-sqlite3 native build fails on Windows/Node mismatch | M×H | Pin Node LTS in `.nvmrc`/`engines`; if prebuilt missing, install VS Build Tools; fallback: run app under WSL. Blocker for all DB phases — resolve here, not later |
| turbopack `.glsl` rule syntax differs by Next major (D1/D3) | M×M | Verify against resolved version docs at step 7; if turbopack rule unsupported, run dev with webpack (`next dev` without `--turbopack`) and note it |
| shadcn CLI vs Tailwind v4 init drift | M×M | Follow shadcn CLI output verbatim; do not hand-write `globals.css` theme block |
| next-intl v3 vs v4 API change (`routing.ts`/`request.ts`) | M×M | Read installed package's docs/types before wiring; keep i18n surface in 3 small files for cheap rewrite |
| Hydration mismatch from theme class on first paint | M×M | `suppressHydrationWarning` on `<html>`, next-themes script strategy; assert in smoke test |
| db import leaking into a client component | L×H | `db/*` only imported by `'use server'` modules; lint rule / review check each phase |

## Security Considerations

- Single-user, localhost-only: no auth by design (§6.3). Do **not** expose the dev server on a public interface.
- `data/` gitignored — progress DB never committed.
- Route Handlers/Server Actions are the only DB entry points; validate every input with a schema before it reaches SQL (Drizzle parameterizes, but shape validation still required).
- No secrets in repo; no `.env` needed at this phase.

## Rollback

Single commit ("chore: scaffold shaderpath"). Revert = `git reset --hard` to the pre-scaffold commit + `rm -rf node_modules data .next`. No external state to unwind.

## Notes (post-implementation, 2026-08-13)

**Resolved versions (D3):** Next.js 16.3.0 (Turbopack default for dev + build), React 19.2.8, Tailwind 4.3.3, next-intl 4.13.6, drizzle-orm 0.45.2, drizzle-kit 0.31.10, better-sqlite3 **^12.11.1 (pinned)**, shadcn CLI 4.17, vitest 4.1.10, playwright 1.62.1, Node 22 + pnpm 11.5.

**Deviations / gotchas:**
- better-sqlite3 v13 dropped `prebuild-install` → requires VS Build Tools on Windows. Pinned to ^12 (prebuilt binaries). Revisit only if v13 features needed.
- shadcn 4.x default preset (`base-nova`) is **Base UI**-based, not Radix. Trigger composition uses `render={<Button/>}` prop, not `asChild`. Init run with `--pointer` (cursor-pointer on buttons). 29 ui files (input/textarea/toggle/input-group pulled in as dependencies).
- Next 16: `proxy.ts` replaces `middleware.ts` — next-intl `createMiddleware` exported from it works unchanged.
- No root `app/layout.tsx` — `<html>` lives in `app/[locale]/layout.tsx` (next-intl convention; build validates).
- `localeDetection: false` in routing — spec mandates vi default; Accept-Language would otherwise send en-browsers to `/en` on `/`.
- e2e web server pinned to port 3100 (3000 occupied by another local app).
- pnpm 11 `allowBuilds` in `pnpm-workspace.yaml` gates native postinstalls: better-sqlite3/esbuild/@parcel/watcher/@swc/core = true.
- Scaffold-generated `AGENTS.md`/`CLAUDE.md` (create-next-app 16 templates) kept as-is.

**Verification run:** `tsc --noEmit` ✓ · `eslint` ✓ · `next build` ✓ · e2e 4/4 (redirect `/`→`/vi`, vi+en render, switcher keeps route, dark class) ✓ · delete `data/` → boot → 8 tables + `__drizzle_migrations`, `journal_mode=wal` ✓ · `.glsl` import typecheck ✓.

## Next Steps

→ [Phase 2](phase-02-content-pipeline-mdx-katex-shiki-curriculum.md): MDX/KaTeX/shiki pipeline + curriculum metadata for 13 tracks.
Blockers cleared for: 2 (config surface), 3 (schema), 5 (`.glsl` imports).

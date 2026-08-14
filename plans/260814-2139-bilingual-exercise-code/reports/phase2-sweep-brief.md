# Phase 2 sweep brief (shared by all agents)

Work context: `D:\Workspace\Personal\Webs\learning-3d`. You own ONLY the tracks
named in your task. Parallel agents own the other tracks — never touch them, and
never touch `content/types.ts` or anything under `components/`.

## Read first

- `content/lessons/00-math/dot-and-cross-products/exercises.ts` — the reference
  migration. Copy its shape.
- `components/exercise/prompt-body.tsx` — the ONLY renderer `solutionNote` gets.
- `plans/260814-2139-bilingual-exercise-code/plan.md` — measured scope, decisions.

## The two transformations

Every `content/lessons/<your-track>/*/exercises.ts` gets ONE pass doing both:

### 1. Prose answers → `solutionNote`

A `solutionCode` that is nothing but `//` lines of explanation is **not code**.
It exists only because `solutionCode` was the one field that always rendered.

```ts
// BEFORE
solutionCode: `// n·L = (0)(0.6) + (1)(0.8) + (0)(0) = 0.8
// theta = arccos(0.8) ≈ 36.87°
//
// 0.8 > 0 → góc < 90° → bề mặt hướng về phía nguồn sáng.`,

// AFTER — solutionCode deleted entirely
solutionNote: {
  vi: `$\\hat n \\cdot \\hat L = ... = 0.8$, nên $\\theta = \\arccos(0.8) \\approx 36.87^\\circ$.

Vì $0.8 > 0$ nên bề mặt đang hướng về phía nguồn sáng.`,
  en: `$\\hat n \\cdot \\hat L = ... = 0.8$, so $\\theta = \\arccos(0.8) \\approx 36.87^\\circ$.

Since $0.8 > 0$, the surface faces the light source.`,
},
```

Rules:
- **Both locales are required** (TypeScript enforces it). The `en` text must
  carry the SAME number of explanatory points as the `vi` — do not summarise.
- `solutionNote` goes after `solutionCode`'s old position, before `hints`.
- Delete `solutionCode` only when it was pure prose. If it holds real code with
  a few comments, KEEP it (see transformation 2) — and if it also carries a
  paragraph of explanation, that paragraph may move to `solutionNote`.

### 2. Real code comments → English

Every remaining Vietnamese comment inside `starterCode` / `solutionCode`
(any exercise kind, including `build`, whose starter is not even rendered) is
translated in place. `// TODO 1: SDF hình tròn tâm chuột` →
`// TODO 1: circle SDF centred on the mouse`.

**Never change a non-comment line.** The code must be byte-identical apart from
comment text. Do not "improve" the code, rename variables, or reformat.

## PromptBody supports a small subset — stay inside it

Paragraphs (separated by a blank line), `` `inline code` ``, `$inline katex$`,
and ```` ```fenced blocks``` ````. **No bold, no lists, no headings** — they
render as literal characters. Use separate paragraphs instead of bullets.

## KaTeX rules (violating these breaks the build gate)

- **No Vietnamese characters inside `\text{}`** — KaTeX has no glyphs for them.
  `pnpm lint:content` fails on this. Explain in the prose around the formula.
- **Use `^\circ`, never the `°` character**, inside `$...$`. A raw degree sign
  is an unrecognised Unicode character to KaTeX.
- These are TypeScript template literals: **every TeX backslash must be doubled**
  — `$\\hat n$`, `$\\theta$`, `$\\approx$`, `$\\le$`. A single `\h` collapses to
  `h` and the formula renders as plain text.
- Plain arithmetic can stay plain text; only wrap in `$...$` what benefits.

## Self-verify (parallel-safe)

1. `pnpm typecheck` — must be clean for YOUR files. Transient errors inside other
   agents' folders are expected; ignore them.
2. `pnpm lint:content` — 0 errors attributable to your lessons.
3. Do NOT run `pnpm build`, `pnpm test:e2e`, or `git commit` — the orchestrator
   does that once all agents finish.

## Definition of done for your slice

- Zero Vietnamese diacritics remain in any `starterCode` / `solutionCode` of your
  lessons (this is what phase 3's lint rule will enforce).
- Every prose answer you moved exists in both `vi` and `en`.
- No code line changed other than its comments.

End with: **Status:** DONE|BLOCKED, **Summary:**, **Concerns:**.

import fs from "node:fs";
import path from "node:path";
import { extractToc } from "../lib/mdx-toc";
import { LESSON_SLUGS } from "../content/slugs";
import { LOCALES } from "../content/types";
import { stripInlineMath } from "../lib/tex-to-text";

// Emits typed maps from the content/lessons filesystem (decision D2):
//   LESSON_REGISTRY     slug×locale → dynamic import of theory MDX
//   REFERENCES_REGISTRY slug        → dynamic import of references.ts
//   TOC_REGISTRY        slug×locale → TocItem[] parsed from MDX headings
// TOC lives here (not a remark plugin) because Turbopack requires MDX plugins
// in serializable string form — injecting an `export const toc` via estree is
// far heavier than parsing headings in this generator.

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const OUT = path.join(process.cwd(), "content", "lesson-registry.generated.ts");


interface PitfallItem {
  label: string;
  detail?: string;
}

function stripInlineMarkdown(text: string): string {
  // keep `_` (snake_case identifiers, not _emphasis_) and lone `*`
  // (gl.uniform* is API text, not markdown) — only bold pairs are markup here
  return stripInlineMath(text)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

// Pulls the numbered/bulleted items out of the lesson's single
// `<Callout variant="mistake">` block. Items follow the house pattern
// `1. **Bold lead.** explanation…` — the bold lead becomes the node label.
function extractPitfalls(mdxSource: string): PitfallItem[] {
  const start = mdxSource.indexOf('<Callout variant="mistake"');
  if (start === -1) return [];
  const end = mdxSource.indexOf("</Callout>", start);
  if (end === -1) return [];
  const items: string[] = [];
  let current: string[] | null = null;
  // split tolerates CRLF: `.` never matches `\r`, which would break the `$` anchor
  for (const line of mdxSource.slice(start, end).split(/\r?\n/)) {
    const m = /^\s*(?:\d+\.|-)\s+(.*)$/.exec(line);
    if (m?.[1]) {
      if (current) items.push(current.join(" "));
      current = [m[1]];
    } else if (current) {
      if (line.trim() === "") {
        items.push(current.join(" "));
        current = null;
      } else {
        current.push(line.trim());
      }
    }
  }
  if (current) items.push(current.join(" "));
  return items.map((raw) => {
    const lead = /^\*\*(.+?)\*\*\s*(.*)$/.exec(raw);
    if (lead?.[1]) {
      const label = stripInlineMarkdown(lead[1]).replace(/[.,;:]$/, "");
      const detail = stripInlineMarkdown(lead[2] ?? "");
      return detail ? { label, detail } : { label };
    }
    const text = stripInlineMarkdown(raw);
    if (text.length <= 60) return { label: text };
    const cut = text.lastIndexOf(" ", 60);
    return { label: `${text.slice(0, cut > 20 ? cut : 60)}…`, detail: text };
  });
}

const slugSet = new Set<string>(LESSON_SLUGS);
const theoryEntries: string[] = [];
const referenceEntries: string[] = [];
const tocEntries: string[] = [];
const pitfallEntries: string[] = [];
const mindmapEntries: string[] = [];
const demoEntries: string[] = [];
const exerciseEntries: string[] = [];
const reviewCardEntries: string[] = [];
const warnings: string[] = [];

if (fs.existsSync(LESSONS_DIR)) {
  for (const trackDir of fs.readdirSync(LESSONS_DIR).sort()) {
    const trackPath = path.join(LESSONS_DIR, trackDir);
    if (!fs.statSync(trackPath).isDirectory() || trackDir.startsWith("_")) {
      continue;
    }
    for (const lessonDir of fs.readdirSync(trackPath).sort()) {
      const lessonPath = path.join(trackPath, lessonDir);
      if (!fs.statSync(lessonPath).isDirectory()) continue;
      if (!slugSet.has(lessonDir)) {
        warnings.push(`skipped ${trackDir}/${lessonDir}: not in LESSON_SLUGS`);
        continue;
      }

      const locales = LOCALES.filter((l) =>
        fs.existsSync(path.join(lessonPath, `theory.${l}.mdx`)),
      );
      if (locales.length > 0) {
        const fields = locales
          .map(
            (l) =>
              `    ${l}: () => import("./lessons/${trackDir}/${lessonDir}/theory.${l}.mdx"),`,
          )
          .join("\n");
        theoryEntries.push(`  "${lessonDir}": {\n${fields}\n  },`);

        const pitfallFields: string[] = [];
        const tocFields = locales
          .map((l) => {
            const src = fs.readFileSync(
              path.join(lessonPath, `theory.${l}.mdx`),
              "utf8",
            );
            const pitfalls = extractPitfalls(src);
            if (pitfalls.length > 0) {
              pitfallFields.push(`    ${l}: ${JSON.stringify(pitfalls)},`);
            }
            return `    ${l}: ${JSON.stringify(extractToc(src))},`;
          })
          .join("\n");
        tocEntries.push(`  "${lessonDir}": {\n${tocFields}\n  },`);
        if (pitfallFields.length > 0) {
          pitfallEntries.push(
            `  "${lessonDir}": {\n${pitfallFields.join("\n")}\n  },`,
          );
        }
      }

      if (fs.existsSync(path.join(lessonPath, "mindmap.ts"))) {
        mindmapEntries.push(
          `  "${lessonDir}": () => import("./lessons/${trackDir}/${lessonDir}/mindmap"),`,
        );
      }

      if (fs.existsSync(path.join(lessonPath, "references.ts"))) {
        referenceEntries.push(
          `  "${lessonDir}": () => import("./lessons/${trackDir}/${lessonDir}/references"),`,
        );
      }

      if (fs.existsSync(path.join(lessonPath, "demo.tsx"))) {
        demoEntries.push(
          `  "${lessonDir}": () => import("./lessons/${trackDir}/${lessonDir}/demo"),`,
        );
      }

      if (fs.existsSync(path.join(lessonPath, "exercises.ts"))) {
        exerciseEntries.push(
          `  "${lessonDir}": () => import("./lessons/${trackDir}/${lessonDir}/exercises"),`,
        );
      }

      if (fs.existsSync(path.join(lessonPath, "review-cards.ts"))) {
        reviewCardEntries.push(
          `  "${lessonDir}": () => import("./lessons/${trackDir}/${lessonDir}/review-cards"),`,
        );
      }
    }
  }
}

const body = `// AUTO-GENERATED by scripts/gen-lesson-registry.ts — DO NOT EDIT.
// Regenerate with: pnpm gen:registry
import type { ComponentType } from "react";
import type { LessonSlug } from "./slugs";
import type {
  Citation,
  Exercise,
  Locale,
  Localized,
  MindMapNode,
} from "./types";

export type LessonModuleLoader = () => Promise<{ default: ComponentType }>;
export type ReferencesLoader = () => Promise<{ references: Citation[] }>;

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3 | 4;
}

export const LESSON_REGISTRY: Partial<
  Record<LessonSlug, Partial<Record<Locale, LessonModuleLoader>>>
> = {
${theoryEntries.join("\n")}
};

export const REFERENCES_REGISTRY: Partial<
  Record<LessonSlug, ReferencesLoader>
> = {
${referenceEntries.join("\n")}
};

export const TOC_REGISTRY: Partial<
  Record<LessonSlug, Partial<Record<Locale, TocItem[]>>>
> = {
${tocEntries.join("\n")}
};

export interface PitfallItem {
  label: string;
  detail?: string;
}

// Mistake-callout items per lesson×locale; lessons without the callout are
// absent (their mind map hides the pitfalls branch).
export const PITFALLS_REGISTRY: Partial<
  Record<LessonSlug, Partial<Record<Locale, PitfallItem[]>>>
> = {
${pitfallEntries.join("\n")}
};

// Handwritten mind-map overrides (one file, both locales); when present the
// lesson page uses it instead of the auto-generated tree. Gated by
// lint-content (anchor validity, vi/en parity).
export type MindMapLoader = () => Promise<{
  mindMap: Localized<MindMapNode[]>;
}>;

export const MIND_MAP_OVERRIDES: Partial<Record<LessonSlug, MindMapLoader>> = {
${mindmapEntries.join("\n")}
};

export type ExercisesLoader = () => Promise<{ exercises: Exercise[] }>;

export const EXERCISES_REGISTRY: Partial<
  Record<LessonSlug, ExercisesLoader>
> = {
${exerciseEntries.join("\n")}
};
`;

// DEMO_REGISTRY lives in its own file: it is imported by a CLIENT component
// (LessonDemoHost) so demos code-split per lesson. Keeping it out of the main
// registry stops the client bundler from ever seeing the MDX/theory loaders.
const demoBody = `// AUTO-GENERATED by scripts/gen-lesson-registry.ts — DO NOT EDIT.
// Regenerate with: pnpm gen:registry
import type { ComponentType } from "react";
import type { LessonSlug } from "./slugs";

export type DemoModuleLoader = () => Promise<{ default: ComponentType }>;

export const DEMO_REGISTRY: Partial<Record<LessonSlug, DemoModuleLoader>> = {
${demoEntries.join("\n")}
};
`;

// The review page is a client component and needs exercises for its fallback
// prompt. Importing EXERCISES_REGISTRY from the main registry would pull the
// MDX loaders into the client graph, so the review loaders get their own file.
const reviewBody = `// AUTO-GENERATED by scripts/gen-lesson-registry.ts — DO NOT EDIT.
// Regenerate with: pnpm gen:registry
import type { LessonSlug } from "./slugs";
import type { Exercise, ReviewCard } from "./types";

export type ReviewCardsLoader = () => Promise<{ reviewCards: ReviewCard[] }>;

export const REVIEW_CARDS_REGISTRY: Partial<
  Record<LessonSlug, ReviewCardsLoader>
> = {
${reviewCardEntries.join("\n")}
};

export type ReviewExercisesLoader = () => Promise<{ exercises: Exercise[] }>;

export const REVIEW_EXERCISES_REGISTRY: Partial<
  Record<LessonSlug, ReviewExercisesLoader>
> = {
${exerciseEntries.join("\n")}
};
`;

fs.writeFileSync(OUT, body, "utf8");
fs.writeFileSync(
  path.join(path.dirname(OUT), "demo-registry.generated.ts"),
  demoBody,
  "utf8",
);
fs.writeFileSync(
  path.join(path.dirname(OUT), "review-registry.generated.ts"),
  reviewBody,
  "utf8",
);
console.log(
  `lesson registry: ${theoryEntries.length} theory, ${referenceEntries.length} references, ${demoEntries.length} demos, ${exerciseEntries.length} exercises, ${reviewCardEntries.length} review-card sets, ${pitfallEntries.length} pitfall sets, ${mindmapEntries.length} mind-map overrides`,
);
for (const w of warnings) console.warn(`  ${w}`);

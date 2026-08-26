import {
  pick,
  CORE_LOCALES,
  type Locale,
  type Localized,
  type MindMapNode,
} from "@/content/types";

// Validates a handwritten mindmap.ts override. Pure so lint-content.ts and
// the unit tests share the exact same rules. The auto-generated tree needs no
// gate — it is derived from the lesson and cannot disagree with it.

export interface MindMapLintResult {
  errors: string[];
  warnings: string[];
}

const KINDS = new Set(["objective", "section", "pitfall", "link"]);
const MAX_LABEL_WORDS = 8;

function isNode(value: unknown): value is MindMapNode {
  if (typeof value !== "object" || value === null) return false;
  const n = value as Partial<MindMapNode>;
  return (
    typeof n.id === "string" &&
    n.id.length > 0 &&
    typeof n.label === "string" &&
    n.label.length > 0 &&
    typeof n.kind === "string" &&
    KINDS.has(n.kind) &&
    (n.children === undefined || Array.isArray(n.children))
  );
}

/** Pre-order structural signature: kinds + nesting, ignoring text and ids. */
function shapeOf(nodes: MindMapNode[]): string {
  return nodes
    .map((n) => `${n.kind}(${n.children ? shapeOf(n.children) : ""})`)
    .join(",");
}

function walk(
  nodes: MindMapNode[],
  visit: (n: MindMapNode, depth: number) => void,
  depth = 0,
): void {
  for (const n of nodes) {
    visit(n, depth);
    // isArray, not truthiness: a malformed `children: {}` must be reported
    // by the shape check, not crash the traversal
    if (Array.isArray(n.children)) walk(n.children, visit, depth + 1);
  }
}

export function lintMindMapOverride(args: {
  at: string;
  mindMap: unknown;
  /** Valid heading anchor ids per locale (from extractToc on the MDX). */
  headingIds: Localized<ReadonlySet<string>>;
  lessonSlugs: ReadonlySet<string>;
}): MindMapLintResult {
  const { at, mindMap, headingIds, lessonSlugs } = args;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 5: well-formed export — Localized<MindMapNode[]>, both locales non-empty
  const record = mindMap as Partial<Localized<unknown>> | null | undefined;
  // Core locales only: a handwritten override cannot exist for a language
  // still being filled in, and that language falls back rather than failing.
  const locales: readonly Locale[] = CORE_LOCALES;
  let malformed = false;
  for (const loc of locales) {
    const tree = record?.[loc];
    if (!Array.isArray(tree) || tree.length === 0) {
      errors.push(`${at}: mindmap.ts ${loc} tree is missing or empty`);
      malformed = true;
      continue;
    }
    walk(tree as MindMapNode[], (n) => {
      if (!isNode(n)) {
        errors.push(
          `${at}: mindmap.ts ${loc} has a malformed node: ${JSON.stringify(n).slice(0, 80)}`,
        );
        malformed = true;
      }
    });
  }
  if (malformed) return { errors, warnings };
  const trees = record as Localized<MindMapNode[]>;

  // Rule 2: vi/en structural parity (same shape and kinds; ids/labels differ)
  if (shapeOf(trees.vi) !== shapeOf(trees.en)) {
    errors.push(
      `${at}: mindmap.ts vi/en trees differ structurally (node kinds or nesting) - mirror the structure, translate the text`,
    );
  }

  for (const loc of locales) {
    const seen = new Set<string>();
    walk(pick(trees, loc), (n, depth) => {
      // ids must stay unique: they are anchor targets and React keys
      if (seen.has(n.id)) {
        errors.push(`${at}: mindmap.ts ${loc} duplicate node id "${n.id}"`);
      }
      seen.add(n.id);

      // "root" is synthesized by buildLessonMindMap; a branch reusing it
      // would shadow the real root in the canvas id map
      if (n.id === "root") {
        errors.push(`${at}: mindmap.ts ${loc} node id "root" is reserved`);
      }

      // Top-level nodes render as toggle buttons; anything deeper of kind
      // section/link renders as a REAL <a href>, children or not — so the id
      // must resolve.
      // Rule 1: section anchors must point at a real heading of that locale
      if (n.kind === "section" && depth >= 1) {
        if (!pick(headingIds, loc).has(n.id)) {
          errors.push(
            `${at}: mindmap.ts ${loc} section node "${n.id}" matches no heading in theory.${loc}.mdx`,
          );
        }
      }

      // Rule 4: link nodes must reference an existing lesson
      if (n.kind === "link" && depth >= 1) {
        if (!lessonSlugs.has(n.id)) {
          errors.push(
            `${at}: mindmap.ts ${loc} link node "${n.id}" is not a lesson slug`,
          );
        }
      }

      // Rule 3: node labels are labels, not sentences
      const words = n.label.split(/\s+/).filter(Boolean).length;
      if (words > MAX_LABEL_WORDS) {
        warnings.push(
          `${at}: mindmap.ts ${loc} label "${n.label.slice(0, 40)}..." has ${words} words (guideline <=${MAX_LABEL_WORDS})`,
        );
      }
    });
  }

  // Link ids are locale-independent lesson slugs: they must match across trees
  const linkIds = (tree: MindMapNode[]) => {
    const ids: string[] = [];
    walk(tree, (n, depth) => {
      if (n.kind === "link" && depth >= 1) ids.push(n.id);
    });
    return ids.join(",");
  };
  if (linkIds(trees.vi) !== linkIds(trees.en)) {
    errors.push(
      `${at}: mindmap.ts vi/en link nodes reference different lessons`,
    );
  }

  return { errors, warnings };
}

import type {
  PitfallItem,
  TocItem,
} from "@/content/lesson-registry.generated";
import type { LessonMeta, Locale, MindMapNode } from "@/content/types";
import { stripInlineMath } from "@/lib/tex-to-text";

export interface MindMapStrings {
  objectives: string;
  content: string;
  pitfalls: string;
  links: string;
  prerequisiteNote: string;
  dependentNote: string;
}

// Headings are assertion-shaped "topic: insight" — the split gives a short
// node label plus a detail revealed on demand. Inline KaTeX becomes plain
// text (nodes cannot host KaTeX).
function splitAtColon(text: string): { label: string; detail?: string } {
  const clean = stripInlineMath(text);
  const i = clean.indexOf(": ");
  if (i <= 0) return { label: clean };
  return { label: clean.slice(0, i), detail: clean.slice(i + 2) };
}

function sectionNodes(toc: TocItem[]): MindMapNode[] {
  const nodes: MindMapNode[] = [];
  let lastDepth2: MindMapNode | undefined;
  let lastDepth3: MindMapNode | undefined;
  for (const item of toc) {
    const node: MindMapNode = {
      id: item.id,
      kind: "section",
      ...splitAtColon(item.text),
    };
    const parent =
      item.depth === 2
        ? undefined
        : item.depth === 3
          ? lastDepth2
          : (lastDepth3 ?? lastDepth2);
    if (parent) (parent.children ??= []).push(node);
    else nodes.push(node);
    if (item.depth === 2) {
      lastDepth2 = node;
      lastDepth3 = undefined;
    } else if (item.depth === 3) {
      lastDepth3 = node;
    }
  }
  return nodes;
}

/**
 * Assembles one lesson's mind map from already-audited data: meta
 * (objectives, prerequisites), TOC headings, and mistake-callout items.
 * Pure and deterministic — the tree is serialized into RSC props.
 */
export function buildLessonMindMap(args: {
  meta: LessonMeta;
  locale: Locale;
  toc: TocItem[];
  pitfalls: PitfallItem[];
  prerequisites: LessonMeta[];
  dependents: LessonMeta[];
  strings: MindMapStrings;
  /** Handwritten branches from mindmap.ts; replaces the auto-built ones. */
  overrideBranches?: MindMapNode[];
}): MindMapNode {
  const { meta, locale, toc, pitfalls, prerequisites, dependents, strings } =
    args;
  if (args.overrideBranches && args.overrideBranches.length > 0) {
    return {
      id: "root",
      kind: "section",
      label: meta.title[locale],
      detail: meta.summary[locale],
      children: args.overrideBranches,
    };
  }
  const branches: MindMapNode[] = [];

  if (meta.objectives[locale].length > 0) {
    branches.push({
      id: "objectives",
      kind: "objective",
      label: strings.objectives,
      children: meta.objectives[locale].map((o, i) => ({
        id: `objective-${i}`,
        kind: "objective",
        label: o,
      })),
    });
  }

  const sections = sectionNodes(toc);
  if (sections.length > 0) {
    branches.push({
      id: "content",
      kind: "section",
      label: strings.content,
      children: sections,
    });
  }

  if (pitfalls.length > 0) {
    branches.push({
      id: "pitfalls",
      kind: "pitfall",
      label: strings.pitfalls,
      children: pitfalls.map((p, i) => ({
        id: `pitfall-${i}`,
        kind: "pitfall",
        label: p.label,
        detail: p.detail,
      })),
    });
  }

  const linkChildren: MindMapNode[] = [
    ...prerequisites.map((p): MindMapNode => ({
      id: p.slug,
      kind: "link",
      label: p.title[locale],
      detail: strings.prerequisiteNote,
    })),
    ...dependents.map((d): MindMapNode => ({
      id: d.slug,
      kind: "link",
      label: d.title[locale],
      detail: strings.dependentNote,
    })),
  ];
  if (linkChildren.length > 0) {
    branches.push({
      id: "links",
      kind: "link",
      label: strings.links,
      children: linkChildren,
    });
  }

  return {
    id: "root",
    kind: "section",
    label: meta.title[locale],
    detail: meta.summary[locale],
    children: branches,
  };
}

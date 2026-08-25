import GithubSlugger from "github-slugger";

// Single source of heading-slug truth, shared by gen-lesson-registry (TOC +
// mind-map anchors) and lint-content (override anchor validation). rehype-slug
// runs before rehype-katex (next.config.ts) precisely so the rendered ids
// match what this produces from raw MDX text.

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3 | 4;
}

export function extractToc(mdxSource: string): TocItem[] {
  // Strip fenced code blocks so `## comments` inside fences don't match
  const withoutFences = mdxSource.replace(/^```[\s\S]*?^```/gm, "");
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const line of withoutFences.split("\n")) {
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!m || !m[1] || !m[2]) continue;
    // Strip inline markdown the way rendered text content would appear
    const text = m[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim();
    items.push({
      id: slugger.slug(text),
      text,
      depth: m[1].length as 2 | 3 | 4,
    });
  }
  return items;
}

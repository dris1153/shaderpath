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

const GREEK: Record<string, string> = {
  alpha: "α",
  beta: "β",
  theta: "θ",
  lambda: "λ",
  pi: "π",
  phi: "φ",
  omega: "ω",
};

/** KaTeX renders headings fine; a table of contents is plain text and showed
 *  the source. Covers what the headings actually use and degrades to dropping
 *  the backslash for anything else, so an unknown macro reads as a word. */
function mathToUnicode(text: string): string {
  return text.replace(/\$([^$]+)\$/g, (_, math: string) =>
    math
      // A function right after a symbol needs the space KaTeX would draw
      // ("A\sin" is "A sin"); one after a bracket or a sign must not get it.
      .replace(/([A-Za-z0-9])\\(sin|cos|tan|log|ln|max|min)\b/g, "$1 $2")
      .replace(/\\([a-zA-Z]+)\b/g, (whole: string, name: string) =>
        name in GREEK ? GREEK[name]! : whole.slice(1),
      )
      .replace(/\^2\b/g, "²")
      .replace(/\^3\b/g, "³")
      .replace(/-/g, "−")
      .replace(/\s+/g, " ")
      .trim(),
  );
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
    // The slug keeps coming from the raw text: rehype-slug runs before
    // rehype-katex, so the rendered id is built from the same string, and
    // lint-content validates mind-map anchors against it.
    items.push({
      id: slugger.slug(text),
      text: mathToUnicode(text),
      depth: m[1].length as 2 | 3 | 4,
    });
  }
  return items;
}

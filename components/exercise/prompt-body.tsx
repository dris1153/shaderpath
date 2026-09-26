import katex from "katex";
import type { ReactNode } from "react";

// Minimal renderer for exercise prompts (repo-authored content only):
// paragraphs, `inline code`, $inline math$ (KaTeX), **bold**, *italic* and
// ```fenced blocks```.
// Full MDX prompts were deliberately skipped — no runtime MDX eval (D2);
// the Phase 7 content lint keeps prompts inside this subset.

// Code and math come first in the alternation so a `*` inside either is
// consumed before emphasis sees it. Emphasis markers must hug their text and
// sit at a word boundary, or `2 * 3`, `gl.uniform*` and `(2-0)*(-1)` in
// worked answers would turn italic.
const INLINE =
  /(`[^`]+`|\$[^$\n]+\$|(?<![^\s("'])\*\*(?=\S)[^*\n]+?(?<=\S)\*\*(?![^\s.,;:!?)"'])|(?<![^\s("'])\*(?=[^\s*])[^*\n]+?(?<=\S)\*(?![^\s.,;:!?)"']))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={key} className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      return (
        <span
          key={key}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(part.slice(1, -1), {
              throwOnError: false,
            }),
          }}
        />
      );
    }
    // Odd indices are what INLINE captured. Emphasis must come from a match,
    // not from leftover text that merely starts and ends with `*`.
    const captured = i % 2 === 1;
    if (captured && part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>;
    }
    if (captured && part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>;
    }
    return <span key={key}>{part}</span>;
  });
}

export function PromptBody({ text }: { text: string }) {
  // Split out fenced code blocks first
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-3 text-sm leading-6">
      {blocks.map((block, bi) => {
        if (block.startsWith("```")) {
          const code = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={bi}
              className="bg-muted overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-5"
            >
              <code>{code}</code>
            </pre>
          );
        }
        return block
          .split(/\n{2,}/)
          .filter((p) => p.trim().length > 0)
          .map((paragraph, pi) => (
            <p key={`${bi}-${pi}`}>
              {renderInline(paragraph.trim(), `${bi}-${pi}`)}
            </p>
          ));
      })}
    </div>
  );
}

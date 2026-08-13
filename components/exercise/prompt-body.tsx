import katex from "katex";
import type { ReactNode } from "react";

// Minimal renderer for exercise prompts (repo-authored content only):
// paragraphs, `inline code`, $inline math$ (KaTeX) and ```fenced blocks```.
// Full MDX prompts were deliberately skipped — no runtime MDX eval (D2);
// the Phase 7 content lint keeps prompts inside this subset.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\$[^$\n]+\$)/g);
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

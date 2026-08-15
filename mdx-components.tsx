import { isValidElement, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Figure } from "@/components/lesson/figure";
import { PlaygroundEmbed } from "@/components/playground/playground-embed";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Rehype plugins put their own className on the nodes they build — shiki does it
// to every <pre>. Spreading props after a literal className silently discards
// ours, so every mapping merges instead of overwriting.
function languageOf(children: ReactNode): string | undefined {
  if (!isValidElement<{ className?: string }>(children)) return undefined;
  return /language-(\w+)/.exec(children.props.className ?? "")?.[1];
}

// Element → shadcn/Tailwind mapping shared by every lesson MDX file.
const components: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-2 text-3xl font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn("mt-6 scroll-m-20 text-lg font-semibold", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mt-4 leading-7", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mt-4 ml-6 list-disc space-y-1", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mt-4 ml-6 list-decimal space-y-1", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "text-muted-foreground mt-4 border-l-2 pl-4 italic",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "bg-muted rounded px-1.5 py-0.5 font-mono text-sm [pre_&]:bg-transparent [pre_&]:p-0",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ children, ...props }) => (
    <CodeBlock language={languageOf(children)} {...props}>
      {children}
    </CodeBlock>
  ),
  table: ({ className, ...props }) => (
    <div className="mt-4 overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("border-b px-3 py-2 text-left font-medium", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border-b px-3 py-2 align-top", className)} {...props} />
  ),
  hr: () => <Separator className="my-8" />,
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "text-primary font-medium underline underline-offset-4",
        className,
      )}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      {...props}
    />
  ),
  Callout,
  Figure,
  // Embedded playground for hasPlayground lessons: <Playground source={"..."} />
  Playground: ({ source }: { source?: string }) => (
    <PlaygroundEmbed compact initialSource={source} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}

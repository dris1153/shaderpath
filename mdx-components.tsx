import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/lesson/callout";
import { PlaygroundEmbed } from "@/components/playground/playground-embed";
import { Separator } from "@/components/ui/separator";

// Element → shadcn/Tailwind mapping shared by every lesson MDX file.
const components: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-2 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2
      className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h4: (props) => (
    <h4 className="mt-6 scroll-m-20 text-lg font-semibold" {...props} />
  ),
  p: (props) => <p className="mt-4 leading-7" {...props} />,
  ul: (props) => <ul className="mt-4 ml-6 list-disc space-y-1" {...props} />,
  ol: (props) => <ol className="mt-4 ml-6 list-decimal space-y-1" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="text-muted-foreground mt-4 border-l-2 pl-4 italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm [pre_&]:bg-transparent [pre_&]:p-0"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-lg border p-4 text-sm leading-6"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b px-3 py-2 text-left font-medium" {...props} />
  ),
  td: (props) => <td className="border-b px-3 py-2 align-top" {...props} />,
  hr: () => <Separator className="my-8" />,
  a: (props) => (
    <a
      className="text-primary font-medium underline underline-offset-4"
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      {...props}
    />
  ),
  Callout,
  // Embedded playground for hasPlayground lessons: <Playground source={"..."} />
  Playground: ({ source }: { source?: string }) => (
    <PlaygroundEmbed compact initialSource={source} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}

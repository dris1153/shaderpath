"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

// Plain Monaco pane for `code`-kind exercises (TS/JS) — edited, never executed.
export function CodeEditor({
  value,
  language = "typescript",
  onChange,
}: {
  value: string;
  language?: string;
  onChange: (v: string) => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <Editor
      language={language}
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        padding: { top: 12 },
      }}
    />
  );
}

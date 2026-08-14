"use client";

import { useEffect, useRef, type RefObject } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlslError } from "@/lib/glsl/parse-error";
import { registerGlslLanguage } from "./glsl-language";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export interface EditorHandle {
  revealLine: (line: number) => void;
}

export function GlslEditor({
  value,
  onChange,
  errors,
  handleRef,
}: {
  value: string;
  onChange: (v: string) => void;
  errors: GlslError[];
  handleRef?: RefObject<EditorHandle | null>;
}) {
  const t = useTranslations("a11y");
  const { resolvedTheme } = useTheme();
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const monaco = monacoRef.current;
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!monaco || !model) return;
    const lineCount = model.getLineCount();
    monaco.editor.setModelMarkers(
      model,
      "glsl",
      errors.map((e) => {
        const line = Math.min(e.line, lineCount);
        return {
          startLineNumber: line,
          endLineNumber: line,
          startColumn: 1,
          endColumn: model.getLineMaxColumn(line),
          message: e.message,
          severity:
            e.severity === "warning"
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Error,
        };
      }),
    );
  }, [errors]);

  return (
    <>
      <p className="sr-only">{t("editorEscapeHint")}</p>
      <Editor
        language="glsl"
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={registerGlslLanguage}
        onMount={(ed, monaco) => {
          editorRef.current = ed;
          monacoRef.current = monaco;
          if (handleRef) {
            handleRef.current = {
              revealLine: (line) => {
                ed.revealLineInCenter(line);
                ed.setPosition({ lineNumber: line, column: 1 });
                ed.focus();
              },
            };
          }
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12 },
          ariaLabel: t("editorEscapeHint"),
        }}
      />
    </>
  );
}

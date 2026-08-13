"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DEFAULT_FRAGMENT } from "@/lib/glsl/assemble";
import type { GlslError } from "@/lib/glsl/parse-error";
import type { Snippet } from "@/lib/playground";
import { ErrorList } from "./error-list";
import { GlslEditor, type EditorHandle } from "./glsl-editor";
import { ShaderPreview } from "./shader-preview";
import { SnippetBar } from "./snippet-bar";

// Playground state lives in this one component — editor, preview, snippets
// are direct children (spec §1's "ephemeral UI state", no store needed yet).
export function PlaygroundClient({
  initialSnippets = [],
  initialSource,
  compact = false,
}: {
  initialSnippets?: Snippet[];
  initialSource?: string;
  compact?: boolean;
}) {
  const [snippets, setSnippets] = useState(initialSnippets);
  const [snippetId, setSnippetId] = useState<number | null>(null);
  const [source, setSource] = useState(initialSource ?? DEFAULT_FRAGMENT);
  const [liveSource, setLiveSource] = useState(source);
  const [errors, setErrors] = useState<GlslError[]>([]);
  const [compileMs, setCompileMs] = useState<number | null>(null);
  const editorHandle = useRef<EditorHandle | null>(null);

  // 300ms debounce keeps recompiles off the keystroke path
  useEffect(() => {
    const timer = setTimeout(() => setLiveSource(source), 300);
    return () => clearTimeout(timer);
  }, [source]);

  const onCompile = useCallback((errs: GlslError[], ms: number) => {
    setErrors(errs);
    setCompileMs(ms);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {!compact && (
        <SnippetBar
          snippets={snippets}
          currentId={snippetId}
          source={source}
          onSnippets={setSnippets}
          onLoad={(s) => {
            setSnippetId(s.id);
            setSource(s.fragmentShader);
          }}
          onNew={() => {
            setSnippetId(null);
            setSource(DEFAULT_FRAGMENT);
          }}
        />
      )}
      <ResizablePanelGroup
        orientation="horizontal"
        className={
          compact
            ? "min-h-[320px] flex-1 rounded-lg border"
            : "min-h-[520px] flex-1 rounded-lg border"
        }
      >
        <ResizablePanel defaultSize={50} minSize={25}>
          <GlslEditor
            value={source}
            onChange={setSource}
            errors={errors}
            handleRef={editorHandle}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={25}>
          <ShaderPreview source={liveSource} onCompile={onCompile} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <ErrorList
        errors={errors}
        compileMs={compileMs}
        onJump={(line) => editorHandle.current?.revealLine(line)}
      />
    </div>
  );
}

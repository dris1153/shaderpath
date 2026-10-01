"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DEFAULT_FRAGMENT } from "@/lib/glsl/assemble";
import type { GlslError } from "@/lib/glsl/parse-error";
import type { SnippetSummary } from "@/lib/api-payloads";
import { isAuthError } from "@/lib/hooks/fetch-json";
import { useSnippets } from "@/lib/hooks/use-snippets";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ErrorList } from "./error-list";
import { GlslEditor, type EditorHandle } from "./glsl-editor";
import { ShaderPreview } from "./shader-preview";
import { SnippetBar } from "./snippet-bar";

// Playground state lives in this one component — editor, preview, snippets
// are direct children (spec §1's "ephemeral UI state", no store needed yet).
export function PlaygroundClient({
  initialSource,
  compact = false,
  onSourceChange,
}: {
  initialSource?: string;
  compact?: boolean;
  /** Fires on editor edits — used by shader exercises to autosave userCode */
  onSourceChange?: (source: string) => void;
}) {
  const tA11y = useTranslations("a11y");
  const t = useTranslations("playground");
  // Below md the split is too narrow to edit in: one pane at a time instead.
  const narrow = useMediaQuery("(max-width: 767px)");
  const [pane, setPane] = useState<"code" | "preview">("code");
  const { data, error } = useSnippets(!compact);
  // Save and delete are server actions that hand back the whole fresh list, so
  // once one has run it, not the query, is the truth.
  const [saved, setSaved] = useState<SnippetSummary[] | null>(null);
  // /api/snippets answers 401 to a guest. That is "no account", not "could not
  // read": the presets are static content and a signed-out visitor must still
  // be able to browse them. Anything else — a 503, a dead network — keeps the
  // skeleton, because then we genuinely do not know what they have saved.
  const guest = isAuthError(error);
  const snippets = saved ?? data?.snippets ?? (guest ? [] : undefined);
  // One selection string drives the dropdown: "" (unsaved), "u:<id>" or
  // "p:<slug>". Keeping presets out of the snippet id is what stops "Save"
  // from overwriting a user snippet after loading a preset.
  const [selection, setSelection] = useState("");
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

  const editor = (
    <GlslEditor
      value={source}
      onChange={(v) => {
        setSource(v);
        onSourceChange?.(v);
      }}
      errors={errors}
      handleRef={editorHandle}
      fontSize={narrow ? 16 : 13}
    />
  );
  const preview = <ShaderPreview source={liveSource} onCompile={onCompile} />;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {!compact && !snippets && <Skeleton className="h-9 w-full" />}
      {!compact && snippets && (
        <SnippetBar
          snippets={snippets}
          canSave={!guest}
          selection={selection}
          source={source}
          onSnippets={setSaved}
          onSelect={(value, loaded) => {
            setSelection(value);
            setSource(loaded.source);
          }}
          onNew={() => {
            setSelection("");
            setSource(DEFAULT_FRAGMENT);
          }}
        />
      )}
      {narrow ? (
        <>
          {/* Both panes stay mounted so the editor keeps its state and the
              preview its GL context; Monaco relayouts itself when shown. */}
          <div className={cn("h-[60vh] min-h-[360px] overflow-hidden rounded-xl border-2", pane !== "code" && "hidden")}>
            {editor}
          </div>
          <div className={cn("aspect-square overflow-hidden rounded-xl border-2", pane !== "preview" && "hidden")}>
            {preview}
          </div>
          <div
            className={cn(
              "bg-card sticky z-30 flex items-center gap-2 rounded-xl border-2 p-1.5",
              // Clears the fixed tab bar on full pages; embeds sit in a lesson.
              compact ? "bottom-3" : "bottom-[calc(5rem+env(safe-area-inset-bottom))]",
            )}
          >
            <ToggleGroup
              value={[pane]}
              onValueChange={(v) => v[0] && setPane(v[0] as "code" | "preview")}
              aria-label={t("paneLabel")}
            >
              <ToggleGroupItem value="code">{t("paneCode")}</ToggleGroupItem>
              <ToggleGroupItem value="preview">{t("panePreview")}</ToggleGroupItem>
            </ToggleGroup>
            {compileMs !== null ? (
              errors.length === 0 ? (
                <span className="bg-mint text-ink ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold">
                  <IconCircleCheck className="size-4" aria-hidden />
                  {t("compiledIn", { ms: compileMs })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPane("code")}
                  className="bg-coral text-ink ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <IconAlertTriangle className="size-4" aria-hidden />
                  {t("errorsTitle", { count: errors.length })}
                </button>
              )
            ) : null}
          </div>
        </>
      ) : (
        <ResizablePanelGroup
          orientation="horizontal"
          className={
            compact
              ? "min-h-[320px] flex-1 rounded-xl border-2"
              : "min-h-[520px] flex-1 rounded-xl border-2"
          }
        >
          <ResizablePanel defaultSize={50} minSize={25}>
            {editor}
          </ResizablePanel>
          <ResizableHandle withHandle aria-label={tA11y("resizeHandle")} />
          <ResizablePanel defaultSize={50} minSize={25}>
            {preview}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      <ErrorList
        errors={errors}
        compileMs={compileMs}
        onJump={(line) => editorHandle.current?.revealLine(line)}
      />
    </div>
  );
}

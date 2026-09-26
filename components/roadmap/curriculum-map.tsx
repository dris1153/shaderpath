"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/content/types";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import type { LayoutId } from "@/lib/roadmap/layouts";
import { nextBand, type ZoomBand } from "@/lib/roadmap/zoom-bands";
import { cn } from "@/lib/utils";
import {
  buildFlow,
  type LabelNodeData,
  type LessonNodeData,
} from "./build-flow";
import {
  ChainHandles,
  LessonRowNode,
  MapLegend,
  ModuleRowNode,
  TrackCardNode,
} from "./map-card-nodes";

export interface CurriculumMapStrings {
  legendCompleted: string;
  legendUnlocked: string;
  legendLocked: string;
  regionLabel: string;
  checkpoint: string;
}


function LessonNode({ data }: NodeProps<Node<LessonNodeData>>) {
  return (
    <div
      className={cn(
        "bg-card w-56 rounded-md border px-2.5 py-1.5 text-xs leading-snug",
        data.state === "completed" && "border-primary bg-primary/10",
        data.state === "locked" && "border-dashed opacity-60",
      )}
    >
      <Handle type="target" position={Position.Left} className="invisible!" />
      {/* Real anchor: middle-click, keyboard and prefetch all behave. */}
      <Link href={`/lesson/${data.slug}`} className="hover:underline">
        {data.title}
      </Link>
      {data.isCheckpoint && (
        <span className="text-muted-foreground block text-[10px]">
          {data.checkpointLabel}
        </span>
      )}
      <Handle type="source" position={Position.Right} className="invisible!" />
    </div>
  );
}

function LabelNode({ data }: NodeProps<Node<LabelNodeData>>) {
  return data.kind === "track" ? (
    // A link, not a heading: the keyboard needs the stop, while 14 headings
    // inside a canvas would only clutter the page outline.
    <p className="w-56 text-sm font-semibold">
      <ChainHandles />
      <Link href={data.href ?? "/roadmap"} className="hover:underline">
        {data.title}
      </Link>
    </p>
  ) : (
    <p className="text-muted-foreground w-56 text-[10px] font-medium tracking-wide uppercase">
      {data.title}
    </p>
  );
}

const nodeTypes = {
  lesson: LessonNode,
  label: LabelNode,
  trackCard: TrackCardNode,
  moduleRow: ModuleRowNode,
  lessonRow: LessonRowNode,
};


export default function CurriculumMap({
  locale,
  strings,
}: {
  locale: Locale;
  strings: CurriculumMapStrings;
}) {
  const { resolvedTheme } = useTheme();
  const { data } = useProgressMap();
  // The API answers { progress: {}, authenticated: false } for a guest, and an
  // empty map is not "an account that has done nothing": taken literally it
  // locks almost every node and a visitor meets a wall of dashes. Same line
  // RoadmapSummary already draws.
  const progress = data?.authenticated ? data.progress : undefined;
  // Starts wide because fitView lands near 0.2 with 211 nodes. Driven from
  // onMove/onInit rather than an effect on the zoom store: setting state from
  // an effect is what react-hooks/set-state-in-effect flags.
  const [band, setBand] = useState<ZoomBand>("tracks");
  // Temporary: four folds ship together so they can be compared and three
  // deleted. Phase 4 of the plan removes this control and the losers.
  const [variant, setVariant] = useState<LayoutId>("serpentine");
  const observe = useCallback(
    (zoom: number) => setBand((current) => nextBand(zoom, current)),
    [],
  );

  const { nodes, edges } = useMemo(
    () =>
      buildFlow({
        variant,
        band,
        locale,
        progress,
        checkpointLabel: strings.checkpoint,
      }),
    [band, locale, progress, strings.checkpoint, variant],
  );

  return (
    <div>
      {progress && (
        <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="border-primary bg-primary/10 size-3 rounded-sm border" />
            {strings.legendCompleted}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-card size-3 rounded-sm border" />
            {strings.legendUnlocked}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-dashed opacity-60" />
            {strings.legendLocked}
          </span>
        </div>
      )}
      {variant !== "columns" && <MapLegend />}
      <div className="mt-3 flex flex-wrap gap-1 text-xs">
        {(["serpentine", "vertical", "horizontal", "columns"] as const).map(
          (id) => (
            <button
              key={id}
              type="button"
              onClick={() => setVariant(id)}
              aria-pressed={variant === id}
              className={cn(
                "rounded-md border px-2 py-1",
                variant === id ? "bg-secondary" : "text-muted-foreground",
              )}
            >
              {id}
            </button>
          ),
        )}
      </div>
      {/* Nodes render in curriculum order, so tabbing the region walks the
          14 tracks in sequence — the same path the list view offers. */}
      <div
        role="region"
        aria-label={strings.regionLabel}
        className="mt-3 h-[70vh] min-h-120 overflow-hidden rounded-xl border"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          fitView
          minZoom={0.08}
          nodesDraggable={false}
          nodesConnectable={false}
          // Without this every node wrapper (incl. 49 inert labels) is a tab
          // stop; the inner lesson links are the real keyboard targets.
          nodesFocusable={false}
          onInit={(instance) => observe(instance.getZoom())}
          onMove={(_, viewport) => observe(viewport.zoom)}
          // elementsSelectable stays on: with both dragging and selection off,
          // xyflow turns node pointer-events off entirely and the lesson links
          // stop receiving clicks.
        >
          <Background />
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

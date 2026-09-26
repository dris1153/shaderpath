"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useTheme } from "next-themes";
import type { Locale } from "@/content/types";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import type { LayoutId } from "@/lib/roadmap/layouts";
import { nextBand, type ZoomBand } from "@/lib/roadmap/zoom-bands";
import { cn } from "@/lib/utils";
import { buildFlow } from "./build-flow";
import {
  LessonRowNode,
  MapLegend,
  ModuleRowNode,
  TrackCardNode,
} from "./map-card-nodes";
import { LabelNode, LessonNode } from "./map-compact-nodes";

export interface CurriculumMapStrings {
  legendCompleted: string;
  legendUnlocked: string;
  legendLocked: string;
  regionLabel: string;
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
  // Starts wide because fitView lands near 0.25 on the folded route. Driven
  // from onMove/onInit rather than an effect on the zoom store: setting state
  // from an effect is what react-hooks/set-state-in-effect flags.
  const [band, setBand] = useState<ZoomBand>("tracks");
  // Temporary: four layouts ship together so the user can compare them in the
  // app and pick one. The switcher and the losers go once that choice is made.
  const [variant, setVariant] = useState<LayoutId>("serpentine");
  const observe = useCallback(
    (zoom: number) => setBand((current) => nextBand(zoom, current)),
    [],
  );

  const { nodes, edges } = useMemo(
    () => buildFlow({ variant, band, locale, progress }),
    [variant, band, locale, progress],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1 text-xs">
        {(["serpentine", "horizontal", "vertical", "columns"] as const).map(
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
      {/* Columns has no bars or pips to explain. */}
      {variant !== "columns" && <MapLegend />}
      {progress && (
        // Swatches match the lesson rows: completed reads in the primary
        // colour, the same colour that fills each track's road.
        <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-primary size-2 rounded-full" />
            {strings.legendCompleted}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-foreground size-2 rounded-full" />
            {strings.legendUnlocked}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-foreground size-2 rounded-full opacity-50" />
            {strings.legendLocked}
          </span>
        </div>
      )}
      {/* Cards render in curriculum order, so tabbing the region walks the
          14 tracks in sequence — the same path the list view offers. */}
      <div
        role="region"
        aria-label={strings.regionLabel}
        className="mt-3 h-[70vh] min-h-120 overflow-hidden rounded-xl border"
      >
        <ReactFlow
          // fitView only runs on mount; remounting refits each layout.
          key={variant}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          fitView
          minZoom={0.08}
          nodesDraggable={false}
          nodesConnectable={false}
          // Without this every node wrapper is a tab stop; the links inside
          // the cards and rows are the real keyboard targets.
          nodesFocusable={false}
          onInit={(instance) => observe(instance.getZoom())}
          onMove={(_, viewport) => observe(viewport.zoom)}
          // elementsSelectable stays on: with both dragging and selection off,
          // xyflow turns node pointer-events off entirely and the links stop
          // receiving clicks.
        >
          <Background />
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

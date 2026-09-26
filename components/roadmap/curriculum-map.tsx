"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import type { LessonSlug } from "@/content/slugs";
import { type Locale, pick } from "@/content/types";
import { isUnlocked, type ProgressMap } from "@/lib/curriculum";
import {
  isVisible,
  nextBand,
  type NodeTier,
  type ZoomBand,
} from "@/lib/roadmap/zoom-bands";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { cn } from "@/lib/utils";
import { chainEdges, layoutFor, type LayoutId } from "@/lib/roadmap/layouts";

export interface CurriculumMapStrings {
  legendCompleted: string;
  legendUnlocked: string;
  legendLocked: string;
  regionLabel: string;
  checkpoint: string;
}

type LessonState = "pending" | "completed" | "unlocked" | "locked";

type LessonNodeData = {
  title: string;
  state: LessonState;
  slug: string;
  isCheckpoint: boolean;
  checkpointLabel: string;
};
type LabelNodeData = { title: string; kind: "track" | "module"; href?: string };

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

const SIDES = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
] as const;

function LabelNode({ data }: NodeProps<Node<LabelNodeData>>) {
  return data.kind === "track" ? (
    // A link, not a heading: the keyboard needs the stop, while 14 headings
    // inside a canvas would only clutter the page outline.
    <p className="w-56 text-sm font-semibold">
      {/* Chain edges run between tracks, and xyflow draws nothing to a node
          without handles. Every side carries both kinds so each fold can
          leave from whichever side faces the next station. */}
      {SIDES.map(([id, position]) => (
        <span key={id}>
          <Handle id={`s-${id}`} type="source" position={position} className="invisible!" />
          <Handle id={`t-${id}`} type="target" position={position} className="invisible!" />
        </span>
      ))}
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

const nodeTypes = { lesson: LessonNode, label: LabelNode };

function stateOf(
  slug: LessonSlug,
  progress: ProgressMap | undefined,
): LessonState {
  // Unknown never renders as a confident value: no data → neutral, not locked.
  if (!progress) return "pending";
  if (progress[slug] === "completed") return "completed";
  return isUnlocked(slug, progress) ? "unlocked" : "locked";
}

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

  const { nodes, edges } = useMemo(() => {
    const layout = layoutFor(variant, TRACKS, MODULES, LESSONS);
    const flowNodes: Node[] = layout.nodes.map((n) => {
      const position = { x: n.x, y: n.y };
      // MiniMap reads node.internals.userNode and skips anything without
      // dimensions. These nodes are uncontrolled — no onNodesChange — so
      // nothing writes `measured` back onto them and the minimap rendered an
      // empty frame. initialWidth/Height are hints only: the node still
      // measures itself, and fitView gets a better first guess.
      const common = {
        id: n.id,
        position,
        draggable: false,
        connectable: false,
        initialWidth: 224,
        // 162 lessons cannot be legible at once at any styling, so each zoom
        // band hides the tiers below it. Hiding rather than rebuilding the
        // array keeps node identity and measurements, and the minimap already
        // skips hidden nodes so it follows the band for free.
        hidden: !isVisible(n.kind as NodeTier, band),
      };
      if (n.kind === "lesson") {
        return {
          ...common,
          initialHeight: n.lesson!.kind === "checkpoint" ? 44 : 30,
          type: "lesson",
          data: {
            title: pick(n.lesson!.title, locale),
            state: stateOf(n.lesson!.slug, progress),
            slug: n.lesson!.slug,
            isCheckpoint: n.lesson!.kind === "checkpoint",
            checkpointLabel: strings.checkpoint,
          } satisfies LessonNodeData,
        };
      }
      return {
        ...common,
        initialHeight: 20,
        type: "label",
        selectable: false,
        data: {
          title: pick(n.track?.title ?? n.module?.title ?? { vi: "", en: "" }, locale),
          kind: n.kind,
          href: n.track ? `/track/${n.track.id}` : undefined,
        } satisfies LabelNodeData,
      };
    });
    // The overview draws the sequence between tracks; the detail view draws
    // prerequisites between lessons. Drawing either at the wrong band leaves
    // edges hanging off hidden endpoints.
    const at = new Map(layout.nodes.map((n) => [n.id, n]));
    const flowEdges: Edge[] =
      band === "lessons"
        ? layout.edges.map((e) => ({
            id: e.id,
            source: e.from,
            target: e.to,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { opacity: 0.5 },
          }))
        : chainEdges(TRACKS, LESSONS).map((e) => {
            // Leave from the side facing the next station: a serpentine row
            // that runs right to left must not loop round to its right edge.
            const a = at.get(e.from)!;
            const b = at.get(e.to)!;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const [out, into] =
              Math.abs(dx) >= Math.abs(dy)
                ? dx >= 0 ? ["r", "l"] : ["l", "r"]
                : dy >= 0 ? ["b", "t"] : ["t", "b"];
            return {
              id: e.id,
              source: e.from,
              target: e.to,
              sourceHandle: `s-${out}`,
              targetHandle: `t-${into}`,
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { opacity: 0.6 },
            };
          });
    return { nodes: flowNodes, edges: flowEdges };
  }, [band, locale, progress, strings.checkpoint, variant]);

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

"use client";

import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
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
import type { Locale } from "@/content/types";
import { isUnlocked, type ProgressMap } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { cn } from "@/lib/utils";
import { layoutCurriculumMap } from "./curriculum-map-layout";

export interface CurriculumMapStrings {
  legendCompleted: string;
  legendUnlocked: string;
  legendLocked: string;
  a11y: string;
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
type LabelNodeData = { title: string; kind: "track" | "module" };

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
    <p className="w-56 text-sm font-semibold">{data.title}</p>
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
  const progress = data?.progress;

  const { nodes, edges } = useMemo(() => {
    const layout = layoutCurriculumMap(TRACKS, MODULES, LESSONS);
    const flowNodes: Node[] = layout.nodes.map((n) => {
      const position = { x: n.x, y: n.y };
      const common = { id: n.id, position, draggable: false, connectable: false };
      if (n.kind === "lesson") {
        return {
          ...common,
          type: "lesson",
          data: {
            title: n.lesson!.title[locale],
            state: stateOf(n.lesson!.slug, progress),
            slug: n.lesson!.slug,
            isCheckpoint: n.lesson!.kind === "checkpoint",
            checkpointLabel: strings.checkpoint,
          } satisfies LessonNodeData,
        };
      }
      return {
        ...common,
        type: "label",
        selectable: false,
        data: {
          title: (n.track?.title ?? n.module?.title)?.[locale] ?? "",
          kind: n.kind,
        } satisfies LabelNodeData,
      };
    });
    const flowEdges: Edge[] = layout.edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { opacity: 0.5 },
    }));
    return { nodes: flowNodes, edges: flowEdges };
  }, [locale, progress, strings.checkpoint]);

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
      <p className="text-muted-foreground mt-2 text-xs">{strings.a11y}</p>
      <div className="mt-3 h-[70vh] min-h-120 overflow-hidden rounded-xl border">
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

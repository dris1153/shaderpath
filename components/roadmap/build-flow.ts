import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import type { LessonSlug } from "@/content/slugs";
import { type Locale, pick } from "@/content/types";
import { isUnlocked, trackCompletion, type ProgressMap } from "@/lib/curriculum";
import { trackChain } from "@/lib/roadmap/chain";
import {
  difficultyPips,
  hoursLabel,
  longestRegularMinutes,
  roadFraction,
  trackStats,
} from "@/lib/roadmap/encoding";
import { chainEdges, layoutFor, type LayoutId } from "@/lib/roadmap/layouts";
import { isVisible, type NodeTier, type ZoomBand } from "@/lib/roadmap/zoom-bands";
import type {
  LessonRowData,
  ModuleRowData,
  TrackCardData,
} from "./map-card-nodes";

// Turns a layout into xyflow nodes and edges. Kept out of the component so the
// component is state and markup, and this stays a plain function of its inputs.

export type LessonState = "pending" | "completed" | "unlocked" | "locked";

export type LessonNodeData = {
  title: string;
  state: LessonState;
  slug: string;
  isCheckpoint: boolean;
  checkpointLabel: string;
};
export type LabelNodeData = { title: string; kind: "track" | "module"; href?: string };

function stateOf(
  slug: LessonSlug,
  progress: ProgressMap | undefined,
): LessonState {
  // Unknown never renders as a confident value: no data → neutral, not locked.
  if (!progress) return "pending";
  if (progress[slug] === "completed") return "completed";
  return isUnlocked(slug, progress) ? "unlocked" : "locked";
}

export function buildFlow({
  variant,
  band,
  locale,
  progress,
  checkpointLabel,
}: {
  variant: LayoutId;
  band: ZoomBand;
  locale: Locale;
  progress: ProgressMap | undefined;
  checkpointLabel: string;
}): { nodes: Node[]; edges: Edge[] } {
    const layout = layoutFor(variant, TRACKS, MODULES, LESSONS);
    const chain = trackChain(TRACKS);
    const yardstick = longestRegularMinutes(chain, LESSONS);
    const terminus = chain.at(-1)!.id;
    const flowNodes: Node[] = layout.nodes.map((n) => {
      // MiniMap reads node.internals.userNode and skips anything without
      // dimensions. These nodes are uncontrolled — no onNodesChange — so
      // nothing writes `measured` back onto them. initialWidth/Height are
      // hints only: the node still measures itself.
      const common = {
        id: n.id,
        position: { x: n.x, y: n.y },
        draggable: false,
        connectable: false,
        initialWidth: n.w,
        initialHeight: n.h,
        // Each zoom band hides the tiers below it. Hiding rather than
        // rebuilding keeps node identity, and the minimap skips hidden nodes.
        hidden: !isVisible(n.kind as NodeTier, band),
        // Cards sit under the rows drawn inside them.
        zIndex: n.kind === "track" ? 0 : 1,
      };

      if (layout.style === "card") {
        if (n.kind === "track") {
          const stats = trackStats(n.track!, LESSONS);
          const core = progress ? trackCompletion(n.track!.id, progress) : null;
          return {
            ...common,
            type: "trackCard",
            selectable: false,
            data: {
              order: n.track!.order,
              title: pick(n.track!.title, locale),
              href: `/track/${n.track!.id}`,
              w: n.w,
              h: n.h,
              hours: hoursLabel(stats.minutes),
              difficulty: stats.difficulty,
              pips: difficultyPips(stats.difficulty),
              checkpoints: stats.checkpoints,
              road: roadFraction(stats.minutes, yardstick),
              done: core ? core.percent / 100 : undefined,
              coreCompleted: core?.coreCompleted ?? 0,
              coreTotal: core?.coreTotal ?? 0,
              isTerminus: n.track!.id === terminus,
              summary: pick(n.track!.summary, locale),
              showSummary: band === "tracks",
            } satisfies TrackCardData,
          };
        }
        if (n.kind === "module") {
          return {
            ...common,
            type: "moduleRow",
            selectable: false,
            data: {
              title: pick(n.module!.title, locale),
              w: n.w,
              h: n.h,
            } satisfies ModuleRowData,
          };
        }
        return {
          ...common,
          type: "lessonRow",
          data: {
            title: pick(n.lesson!.title, locale),
            slug: n.lesson!.slug,
            w: n.w,
            h: n.h,
            state: stateOf(n.lesson!.slug, progress),
            isCheckpoint: n.lesson!.kind === "checkpoint",
            isElective: n.lesson!.tier === "elective",
          } satisfies LessonRowData,
        };
      }

      if (n.kind === "lesson") {
        return {
          ...common,
          type: "lesson",
          data: {
            title: pick(n.lesson!.title, locale),
            state: stateOf(n.lesson!.slug, progress),
            slug: n.lesson!.slug,
            isCheckpoint: n.lesson!.kind === "checkpoint",
            checkpointLabel: checkpointLabel,
          } satisfies LessonNodeData,
        };
      }
      return {
        ...common,
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
              // Stroke is in world units: 2 is half a pixel at the overview's
              // zoom of 0.25, which is how the route went invisible.
              style: {
                opacity: 0.55,
                strokeWidth: layout.style === "card" ? 10 : 1,
              },
            };
          });
    return { nodes: flowNodes, edges: flowEdges };
}

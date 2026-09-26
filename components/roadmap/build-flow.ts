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
import { chainEdges, layoutRoadmap } from "@/lib/roadmap/layouts";
import { isVisible, type ZoomBand } from "@/lib/roadmap/zoom-bands";
import type {
  LessonRowData,
  ModuleRowData,
  TrackCardData,
} from "./map-card-nodes";

// Turns the layout into xyflow nodes and edges. Kept out of the component so
// the component is state and markup, and this stays a plain function of its
// inputs.

type LessonState = LessonRowData["state"];

function stateOf(
  slug: LessonSlug,
  progress: ProgressMap | undefined,
): LessonState {
  // Unknown never renders as a confident value: no data → neutral, not locked.
  if (!progress) return "pending";
  if (progress[slug] === "completed") return "completed";
  return isUnlocked(slug, progress) ? "unlocked" : "locked";
}

/** Leave from the side facing the next station: a row that runs right to left
 *  must not loop round to its right edge. */
function sidesBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ["r", "l"] : ["l", "r"];
  return dy >= 0 ? ["b", "t"] : ["t", "b"];
}

export function buildFlow({
  band,
  locale,
  progress,
}: {
  band: ZoomBand;
  locale: Locale;
  progress: ProgressMap | undefined;
}): { nodes: Node[]; edges: Edge[] } {
  const layout = layoutRoadmap(TRACKS, MODULES, LESSONS);
  const chain = trackChain(TRACKS);
  const yardstick = longestRegularMinutes(chain, LESSONS);
  const terminus = chain.at(-1)!.id;

  const nodes: Node[] = layout.nodes.map((n) => {
    // MiniMap reads node.internals.userNode and skips anything without
    // dimensions. These nodes are uncontrolled — no onNodesChange — so nothing
    // writes `measured` back onto them. initialWidth/Height are hints only:
    // the node still measures itself.
    const common = {
      id: n.id,
      position: { x: n.x, y: n.y },
      draggable: false,
      connectable: false,
      initialWidth: n.w,
      initialHeight: n.h,
      // Each zoom band hides the tiers below it. Hiding rather than
      // rebuilding keeps node identity, and the minimap skips hidden nodes.
      hidden: !isVisible(n.kind, band),
      // Cards sit under the rows drawn inside them.
      zIndex: n.kind === "track" ? 0 : 1,
    };

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
  });

  // The overview draws the sequence between tracks; the detail view draws
  // prerequisites between lessons. Drawing either at the wrong band leaves
  // edges hanging off hidden endpoints.
  const at = new Map(layout.nodes.map((n) => [n.id, n]));
  const edges: Edge[] =
    band === "lessons"
      ? layout.edges.map((e) => ({
          id: e.id,
          source: e.from,
          target: e.to,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { opacity: 0.5, strokeWidth: 2 },
        }))
      : chainEdges(TRACKS, LESSONS).map((e) => {
          const [out, into] = sidesBetween(at.get(e.from)!, at.get(e.to)!);
          return {
            id: e.id,
            source: e.from,
            target: e.to,
            sourceHandle: `s-${out}`,
            targetHandle: `t-${into}`,
            markerEnd: { type: MarkerType.ArrowClosed },
            // Stroke is in world units: 2 is half a pixel at the overview's
            // zoom of 0.25, which is how the route once went invisible.
            style: { opacity: 0.55, strokeWidth: 10 },
          };
        });

  return { nodes, edges };
}

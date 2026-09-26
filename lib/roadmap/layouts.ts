import type { LessonMeta, ModuleDef, TrackDef } from "@/content/types";
import { trackChain, trackLinks } from "./chain";
import {
  layoutCurriculumMap,
  type CurriculumMapLayout,
  type CurriculumMapNode,
} from "@/components/roadmap/curriculum-map-layout";

// Three folds of one line, drawn as a zoomable UI: modules live inside their
// track's card and lessons inside their module, with type sized per tier.
// That is what lets one world stay legible at every band. Hanging lessons
// below each track (phase 2) spaced the rows 1280 apart, so fitting the
// overview meant zooming out until names were a few pixels; packing each band
// separately fought the zoom that picks the band. Nesting has neither
// problem — positions never move and zoom only ever means "closer".
//
// The columns layout stays as the old design, drawn the old way, as the
// control the new folds have to beat.

export type LayoutId = "columns" | "horizontal" | "vertical" | "serpentine";
export type LayoutStyle = "compact" | "card";

export interface SizedNode extends CurriculumMapNode {
  w: number;
  h: number;
}

export interface SizedLayout extends Omit<CurriculumMapLayout, "nodes"> {
  nodes: SizedNode[];
  style: LayoutStyle;
}

/** World units. Chosen so the serpentine overview fits a 1100×630 canvas at
 *  zoom 0.25, where a 48-unit title renders at 12px. The tallest track
 *  (webgl: 3 modules, 15 lessons) needs 170 + 3×40 + 15×24 = 650. Module rows
 *  are taller than lesson rows because their type has to read at the modules
 *  band, which starts at zoom 0.38. */
export const CARD = {
  w: 800,
  h: 680,
  header: 170,
  pad: 24,
  moduleRow: 40,
  lessonRow: 24,
  gapX: 80,
  gapY: 80,
} as const;

const SERPENTINE_COLS = 5;

function origin(id: Exclude<LayoutId, "columns">, i: number) {
  const px = CARD.w + CARD.gapX;
  const py = CARD.h + CARD.gapY;
  switch (id) {
    case "horizontal":
      return { x: i * px, y: 0 };
    case "vertical":
      return { x: 0, y: i * py };
    case "serpentine": {
      const row = Math.floor(i / SERPENTINE_COLS);
      const col = i % SERPENTINE_COLS;
      // Alternate rows run backwards so the route stays continuous across the
      // fold instead of jumping back to the left edge.
      return {
        x: (row % 2 === 0 ? col : SERPENTINE_COLS - 1 - col) * px,
        y: row * py,
      };
    }
  }
}

function nest(
  id: Exclude<LayoutId, "columns">,
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): SizedLayout {
  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
  const inner = CARD.w - CARD.pad * 2;
  const nodes: SizedNode[] = [];

  trackChain(tracks).forEach((track, i) => {
    const o = origin(id, i);
    nodes.push({
      id: `track:${track.id}`,
      kind: "track",
      x: o.x,
      y: o.y,
      w: CARD.w,
      h: CARD.h,
      track,
    });

    let y = o.y + CARD.header;
    const trackModules = modules
      .filter((m) => m.trackId === track.id)
      .sort((a, b) => a.order - b.order);
    for (const mod of trackModules) {
      nodes.push({
        id: `module:${mod.id}`,
        kind: "module",
        x: o.x + CARD.pad,
        y,
        w: inner,
        h: CARD.moduleRow,
        module: mod,
      });
      y += CARD.moduleRow;
      for (const slug of mod.lessonSlugs) {
        const lesson = lessonBySlug.get(slug);
        if (!lesson) continue;
        nodes.push({
          id: slug,
          kind: "lesson",
          x: o.x + CARD.pad * 2,
          y,
          w: inner - CARD.pad,
          h: CARD.lessonRow,
          lesson,
        });
        y += CARD.lessonRow;
      }
    }
  });

  return {
    nodes,
    edges: layoutCurriculumMap(tracks, modules, lessons).edges,
    style: "card",
  };
}

export function layoutFor(
  id: LayoutId,
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): SizedLayout {
  if (id !== "columns") return nest(id, tracks, modules, lessons);
  const old = layoutCurriculumMap(tracks, modules, lessons);
  return {
    edges: old.edges,
    style: "compact",
    nodes: old.nodes.map((n) => ({
      ...n,
      w: 224,
      h: n.kind === "lesson" ? (n.lesson!.kind === "checkpoint" ? 44 : 30) : 20,
    })),
  };
}

export function chainEdges(
  tracks: readonly TrackDef[],
  lessons: readonly LessonMeta[],
) {
  return trackLinks(tracks, lessons).map((l) => ({
    id: `chain:${l.from}->${l.to}`,
    from: `track:${l.from}`,
    to: `track:${l.to}`,
  }));
}

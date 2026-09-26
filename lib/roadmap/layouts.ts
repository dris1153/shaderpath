import type { LessonSlug } from "@/content/slugs";
import type { LessonMeta, ModuleDef, TrackDef } from "@/content/types";
import { trackChain, trackLinks } from "./chain";

// The curriculum is a chain — 14 tracks, one dependency layer each, converging
// on capstones — drawn as a zoomable UI: modules live inside their track's
// card and lessons inside their module, with type sized per tier, so one world
// stays legible at every zoom band.
//
// The route is folded five stations wide, alternate rows running backwards.
// Folding is what makes the overview readable at all: it is the only
// arrangement whose bounding box matches a landscape canvas. A single row or
// column is fitted by its long side, and at that zoom its names are 3–4px.
// Horizontal, vertical and the old columns were built, rendered and deleted
// for exactly that reason.

export interface MapNode {
  id: string;
  kind: "track" | "module" | "lesson";
  x: number;
  y: number;
  w: number;
  h: number;
  track?: TrackDef;
  module?: ModuleDef;
  lesson?: LessonMeta;
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
}

export interface MapLayout {
  nodes: MapNode[];
  edges: MapEdge[];
}

/** World units. Chosen so the overview fits a 1100×630 canvas at zoom 0.25,
 *  where a 48-unit title renders at 12px. The tallest track (webgl: 3
 *  modules, 15 lessons) needs 170 + 3×40 + 15×24 = 650. Module rows are taller
 *  than lesson rows because their type has to read at the modules band, which
 *  starts at zoom 0.38. */
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

const COLS = 5;

function origin(i: number) {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  return {
    // Alternate rows run backwards so the route stays continuous across the
    // fold instead of jumping back to the left edge.
    x: (row % 2 === 0 ? col : COLS - 1 - col) * (CARD.w + CARD.gapX),
    y: row * (CARD.h + CARD.gapY),
  };
}

/** Prerequisites between lessons in different tracks. In-track order is
 *  already the order of rows inside a card, so drawing it would only add
 *  noise. */
export function lessonEdges(lessons: readonly LessonMeta[]): MapEdge[] {
  const trackOf = new Map<LessonSlug, string>(
    lessons.map((l) => [l.slug, l.trackId]),
  );
  return lessons.flatMap((l) =>
    l.prerequisites
      .filter((p) => trackOf.has(p) && trackOf.get(p) !== l.trackId)
      .map((p) => ({ id: `${p}->${l.slug}`, from: p, to: l.slug })),
  );
}

export function chainEdges(
  tracks: readonly TrackDef[],
  lessons: readonly LessonMeta[],
): MapEdge[] {
  return trackLinks(tracks, lessons).map((l) => ({
    id: `chain:${l.from}->${l.to}`,
    from: `track:${l.from}`,
    to: `track:${l.to}`,
  }));
}

export function layoutRoadmap(
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): MapLayout {
  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
  const inner = CARD.w - CARD.pad * 2;
  const nodes: MapNode[] = [];

  trackChain(tracks).forEach((track, i) => {
    const o = origin(i);
    nodes.push({ id: `track:${track.id}`, kind: "track", x: o.x, y: o.y, w: CARD.w, h: CARD.h, track });

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

  return { nodes, edges: lessonEdges(lessons) };
}

import type { LessonMeta, ModuleDef, TrackDef } from "@/content/types";
import { trackChain, trackLinks } from "./chain";
import {
  COL_W,
  ROW_H,
  layoutCurriculumMap,
  type CurriculumMapLayout,
  type CurriculumMapNode,
} from "@/components/roadmap/curriculum-map-layout";

// Three folds of one line. The curriculum is a chain — 14 tracks, one
// dependency layer each, converging on capstones — so every variant draws the
// same sequence and differs only in where the columns are put.
//
// Deliberately NOT band-aware. Packing each zoom band separately was tried
// and creates a loop: a compact overview makes fitView land near zoom 0.7,
// which the band thresholds read as "show modules", which expands the world
// again. Zoom cannot select the band when the band changes what zoom means.
// One world, one meaning for zoom; making the far band legible is the station
// card's job, in phase 3.

export type LayoutId = "columns" | "horizontal" | "vertical" | "serpentine";

/** Room one track's modules and lessons need below or beside its heading. */
const TRACK_SPAN = ROW_H * 20;
const SERPENTINE_COLS = 5;

/** Where track `i` starts. Everything in the track hangs off this. */
function origin(id: Exclude<LayoutId, "columns">, i: number) {
  switch (id) {
    case "horizontal":
      return { x: i * COL_W, y: 0 };
    case "vertical":
      return { x: 0, y: i * TRACK_SPAN };
    case "serpentine": {
      const row = Math.floor(i / SERPENTINE_COLS);
      const col = i % SERPENTINE_COLS;
      return {
        x: (row % 2 === 0 ? col : SERPENTINE_COLS - 1 - col) * COL_W,
        y: row * TRACK_SPAN,
      };
    }
  }
}

function fold(
  id: Exclude<LayoutId, "columns">,
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): CurriculumMapLayout {
  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
  const nodes: CurriculumMapNode[] = [];

  trackChain(tracks).forEach((track, i) => {
    const { x, y } = origin(id, i);
    let row = 0;
    nodes.push({ id: `track:${track.id}`, kind: "track", x, y, track });
    row += 1;
    const trackModules = modules
      .filter((m) => m.trackId === track.id)
      .sort((a, b) => a.order - b.order);
    for (const mod of trackModules) {
      nodes.push({
        id: `module:${mod.id}`,
        kind: "module",
        x,
        y: y + row * ROW_H,
        module: mod,
      });
      row += 1;
      for (const slug of mod.lessonSlugs) {
        const lesson = lessonBySlug.get(slug);
        if (!lesson) continue;
        nodes.push({ id: slug, kind: "lesson", x, y: y + row * ROW_H, lesson });
        row += 1;
      }
    }
  });

  // Prerequisite edges stay the columns layout's job; the caller picks the
  // chain edges for the overview instead.
  return { nodes, edges: layoutCurriculumMap(tracks, modules, lessons).edges };
}

export function layoutFor(
  id: LayoutId,
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): CurriculumMapLayout {
  return id === "columns"
    ? layoutCurriculumMap(tracks, modules, lessons)
    : fold(id, tracks, modules, lessons);
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

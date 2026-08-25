import type { LessonSlug } from "@/content/slugs";
import type { LessonMeta, ModuleDef, TrackDef } from "@/content/types";

// Pure layout for the curriculum map: one column per track, rows in
// module/lesson order. The curriculum is an ordered tree, so positions are
// arithmetic — a graph-layout engine would be dead weight. No xyflow imports
// here: plain data out, unit-testable.

export interface CurriculumMapNode {
  id: string;
  kind: "track" | "module" | "lesson";
  x: number;
  y: number;
  track?: TrackDef;
  module?: ModuleDef;
  lesson?: LessonMeta;
}

export interface CurriculumMapEdge {
  id: string;
  /** prerequisite lesson slug */
  from: LessonSlug;
  /** dependent lesson slug */
  to: LessonSlug;
}

export interface CurriculumMapLayout {
  nodes: CurriculumMapNode[];
  edges: CurriculumMapEdge[];
}

export const COL_W = 260;
export const ROW_H = 64;

export function layoutCurriculumMap(
  tracks: readonly TrackDef[],
  modules: readonly ModuleDef[],
  lessons: readonly LessonMeta[],
): CurriculumMapLayout {
  const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
  const trackIdOf = new Map(lessons.map((l) => [l.slug, l.trackId]));
  const nodes: CurriculumMapNode[] = [];

  const orderedTracks = [...tracks].sort((a, b) => a.order - b.order);
  orderedTracks.forEach((track, col) => {
    const x = col * COL_W;
    let row = 0;
    nodes.push({ id: `track:${track.id}`, kind: "track", x, y: 0, track });
    row += 1;
    const trackModules = modules
      .filter((m) => m.trackId === track.id)
      .sort((a, b) => a.order - b.order);
    for (const module of trackModules) {
      nodes.push({
        id: `module:${module.id}`,
        kind: "module",
        x,
        y: row * ROW_H,
        module,
      });
      row += 1;
      for (const slug of module.lessonSlugs) {
        const lesson = lessonBySlug.get(slug);
        if (!lesson) continue;
        nodes.push({ id: slug, kind: "lesson", x, y: row * ROW_H, lesson });
        row += 1;
      }
    }
  });

  // In-track prerequisite order is already implied by vertical order; drawing
  // only cross-track edges keeps the picture readable.
  const edges: CurriculumMapEdge[] = lessons.flatMap((l) =>
    l.prerequisites
      .filter((p) => trackIdOf.get(p) !== undefined && trackIdOf.get(p) !== l.trackId)
      .map((p) => ({ id: `${p}->${l.slug}`, from: p, to: l.slug })),
  );

  return { nodes, edges };
}

import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import type { LessonSlug } from "@/content/slugs";
import type { LessonMeta, ModuleDef, TrackDef, TrackId } from "@/content/types";

// Pure query/unlock/progress helpers — no DB imports (progress rows arrive in phase 3).

export type ProgressStatus =
  | "locked"
  | "not_started"
  | "in_progress"
  | "completed";
export type ProgressMap = Partial<Record<LessonSlug, ProgressStatus>>;

const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]));
const moduleById = new Map(MODULES.map((m) => [m.id, m]));
const trackById = new Map(TRACKS.map((t) => [t.id, t]));

// Global curriculum order: tracks by order → modules by order → module's slug list
const ORDERED_SLUGS: LessonSlug[] = TRACKS.flatMap((t) =>
  MODULES.filter((m) => m.trackId === t.id)
    .sort((a, b) => a.order - b.order)
    .flatMap((m) => m.lessonSlugs),
);

export function getLesson(slug: LessonSlug): LessonMeta | undefined {
  return lessonBySlug.get(slug);
}

export function getTrack(id: TrackId): TrackDef | undefined {
  return trackById.get(id);
}

export function getModule(id: string): ModuleDef | undefined {
  return moduleById.get(id);
}

export function getModulesOfTrack(trackId: TrackId): ModuleDef[] {
  return MODULES.filter((m) => m.trackId === trackId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getLessonsOfModule(moduleId: string): LessonMeta[] {
  const mod = moduleById.get(moduleId);
  if (!mod) return [];
  return mod.lessonSlugs
    .map((slug) => lessonBySlug.get(slug))
    .filter((l): l is LessonMeta => l !== undefined);
}

export function getNeighbors(slug: LessonSlug): {
  prev: LessonMeta | undefined;
  next: LessonMeta | undefined;
} {
  const i = ORDERED_SLUGS.indexOf(slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const prevSlug = ORDERED_SLUGS[i - 1];
  const nextSlug = ORDERED_SLUGS[i + 1];
  return {
    prev: prevSlug ? lessonBySlug.get(prevSlug) : undefined,
    next: nextSlug ? lessonBySlug.get(nextSlug) : undefined,
  };
}

// D9: only core-tier prerequisites gate; spec §6.1.1 keeps a "learn anyway" escape in the UI.
export function isUnlocked(slug: LessonSlug, progress: ProgressMap): boolean {
  const lesson = lessonBySlug.get(slug);
  if (!lesson) return false;
  return lesson.prerequisites.every((p) => {
    const prereq = lessonBySlug.get(p);
    if (!prereq || prereq.tier !== "core") return true;
    return progress[p] === "completed";
  });
}

export interface CompletionStats {
  coreCompleted: number;
  coreTotal: number;
  electiveCompleted: number;
  electiveTotal: number;
  /** Core-based percent 0–100 (D9: electives reported separately, never in %) */
  percent: number;
}

function completionOf(lessons: LessonMeta[], progress: ProgressMap): CompletionStats {
  const core = lessons.filter((l) => l.tier === "core");
  const elective = lessons.filter((l) => l.tier === "elective");
  const coreCompleted = core.filter((l) => progress[l.slug] === "completed").length;
  const electiveCompleted = elective.filter(
    (l) => progress[l.slug] === "completed",
  ).length;
  return {
    coreCompleted,
    coreTotal: core.length,
    electiveCompleted,
    electiveTotal: elective.length,
    percent: core.length === 0 ? 0 : Math.round((coreCompleted / core.length) * 100),
  };
}

export function moduleCompletion(
  moduleId: string,
  progress: ProgressMap,
): CompletionStats {
  return completionOf(getLessonsOfModule(moduleId), progress);
}

export function trackCompletion(
  trackId: TrackId,
  progress: ProgressMap,
): CompletionStats {
  return completionOf(
    LESSONS.filter((l) => l.trackId === trackId),
    progress,
  );
}

export function overallCompletion(progress: ProgressMap): CompletionStats {
  return completionOf([...LESSONS], progress);
}

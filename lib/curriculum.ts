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

const dependentsBySlug = new Map<LessonSlug, LessonMeta[]>();
for (const l of LESSONS) {
  for (const p of l.prerequisites) {
    const arr = dependentsBySlug.get(p);
    if (arr) arr.push(l);
    else dependentsBySlug.set(p, [l]);
  }
}

export function getLesson(slug: LessonSlug): LessonMeta | undefined {
  return lessonBySlug.get(slug);
}

/** Lessons that list `slug` among their prerequisites (curriculum order). */
export function getDependents(slug: LessonSlug): LessonMeta[] {
  return dependentsBySlug.get(slug) ?? [];
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

/** A track's estimated study time in whole hours (at least 1). */
export function trackHours(trackId: TrackId): number {
  const minutes = LESSONS.filter((l) => l.trackId === trackId).reduce((sum, l) => sum + l.estimatedMinutes, 0);
  return Math.max(1, Math.round(minutes / 60));
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

export type LessonRowState = "done" | "in_progress" | "next" | "soft_locked" | "not_started";

/**
 * Display state of every lesson in a track. "next" goes to the first open core
 * lesson whose prerequisites are met, so a track shows at most one. Soft-locked
 * lessons stay reachable; the row only says what to read first.
 */
export function trackLessonStates(trackId: TrackId, progress: ProgressMap): Map<LessonSlug, LessonRowState> {
  const lessons = ORDERED_SLUGS.flatMap((slug) => {
    const lesson = lessonBySlug.get(slug);
    return lesson && lesson.trackId === trackId ? [lesson] : [];
  });
  const next = lessons.find(
    (l) => l.tier === "core" && progress[l.slug] !== "completed" && isUnlocked(l.slug, progress),
  );
  return new Map(
    lessons.map((l): [LessonSlug, LessonRowState] => [
      l.slug,
      progress[l.slug] === "completed"
        ? "done"
        : l.slug === next?.slug
          ? "next"
          : !isUnlocked(l.slug, progress)
            ? "soft_locked"
            : progress[l.slug] === "in_progress"
              ? "in_progress"
              : "not_started",
    ]),
  );
}

/** The first core prerequisite still open: what a soft-locked row recommends first. */
export function blockingPrerequisite(slug: LessonSlug, progress: ProgressMap): LessonMeta | undefined {
  return lessonBySlug
    .get(slug)
    ?.prerequisites.map((p) => lessonBySlug.get(p))
    .find((p): p is LessonMeta => p !== undefined && p.tier === "core" && progress[p.slug] !== "completed");
}

/** The track holding the next open core lesson in course order (the "recommended" track). */
export function currentTrackId(progress: ProgressMap): TrackId | undefined {
  const slug = ORDERED_SLUGS.find((s) => {
    const lesson = lessonBySlug.get(s);
    return lesson?.tier === "core" && progress[s] !== "completed" && isUnlocked(s, progress);
  });
  return slug ? lessonBySlug.get(slug)?.trackId : undefined;
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

/**
 * Core lessons of `slug`'s module when `slug` is itself core, else []. Completing
 * the last unfinished one of these completes the module.
 */
export function moduleCoreSlugs(slug: LessonSlug): LessonSlug[] {
  const lesson = lessonBySlug.get(slug);
  if (!lesson || lesson.tier !== "core") return [];
  return getLessonsOfModule(lesson.moduleId)
    .filter((l) => l.tier === "core")
    .map((l) => l.slug);
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

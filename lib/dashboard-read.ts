import { and, eq, gte, lte, or } from "drizzle-orm";
import { db } from "@/db/client";
import { exerciseAttempts, lessonProgress, reviewQueue } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";
import type { TrackId } from "@/content/types";
import { LESSONS, TRACKS } from "@/content/curriculum";
import { isUnlocked, type ProgressMap } from "@/lib/curriculum";
import { getAllProgressRows, type ProgressRow } from "@/lib/progress-read";

// Sync server-side reads (better-sqlite3) — RSC only, never client (spec §8.7).
//
// The dashboard answers "what do I do now?", so every row here has to justify a
// click. Three signals the database already records had no reader at all before
// this: self-rated confidence, SRS ease, and whether an exercise needed its
// solution revealed.

import { QUEUE_ORDER, type QueueItem } from "@/lib/dashboard-queue";

// SM-2 starts every card at 2.5 and only drops it on a bad grade, so a card
// under 2.0 that has already come round several times is one the current
// approach is not fixing — re-reading beats another review.
const LEECH_EASE = 2.0;
const LEECH_REVIEWS = 3;
/** Self-rating is 1..5; at or below this the learner said they were unsure. */
const SHAKY_CONFIDENCE = 2;
const DAY_MS = 86_400_000;

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

export function getShakyLessons(): ProgressRow[] {
  return db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.status, "completed"),
        lte(lessonProgress.confidence, SHAKY_CONFIDENCE),
      ),
    )
    .all();
}

/** Only due leeches: one that is not due yet is not today's problem. */
export function getLeeches(now: Date) {
  return db
    .select()
    .from(reviewQueue)
    .where(
      and(
        lte(reviewQueue.easeFactor, LEECH_EASE),
        gte(reviewQueue.reviewCount, LEECH_REVIEWS),
        lte(reviewQueue.dueAt, now),
      ),
    )
    .all();
}

/** Lessons where an exercise needed hints or the solution to get through. */
export function getLeanedOnLessons(): {
  lessonSlug: string;
  hinted: number;
  solutions: number;
}[] {
  const rows = db
    .select()
    .from(exerciseAttempts)
    .where(
      or(
        eq(exerciseAttempts.solutionRevealed, true),
        gte(exerciseAttempts.hintsRevealed, 1),
      ),
    )
    .all();

  const byLesson = new Map<string, { hinted: number; solutions: number }>();
  for (const row of rows) {
    const acc = byLesson.get(row.lessonSlug) ?? { hinted: 0, solutions: 0 };
    if (row.hintsRevealed > 0) acc.hinted += 1;
    if (row.solutionRevealed) acc.solutions += 1;
    byLesson.set(row.lessonSlug, acc);
  }
  return [...byLesson].map(([lessonSlug, v]) => ({ lessonSlug, ...v }));
}

/** Core lessons finished per week over the last 4 weeks — a pace, not a deadline. */
export function getWeeklyPace(now: Date): number {
  const since = new Date(now.getTime() - 28 * DAY_MS);
  const done = db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.status, "completed"),
        gte(lessonProgress.completedAt, since),
      ),
    )
    .all();
  return Math.round((done.length / 4) * 10) / 10;
}

/**
 * The whole queue, most urgent first and one row per lesson: a lesson that is
 * both overdue and a leech is one job, not two.
 */
export function buildQueue(now: Date, progress: ProgressMap): QueueItem[] {
  const byLesson = new Map<LessonSlug, QueueItem>();
  const claim = (item: QueueItem) => {
    const seen = byLesson.get(item.lessonSlug);
    if (seen && QUEUE_ORDER.indexOf(seen.kind) <= QUEUE_ORDER.indexOf(item.kind)) {
      return;
    }
    byLesson.set(item.lessonSlug, item);
  };

  for (const row of getLeeches(now)) {
    claim({
      kind: "leech",
      lessonSlug: row.lessonSlug as LessonSlug,
      reviewCount: row.reviewCount,
      easeFactor: row.easeFactor,
    });
  }

  for (const row of db.select().from(reviewQueue).where(lte(reviewQueue.dueAt, now)).all()) {
    const late = daysBetween(row.dueAt, now);
    claim({
      kind: late >= 1 ? "overdue" : "due",
      lessonSlug: row.lessonSlug as LessonSlug,
      daysLate: late,
      reviewCount: row.reviewCount,
      easeFactor: row.easeFactor,
    });
  }

  for (const row of getShakyLessons()) {
    claim({
      kind: "shaky",
      lessonSlug: row.lessonSlug as LessonSlug,
      confidence: row.confidence ?? undefined,
    });
  }

  for (const row of getLeanedOnLessons()) {
    claim({
      kind: "hinted",
      lessonSlug: row.lessonSlug as LessonSlug,
      hintedExercises: row.hinted,
      solutionsRevealed: row.solutions,
    });
  }

  const inProgress = getAllProgressRows().find((r) => r.status === "in_progress");
  const nextUp =
    inProgress?.lessonSlug ??
    LESSONS.find(
      (l) =>
        l.tier === "core" &&
        progress[l.slug] !== "completed" &&
        isUnlocked(l.slug, progress),
    )?.slug;
  if (nextUp) {
    claim({
      kind: "continue",
      lessonSlug: nextUp as LessonSlug,
      scrollPercent: inProgress?.scrollPercent,
    });
  }

  return [...byLesson.values()].sort((a, b) => {
    const byKind = QUEUE_ORDER.indexOf(a.kind) - QUEUE_ORDER.indexOf(b.kind);
    return byKind !== 0 ? byKind : (b.daysLate ?? 0) - (a.daysLate ?? 0);
  });
}

export interface TrackMapStep {
  slug: LessonSlug;
  order: number;
  done: boolean;
  current: boolean;
  unlocked: boolean;
  confidence?: number;
}

export interface TrackMap {
  trackId: TrackId;
  position: number;
  totalTracks: number;
  done: number;
  total: number;
  steps: TrackMapStep[];
  nextTrackId?: TrackId;
  nextTrackLessons: number;
}

/** The track the learner is standing in, plus what finishing it unlocks. */
export function getTrackMap(
  progress: ProgressMap,
  focusSlug: LessonSlug | undefined,
): TrackMap | null {
  const focus = focusSlug
    ? LESSONS.find((l) => l.slug === focusSlug)
    : LESSONS.find((l) => progress[l.slug] !== "completed");
  if (!focus) return null;

  const confidence = new Map<string, number>();
  for (const row of getAllProgressRows()) {
    if (row.confidence !== null) confidence.set(row.lessonSlug, row.confidence);
  }

  const lessons = LESSONS.filter((l) => l.trackId === focus.trackId);
  const position = TRACKS.findIndex((t) => t.id === focus.trackId);
  const next = TRACKS[position + 1];

  return {
    trackId: focus.trackId,
    position: position + 1,
    totalTracks: TRACKS.length,
    done: lessons.filter((l) => progress[l.slug] === "completed").length,
    total: lessons.length,
    steps: lessons.map((l) => ({
      slug: l.slug,
      order: l.order,
      done: progress[l.slug] === "completed",
      current: l.slug === focus.slug,
      unlocked: isUnlocked(l.slug, progress),
      confidence: confidence.get(l.slug),
    })),
    nextTrackId: next?.id,
    nextTrackLessons: next ? LESSONS.filter((l) => l.trackId === next.id).length : 0,
  };
}

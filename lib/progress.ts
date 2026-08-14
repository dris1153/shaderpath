"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { lessonProgress, reviewQueue, studySessions } from "@/db/schema";
import { LESSON_SLUGS, type LessonSlug } from "@/content/slugs";
import { nextDueDate } from "@/lib/srs";

// Client input is untrusted even single-user: validate slug, clamp numbers.
const VALID_SLUGS = new Set<string>(LESSON_SLUGS);
const MAX_DELTA_SECONDS = 120;

function assertSlug(slug: string): asserts slug is LessonSlug {
  if (!VALID_SLUGS.has(slug)) throw new Error(`Unknown lesson slug: ${slug}`);
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export async function saveReadingProgress(input: {
  slug: string;
  scrollPercent: number;
  deltaSeconds: number;
}) {
  assertSlug(input.slug);
  const scrollPercent = clamp(input.scrollPercent, 0, 1);
  const deltaSeconds = Math.round(
    clamp(input.deltaSeconds, 0, MAX_DELTA_SECONDS),
  );

  db.insert(lessonProgress)
    .values({
      lessonSlug: input.slug,
      status: "in_progress",
      startedAt: new Date(),
      scrollPercent,
      timeSpentSeconds: deltaSeconds,
    })
    .onConflictDoUpdate({
      target: lessonProgress.lessonSlug,
      set: {
        scrollPercent,
        timeSpentSeconds: sql`${lessonProgress.timeSpentSeconds} + ${deltaSeconds}`,
        // completed stays completed; anything else becomes in_progress
        status: sql`CASE WHEN ${lessonProgress.status} = 'completed' THEN 'completed' ELSE 'in_progress' END`,
        startedAt: sql`COALESCE(${lessonProgress.startedAt}, ${Math.floor(Date.now() / 1000)})`,
      },
    })
    .run();
}

export async function markComplete(slug: string, confidence?: number) {
  assertSlug(slug);
  const conf =
    confidence === undefined ? null : Math.round(clamp(confidence, 1, 5));

  db.insert(lessonProgress)
    .values({
      lessonSlug: slug,
      status: "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      confidence: conf,
    })
    .onConflictDoUpdate({
      target: lessonProgress.lessonSlug,
      set: {
        status: "completed",
        completedAt: new Date(),
        confidence: conf,
        startedAt: sql`COALESCE(${lessonProgress.startedAt}, ${Math.floor(Date.now() / 1000)})`,
      },
    })
    .run();

  // SRS (spec §6.2.11): completion enters the review queue due tomorrow.
  // An existing schedule is never reset by re-completing.
  db.insert(reviewQueue)
    .values({
      lessonSlug: slug,
      intervalDays: 1,
      easeFactor: 2.5,
      dueAt: nextDueDate(1, new Date()),
      reviewCount: 0,
    })
    .onConflictDoNothing({ target: reviewQueue.lessonSlug })
    .run();
}

export async function openStudySession(slug: string): Promise<number> {
  assertSlug(slug);
  const row = db
    .insert(studySessions)
    .values({ lessonSlug: slug, startedAt: new Date() })
    .returning({ id: studySessions.id })
    .get();
  return row.id;
}

export async function closeStudySession(id: number, durationSeconds: number) {
  if (!Number.isInteger(id) || id <= 0) return;
  db.update(studySessions)
    .set({
      endedAt: new Date(),
      durationSeconds: Math.round(clamp(durationSeconds, 0, 60 * 60 * 12)),
    })
    .where(eq(studySessions.id, id))
    .run();
}

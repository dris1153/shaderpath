import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { exerciseAttempts } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";

// Sync server-side reads — RSC only (spec §8.7).

export type AttemptRow = typeof exerciseAttempts.$inferSelect;

export function getAttemptsForLesson(slug: LessonSlug): AttemptRow[] {
  return db
    .select()
    .from(exerciseAttempts)
    .where(eq(exerciseAttempts.lessonSlug, slug))
    .all();
}

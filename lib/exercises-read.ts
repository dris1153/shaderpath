import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { exerciseAttempts } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";

// Server-side reads — RSC only (spec §8.7).

export type AttemptRow = typeof exerciseAttempts.$inferSelect;

export async function getAttemptsForLesson(slug: LessonSlug): Promise<AttemptRow[]> {
  return db
    .select()
    .from(exerciseAttempts)
    .where(eq(exerciseAttempts.lessonSlug, slug));
}

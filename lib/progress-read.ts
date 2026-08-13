import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { lessonProgress } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";
import type { ProgressMap } from "@/lib/curriculum";

// Sync server-side reads (better-sqlite3) — RSC only, never client (spec §8.7).

export type ProgressRow = typeof lessonProgress.$inferSelect;

export function getProgressRow(slug: LessonSlug): ProgressRow | undefined {
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.lessonSlug, slug))
    .get();
}

export function getAllProgressRows(): ProgressRow[] {
  return db.select().from(lessonProgress).all();
}

export function getProgressMap(): ProgressMap {
  const map: ProgressMap = {};
  for (const row of getAllProgressRows()) {
    map[row.lessonSlug as LessonSlug] = row.status;
  }
  return map;
}

export function getTotalTimeSeconds(): number {
  return getAllProgressRows().reduce((s, r) => s + r.timeSpentSeconds, 0);
}

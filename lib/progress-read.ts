import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { lessonProgress } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";
import type { ProgressMap } from "@/lib/curriculum";

// Server-side reads — RSC only, never client (spec §8.7).

export type ProgressRow = typeof lessonProgress.$inferSelect;

export async function getProgressRow(slug: LessonSlug): Promise<ProgressRow | undefined> {
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.lessonSlug, slug))
    .then((r) => r[0]);
}

export async function getAllProgressRows(): Promise<ProgressRow[]> {
  return db.select().from(lessonProgress);
}

export async function getProgressMap(): Promise<ProgressMap> {
  const map: ProgressMap = {};
  for (const row of await getAllProgressRows()) {
    map[row.lessonSlug as LessonSlug] = row.status;
  }
  return map;
}

export async function getTotalTimeSeconds(): Promise<number> {
  return (await getAllProgressRows()).reduce((s, r) => s + r.timeSpentSeconds, 0);
}

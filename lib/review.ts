"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reviewQueue } from "@/db/schema";
import { LESSON_SLUGS } from "@/content/slugs";
import {
  nextDueDate,
  sm2Update,
  type ReviewQuality,
} from "@/lib/srs";

const VALID_SLUGS = new Set<string>(LESSON_SLUGS);
const QUALITIES: ReviewQuality[] = ["again", "hard", "good", "easy"];

export async function gradeReview(slug: string, quality: ReviewQuality) {
  if (!VALID_SLUGS.has(slug)) throw new Error(`Unknown lesson slug: ${slug}`);
  if (!QUALITIES.includes(quality)) throw new Error(`Bad quality: ${quality}`);

  const row = db
    .select()
    .from(reviewQueue)
    .where(eq(reviewQueue.lessonSlug, slug))
    .get();
  if (!row) throw new Error(`No review row for ${slug}`);

  const next = sm2Update(
    {
      intervalDays: row.intervalDays,
      easeFactor: row.easeFactor,
      reviewCount: row.reviewCount,
    },
    quality,
  );

  db.update(reviewQueue)
    .set({
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      reviewCount: next.reviewCount,
      dueAt: nextDueDate(next.intervalDays, new Date()),
    })
    .where(eq(reviewQueue.id, row.id))
    .run();
}

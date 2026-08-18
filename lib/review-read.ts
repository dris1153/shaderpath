import { lte } from "drizzle-orm";
import { db } from "@/db/client";
import { reviewQueue } from "@/db/schema";

export type ReviewRow = typeof reviewQueue.$inferSelect;

/** Lessons due for review now (indexed on due_at per §5). */
export async function getDueReviews(now: Date): Promise<ReviewRow[]> {
  return db
    .select()
    .from(reviewQueue)
    .where(lte(reviewQueue.dueAt, now));
}

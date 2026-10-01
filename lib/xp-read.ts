import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { reviewQueue } from "@/db/schema";
import { weekActivity } from "@/lib/date-buckets";
import { getStats } from "@/lib/stats";
import { levelFor, xpTotal, type LevelInfo } from "@/lib/xp";

export interface GamificationData extends LevelInfo {
  xp: number;
  streak: { current: number; longest: number; thisWeek: boolean[] };
}

/** Call inside withUser: every read is scoped to the signed-in user by RLS. */
export async function getGamification(now: Date): Promise<GamificationData> {
  // ponytail: reuses the stats read (full session scan) so XP and /stats can
  // never disagree; swap for count/distinct-day queries if the header gets slow.
  const stats = await getStats(now);
  const [reviews] = await db
    .select({ n: sql<number>`coalesce(sum(${reviewQueue.reviewCount}), 0)::int` })
    .from(reviewQueue);
  const xp = xpTotal({
    lessons: stats.lessonsCompleted,
    exercises: stats.exercisesCompleted,
    reviews: reviews?.n ?? 0,
  });
  return {
    xp,
    ...levelFor(xp),
    streak: {
      ...stats.streaks,
      thisWeek: weekActivity(new Set(Object.keys(stats.minutesByDay)), now),
    },
  };
}

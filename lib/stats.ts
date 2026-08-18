import { db } from "@/db/client";
import { exerciseAttempts, lessonProgress, studySessions } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";
import type { TrackId } from "@/content/types";
import { getLesson } from "@/lib/curriculum";
import { computeStreaks, dayKey, type Streaks } from "@/lib/date-buckets";

// Aggregates read Phase-3 session rows — no second timing mechanism.

export interface StatsData {
  minutesByDay: Record<string, number>;
  totalMinutes: number;
  streaks: Streaks;
  minutesByTrack: Partial<Record<TrackId, number>>;
  lessonsCompleted: number;
  exercisesCompleted: number;
}

export async function getStats(now: Date): Promise<StatsData> {
  const sessions = await db.select().from(studySessions);

  const minutesByDay: Record<string, number> = {};
  const minutesByTrack: Partial<Record<TrackId, number>> = {};
  let totalSeconds = 0;

  for (const s of sessions) {
    if (s.durationSeconds <= 0) continue;
    totalSeconds += s.durationSeconds;
    const key = dayKey(s.startedAt);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + s.durationSeconds / 60;

    if (s.lessonSlug) {
      const lesson = getLesson(s.lessonSlug as LessonSlug);
      if (lesson) {
        minutesByTrack[lesson.trackId] =
          (minutesByTrack[lesson.trackId] ?? 0) + s.durationSeconds / 60;
      }
    }
  }

  const lessonsCompleted = (await db.select().from(lessonProgress)).filter((r) => r.status === "completed").length;
  const exercisesCompleted = (await db.select().from(exerciseAttempts)).filter((r) => r.status === "completed").length;

  return {
    minutesByDay,
    totalMinutes: Math.round(totalSeconds / 60),
    streaks: computeStreaks(new Set(Object.keys(minutesByDay)), now),
    minutesByTrack,
    lessonsCompleted,
    exercisesCompleted,
  };
}

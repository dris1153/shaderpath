import type { LessonMeta, TrackDef } from "@/content/types";

// What each station shows. Magnitude is carried by length, never by hue: a
// track has one difficulty and one duration, and a colour ramp for a single
// value per entity is a palette to validate in two themes for no gain. The
// bar's length is the track's hours and its fill is progress, so the overlay
// paints onto the same road instead of competing with a second bar.

export interface TrackStats {
  minutes: number;
  /** Mean lesson difficulty, 1–5. Rises almost monotonically along the chain. */
  difficulty: number;
  checkpoints: number;
  electives: number;
  lessons: number;
}

export function trackStats(
  track: TrackDef,
  lessons: readonly LessonMeta[],
): TrackStats {
  const own = lessons.filter((l) => l.trackId === track.id);
  const minutes = own.reduce((sum, l) => sum + l.estimatedMinutes, 0);
  return {
    minutes,
    difficulty: own.length
      ? own.reduce((sum, l) => sum + l.difficulty, 0) / own.length
      : 0,
    checkpoints: own.filter((l) => l.kind === "checkpoint").length,
    electives: own.filter((l) => l.tier === "elective").length,
    lessons: own.length,
  };
}

/**
 * The yardstick for bar length: the longest track that is not the terminus.
 * Capstones runs 32h against 6–9h for the rest; measuring against it would
 * squash thirteen tracks into a quarter of the width and make them
 * uncomparable. It caps at full length instead, and its label carries the
 * real number.
 */
export function longestRegularMinutes(
  chain: readonly TrackDef[],
  lessons: readonly LessonMeta[],
): number {
  const regular = chain.slice(0, -1);
  return Math.max(...regular.map((t) => trackStats(t, lessons).minutes), 1);
}

export function roadFraction(minutes: number, yardstick: number): number {
  return Math.min(minutes / yardstick, 1);
}

/** Filled pips out of five, to the nearest half. */
export function difficultyPips(difficulty: number): number {
  return Math.round(difficulty * 2) / 2;
}

export function hoursLabel(minutes: number): string {
  const hours = minutes / 60;
  return hours >= 10 ? `${Math.round(hours)}` : `${Math.round(hours * 10) / 10}`;
}

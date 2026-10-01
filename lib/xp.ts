// XP and levels are derived from rows the app already stores; nothing here is
// persisted. Weights are a product decision (plan 261001-arcade-ui-redesign).
export const XP_PER_LESSON = 10;
export const XP_PER_EXERCISE = 5;
export const XP_PER_REVIEW = 2;

export function xpTotal(counts: { lessons: number; exercises: number; reviews: number }): number {
  return (
    XP_PER_LESSON * counts.lessons +
    XP_PER_EXERCISE * counts.exercises +
    XP_PER_REVIEW * counts.reviews
  );
}

/** Total XP needed to reach `level`: 50 · (1 + 2 + … + (level − 1)). Level 1 starts at 0. */
export function levelThreshold(level: number): number {
  return (50 * (level - 1) * level) / 2;
}

export interface LevelInfo {
  level: number;
  /** XP earned since the current level began. */
  intoLevel: number;
  /** XP between this level and the next. */
  levelSize: number;
}

export function levelFor(xp: number): LevelInfo {
  let level = 1;
  while (xp >= levelThreshold(level + 1)) level += 1;
  const start = levelThreshold(level);
  return { level, intoLevel: xp - start, levelSize: levelThreshold(level + 1) - start };
}

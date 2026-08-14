// One shared day-bucketing helper for heatmap + streaks. Timestamps are stored
// UTC (spec §5), but "today" is LOCAL — every day key is derived from local
// time here and nowhere else. Comparisons run through noon-anchored Dates so
// DST shifts (23h/25h days) never break consecutiveness.

const pad = (n: number) => String(n).padStart(2, "0");

/** Local-timezone day key, e.g. "2026-08-14". */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a day key to a DST-safe local Date anchored at noon. */
export function keyToNoon(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function addDays(date: Date, n: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function isConsecutive(prevKey: string, nextKey: string): boolean {
  return dayKey(addDays(keyToNoon(prevKey), 1)) === nextKey;
}

export interface Streaks {
  current: number;
  longest: number;
}

/**
 * current: consecutive days ending today — or ending yesterday (a streak is
 * not broken until today is over). longest: best run anywhere in history.
 */
export function computeStreaks(days: Set<string>, today: Date): Streaks {
  let current = 0;
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1);
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of sorted) {
    run = prev !== null && isConsecutive(prev, key) ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = key;
  }
  return { current, longest };
}

/**
 * Heatmap grid: `weekCount` columns of 7 day keys (Monday-first), the last
 * column containing today. Trailing days after today are empty strings.
 */
export function weeksGrid(today: Date, weekCount = 26): string[][] {
  // Monday=0 … Sunday=6
  const weekday = (today.getDay() + 6) % 7;
  const lastMonday = addDays(today, -weekday);
  const weeks: string[][] = [];
  for (let w = weekCount - 1; w >= 0; w--) {
    const monday = addDays(lastMonday, -7 * w);
    const col: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(monday, d);
      col.push(day > today ? "" : dayKey(day));
    }
    weeks.push(col);
  }
  return weeks;
}

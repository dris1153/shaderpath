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

/** Monday's day key: identifies the ISO week (Mon–Sun) a local date falls in. */
function weekOf(date: Date): string {
  return dayKey(addDays(date, -((date.getDay() + 6) % 7)));
}

export interface Streaks {
  current: number;
  longest: number;
}

/**
 * Streak length counts days with a study session. One missed day per ISO week
 * is forgiven: it keeps the run alive but adds nothing. A second miss in the
 * same week ends the run. Today never counts as a miss, because it is not over.
 * current: the run that reaches today. longest: the best run in history.
 */
export function computeStreaks(days: Set<string>, today: Date): Streaks {
  const sorted = [...days].sort();
  const first = sorted[0];
  if (first === undefined) return { current: 0, longest: 0 };
  const todayKey = dayKey(today);

  let current = days.has(todayKey) ? 1 : 0;
  const forgivenBack = new Set<string>();
  for (let cursor = addDays(keyToNoon(todayKey), -1); dayKey(cursor) >= first; cursor = addDays(cursor, -1)) {
    if (days.has(dayKey(cursor))) {
      current += 1;
      continue;
    }
    const week = weekOf(cursor);
    if (forgivenBack.has(week)) break;
    forgivenBack.add(week);
  }

  let longest = 0;
  let run = 0;
  const forgiven = new Set<string>();
  for (let cursor = keyToNoon(first); dayKey(cursor) < todayKey; cursor = addDays(cursor, 1)) {
    if (days.has(dayKey(cursor))) {
      run += 1;
      longest = Math.max(longest, run);
      continue;
    }
    if (run === 0) continue;
    const week = weekOf(cursor);
    if (forgiven.has(week)) run = 0;
    else forgiven.add(week);
  }
  return { current, longest: Math.max(longest, current) };
}

/** Monday-first flags for the ISO week containing `today`. */
export function weekActivity(days: Set<string>, today: Date): boolean[] {
  const monday = addDays(keyToNoon(dayKey(today)), -((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => days.has(dayKey(addDays(monday, i))));
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

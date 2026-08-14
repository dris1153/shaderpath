import { describe, expect, it } from "vitest";
import { computeStreaks, dayKey, weeksGrid } from "@/lib/date-buckets";

const d = (s: string) => {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, day ?? 1, 12);
};

describe("dayKey", () => {
  it("formats local dates", () => {
    expect(dayKey(d("2026-08-14"))).toBe("2026-08-14");
    expect(dayKey(new Date(2026, 0, 5, 0, 0, 1))).toBe("2026-01-05");
  });

  it("buckets a just-before-midnight and just-after-midnight pair differently", () => {
    expect(dayKey(new Date(2026, 7, 13, 23, 59, 59))).toBe("2026-08-13");
    expect(dayKey(new Date(2026, 7, 14, 0, 0, 1))).toBe("2026-08-14");
  });
});

describe("computeStreaks", () => {
  it("counts a current streak ending today", () => {
    const days = new Set(["2026-08-12", "2026-08-13", "2026-08-14"]);
    expect(computeStreaks(days, d("2026-08-14"))).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("keeps yesterday's streak alive when today has no session yet", () => {
    const days = new Set(["2026-08-12", "2026-08-13"]);
    expect(computeStreaks(days, d("2026-08-14")).current).toBe(2);
  });

  it("breaks across a 3-day gap and tracks the longest run separately", () => {
    const days = new Set([
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      // gap 05–07
      "2026-08-08",
      "2026-08-14",
    ]);
    const s = computeStreaks(days, d("2026-08-14"));
    expect(s.current).toBe(1);
    expect(s.longest).toBe(4);
  });

  it("same-day multiple sessions count once (input is a set of day keys)", () => {
    const days = new Set(["2026-08-14"]);
    expect(computeStreaks(days, d("2026-08-14")).current).toBe(1);
  });

  it("handles the DST spring-forward boundary as consecutive", () => {
    // US DST 2026: March 8. 2026-03-07 → 2026-03-08 must stay consecutive
    const days = new Set(["2026-03-07", "2026-03-08", "2026-03-09"]);
    expect(computeStreaks(days, d("2026-03-09")).longest).toBe(3);
  });

  it("returns zeros for empty history", () => {
    expect(computeStreaks(new Set(), d("2026-08-14"))).toEqual({
      current: 0,
      longest: 0,
    });
  });
});

describe("weeksGrid", () => {
  it("produces the requested number of Monday-first columns ending today", () => {
    const grid = weeksGrid(d("2026-08-14"), 4); // 2026-08-14 is a Friday
    expect(grid).toHaveLength(4);
    const last = grid[3];
    expect(last?.[0]).toBe("2026-08-10"); // Monday of the current week
    expect(last?.[4]).toBe("2026-08-14"); // Friday = today
    expect(last?.[5]).toBe(""); // Saturday is in the future
    expect(last?.[6]).toBe("");
    // continuity between columns
    expect(grid[2]?.[6]).toBe("2026-08-09");
  });
});

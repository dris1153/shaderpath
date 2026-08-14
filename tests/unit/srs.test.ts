import { describe, expect, it } from "vitest";
import { INITIAL_STATE, sm2Update, type SrsState } from "@/lib/srs";

describe("SM-2-lite", () => {
  it("grows the interval monotonically on repeated good grades", () => {
    let s: SrsState = { ...INITIAL_STATE };
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      s = sm2Update(s, "good");
      intervals.push(s.intervalDays);
    }
    // 1*2.5=3 (rounded), 3*2.5=8, 8*2.5=20, 20*2.5=50, 50*2.5=125
    expect(intervals).toEqual([3, 8, 20, 50, 125]);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1] ?? 0);
    }
  });

  it("resets the interval on again and reduces ease", () => {
    let s: SrsState = { intervalDays: 30, easeFactor: 2.5, reviewCount: 4 };
    s = sm2Update(s, "again");
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBeCloseTo(2.3);
    expect(s.reviewCount).toBe(5);
  });

  it("clamps ease at the SM-2 floor of 1.3", () => {
    let s: SrsState = { intervalDays: 1, easeFactor: 1.35, reviewCount: 0 };
    s = sm2Update(s, "again");
    s = sm2Update(s, "again");
    expect(s.easeFactor).toBe(1.3);
  });

  it("caps the interval at 365 days", () => {
    let s: SrsState = { intervalDays: 300, easeFactor: 2.5, reviewCount: 9 };
    s = sm2Update(s, "easy");
    expect(s.intervalDays).toBe(365);
  });

  it("hard grows slowly and never shrinks below 1", () => {
    let s: SrsState = { intervalDays: 1, easeFactor: 2.5, reviewCount: 0 };
    s = sm2Update(s, "hard");
    expect(s.intervalDays).toBeGreaterThanOrEqual(1);
    expect(s.easeFactor).toBeCloseTo(2.35);
  });
});

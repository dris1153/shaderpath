import { describe, expect, it } from "vitest";
import { levelFor, levelThreshold, xpTotal } from "@/lib/xp";

describe("xpTotal", () => {
  it("weights lessons 10, exercises 5, reviews 2", () => {
    expect(xpTotal({ lessons: 0, exercises: 0, reviews: 0 })).toBe(0);
    expect(xpTotal({ lessons: 3, exercises: 4, reviews: 5 })).toBe(30 + 20 + 10);
  });
});

describe("levels", () => {
  it("uses cumulative thresholds 0, 50, 150, 300, 500", () => {
    expect([1, 2, 3, 4, 5].map(levelThreshold)).toEqual([0, 50, 150, 300, 500]);
  });

  it("starts at level 1 with 0 XP", () => {
    expect(levelFor(0)).toEqual({ level: 1, intoLevel: 0, levelSize: 50 });
  });

  it("levels up exactly on a threshold, not one XP before", () => {
    expect(levelFor(49)).toEqual({ level: 1, intoLevel: 49, levelSize: 50 });
    expect(levelFor(50)).toEqual({ level: 2, intoLevel: 0, levelSize: 100 });
    expect(levelFor(150)).toEqual({ level: 3, intoLevel: 0, levelSize: 150 });
    expect(levelFor(299)).toEqual({ level: 3, intoLevel: 149, levelSize: 150 });
  });
});

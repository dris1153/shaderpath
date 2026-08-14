// SM-2-lite (spec §6.2.11): pure scheduling math, no I/O. The review actions
// in lib/review.ts persist the results.

export interface SrsState {
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
}

export type ReviewQuality = "again" | "hard" | "good" | "easy";

export const INITIAL_STATE: SrsState = {
  intervalDays: 1,
  easeFactor: 2.5,
  reviewCount: 0,
};

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MAX_INTERVAL = 365;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function sm2Update(state: SrsState, quality: ReviewQuality): SrsState {
  let { intervalDays, easeFactor } = state;

  switch (quality) {
    case "again":
      intervalDays = 1;
      easeFactor -= 0.2;
      break;
    case "hard":
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      easeFactor -= 0.15;
      break;
    case "good":
      intervalDays = Math.round(intervalDays * easeFactor);
      break;
    case "easy":
      intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      easeFactor += 0.15;
      break;
  }

  return {
    intervalDays: clamp(intervalDays, 1, MAX_INTERVAL),
    easeFactor: clamp(easeFactor, MIN_EASE, MAX_EASE),
    reviewCount: state.reviewCount + 1,
  };
}

export function nextDueDate(intervalDays: number, from: Date): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + intervalDays);
  return due;
}

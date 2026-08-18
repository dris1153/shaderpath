import type { LessonSlug } from "@/content/slugs";

// Shape of the dashboard queue, with no database import: the client component
// that renders the queue needs these, and pulling them from the read layer would
// drag the postgres driver into the browser bundle (§8.7).

// Ordered by urgency, and a lesson only ever takes its highest slot. Leech sits
// above overdue on purpose: both are reviews that are due, but "you have
// forgotten this five times" is better advice than "this is late", and it points
// at re-reading rather than another review that will not stick either.
// `continue` outranks the weak-spot kinds even though it is the least urgent
// thing here: it is the entry point, and if the lesson you are on also happens
// to be one you once used hints on, absorbing it into a "redo exercises" row
// leaves the dashboard with nowhere to start.
export const QUEUE_ORDER = [
  "leech",
  "overdue",
  "due",
  "continue",
  "shaky",
  "hinted",
] as const;

export type QueueKind = (typeof QUEUE_ORDER)[number];

/** Which chip a row belongs to. */
export type QueueGroup = "review" | "weak" | "next";

export const GROUP_OF: Record<QueueKind, QueueGroup> = {
  overdue: "review",
  due: "review",
  leech: "weak",
  shaky: "weak",
  hinted: "weak",
  continue: "next",
};

export interface QueueItem {
  kind: QueueKind;
  lessonSlug: LessonSlug;
  /** Whole days past due, for the "quá hạn N ngày" label. */
  daysLate?: number;
  reviewCount?: number;
  easeFactor?: number;
  confidence?: number;
  hintedExercises?: number;
  solutionsRevealed?: number;
  scrollPercent?: number;
}

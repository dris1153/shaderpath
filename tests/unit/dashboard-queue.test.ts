import { describe, expect, it } from "vitest";
import { GROUP_OF, QUEUE_ORDER, type QueueKind } from "@/lib/dashboard-queue";

// The queue's contract is its ordering: it decides what the learner is told to
// do first, so the ranking is worth pinning down independently of the database.

describe("queue ranking", () => {
  it("puts a leech above a plain overdue review", () => {
    expect(QUEUE_ORDER.indexOf("leech")).toBeLessThan(
      QUEUE_ORDER.indexOf("overdue"),
    );
  });

  it("ranks every review kind above the entry point", () => {
    const lastReview = Math.max(
      QUEUE_ORDER.indexOf("overdue"),
      QUEUE_ORDER.indexOf("due"),
    );
    expect(lastReview).toBeLessThan(QUEUE_ORDER.indexOf("continue"));
  });

  it("keeps the entry point from being absorbed by a weak-spot label", () => {
    // One row per lesson, so whichever kind ranks higher is the one shown: the
    // lesson being read must not disappear into a "redo exercises" row.
    expect(QUEUE_ORDER.indexOf("continue")).toBeLessThan(
      QUEUE_ORDER.indexOf("shaky"),
    );
    expect(QUEUE_ORDER.indexOf("continue")).toBeLessThan(
      QUEUE_ORDER.indexOf("hinted"),
    );
  });

  it("assigns every kind to exactly one chip", () => {
    for (const kind of QUEUE_ORDER) {
      expect(GROUP_OF[kind as QueueKind]).toBeDefined();
    }
    expect(new Set(Object.keys(GROUP_OF))).toEqual(new Set(QUEUE_ORDER));
  });

  it("groups a leech under weak spots, not review", () => {
    // A leech is due, but the advice is to re-read rather than grade it again.
    expect(GROUP_OF.leech).toBe("weak");
    expect(GROUP_OF.overdue).toBe("review");
  });
});

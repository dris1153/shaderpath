import { beforeAll, describe, expect, it } from "vitest";
import { exerciseAttempts, lessonProgress, reviewQueue, studySessions } from "@/db/schema";
import { db, withUser } from "@/db/client";
import { getGamification } from "@/lib/xp-read";
import { truncateAll } from "../setup/reset-tables";
import { createTestUser } from "../setup/test-users";

// XP is a hand count over three tables; a stranger's rows must never add to it.
let alice: string;
let bob: string;

beforeAll(async () => {
  await truncateAll();
  alice = await createTestUser("alice-xp@test.local");
  bob = await createTestUser("bob-xp@test.local");

  await withUser(alice, async () => {
    await db.insert(lessonProgress).values([
      { lessonSlug: "vector-basics", status: "completed" },
      { lessonSlug: "cartesian-and-uv-space", status: "completed" },
      { lessonSlug: "matrix-basics", status: "in_progress" },
    ]);
    await db.insert(exerciseAttempts).values([
      { lessonSlug: "vector-basics", exerciseId: "a", status: "completed", updatedAt: new Date() },
      { lessonSlug: "vector-basics", exerciseId: "b", status: "attempted", updatedAt: new Date() },
    ]);
    await db.insert(reviewQueue).values({
      lessonSlug: "vector-basics",
      intervalDays: 1,
      easeFactor: 2.5,
      dueAt: new Date(),
      reviewCount: 3,
    });
  });
  // Bob does far more; none of it may leak into Alice's total.
  await withUser(bob, async () => {
    await db.insert(lessonProgress).values({ lessonSlug: "vector-basics", status: "completed" });
    await db.insert(reviewQueue).values({
      lessonSlug: "vector-basics",
      intervalDays: 1,
      easeFactor: 2.5,
      dueAt: new Date(),
      reviewCount: 40,
    });
    await db.insert(studySessions).values({
      lessonSlug: "vector-basics",
      startedAt: new Date(),
      durationSeconds: 600,
    });
  });
});

describe("getGamification", () => {
  it("sums only the signed-in user's rows: 2 lessons, 1 exercise, 3 reviews", async () => {
    const data = await withUser(alice, async () => await getGamification(new Date()));
    expect(data.xp).toBe(2 * 10 + 1 * 5 + 3 * 2);
    expect(data.level).toBe(1);
    expect(data.intoLevel).toBe(31);
    // Bob's session is today; Alice has none.
    expect(data.streak.current).toBe(0);
    expect(data.streak.thisWeek).toHaveLength(7);
  });
});

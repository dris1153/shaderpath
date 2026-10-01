import { beforeAll, describe, expect, it } from "vitest";
import { db, withUser } from "@/db/client";
import { reviewQueue } from "@/db/schema";
import { getNextReviewDays } from "@/lib/dashboard-read";
import { truncateAll } from "../setup/reset-tables";
import { createTestUser } from "../setup/test-users";

const DAY = 86_400_000;
const NOW = new Date("2026-10-01T12:00:00Z");
let reader: string;
let empty: string;

beforeAll(async () => {
  await truncateAll();
  reader = await createTestUser("next-review@test.local");
  empty = await createTestUser("no-reviews@test.local");
  await withUser(reader, async () => {
    await db.insert(reviewQueue).values([
      // Already due: belongs to "review today", not to "next".
      { lessonSlug: "vector-basics", dueAt: new Date(NOW.getTime() - DAY) },
      { lessonSlug: "matrix-basics", dueAt: new Date(NOW.getTime() + 3.5 * DAY) },
      { lessonSlug: "cartesian-and-uv-space", dueAt: new Date(NOW.getTime() + 9 * DAY) },
    ]);
  });
});

describe("getNextReviewDays", () => {
  it("rounds the earliest future review up to whole days", async () => {
    expect(await withUser(reader, async () => await getNextReviewDays(NOW))).toBe(4);
  });

  it("is undefined when nothing is scheduled", async () => {
    expect(await withUser(empty, async () => await getNextReviewDays(NOW))).toBeUndefined();
  });
});

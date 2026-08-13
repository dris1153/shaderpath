import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Point the DB singleton at a scratch file BEFORE importing anything that touches it
process.env.SHADERPATH_DB = path.join(
  os.tmpdir(),
  `shaderpath-test-${process.pid}-${Date.now()}.db`,
);

const { runMigrations } = await import("@/db/migrate");
const {
  saveReadingProgress,
  markComplete,
  openStudySession,
  closeStudySession,
} = await import("@/lib/progress");
const { getProgressRow } = await import("@/lib/progress-read");
const { db } = await import("@/db/client");
const { studySessions } = await import("@/db/schema");

runMigrations();

describe("progress server actions", () => {
  it("rejects unknown slugs", async () => {
    await expect(
      saveReadingProgress({
        slug: "not-a-lesson",
        scrollPercent: 0.5,
        deltaSeconds: 5,
      }),
    ).rejects.toThrow(/Unknown lesson slug/);
    await expect(markComplete("also-not-a-lesson")).rejects.toThrow();
  });

  it("clamps scroll percent and time deltas", async () => {
    await saveReadingProgress({
      slug: "vector-basics",
      scrollPercent: 7,
      deltaSeconds: 99999,
    });
    const row = getProgressRow("vector-basics");
    expect(row?.scrollPercent).toBe(1);
    expect(row?.timeSpentSeconds).toBe(120); // MAX_DELTA_SECONDS cap
    expect(row?.status).toBe("in_progress");
    expect(row?.startedAt).toBeInstanceOf(Date);
  });

  it("accumulates time and updates scroll position", async () => {
    await saveReadingProgress({
      slug: "matrix-basics",
      scrollPercent: 0.4,
      deltaSeconds: 10,
    });
    await saveReadingProgress({
      slug: "matrix-basics",
      scrollPercent: 0.2,
      deltaSeconds: 20,
    });
    const row = getProgressRow("matrix-basics");
    expect(row?.timeSpentSeconds).toBe(30);
    expect(row?.scrollPercent).toBe(0.2); // latest position wins (resume where you left)
  });

  it("keeps completed status across later reading saves", async () => {
    await markComplete("cartesian-and-uv-space", 7);
    let row = getProgressRow("cartesian-and-uv-space");
    expect(row?.status).toBe("completed");
    expect(row?.confidence).toBe(5); // clamped 1–5
    expect(row?.completedAt).toBeInstanceOf(Date);

    await saveReadingProgress({
      slug: "cartesian-and-uv-space",
      scrollPercent: 0.9,
      deltaSeconds: 15,
    });
    row = getProgressRow("cartesian-and-uv-space");
    expect(row?.status).toBe("completed");
    expect(row?.scrollPercent).toBe(0.9);
  });

  it("opens and closes study sessions", async () => {
    const id = await openStudySession("vector-basics");
    expect(id).toBeGreaterThan(0);
    await closeStudySession(id, 42);
    const session = db.select().from(studySessions).all().at(-1);
    expect(session?.durationSeconds).toBe(42);
    expect(session?.endedAt).toBeInstanceOf(Date);
  });
});

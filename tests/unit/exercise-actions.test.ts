import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

process.env.SHADERPATH_DB = path.join(
  os.tmpdir(),
  `shaderpath-ex-test-${process.pid}-${Date.now()}.db`,
);

const { runMigrations } = await import("@/db/migrate");
const {
  setExerciseStatus,
  revealHint,
  revealSolution,
  saveUserCode,
  saveChecklist,
} = await import("@/lib/exercises");
const { getAttemptsForLesson } = await import("@/lib/exercises-read");

runMigrations();

const SLUG = "cartesian-and-uv-space";
const CONCEPT = "uv-pixel-mapping"; // 2 hints, 3 checklist items
const CODE = "normalize-canvas-coords";

function row(exerciseId: string) {
  return getAttemptsForLesson(SLUG).find((a) => a.exerciseId === exerciseId);
}

describe("exercise server actions", () => {
  it("rejects unknown lesson slugs and exercise ids", async () => {
    await expect(setExerciseStatus("nope", CONCEPT, "attempted")).rejects.toThrow(
      /Unknown lesson/,
    );
    await expect(revealHint(SLUG, "ghost-exercise")).rejects.toThrow(
      /Unknown exercise/,
    );
  });

  it("reveals hints monotonically, capped at the hint count", async () => {
    expect(await revealHint(SLUG, CONCEPT)).toBe(1);
    expect(await revealHint(SLUG, CONCEPT)).toBe(2);
    expect(await revealHint(SLUG, CONCEPT)).toBe(2); // capped, never above
    const r = row(CONCEPT);
    expect(r?.hintsRevealed).toBe(2);
    expect(r?.status).toBe("attempted"); // hint = engagement
  });

  it("upserts a single row per exercise (unique index)", async () => {
    await setExerciseStatus(SLUG, CONCEPT, "completed");
    await revealSolution(SLUG, CONCEPT);
    const rows = getAttemptsForLesson(SLUG).filter(
      (a) => a.exerciseId === CONCEPT,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("completed"); // reveal never downgrades status
    expect(rows[0]?.solutionRevealed).toBe(true);
  });

  it("creates the row as attempted when solution is revealed first", async () => {
    await revealSolution(SLUG, CODE);
    const r = row(CODE);
    expect(r?.status).toBe("attempted");
    expect(r?.solutionRevealed).toBe(true);
  });

  it("saves user code with a size cap", async () => {
    await saveUserCode(SLUG, CODE, "const u = 0.5;");
    expect(row(CODE)?.userCode).toBe("const u = 0.5;");
    await expect(
      saveUserCode(SLUG, CODE, "x".repeat(200 * 1024)),
    ).rejects.toThrow(/too large/);
  });

  it("validates checklist shape and length against content", async () => {
    await expect(
      saveChecklist(SLUG, CONCEPT, [true, false]), // content has 3 items
    ).rejects.toThrow(/Bad checklist/);
    await expect(
      saveChecklist(SLUG, CONCEPT, [true, "yes", false]),
    ).rejects.toThrow(/Bad checklist/);
    await saveChecklist(SLUG, CONCEPT, [true, false, true]);
    expect(row(CONCEPT)?.checklistState).toEqual([true, false, true]);
  });
});

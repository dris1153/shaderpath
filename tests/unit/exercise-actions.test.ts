import { beforeAll, describe, expect, it } from "vitest";


import {
  setExerciseStatus,
  revealHint,
  revealSolution,
  saveUserCode,
  saveChecklist,
} from "@/lib/exercises";
import { getAttemptsForLesson } from "@/lib/exercises-read";

import { truncateAll } from "../setup/reset-tables";

beforeAll(truncateAll);


const SLUG = "cartesian-and-uv-space";
const CONCEPT = "uv-pixel-mapping"; // 2 hints, 3 checklist items
const CODE = "normalize-canvas-coords";

async function row(exerciseId: string) {
  return (await getAttemptsForLesson(SLUG)).find((a) => a.exerciseId === exerciseId);
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
    const r = await row(CONCEPT);
    expect(r?.hintsRevealed).toBe(2);
    expect(r?.status).toBe("attempted"); // hint = engagement
  });

  it("upserts a single row per exercise (unique index)", async () => {
    await setExerciseStatus(SLUG, CONCEPT, "completed");
    await revealSolution(SLUG, CONCEPT);
    const rows = (await getAttemptsForLesson(SLUG)).filter(
      (a) => a.exerciseId === CONCEPT,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("completed"); // reveal never downgrades status
    expect(rows[0]?.solutionRevealed).toBe(true);
  });

  it("creates the row as attempted when solution is revealed first", async () => {
    await revealSolution(SLUG, CODE);
    const r = await row(CODE);
    expect(r?.status).toBe("attempted");
    expect(r?.solutionRevealed).toBe(true);
  });

  it("saves user code with a size cap", async () => {
    await saveUserCode(SLUG, CODE, "const u = 0.5;");
    expect((await row(CODE))?.userCode).toBe("const u = 0.5;");
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
    expect((await row(CONCEPT))?.checklistState).toEqual([true, false, true]);
  });
});

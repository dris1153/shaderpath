"use server";

import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { exerciseAttempts } from "@/db/schema";
import { LESSON_SLUGS, type LessonSlug } from "@/content/slugs";
import { EXERCISES_REGISTRY } from "@/content/lesson-registry.generated";
import type { Exercise } from "@/content/types";

const VALID_SLUGS = new Set<string>(LESSON_SLUGS);
const MAX_CODE_BYTES = 128 * 1024;
const STATUSES = ["not_started", "attempted", "completed", "skipped"] as const;
type AttemptStatus = (typeof STATUSES)[number];

async function assertExercise(
  slug: string,
  exerciseId: string,
): Promise<Exercise> {
  if (!VALID_SLUGS.has(slug)) throw new Error(`Unknown lesson slug: ${slug}`);
  const loader = EXERCISES_REGISTRY[slug as LessonSlug];
  const exercises = loader ? (await loader()).exercises : [];
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) {
    throw new Error(`Unknown exercise ${slug}/${exerciseId}`);
  }
  return exercise;
}

// One row per (lessonSlug, exerciseId) — enforced by uq_exercise_attempts_lesson_exercise.
// insertValues must be plain values (no SQL fragments — the VALUES clause has
// no row context); updateSet may reference existing columns.
async function upsert(
  slug: string,
  exerciseId: string,
  insertValues: Record<string, unknown>,
  updateSet?: Record<string, unknown>,
) {
  await db.insert(exerciseAttempts)
    .values({
      lessonSlug: slug,
      exerciseId,
      updatedAt: new Date(),
      ...insertValues,
    })
    .onConflictDoUpdate({
      target: [exerciseAttempts.lessonSlug, exerciseAttempts.exerciseId],
      set: { ...(updateSet ?? insertValues), updatedAt: new Date() },
    });
}

// SQL fragment: engaging with an exercise moves not_started → attempted,
// but never downgrades completed/skipped.
const BUMP_TO_ATTEMPTED = sql`CASE WHEN ${exerciseAttempts.status} = 'not_started' THEN 'attempted' ELSE ${exerciseAttempts.status} END`;

export async function setExerciseStatus(
  slug: string,
  exerciseId: string,
  status: AttemptStatus,
) {
  await assertExercise(slug, exerciseId);
  if (!STATUSES.includes(status)) throw new Error(`Bad status: ${status}`);
  await upsert(slug, exerciseId, { status });
}

/** Monotonic reveal; returns the persisted count (capped at hints.length). */
export async function revealHint(
  slug: string,
  exerciseId: string,
): Promise<number> {
  const exercise = await assertExercise(slug, exerciseId);
  const max = exercise.hints.length;
  await db.insert(exerciseAttempts)
    .values({
      lessonSlug: slug,
      exerciseId,
      hintsRevealed: Math.min(1, max),
      status: "attempted",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [exerciseAttempts.lessonSlug, exerciseAttempts.exerciseId],
      set: {
        // LEAST, not MIN: two-argument MIN is a SQLite scalar; in Postgres
        // MIN is an aggregate and rejects a second argument.
        hintsRevealed: sql`LEAST(${exerciseAttempts.hintsRevealed} + 1, ${max})`,
        status: BUMP_TO_ATTEMPTED,
        updatedAt: new Date(),
      },
    });
  const row = await db
    .select({ hintsRevealed: exerciseAttempts.hintsRevealed })
    .from(exerciseAttempts)
    .where(
      sql`${exerciseAttempts.lessonSlug} = ${slug} AND ${exerciseAttempts.exerciseId} = ${exerciseId}`,
    )
    .then((r) => r[0]);
  return row?.hintsRevealed ?? Math.min(1, max);
}

export async function revealSolution(slug: string, exerciseId: string) {
  await assertExercise(slug, exerciseId);
  await upsert(
    slug,
    exerciseId,
    { solutionRevealed: true, status: "attempted" },
    { solutionRevealed: true, status: BUMP_TO_ATTEMPTED },
  );
}

export async function saveUserCode(
  slug: string,
  exerciseId: string,
  code: string,
) {
  await assertExercise(slug, exerciseId);
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
    throw new Error("Code too large");
  }
  await upsert(
    slug,
    exerciseId,
    { userCode: code, status: "attempted" },
    { userCode: code, status: BUMP_TO_ATTEMPTED },
  );
}

export async function saveChecklist(
  slug: string,
  exerciseId: string,
  state: unknown,
) {
  const exercise = await assertExercise(slug, exerciseId);
  if (
    !Array.isArray(state) ||
    state.length !== exercise.checklist.length ||
    state.length > 50 ||
    !state.every((v) => typeof v === "boolean")
  ) {
    throw new Error("Bad checklist state");
  }
  await upsert(
    slug,
    exerciseId,
    { checklistState: state as boolean[], status: "attempted" },
    { checklistState: state as boolean[], status: BUMP_TO_ATTEMPTED },
  );
}

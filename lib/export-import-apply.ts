// Server-only: writes a validated import into SQLite. Every insert lists its
// columns explicitly (never spreads the raw payload) so writes stay
// parameterized even though the source data is untrusted.

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import {
  bookmarks,
  exerciseAttempts,
  lessonProgress,
  notes,
  playgroundSnippets,
  reviewQueue,
  studySessions,
} from "@/db/schema";
import type { ImportTables } from "./export-import-types";

export type Tx = Parameters<
  Parameters<PostgresJsDatabase<typeof schema>["transaction"]>[0]
>[0];

// Rows carry no `id`: the column is a per-database serial, so an import must
// let Postgres mint fresh ones. Tables with a natural key (lesson slug, or slug
// + exercise id) upsert on it; the rest simply insert, since "the same note
// twice" has no meaning to match on.
const toDate = (v: string) => new Date(v);
const toDateOrNull = (v: string | null) => (v === null ? null : new Date(v));

const ALL_TABLES = [
  lessonProgress,
  exerciseAttempts,
  notes,
  bookmarks,
  studySessions,
  reviewQueue,
  playgroundSnippets,
] as const;

async function deleteAllRows(tx: Tx) {
  for (const table of ALL_TABLES) await tx.delete(table);
}

// Upsert-by-natural-key doubles as a plain insert after deleteAllRows() in
// replace mode (nothing left to conflict with), so one function covers both.
async function upsertLessonProgress(tx: Tx, rows: ImportTables["lessonProgress"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      status: r.status,
      startedAt: toDateOrNull(r.startedAt),
      completedAt: toDateOrNull(r.completedAt),
      timeSpentSeconds: r.timeSpentSeconds,
      scrollPercent: r.scrollPercent,
      confidence: r.confidence,
    };
    await tx.insert(lessonProgress)
      .values(values)
      .onConflictDoUpdate({ target: [lessonProgress.userId, lessonProgress.lessonSlug], set: values });
  }
}

async function upsertExerciseAttempts(tx: Tx, rows: ImportTables["exerciseAttempts"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      exerciseId: r.exerciseId,
      status: r.status,
      hintsRevealed: r.hintsRevealed,
      solutionRevealed: r.solutionRevealed,
      userCode: r.userCode,
      checklistState: r.checklistState,
      updatedAt: toDate(r.updatedAt),
    };
    await tx.insert(exerciseAttempts)
      .values(values)
      .onConflictDoUpdate({
        target: [
          exerciseAttempts.userId,
          exerciseAttempts.lessonSlug,
          exerciseAttempts.exerciseId,
        ],
        set: values,
      });
  }
}

async function upsertNotes(tx: Tx, rows: ImportTables["notes"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      anchorId: r.anchorId,
      selectedText: r.selectedText,
      body: r.body,
      createdAt: toDate(r.createdAt),
    };
    await tx.insert(notes).values(values);
  }
}

async function upsertBookmarks(tx: Tx, rows: ImportTables["bookmarks"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      anchorId: r.anchorId,
      label: r.label,
      createdAt: toDate(r.createdAt),
    };
    await tx.insert(bookmarks).values(values);
  }
}

async function upsertStudySessions(tx: Tx, rows: ImportTables["studySessions"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      startedAt: toDate(r.startedAt),
      endedAt: toDateOrNull(r.endedAt),
      durationSeconds: r.durationSeconds,
    };
    await tx.insert(studySessions).values(values);
  }
}

async function upsertReviewQueue(tx: Tx, rows: ImportTables["reviewQueue"]) {
  for (const r of rows) {
    const values = {
      lessonSlug: r.lessonSlug,
      intervalDays: r.intervalDays,
      easeFactor: r.easeFactor,
      dueAt: toDate(r.dueAt),
      reviewCount: r.reviewCount,
    };
    await tx.insert(reviewQueue)
      .values(values)
      .onConflictDoUpdate({ target: [reviewQueue.userId, reviewQueue.lessonSlug], set: values });
  }
}

async function upsertSnippets(tx: Tx, rows: ImportTables["playgroundSnippets"]) {
  for (const r of rows) {
    const values = {
      title: r.title,
      vertexShader: r.vertexShader,
      fragmentShader: r.fragmentShader,
      uniformsJson: r.uniformsJson,
      forkedFromLesson: r.forkedFromLesson,
      createdAt: toDate(r.createdAt),
    };
    await tx.insert(playgroundSnippets).values(values);
  }
}

export async function applyPayload(
  tx: Tx,
  tables: ImportTables,
  mode: "replace" | "merge",
): Promise<Record<string, number>> {
  if (mode === "replace") await deleteAllRows(tx);

  await upsertLessonProgress(tx, tables.lessonProgress);
  await upsertExerciseAttempts(tx, tables.exerciseAttempts);
  await upsertNotes(tx, tables.notes);
  await upsertBookmarks(tx, tables.bookmarks);
  await upsertStudySessions(tx, tables.studySessions);
  await upsertReviewQueue(tx, tables.reviewQueue);
  await upsertSnippets(tx, tables.playgroundSnippets);

  return {
    lessonProgress: tables.lessonProgress.length,
    exerciseAttempts: tables.exerciseAttempts.length,
    notes: tables.notes.length,
    bookmarks: tables.bookmarks.length,
    studySessions: tables.studySessions.length,
    reviewQueue: tables.reviewQueue.length,
    playgroundSnippets: tables.playgroundSnippets.length,
  };
}

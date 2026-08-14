// Server-only: writes a validated import into SQLite. Every insert lists its
// columns explicitly (never spreads the raw payload) so writes stay
// parameterized even though the source data is untrusted.

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import {
  bookmarks,
  exerciseAttempts,
  lessonProgress,
  notes,
  playgroundSnippets,
  reviewQueue,
  settings,
  studySessions,
} from "@/db/schema";
import type { ImportTables } from "./export-import-types";

export type Tx = BetterSQLite3Database<typeof schema>;

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
  settings,
] as const;

function deleteAllRows(tx: Tx) {
  for (const table of ALL_TABLES) tx.delete(table).run();
}

// Upsert-by-natural-key doubles as a plain insert after deleteAllRows() in
// replace mode (nothing left to conflict with), so one function covers both.
function upsertLessonProgress(tx: Tx, rows: ImportTables["lessonProgress"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      status: r.status,
      startedAt: toDateOrNull(r.startedAt),
      completedAt: toDateOrNull(r.completedAt),
      timeSpentSeconds: r.timeSpentSeconds,
      scrollPercent: r.scrollPercent,
      confidence: r.confidence,
    };
    tx.insert(lessonProgress)
      .values(values)
      .onConflictDoUpdate({ target: lessonProgress.lessonSlug, set: values })
      .run();
  }
}

function upsertExerciseAttempts(tx: Tx, rows: ImportTables["exerciseAttempts"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      exerciseId: r.exerciseId,
      status: r.status,
      hintsRevealed: r.hintsRevealed,
      solutionRevealed: r.solutionRevealed,
      userCode: r.userCode,
      checklistState: r.checklistState,
      updatedAt: toDate(r.updatedAt),
    };
    tx.insert(exerciseAttempts)
      .values(values)
      .onConflictDoUpdate({
        target: [exerciseAttempts.lessonSlug, exerciseAttempts.exerciseId],
        set: values,
      })
      .run();
  }
}

function upsertNotes(tx: Tx, rows: ImportTables["notes"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      anchorId: r.anchorId,
      selectedText: r.selectedText,
      body: r.body,
      createdAt: toDate(r.createdAt),
    };
    tx.insert(notes).values(values).onConflictDoUpdate({ target: notes.id, set: values }).run();
  }
}

function upsertBookmarks(tx: Tx, rows: ImportTables["bookmarks"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      anchorId: r.anchorId,
      label: r.label,
      createdAt: toDate(r.createdAt),
    };
    tx.insert(bookmarks)
      .values(values)
      .onConflictDoUpdate({ target: bookmarks.id, set: values })
      .run();
  }
}

function upsertStudySessions(tx: Tx, rows: ImportTables["studySessions"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      startedAt: toDate(r.startedAt),
      endedAt: toDateOrNull(r.endedAt),
      durationSeconds: r.durationSeconds,
    };
    tx.insert(studySessions)
      .values(values)
      .onConflictDoUpdate({ target: studySessions.id, set: values })
      .run();
  }
}

function upsertReviewQueue(tx: Tx, rows: ImportTables["reviewQueue"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      lessonSlug: r.lessonSlug,
      intervalDays: r.intervalDays,
      easeFactor: r.easeFactor,
      dueAt: toDate(r.dueAt),
      reviewCount: r.reviewCount,
    };
    tx.insert(reviewQueue)
      .values(values)
      .onConflictDoUpdate({ target: reviewQueue.lessonSlug, set: values })
      .run();
  }
}

function upsertSnippets(tx: Tx, rows: ImportTables["playgroundSnippets"]) {
  for (const r of rows) {
    const values = {
      id: r.id,
      title: r.title,
      vertexShader: r.vertexShader,
      fragmentShader: r.fragmentShader,
      uniformsJson: r.uniformsJson,
      forkedFromLesson: r.forkedFromLesson,
      createdAt: toDate(r.createdAt),
    };
    tx.insert(playgroundSnippets)
      .values(values)
      .onConflictDoUpdate({ target: playgroundSnippets.id, set: values })
      .run();
  }
}

function upsertSettings(tx: Tx, rows: ImportTables["settings"]) {
  for (const r of rows) {
    tx.insert(settings)
      .values({ key: r.key, value: r.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: r.value } })
      .run();
  }
}

export function applyPayload(
  tx: Tx,
  tables: ImportTables,
  mode: "replace" | "merge",
): Record<string, number> {
  if (mode === "replace") deleteAllRows(tx);

  upsertLessonProgress(tx, tables.lessonProgress);
  upsertExerciseAttempts(tx, tables.exerciseAttempts);
  upsertNotes(tx, tables.notes);
  upsertBookmarks(tx, tables.bookmarks);
  upsertStudySessions(tx, tables.studySessions);
  upsertReviewQueue(tx, tables.reviewQueue);
  upsertSnippets(tx, tables.playgroundSnippets);
  upsertSettings(tx, tables.settings);

  return {
    lessonProgress: tables.lessonProgress.length,
    exerciseAttempts: tables.exerciseAttempts.length,
    notes: tables.notes.length,
    bookmarks: tables.bookmarks.length,
    studySessions: tables.studySessions.length,
    reviewQueue: tables.reviewQueue.length,
    playgroundSnippets: tables.playgroundSnippets.length,
    settings: tables.settings.length,
  };
}

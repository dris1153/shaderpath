// Server-only orchestration for progress export/import (spec §6.2.13).
// Route handlers are the only callers — never import this from a client
// component (pulls in @/db/client → the postgres driver).

import { db } from "@/db/client";
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
import { applyPayload } from "./export-import-apply";
import { SCHEMA_VERSION, type ImportPayload } from "./export-import-schema";

export {
  SCHEMA_VERSION,
  SchemaVersionError,
  ValidationError,
  validate,
  type ImportPayload,
  type ImportTables,
} from "./export-import-schema";

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  tables: {
    lessonProgress: (typeof lessonProgress.$inferSelect)[];
    exerciseAttempts: (typeof exerciseAttempts.$inferSelect)[];
    notes: (typeof notes.$inferSelect)[];
    bookmarks: (typeof bookmarks.$inferSelect)[];
    studySessions: (typeof studySessions.$inferSelect)[];
    reviewQueue: (typeof reviewQueue.$inferSelect)[];
    playgroundSnippets: (typeof playgroundSnippets.$inferSelect)[];
    settings: (typeof settings.$inferSelect)[];
  };
}

/** Reads every progress table for export — no filtering, single-user app. */
export async function serialize(): Promise<ExportPayload> {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables: {
      lessonProgress: await db.select().from(lessonProgress),
      exerciseAttempts: await db.select().from(exerciseAttempts),
      notes: await db.select().from(notes),
      bookmarks: await db.select().from(bookmarks),
      studySessions: await db.select().from(studySessions),
      reviewQueue: await db.select().from(reviewQueue),
      playgroundSnippets: await db.select().from(playgroundSnippets),
      settings: await db.select().from(settings),
    },
  };
}

/** Applies a validated import in one transaction; returns per-table row counts. */
export async function apply(
  payload: ImportPayload,
  mode: "replace" | "merge",
): Promise<Record<string, number>> {
  return db.transaction(async (tx) => applyPayload(tx, payload.tables, mode));
}

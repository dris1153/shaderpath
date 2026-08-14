// Server-only orchestration for progress export/import (spec §6.2.13).
// Route handlers are the only callers — never import this from a client
// component (pulls in @/db/client → better-sqlite3, a native module).

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
export function serialize(): ExportPayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables: {
      lessonProgress: db.select().from(lessonProgress).all(),
      exerciseAttempts: db.select().from(exerciseAttempts).all(),
      notes: db.select().from(notes).all(),
      bookmarks: db.select().from(bookmarks).all(),
      studySessions: db.select().from(studySessions).all(),
      reviewQueue: db.select().from(reviewQueue).all(),
      playgroundSnippets: db.select().from(playgroundSnippets).all(),
      settings: db.select().from(settings).all(),
    },
  };
}

/** Applies a validated import in one transaction; returns per-table row counts. */
export function apply(
  payload: ImportPayload,
  mode: "replace" | "merge",
): Record<string, number> {
  return db.transaction((tx) => applyPayload(tx, payload.tables, mode));
}

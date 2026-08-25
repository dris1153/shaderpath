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

type Owned<T> = Omit<T, "userId" | "id">;

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  tables: {
    lessonProgress: Owned<typeof lessonProgress.$inferSelect>[];
    exerciseAttempts: Owned<typeof exerciseAttempts.$inferSelect>[];
    notes: Owned<typeof notes.$inferSelect>[];
    bookmarks: Owned<typeof bookmarks.$inferSelect>[];
    studySessions: Owned<typeof studySessions.$inferSelect>[];
    reviewQueue: Owned<typeof reviewQueue.$inferSelect>[];
    playgroundSnippets: Owned<typeof playgroundSnippets.$inferSelect>[];
  };
}

// Neither ownership nor surrogate keys enter the file.
//
// user_id: on the way back in it comes from the column's `DEFAULT auth.uid()`,
// so an imported row belongs to whoever imported it — correct by construction
// rather than by remembering to override a field an attacker controls.
//
// id: `serial` is global across accounts, so it stopped being a natural key the
// moment a second user existed. Carrying it would make a restore collide with
// whichever account happens to hold that number today. Rows are matched by
// their real keys instead (lesson slug, or slug + exercise id).
function strip<T extends { userId: string; id: number }>(rows: T[]): Owned<T>[] {
  return rows.map((row) => {
    const copy = { ...row } as Owned<T> & { userId?: string; id?: number };
    delete copy.userId;
    delete copy.id;
    return copy;
  });
}

/** Reads every progress table for export. RLS scopes it to the caller. */
export async function serialize(): Promise<ExportPayload> {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables: {
      lessonProgress: strip(await db.select().from(lessonProgress)),
      exerciseAttempts: strip(await db.select().from(exerciseAttempts)),
      notes: strip(await db.select().from(notes)),
      bookmarks: strip(await db.select().from(bookmarks)),
      studySessions: strip(await db.select().from(studySessions)),
      reviewQueue: strip(await db.select().from(reviewQueue)),
      playgroundSnippets: strip(await db.select().from(playgroundSnippets)),
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

import { sql } from "drizzle-orm";
import { adminDb } from "@/db/client";

// The old harness gave every spec file its own SQLite file. One shared database
// plus sequential files plus this call in beforeAll restores that isolation.
export async function truncateAll(): Promise<void> {
  await adminDb().execute(
    sql`TRUNCATE lesson_progress, exercise_attempts, notes, bookmarks, study_sessions, review_queue, playground_snippets, auth.users RESTART IDENTITY CASCADE`,
  );
}

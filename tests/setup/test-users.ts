import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { adminDb } from "@/db/client";

// Accounts for DB-backed tests. Supabase owns `auth.users` in production; the
// local Docker database gets a minimal stand-in from scripts/test-db.ts, and
// rows here satisfy the foreign keys added by migration 0001.

export async function createTestUser(email?: string): Promise<string> {
  const id = randomUUID();
  await adminDb().execute(
    sql`INSERT INTO auth.users (id, email) VALUES (${id}, ${email ?? `${id}@test.local`})`,
  );
  return id;
}

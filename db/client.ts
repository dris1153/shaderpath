import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Server-only (spec §8.7): must never be imported from client components.
// serverExternalPackages in next.config.ts keeps better-sqlite3 out of bundles.

// SHADERPATH_DB override exists for tests (scratch DB) — defaults to spec §2 path
const DB_PATH =
  process.env.SHADERPATH_DB ?? path.join(process.cwd(), "data", "progress.db");
const DB_DIR = path.dirname(DB_PATH);

function createDb() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Singleton across dev HMR reloads — a new Database() per reload leaks handles.
const globalForDb = globalThis as unknown as {
  __shaderpathDb?: ReturnType<typeof createDb>;
};

export const db = (globalForDb.__shaderpathDb ??= createDb());

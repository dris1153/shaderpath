import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";

// Idempotent — drizzle tracks applied migrations in __drizzle_migrations.
export function runMigrations() {
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "db", "migrations"),
  });
}

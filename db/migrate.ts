import path from "node:path";
import { config as loadEnv } from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Applied from the CLI (pnpm db:migrate), not at boot. Running this on Vercel's
// `register()` hook would fire on every cold start, and DDL through the
// transaction pooler is not safe — so migrations go over the direct connection
// as an explicit deploy step.
export async function runMigrations() {
  // tsx does not read .env files, so a CLI run would otherwise miss the
  // connection string the README tells you to put in .env.local.
  loadEnv({ path: [".env.local", ".env"], quiet: true });

  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set to migrate");

  // max: 1 — the migrator runs statements in order on one connection.
  const sql = postgres(url, {
    max: 1,
    // 0001 claims pre-auth rows for this account. It must be a connection-level
    // setting, not a statement: the migration reads it via current_setting.
    connection: process.env.BACKFILL_USER_ID
      ? { "app.backfill_user_id": process.env.BACKFILL_USER_ID }
      : undefined,
  });
  try {
    await migrate(drizzle(sql), {
      migrationsFolder: path.join(process.cwd(), "db", "migrations"),
    });
  } finally {
    await sql.end();
  }
}

if (process.argv[1]?.includes("migrate")) {
  void runMigrations().then(
    () => console.log("migrations applied"),
    (err: unknown) => {
      console.error(err);
      process.exit(1);
    },
  );
}

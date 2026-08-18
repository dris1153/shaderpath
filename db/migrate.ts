import path from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Applied from the CLI (pnpm db:migrate), not at boot. Running this on Vercel's
// `register()` hook would fire on every cold start, and DDL through the
// transaction pooler is not safe — so migrations go over the direct connection
// as an explicit deploy step.
export async function runMigrations() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set to migrate");

  // max: 1 — the migrator runs statements in order on one connection.
  const sql = postgres(url, { max: 1 });
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

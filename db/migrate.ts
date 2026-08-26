import path from "node:path";
import { config as loadEnv } from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  // max: 1 — the migrator runs statements in order on one connection, which is
  // also what lets the session setting below reach the migration.
  const sql = postgres(url, { max: 1 });
  try {
    const backfillUserId = process.env.BACKFILL_USER_ID?.trim();
    if (backfillUserId) {
      if (!UUID_RE.test(backfillUserId)) {
        throw new Error(
          `BACKFILL_USER_ID is not a uuid: ${JSON.stringify(backfillUserId)}`,
        );
      }

      // Fail here rather than several statements into the migration: without
      // this the uuid only fails much later, as an opaque foreign-key error.
      const [owner] = await sql`
        SELECT id FROM auth.users WHERE id = ${backfillUserId}::uuid
      `;
      if (!owner) {
        throw new Error(
          `BACKFILL_USER_ID ${backfillUserId} is not in auth.users. Sign up first, then copy the uuid from Supabase -> Authentication -> Users.`,
        );
      }

      // set_config, not a startup parameter: Supabase's pooler drops unknown
      // startup parameters, so the migration saw no value and refused to claim
      // any rows. `false` = session scope, so it survives into the migrator's
      // own transaction on this same connection.
      await sql`SELECT set_config('app.backfill_user_id', ${backfillUserId}, false)`;

      // Read it back from a separate statement — exactly how the migration
      // reads it. A pooler that discards the setting would otherwise let the
      // migration run with no owner and reject every row for being orphaned,
      // which is a confusing way to learn the value never arrived.
      const [check] = await sql`
        SELECT current_setting('app.backfill_user_id', true) AS value
      `;
      if (check?.value !== backfillUserId) {
        throw new Error(
          "The connection dropped app.backfill_user_id (got " +
            `${JSON.stringify(check?.value ?? null)}). Point DIRECT_URL at the ` +
            "session-mode connection on port 5432, not the transaction pooler on 6543.",
        );
      }
      console.log(`backfill owner: ${backfillUserId}`);
    } else {
      console.log(
        "BACKFILL_USER_ID not set — migration 0001 will refuse to run if any rows still lack an owner.",
      );
    }

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

import { config as loadEnv } from "dotenv";
import postgres from "postgres";

// Proves on the REAL database what tests/unit/rls-isolation.test.ts proves on
// Docker. The local suite cannot answer the questions that only production has:
// whether the connecting role carries BYPASSRLS, whether Supabase's grants
// actually reach the `authenticated` role, and whether the backfill claimed
// every row. Read-only — the live probe runs inside a rolled-back transaction.
//
// Usage: pnpm verify:rls

const TABLES = [
  "lesson_progress",
  "exercise_attempts",
  "notes",
  "bookmarks",
  "study_sessions",
  "review_queue",
  "playground_snippets",
] as const;

let failures = 0;
let warnings = 0;

function ok(msg: string) {
  console.log(`  PASS  ${msg}`);
}
function fail(msg: string) {
  failures++;
  console.log(`  FAIL  ${msg}`);
}
function warn(msg: string) {
  warnings++;
  console.log(`  WARN  ${msg}`);
}

async function main() {
  loadEnv({ path: [".env.local", ".env"], quiet: true });
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set");

  const sql = postgres(url, { max: 1 });
  try {
    console.log("\n1. Connecting role");
    const [role] = await sql<
      { rolname: string; rolsuper: boolean; rolbypassrls: boolean }[]
    >`
      SELECT rolname, rolsuper, rolbypassrls
      FROM pg_roles WHERE rolname = current_user
    `;
    console.log(`  role: ${role?.rolname}`);
    if (role?.rolsuper || role?.rolbypassrls) {
      // Not fatal: withUser does SET LOCAL ROLE authenticated, and db/client.ts
      // throws outside withUser, so no production query runs as this role. It
      // does mean the database is not a second line of defence for anything
      // that bypasses the app's own client.
      warn(
        `${role.rolname} has ${role.rolsuper ? "SUPERUSER " : ""}${role.rolbypassrls ? "BYPASSRLS" : ""} — ` +
          "policies do not constrain it. Safe only because withUser() switches role and db throws outside it.",
      );
    } else {
      ok(`${role?.rolname} is subject to row level security`);
    }

    console.log("\n2. RLS enabled AND forced");
    const rls = await sql<
      { relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }[]
    >`
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname = ANY(${sql.array([...TABLES])}) AND relkind = 'r'
    `;
    for (const t of TABLES) {
      const row = rls.find((r) => r.relname === t);
      if (!row) fail(`${t}: table not found`);
      else if (!row.relrowsecurity) fail(`${t}: RLS not enabled`);
      else if (!row.relforcerowsecurity) fail(`${t}: RLS not FORCED`);
      else ok(`${t}`);
    }

    console.log("\n3. Owner policy present");
    const policies = await sql<{ tablename: string; cmd: string }[]>`
      SELECT tablename, cmd FROM pg_policies
      WHERE tablename = ANY(${sql.array([...TABLES])})
    `;
    for (const t of TABLES) {
      const p = policies.filter((x) => x.tablename === t);
      if (p.length === 0) fail(`${t}: no policy`);
      else ok(`${t}: ${p.length} policy/policies`);
    }

    console.log("\n4. Backfill left no orphans");
    for (const t of TABLES) {
      const [countRow] = await sql<{ n: string }[]>`
        SELECT count(*)::text AS n FROM ${sql(t)} WHERE user_id IS NULL
      `;
      if (countRow?.n !== "0") fail(`${t}: ${countRow?.n ?? "?"} rows with no owner`);
      else ok(`${t}: no orphans`);
    }

    console.log("\n5. Row ownership");
    const owners = await sql<{ user_id: string; n: string }[]>`
      SELECT user_id::text, count(*)::text AS n
      FROM lesson_progress GROUP BY user_id ORDER BY count(*) DESC
    `;
    if (owners.length === 0) console.log("  (no progress rows yet)");
    for (const o of owners) console.log(`  ${o.n} lesson_progress rows -> ${o.user_id}`);

    console.log("\n6. Grants for the authenticated role");
    for (const t of TABLES) {
      const [priv] = await sql<{ can: boolean }[]>`
        SELECT has_table_privilege('authenticated', ${t}, 'SELECT, INSERT, UPDATE, DELETE') AS can
      `;
      if (!priv?.can) fail(`${t}: authenticated lacks table privileges`);
      else ok(`${t}`);
    }
    const [seq] = await sql<{ seqok: boolean }[]>`
      SELECT has_sequence_privilege('authenticated', 'lesson_progress_id_seq', 'USAGE') AS seqok
    `;
    if (!seq?.seqok) fail("authenticated lacks USAGE on lesson_progress_id_seq (inserts will fail)");
    else ok("sequence usage");

    console.log("\n7. settings table dropped");
    const [settingsRow] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings'
      ) AS exists
    `;
    if (settingsRow?.exists) fail("settings still exists");
    else ok("settings is gone");

    console.log("\n8. Live isolation probe (rolled back, writes nothing)");
    const [totalRow] = await sql<{ total: string }[]>`
      SELECT count(*)::text AS total FROM lesson_progress
    `;
    const total = totalRow?.total ?? "0";
    if (total === "0") {
      console.log("  (no rows to hide — skipped)");
    } else {
      await sql
        .begin(async (tx) => {
          await tx`SET LOCAL ROLE authenticated`;
          await tx`SELECT set_config('request.jwt.claims', ${JSON.stringify({
            sub: "00000000-0000-0000-0000-000000000000",
            role: "authenticated",
          })}, true)`;
          const [seenRow] = await tx<{ seen: string }[]>`
            SELECT count(*)::text AS seen FROM lesson_progress
          `;
          const seen = seenRow?.seen ?? "?";
          if (seen === "0") {
            ok(`a stranger sees 0 of ${total} lesson_progress rows`);
          } else {
            fail(`a stranger sees ${seen} of ${total} lesson_progress rows — RLS is not isolating`);
          }
          throw new Error("__rollback__");
        })
        .catch((err: unknown) => {
          if (!(err instanceof Error) || err.message !== "__rollback__") throw err;
        });
    }

    console.log(
      `\n${failures === 0 ? "OK" : "PROBLEMS"}: ${failures} failure(s), ${warnings} warning(s)\n`,
    );
    if (failures > 0) process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

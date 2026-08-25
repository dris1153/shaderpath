import { execSync } from "node:child_process";
import postgres from "postgres";
import { runMigrations } from "../db/migrate";

// One clean database per test run, shared by every spec — the same contract the
// old per-run SQLite file gave us, which is what made the suite deterministic.

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:dev@localhost:55432/shaderpath_test";

const CONTAINER = "shaderpath-pg";

// Plain postgres:17-alpine has none of what RLS needs: no `auth` schema, no
// auth.uid(), no `authenticated` role — and it connects as a real superuser,
// which BYPASSRLS even when FORCE is set. Without this shim the policies are
// untestable and a green suite would say nothing about production.
//
// auth.uid() mirrors Supabase's own definition (the `sub` claim of
// request.jwt.claims), so withUser() exercises the same code path locally as
// it does against Supabase.
const AUTH_SHIM_SQL = `
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text
);

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $fn$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$fn$;

DO $role$
BEGIN
  CREATE ROLE authenticated NOSUPERUSER NOINHERIT NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$role$;

GRANT USAGE ON SCHEMA public, auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
-- The migrator has not run yet, so grant on future objects too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
`;


function containerRunning(): boolean {
  try {
    return execSync(`docker ps --filter name=${CONTAINER} --format "{{.Names}}"`)
      .toString()
      .includes(CONTAINER);
  } catch {
    return false;
  }
}

/** Starts the throwaway Postgres if it is not already up. */
export function ensureContainer(): void {
  if (containerRunning()) return;
  try {
    execSync(`docker rm -f ${CONTAINER}`, { stdio: "ignore" });
  } catch {
    // nothing to remove
  }
  execSync(
    `docker run -d --name ${CONTAINER} -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=shaderpath -p 55432:5432 postgres:17-alpine`,
    { stdio: "ignore" },
  );
  for (let i = 0; i < 60; i++) {
    try {
      execSync(`docker exec ${CONTAINER} pg_isready -U postgres`, {
        stdio: "ignore",
      });
      return;
    } catch {
      // In-process sleep: Windows `timeout` errors whenever stdin is redirected
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
  throw new Error(`${CONTAINER} did not become ready`);
}

/**
 * Drops and recreates the test database, then migrates it. Dropping the schema
 * rather than the database avoids fighting other connections for the drop lock.
 */
export async function resetTestDatabase(
  url: string = TEST_DATABASE_URL,
): Promise<void> {
  ensureContainer();

  const adminUrl = url.replace(/\/[^/]+$/, "/postgres");
  const dbName = url.split("/").pop() ?? "shaderpath_test";

  const admin = postgres(adminUrl, { max: 1 });
  try {
    await admin.unsafe(`CREATE DATABASE "${dbName}"`);
  } catch {
    // already exists — the schema reset below is what actually cleans it
  } finally {
    await admin.end();
  }

  const sql = postgres(url, { max: 1 });
  try {
    // The drizzle schema holds __drizzle_migrations. Dropping only public
    // leaves that bookkeeping behind, so the migrator decides everything is
    // already applied and recreates nothing.
    await sql.unsafe(
      "DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;",
    );
    await sql.unsafe(AUTH_SHIM_SQL);
  } finally {
    await sql.end();
  }

  process.env.DIRECT_URL = url;
  await runMigrations();
}

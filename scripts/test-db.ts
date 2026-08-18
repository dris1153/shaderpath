import { execSync } from "node:child_process";
import postgres from "postgres";
import { runMigrations } from "../db/migrate";

// One clean database per test run, shared by every spec — the same contract the
// old per-run SQLite file gave us, which is what made the suite deterministic.

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:dev@localhost:55432/shaderpath_test";

const CONTAINER = "shaderpath-pg";


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
      execSync(process.platform === "win32" ? "timeout /t 1 /nobreak" : "sleep 1", {
        stdio: "ignore",
      });
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
  } finally {
    await sql.end();
  }

  process.env.DIRECT_URL = url;
  await runMigrations();
}

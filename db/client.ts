import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Server-only (spec §8.7): must never be imported from client components.

type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Point it at Supabase's transaction pooler (port 6543) in production, or the local test database.",
    );
  }

  // Serverless functions are short-lived and numerous, so each one holds a
  // single connection and hands it back quickly; a per-instance pool would
  // multiply into Postgres' connection limit. Supabase's transaction pooler
  // does the real pooling, and prepared statements must be off to work
  // through it.
  const isPooled = url.includes(":6543");
  const sql = postgres(url, {
    max: isPooled ? 1 : 10,
    prepare: !isPooled,
    idle_timeout: 20,
  });
  return drizzle(sql, { schema });
}

// Singleton across dev HMR reloads — a new client per reload leaks sockets.
const globalForDb = globalThis as unknown as { __shaderpathDb?: Db };

function getDb(): Db {
  return (globalForDb.__shaderpathDb ??= createDb());
}

// Lazy: connecting (or failing on a missing URL) at module scope breaks
// `next build`, which evaluates these modules while collecting page config
// long before any request needs a connection.
export const db = new Proxy({} as Db, {
  get: (_target, prop, receiver) => Reflect.get(getDb(), prop, receiver),
});

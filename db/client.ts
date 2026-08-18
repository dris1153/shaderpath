import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { poolOptionsFor } from "@/lib/db-pool-options";
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

  const sql = postgres(url, { ...poolOptionsFor(url), idle_timeout: 20 });
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

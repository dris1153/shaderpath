import { AsyncLocalStorage } from "node:async_hooks";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { poolOptionsFor } from "@/lib/db-pool-options";
import * as schema from "./schema";

// Server-only (spec §8.7): must never be imported from client components.

type Db = ReturnType<typeof createDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Point it at Supabase's transaction pooler (port 6543) in production, or the local test database.",
    );
  }

  // connect_timeout bounds a cold Supabase wake-up, which is the slow part —
  // a warm query here measures ~150 ms. A statement timeout cannot be set from
  // this side: the pooler accepts `connection: { statement_timeout }` as a
  // startup parameter and silently ignores it (measured, still reports 2min).
  const sqlClient = postgres(url, {
    ...poolOptionsFor(url),
    idle_timeout: 20,
    connect_timeout: 5,
  });
  return drizzle(sqlClient, { schema });
}

// Singleton across dev HMR reloads — a new client per reload leaks sockets.
const globalForDb = globalThis as unknown as { __shaderpathDb?: Db };

function getDb(): Db {
  return (globalForDb.__shaderpathDb ??= createDb());
}

// The ambient owner-scoped transaction, if withUser() opened one, plus whose
// it is — an inherited scope is only safe if you can tell who you inherited.
interface UserScope {
  tx: Tx;
  userId: string;
}
const userTx = new AsyncLocalStorage<UserScope>();

// Resolves to the ambient transaction opened by withUser(). This indirection is
// the whole reason RLS was chosen over manual scoping: every existing
// `db.select()...` call site keeps working verbatim and silently becomes
// owner-scoped.
//
// Outside a context it THROWS rather than falling back to the plain client.
// That fallback would use the table-owner connection, and while FORCE closes
// the ownership bypass it does nothing about BYPASSRLS — so a handler that
// forgot withUser() would quietly return every account's rows and look
// perfectly normal in a one-user dev database. Failing loudly is the only way
// that mistake surfaces before production.
//
// Lazy: connecting (or failing on a missing URL) at module scope breaks
// `next build`, which evaluates these modules while collecting page config
// long before any request needs a connection.
export const db = new Proxy({} as Db, {
  get: (_target, prop, receiver) => {
    const scope = userTx.getStore();
    if (!scope) {
      throw new Error(
        "db was accessed outside withUser(). Wrap the handler in withUser(userId, ...), " +
          "or use adminDb() for setup/migration code that must not be owner-scoped.",
      );
    }
    return Reflect.get(scope.tx, prop, receiver);
  },
});

/**
 * The unscoped connection. RLS does not protect anything reached through this,
 * so it is reserved for code that runs outside any request: test fixtures and
 * migrations. Never call it from a route handler or a server action.
 */
export function adminDb(): Db {
  return getDb();
}

/** The owner of the ambient scope, or null outside withUser(). */
export function currentUserId(): string | null {
  return userTx.getStore()?.userId ?? null;
}

/**
 * Runs `fn` with every `db` query scoped to `userId` by Postgres itself.
 *
 * SET LOCAL ROLE leaves the table-owner role, which would otherwise bypass the
 * policies; the jwt claim is what auth.uid() reads. Both are transaction-local,
 * so they cannot leak to the next borrower of a pooled connection.
 *
 * Keep the body short and database-only: under the transaction pooler this
 * holds the single connection, so an HTTP call in here blocks everything else
 * on this instance.
 *
 * ALWAYS await inside the callback. Drizzle's builders resolve the session when
 * the promise is awaited, so `withUser(id, () => db.execute(...))` runs the
 * query after this scope has closed and throws "accessed outside withUser".
 * Write `async () => { await db.execute(...) }`.
 */
export async function withUser<T>(
  userId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE authenticated`);
    await tx.execute(
      sql`SELECT set_config('request.jwt.claims', ${JSON.stringify({
        sub: userId,
        role: "authenticated",
      })}, true)`,
    );
    return userTx.run({ tx, userId }, fn);
  });
}

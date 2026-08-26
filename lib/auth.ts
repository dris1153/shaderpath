import { currentUserId, withUser } from "@/db/client";
import { createClient, supabaseEnv } from "@/lib/supabase/server";

// The single identity gate. `getUser()` is deliberately the only way the rest of
// the app learns who is signed in, so every data path funnels through the same
// verification.

export interface AuthUser {
  id: string;
  email: string | null;
}

/** Thrown when the auth server could not be reached — distinct from signed out. */
export class AuthUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Authentication service unavailable");
    this.name = "AuthUnavailableError";
    this.cause = cause;
  }
}

/**
 * The signed-in user, or null. Uses getUser() rather than getSession(): the
 * latter reads the cookie without verifying it against the auth server, so a
 * forged cookie would pass. Never trust getSession() on the server.
 *
 * Throws AuthUnavailableError when the answer is unknown. Collapsing that into
 * null would hand a signed-in reader an empty payload — a confident "you have
 * completed nothing" in place of "could not read", which is the exact failure
 * the data routes are built to avoid.
 */
export async function getUser(): Promise<AuthUser | null> {
  // No auth configured at all: every reader is a guest. Distinct from an
  // unreachable auth server — this state is obvious in the UI (nobody can sign
  // in) rather than silently mistaking a signed-in reader for an empty account,
  // and it keeps environments without Supabase (e2e) from waiting on a network
  // round-trip per request.
  if (!supabaseEnv()) return null;

  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    throw new AuthUnavailableError(err);
  }

  let result;
  try {
    result = await supabase.auth.getUser();
  } catch (err) {
    throw new AuthUnavailableError(err);
  }

  const { data, error } = result;
  if (error) {
    // A missing/expired/invalid session is a 4xx from GoTrue; anything else
    // (5xx, network) means we simply do not know.
    const status = (error as { status?: number }).status;
    if (status !== undefined && status >= 400 && status < 500) return null;
    if (status === undefined && !data.user) return null;
    throw new AuthUnavailableError(error);
  }
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

/** For server actions, which have no meaningful signed-out behaviour. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

/**
 * Wraps a server action so it runs owner-scoped. Every action in lib/ goes
 * through this: forgetting it means `db` throws on first use (see
 * db/client.ts), which is a loud failure rather than a silent cross-account
 * read.
 */
export function asUser<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return async (...args: A) => {
    // Already scoped by the caller (a route handler that opened withUser):
    // inherit it rather than re-verifying with the auth server and nesting a
    // second transaction.
    //
    // Nothing today opens a scope for anyone but the caller, so inheriting is
    // correct and saves an auth round-trip per action — the flush beacon runs
    // two of these. Outside production the assumption is checked anyway, so a
    // future admin or import path that scoped to someone else fails in
    // development rather than writing under the wrong account in production.
    const ambient = currentUserId();
    if (ambient !== null) {
      if (process.env.NODE_ENV !== "production") {
        const signedIn = await getUser().catch(() => null);
        if (signedIn && signedIn.id !== ambient) {
          throw new Error(
            `Refusing to run a user action inside another user's database scope (signed in as ${signedIn.id}, scope belongs to ${ambient})`,
          );
        }
      }
      return fn(...args);
    }
    const user = await requireUser();
    return withUser(user.id, () => fn(...args));
  };
}

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Deleting the caller's own account. No uuid is accepted from the client: the
// database function reads auth.uid() and takes no argument, so the request
// cannot name anyone else even if this handler were wrong.
export async function DELETE(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Cross-origin not allowed" }, { status: 403 });
  }

  let user;
  try {
    user = await getUser();
  } catch {
    return NextResponse.json({ error: "Auth unavailable" }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  try {
    // The FK cascades from migration 0001 clear all 7 tables with the row in
    // auth.users, so there is no per-table sweep here to fall out of date.
    await withUser(user.id, async () => {
      // await inside the callback, not `() => db.execute(...)`: drizzle
      // resolves the session when the promise is awaited, so returning it
      // unawaited would run the query after withUser closed its scope.
      await db.execute(sql`SELECT public.delete_own_account()`);
    });
  } catch (err) {
    console.warn("account deletion failed:", err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }

  // The session outlives the row it points at; clear it so the browser is not
  // holding a token for an account that no longer exists.
  const supabase = await createClient();
  await supabase.auth.signOut().catch(() => {});

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST, not GET: a link prefetch must never sign someone out.
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client for the auth forms. Sign-in/sign-up run here so the SDK writes
// the session cookies directly; the server then reads them like any other cookie.

let cached: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
    );
  }
  // One instance per tab: each call would otherwise start its own auto-refresh
  // timer and they would race to rotate the same refresh token.
  return (cached ??= createBrowserClient(url, key));
}

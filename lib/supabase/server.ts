import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client. One per request — never cache or share it, the
// cookie store it closes over belongs to a single request.
//
// Only route handlers and server actions may call this: they are the contexts
// Next allows to write cookies, which is what token refresh needs. The root
// layout deliberately does NOT read auth, so lesson pages stay static.

/** null when auth is not configured at all — distinct from "cannot reach it". */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function createClient() {
  const cookieStore = await cookies();
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase auth is not configured");
  const { url, key } = env;

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Thrown when called from a Server Component, where Next forbids
          // writing cookies. Safe to swallow: proxy.ts refreshes the session
          // for page navigations, so the tokens are already fresh here.
        }
      },
    },
  });
}

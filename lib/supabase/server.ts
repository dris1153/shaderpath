import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client. One per request — never cache or share it, the
// cookie store it closes over belongs to a single request.
//
// Only route handlers and server actions may call this: they are the contexts
// Next allows to write cookies, which is what token refresh needs. The root
// layout deliberately does NOT read auth, so lesson pages stay static.

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
    );
  }
  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

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

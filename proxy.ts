import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Refresh the access token and write the rotated cookies onto the response
  // next-intl already produced. Server Components cannot set cookies, so
  // without this pass a session would expire mid-navigation and log the reader
  // out. Route handlers and server actions refresh themselves.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    try {
      // getUser (not getSession) is what actually performs the refresh.
      await supabase.auth.getUser();
    } catch {
      // Refresh is best-effort. Letting this throw would 500 every route the
      // matcher covers — including the 162 static lesson pages, which need no
      // session at all.
    }
  }

  return response;
}

export const config = {
  // Skip api routes, Next internals and files with an extension (static assets)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

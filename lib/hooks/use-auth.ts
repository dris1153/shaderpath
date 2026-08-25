"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/lib/auth";
import { fetchJson } from "./fetch-json";

/**
 * The signed-in user, fetched after hydration. Deliberately client-side: having
 * the root layout read the session would make every lesson page dynamic and
 * undo the static build.
 */
export function useAuth() {
  return useQuery<{ user: AuthUser | null }>({
    queryKey: ["auth-session"],
    queryFn: () => fetchJson<{ user: AuthUser | null }>("/api/auth/session"),
    staleTime: 60_000,
  });
}

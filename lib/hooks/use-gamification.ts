"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GamificationPayload } from "@/lib/api-payloads";
import { useAuth } from "./use-auth";
import { fetchJson } from "./fetch-json";

const KEY = ["gamification"] as const;

/** XP, level and streak for the signed-in user; never fetched for guests. */
export function useGamification() {
  const { data: auth } = useAuth();
  return useQuery<GamificationPayload>({
    queryKey: KEY,
    queryFn: () => fetchJson<GamificationPayload>("/api/gamification"),
    enabled: Boolean(auth?.user),
    staleTime: 60_000,
  });
}

/** Call after anything that earns XP (lesson, exercise, review). */
export function useInvalidateGamification() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: KEY });
}

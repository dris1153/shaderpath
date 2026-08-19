"use client";

import { useQuery } from "@tanstack/react-query";
import type { StatsPayload } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/** Study aggregates for the stats page. */
export function useStats() {
  return useQuery<StatsPayload>({
    queryKey: ["stats"],
    queryFn: () => fetchJson<StatsPayload>("/api/stats"),
    // Aggregated over whole sessions; a minute-old figure is still true.
    staleTime: 60_000,
  });
}

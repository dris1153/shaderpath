"use client";

import { useQuery } from "@tanstack/react-query";
import type { StatsPayload } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/** Study aggregates for the stats page. Pass `enabled: false` for guests: no request, no 401. */
export function useStats(enabled = true) {
  return useQuery<StatsPayload>({
    queryKey: ["stats"],
    queryFn: () => fetchJson<StatsPayload>("/api/stats"),
    enabled,
    // Aggregated over whole sessions; a minute-old figure is still true.
    staleTime: 60_000,
  });
}

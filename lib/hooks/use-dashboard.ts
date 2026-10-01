"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardPayload } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/** The landing page's queue, track map and pace. Pass `enabled: false` for guests. */
export function useDashboard(enabled = true) {
  return useQuery<DashboardPayload>({
    queryKey: ["dashboard"],
    queryFn: () => fetchJson<DashboardPayload>("/api/dashboard"),
    enabled,
    staleTime: 30_000,
  });
}

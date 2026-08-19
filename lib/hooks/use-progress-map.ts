"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProgressMap } from "@/lib/curriculum";
import { fetchJson } from "./fetch-json";

/**
 * One query serves the roadmap, every track card, every module accordion and
 * every lesson row on the page: react-query dedupes on the key, so the tree can
 * call this wherever it needs progress instead of threading a prop through four
 * component layers.
 *
 * `data` is undefined until it resolves, and callers must treat that as unknown
 * rather than empty — an empty map reports 0 % and locks every lesson, which
 * looks exactly like a reader who has done nothing.
 */
export function useProgressMap() {
  return useQuery<{ progress: ProgressMap }>({
    queryKey: ["progress-map"],
    queryFn: () => fetchJson<{ progress: ProgressMap }>("/api/progress-map"),
    // QueryProvider builds a bare QueryClient, whose default staleTime of 0
    // would refetch on every mount — including each card on this page.
    staleTime: 30_000,
  });
}

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LessonState } from "@/lib/lesson-state";

// Returns react-query's result untouched: consumers need `isPending` and
// `isError` separately, because "not recorded yet" and "could not be read" must
// not render the same way. See the plan's governing rule — never show a
// confident wrong value.

export function lessonStateKey(slug: string) {
  return ["lesson-state", slug] as const;
}

export function useLessonState(slug: string) {
  return useQuery<LessonState>({
    queryKey: lessonStateKey(slug),
    queryFn: async () => {
      const res = await fetch(`/api/lesson-state/${slug}`);
      if (!res.ok) throw new Error(`lesson-state ${res.status}`);
      return res.json() as Promise<LessonState>;
    },
    // The QueryClient is constructed bare, so its default staleTime is 0 and
    // every remount would refetch — including moving between lessons.
    staleTime: 30_000,
  });
}

/** Call after a write so the shared state reflects it without a reload. */
export function useInvalidateLessonState(slug: string) {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: lessonStateKey(slug) });
}

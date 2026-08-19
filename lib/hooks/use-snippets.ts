"use client";

import { useQuery } from "@tanstack/react-query";
import type { SnippetSummary } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/**
 * The saved snippets the playground starts from. Lesson exercises embed the
 * same editor without the snippet bar, so they pass `false` and never ask.
 */
export function useSnippets(enabled = true) {
  return useQuery<{ snippets: SnippetSummary[] }>({
    queryKey: ["snippets"],
    queryFn: () => fetchJson<{ snippets: SnippetSummary[] }>("/api/snippets"),
    enabled,
    staleTime: 30_000,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { NotesPayload } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/** Notes and bookmarks for the notes page. Pass `enabled: false` for guests. */
export function useNotes(enabled = true) {
  return useQuery<NotesPayload>({
    queryKey: ["notes"],
    queryFn: () => fetchJson<NotesPayload>("/api/notes"),
    enabled,
    staleTime: 30_000,
  });
}

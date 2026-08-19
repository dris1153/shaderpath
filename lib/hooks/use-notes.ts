"use client";

import { useQuery } from "@tanstack/react-query";
import type { NotesPayload } from "@/lib/api-payloads";
import { fetchJson } from "./fetch-json";

/** Notes and bookmarks for the notes page. */
export function useNotes() {
  return useQuery<NotesPayload>({
    queryKey: ["notes"],
    queryFn: () => fetchJson<NotesPayload>("/api/notes"),
    staleTime: 30_000,
  });
}

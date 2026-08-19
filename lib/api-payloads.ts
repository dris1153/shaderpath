import type { BookmarkRow, NoteRow } from "@/lib/notes-read";
import type { Snippet } from "@/lib/playground";
import type { StatsData } from "@/lib/stats";

// Shapes that cross the JSON boundary between a route handler and its hook.
//
// Deliberately not the Drizzle rows themselves: every table here carries a
// `createdAt` timestamp, typed as Date but delivered as a string, and no screen
// in this group reads it. Picking the columns the UI actually uses keeps the
// declared type honest and stops a future column from leaking out untyped.
export interface NotesPayload {
  notes: Pick<
    NoteRow,
    "id" | "lessonSlug" | "anchorId" | "body" | "selectedText"
  >[];
  bookmarks: Pick<BookmarkRow, "id" | "lessonSlug" | "anchorId" | "label">[];
}

export type SnippetSummary = Pick<
  Snippet,
  "id" | "title" | "fragmentShader" | "forkedFromLesson"
>;

// StatsData is numbers and records of numbers all the way down, so it survives
// JSON as it stands. `now` does not, and it has to travel with the figures: it
// is the clock that bucketed `minutesByDay`, and the heatmap grid has to be
// drawn against that same instant or the columns drift by a day.
export interface StatsPayload {
  stats: StatsData;
  now: string;
}

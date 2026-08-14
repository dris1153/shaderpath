import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";

export type NoteRow = typeof notes.$inferSelect;
export type BookmarkRow = typeof bookmarks.$inferSelect;

export function getAllNotes(): NoteRow[] {
  return db.select().from(notes).orderBy(desc(notes.createdAt)).all();
}

export function getAllBookmarks(): BookmarkRow[] {
  return db.select().from(bookmarks).orderBy(desc(bookmarks.createdAt)).all();
}

export function isLessonBookmarked(slug: LessonSlug): boolean {
  return (
    db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.lessonSlug, slug), isNull(bookmarks.anchorId)))
      .get() !== undefined
  );
}

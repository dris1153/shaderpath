import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes } from "@/db/schema";
import type { LessonSlug } from "@/content/slugs";

export type NoteRow = typeof notes.$inferSelect;
export type BookmarkRow = typeof bookmarks.$inferSelect;

export async function getAllNotes(): Promise<NoteRow[]> {
  return db.select().from(notes).orderBy(desc(notes.createdAt));
}

export async function getAllBookmarks(): Promise<BookmarkRow[]> {
  return db.select().from(bookmarks).orderBy(desc(bookmarks.createdAt));
}

export async function isLessonBookmarked(slug: LessonSlug): Promise<boolean> {
  return (
    db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.lessonSlug, slug), isNull(bookmarks.anchorId)))
      .then((r) => r[0]) !== undefined
  );
}

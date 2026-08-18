"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { bookmarks, notes } from "@/db/schema";
import { LESSON_SLUGS } from "@/content/slugs";

// User note/bookmark writes — validated, size-capped, stored and rendered as
// plain text (never through the MDX pipeline).

const VALID_SLUGS = new Set<string>(LESSON_SLUGS);
const MAX_BODY = 8 * 1024;
const MAX_META = 300;

function assertSlug(slug: string) {
  if (!VALID_SLUGS.has(slug)) throw new Error(`Unknown lesson slug: ${slug}`);
}

const trimTo = (v: string | null | undefined, max: number) =>
  v ? v.slice(0, max) : null;

export async function createNote(input: {
  lessonSlug: string;
  anchorId?: string | null;
  selectedText?: string | null;
  body: string;
}): Promise<number> {
  assertSlug(input.lessonSlug);
  const body = input.body.trim();
  if (!body || body.length > MAX_BODY) throw new Error("Bad note body");

  const row = await db
    .insert(notes)
    .values({
      lessonSlug: input.lessonSlug,
      anchorId: trimTo(input.anchorId, MAX_META),
      selectedText: trimTo(input.selectedText, MAX_META),
      body,
      createdAt: new Date(),
    })
    .returning({ id: notes.id })
    .then((r) => r[0]);
  if (!row) throw new Error("insert returned no row");
  return row.id;
}

export async function updateNote(id: number, body: string) {
  const trimmed = body.trim();
  if (!Number.isInteger(id) || !trimmed || trimmed.length > MAX_BODY) {
    throw new Error("Bad note update");
  }
  await db.update(notes).set({ body: trimmed }).where(eq(notes.id, id));
}

export async function deleteNote(id: number) {
  if (!Number.isInteger(id)) throw new Error("Bad note id");
  await db.delete(notes).where(eq(notes.id, id));
}

/** Toggle; returns the new state. anchorId=null means the whole lesson. */
export async function toggleBookmark(input: {
  lessonSlug: string;
  anchorId?: string | null;
  label?: string | null;
}): Promise<boolean> {
  assertSlug(input.lessonSlug);
  const anchorId = trimTo(input.anchorId, MAX_META);

  const where = anchorId
    ? and(eq(bookmarks.lessonSlug, input.lessonSlug), eq(bookmarks.anchorId, anchorId))
    : and(eq(bookmarks.lessonSlug, input.lessonSlug), isNull(bookmarks.anchorId));

  const existing = await db.select().from(bookmarks).where(where).then((r) => r[0]);
  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return false;
  }
  await db.insert(bookmarks)
    .values({
      lessonSlug: input.lessonSlug,
      anchorId,
      label: trimTo(input.label, MAX_META),
      createdAt: new Date(),
    });
  return true;
}

export async function deleteBookmark(id: number) {
  if (!Number.isInteger(id)) throw new Error("Bad bookmark id");
  await db.delete(bookmarks).where(eq(bookmarks.id, id));
}

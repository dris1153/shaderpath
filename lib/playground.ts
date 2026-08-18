"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { playgroundSnippets } from "@/db/schema";
import { LESSON_SLUGS } from "@/content/slugs";

export type Snippet = typeof playgroundSnippets.$inferSelect;

const MAX_SOURCE_BYTES = 64 * 1024;
const MAX_SNIPPETS = 500;
const VALID_SLUGS = new Set<string>(LESSON_SLUGS);

function validate(title: string, fragmentShader: string) {
  const trimmed = title.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    throw new Error("Title must be 1–100 characters");
  }
  if (new TextEncoder().encode(fragmentShader).length > MAX_SOURCE_BYTES) {
    throw new Error("Shader source too large");
  }
  return trimmed;
}

export async function listSnippets(): Promise<Snippet[]> {
  return db
    .select()
    .from(playgroundSnippets)
    .orderBy(desc(playgroundSnippets.createdAt));
}

export async function saveSnippet(input: {
  id?: number;
  title: string;
  fragmentShader: string;
  forkedFromLesson?: string | null;
}): Promise<Snippet[]> {
  const title = validate(input.title, input.fragmentShader);
  const forked =
    input.forkedFromLesson && VALID_SLUGS.has(input.forkedFromLesson)
      ? input.forkedFromLesson
      : null;

  if (input.id !== undefined) {
    if (!Number.isInteger(input.id)) throw new Error("Bad snippet id");
    await db.update(playgroundSnippets)
      .set({ title, fragmentShader: input.fragmentShader })
      .where(eq(playgroundSnippets.id, input.id));
  } else {
    const count = (await db.select().from(playgroundSnippets)).length;
    if (count >= MAX_SNIPPETS) throw new Error("Snippet limit reached");
    await db.insert(playgroundSnippets)
      .values({
        title,
        fragmentShader: input.fragmentShader,
        forkedFromLesson: forked,
        createdAt: new Date(),
      });
  }
  return listSnippets();
}

export async function deleteSnippet(id: number): Promise<Snippet[]> {
  if (!Number.isInteger(id)) throw new Error("Bad snippet id");
  await db.delete(playgroundSnippets).where(eq(playgroundSnippets.id, id));
  return listSnippets();
}

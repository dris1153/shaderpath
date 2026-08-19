import { NextResponse } from "next/server";
import type { NotesPayload } from "@/lib/api-payloads";
import { getAllBookmarks, getAllNotes } from "@/lib/notes-read";

// Every note and bookmark, for the notes page. The rows are mapped down rather
// than returned whole: `satisfies` would type-check a narrowed payload while
// still shipping `createdAt` over the wire, so the strip has to be real.

export async function GET() {
  try {
    // Sequential, not Promise.all: against Supabase's transaction pooler the
    // pool holds a single connection, and issuing concurrent queries on it
    // wedges that connection for the lifetime of the process — every later
    // request, on any route, then hangs until the platform kills it.
    const notes = await getAllNotes();
    const bookmarks = await getAllBookmarks();
    return NextResponse.json({
      notes: notes.map((n) => ({
        id: n.id,
        lessonSlug: n.lessonSlug,
        anchorId: n.anchorId,
        body: n.body,
        selectedText: n.selectedText,
      })),
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        lessonSlug: b.lessonSlug,
        anchorId: b.anchorId,
        label: b.label,
      })),
    } satisfies NotesPayload);
  } catch (err) {
    // An empty 200 would render "no notes yet" to a reader who has plenty.
    console.warn("notes read failed:", err);
    return NextResponse.json({ error: "Notes unavailable" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { LESSON_SLUGS, type LessonSlug } from "@/content/slugs";
import { getAttemptsForLesson } from "@/lib/exercises-read";
import type { LessonState } from "@/lib/lesson-state";
import { isLessonBookmarked } from "@/lib/notes-read";
import { getProgressMap, getProgressRow } from "@/lib/progress-read";

// The lesson page's per-user state, in one request. The page renders from
// content files and fetches this after hydration, so a database outage costs
// the reader their progress markers rather than the lesson itself.

const VALID = new Set<string>(LESSON_SLUGS);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonSlug: string }> },
) {
  const { lessonSlug } = await params;
  if (!VALID.has(lessonSlug)) {
    return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  }
  const slug = lessonSlug as LessonSlug;

  try {
    // Sequential, not Promise.all: the pool holds a single connection against
    // Supabase's transaction pooler, and concurrent queries on it wedge that
    // connection permanently — the whole instance stops answering afterwards.
    const row = await getProgressRow(slug);
    const bookmarked = await isLessonBookmarked(slug);
    const attemptRows = await getAttemptsForLesson(slug);
    const progress = await getProgressMap();

    const attempts: LessonState["attempts"] = {};
    for (const a of attemptRows) {
      attempts[a.exerciseId] = {
        status: a.status,
        hintsRevealed: a.hintsRevealed,
        solutionRevealed: a.solutionRevealed,
        userCode: a.userCode,
        checklistState: Array.isArray(a.checklistState) ? a.checklistState : null,
      };
    }

    const body: LessonState = {
      row: row
        ? {
            status: row.status,
            confidence: row.confidence,
            scrollPercent: row.scrollPercent,
          }
        : null,
      bookmarked,
      attempts,
      progress,
    };
    return NextResponse.json(body);
  } catch (err) {
    // Fail loudly on purpose. Returning an empty 200 would be indistinguishable
    // from a reader who has never opened this lesson, and every consumer needs
    // to tell "nothing recorded" from "could not read".
    console.warn(`lesson-state read failed for ${slug}:`, err);
    return NextResponse.json({ error: "Lesson state unavailable" }, { status: 503 });
  }
}

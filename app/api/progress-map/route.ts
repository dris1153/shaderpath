import { NextResponse } from "next/server";
import type { ProgressMap } from "@/lib/curriculum";
import { getProgressMap } from "@/lib/progress-read";

// The completion status of every lesson, shared by the roadmap and each track
// page. Those pages render their curriculum from content files and fetch this
// afterwards, so neither of them reads the database while rendering.
//
// ProgressMap is Partial<Record<LessonSlug, ProgressStatus>> — strings to
// strings, so it needs no JSON-safe restatement. It is the only payload in this
// group that is already safe as it stands.

export async function GET() {
  try {
    const progress = await getProgressMap();
    return NextResponse.json({ progress } satisfies { progress: ProgressMap });
  } catch (err) {
    // Loud on purpose: an empty 200 is indistinguishable from a reader who has
    // completed nothing, and the pages render those two states differently.
    console.warn("progress-map read failed:", err);
    return NextResponse.json({ error: "Progress unavailable" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
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
    // Signed out is not a failure here: the roadmap and track pages are public.
    // `authenticated` keeps "no account" distinguishable from "account with no
    // progress" — the two render differently. An auth service that cannot be
    // reached is a third state again, and getUser throws for it so the catch
    // below answers 503 instead of an empty map.
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ progress: {}, authenticated: false });
    }
    return await withUser(user.id, async () => {
      const progress = await getProgressMap();
      return NextResponse.json({ progress, authenticated: true });
    });
  } catch (err) {
    // Loud on purpose: an empty 200 is indistinguishable from a reader who has
    // completed nothing, and the pages render those two states differently.
    console.warn("progress-map read failed:", err);
    return NextResponse.json({ error: "Progress unavailable" }, { status: 503 });
  }
}

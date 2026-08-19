import { NextResponse } from "next/server";
import type { DashboardPayload } from "@/lib/api-payloads";
import { overallCompletion } from "@/lib/curriculum";
import { buildQueue, getTrackMap, getWeeklyPace } from "@/lib/dashboard-read";
import { getProgressMap } from "@/lib/progress-read";

// Everything the landing page shows below its header. Four reads reach for the
// database independently, and they run one after another on purpose: the pool
// holds a single connection against Supabase's transaction pooler, and
// concurrent queries on it wedge that connection for good.

export async function GET() {
  try {
    const now = new Date();
    const progress = await getProgressMap();
    const queue = await buildQueue(now, progress);
    const focus = queue.find((i) => i.kind === "continue")?.lessonSlug;
    return NextResponse.json({
      stats: overallCompletion(progress),
      queue,
      focus,
      map: await getTrackMap(progress, focus),
      pace: await getWeeklyPace(now),
    } satisfies DashboardPayload);
  } catch (err) {
    // A 200 with an empty map would render a confident 0 % and "nothing due",
    // which is exactly what wiped progress looks like.
    console.warn("dashboard read failed:", err);
    return NextResponse.json({ error: "Dashboard unavailable" }, { status: 503 });
  }
}

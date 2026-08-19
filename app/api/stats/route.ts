import { NextResponse } from "next/server";
import type { StatsPayload } from "@/lib/api-payloads";
import { getStats } from "@/lib/stats";

export async function GET() {
  try {
    const now = new Date();
    const stats = await getStats(now);
    return NextResponse.json({
      stats,
      now: now.toISOString(),
    } satisfies StatsPayload);
  } catch (err) {
    console.warn("stats read failed:", err);
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}

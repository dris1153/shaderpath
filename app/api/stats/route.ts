import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import type { StatsPayload } from "@/lib/api-payloads";
import { getStats } from "@/lib/stats";

export async function GET() {
  try {
    // Inside the try on purpose: getUser throws when the auth service cannot be
    // reached, and that must answer 503 like any other unavailable read — never
    // an empty 200, which reads as "you have done nothing".
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }
    const now = new Date();
    return await withUser(user.id, async () => {
      const stats = await getStats(now);
      return NextResponse.json({
        stats,
        now: now.toISOString(),
      } satisfies StatsPayload);
    });
  } catch (err) {
    console.warn("stats read failed:", err);
    return NextResponse.json({ error: "Stats unavailable" }, { status: 503 });
  }
}

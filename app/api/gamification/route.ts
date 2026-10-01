import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import type { GamificationPayload } from "@/lib/api-payloads";
import { getGamification } from "@/lib/xp-read";

export async function GET() {
  try {
    // Inside the try: an unreachable auth service answers 503, never a 200
    // that would read as zero XP.
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }
    return await withUser(user.id, async () => {
      const data = await getGamification(new Date());
      return NextResponse.json(data satisfies GamificationPayload);
    });
  } catch (err) {
    console.warn("gamification read failed:", err);
    return NextResponse.json({ error: "Gamification unavailable" }, { status: 503 });
  }
}

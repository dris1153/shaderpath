import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import { serialize } from "@/lib/export-import";

// GET-only, same-origin download — never writes anything (spec §Security).
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }
    const payload = await withUser(user.id, () => serialize());
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="shaderpath-progress-${date}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

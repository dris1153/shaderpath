import { NextResponse } from "next/server";
import { serialize } from "@/lib/export-import";

// GET-only, same-origin download — never writes anything (spec §Security).
export async function GET() {
  try {
    const payload = serialize();
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

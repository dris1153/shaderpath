import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import type { SnippetSummary } from "@/lib/api-payloads";
import { listSnippets } from "@/lib/playground";

// The playground's saved snippets. Saving and deleting still go through the
// server actions in lib/playground.ts, which return the full list themselves —
// this endpoint only supplies the initial one the page used to render with.

export async function GET() {
  try {
    // Inside the try on purpose: getUser throws when the auth service cannot be
    // reached, and that must answer 503 like any other unavailable read — never
    // an empty 200, which reads as "you have done nothing".
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }
    return await withUser(user.id, async () => {
      const snippets = await listSnippets();
      return NextResponse.json({
      snippets: snippets.map((s) => ({
        id: s.id,
        title: s.title,
        fragmentShader: s.fragmentShader,
        forkedFromLesson: s.forkedFromLesson,
      })),
      } satisfies { snippets: SnippetSummary[] });
    });
  } catch (err) {
    console.warn("snippets read failed:", err);
    return NextResponse.json({ error: "Snippets unavailable" }, { status: 503 });
  }
}

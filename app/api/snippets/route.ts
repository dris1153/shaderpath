import { NextResponse } from "next/server";
import type { SnippetSummary } from "@/lib/api-payloads";
import { listSnippets } from "@/lib/playground";

// The playground's saved snippets. Saving and deleting still go through the
// server actions in lib/playground.ts, which return the full list themselves —
// this endpoint only supplies the initial one the page used to render with.

export async function GET() {
  try {
    const snippets = await listSnippets();
    return NextResponse.json({
      snippets: snippets.map((s) => ({
        id: s.id,
        title: s.title,
        fragmentShader: s.fragmentShader,
        forkedFromLesson: s.forkedFromLesson,
      })),
    } satisfies { snippets: SnippetSummary[] });
  } catch (err) {
    console.warn("snippets read failed:", err);
    return NextResponse.json({ error: "Snippets unavailable" }, { status: 503 });
  }
}

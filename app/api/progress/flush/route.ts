import {
  closeStudySession,
  saveReadingProgress,
} from "@/lib/progress";

// sendBeacon target for pagehide flush — without this, the last ≤5s of every
// reading session would be lost (phase-03 key insight). Same-origin only; the
// payload is re-validated inside the progress actions.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    slug?: string;
    scrollPercent?: number;
    deltaSeconds?: number;
    sessionId?: number;
    sessionSeconds?: number;
  } | null;

  if (!body || typeof body.slug !== "string") {
    return new Response(null, { status: 400 });
  }

  try {
    await saveReadingProgress({
      slug: body.slug,
      scrollPercent: Number(body.scrollPercent) || 0,
      deltaSeconds: Number(body.deltaSeconds) || 0,
    });
    if (typeof body.sessionId === "number") {
      await closeStudySession(body.sessionId, Number(body.sessionSeconds) || 0);
    }
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, { status: 204 });
}

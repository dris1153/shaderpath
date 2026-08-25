import { NextResponse } from "next/server";
import { withUser } from "@/db/client";
import { getUser } from "@/lib/auth";
import {
  apply,
  validate,
  SchemaVersionError,
  ValidationError,
} from "@/lib/export-import";

// Import is the only path that writes arbitrary rows — same-origin, JSON
// content-type, and size-capped before the payload is even parsed (spec
// §Security Considerations). Field-level validation happens in validate().
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let user;
  try {
    user = await getUser();
  } catch {
    return NextResponse.json({ error: "Auth unavailable" }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed" },
      { status: 403 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 },
    );
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    return NextResponse.json(
      { error: "Import file too large (max 20MB)" },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyObj =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  const mode = bodyObj?.mode;
  if (mode !== "replace" && mode !== "merge") {
    return NextResponse.json(
      { error: 'mode must be "replace" or "merge"' },
      { status: 400 },
    );
  }

  try {
    const payload = validate(bodyObj?.data);
    // await, not a bare call: without it the promise escaped this try block, so
    // a failed import answered 200 and `counts` serialised as {}.
    const counts = await withUser(user.id, () => apply(payload, mode));
    return NextResponse.json({ counts });
  } catch (err) {
    if (err instanceof SchemaVersionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Import failed" }, { status: 400 });
  }
}

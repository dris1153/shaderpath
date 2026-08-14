import { NextResponse } from "next/server";
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
    const counts = apply(payload, mode);
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

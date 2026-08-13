import { PRELUDE_LINES } from "./assemble";

export interface GlslError {
  /** 1-based line in the USER's source (prelude offset already removed) */
  line: number;
  message: string;
  severity: "error" | "warning";
}

// Known info-log shapes:
//   ANGLE/Chrome:  ERROR: 0:12: 'foo' : syntax error
//   Firefox:       ERROR: 0:12: 'foo' : syntax error  (same family)
//   Safari:        ERROR: 0:12: ...   / sometimes "ERROR: 2 compilation errors."
const LINE_RE = /^(ERROR|WARNING):\s*\d+:(\d+)\s*:?\s*(.*)$/;

export function parseGlslLog(
  log: string,
  userLineCount: number,
): GlslError[] {
  const errors: GlslError[] = [];
  for (const raw of log.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = LINE_RE.exec(line);
    if (!m || !m[1] || !m[2]) continue;
    const compiledLine = Number(m[2]);
    errors.push({
      // Clamp: prelude-internal errors (bad uniform redefinition etc.) → line 1
      line: Math.min(
        Math.max(compiledLine - PRELUDE_LINES, 1),
        Math.max(userLineCount, 1),
      ),
      message: m[3]?.trim() || line,
      severity: m[1] === "WARNING" ? "warning" : "error",
    });
  }

  // Fallback: an unparseable non-empty log must still reach the user (§11.5)
  if (errors.length === 0 && log.trim().length > 0) {
    errors.push({ line: 1, message: log.trim(), severity: "error" });
  }
  return errors;
}

import { describe, expect, it } from "vitest";
import { FRAG_PRELUDE, PRELUDE_LINES } from "@/lib/glsl/assemble";
import { parseGlslLog } from "@/lib/glsl/parse-error";

describe("PRELUDE_LINES", () => {
  it("equals the actual number of prelude lines", () => {
    expect(PRELUDE_LINES).toBe(FRAG_PRELUDE.split("\n").length - 1);
    expect(PRELUDE_LINES).toBeGreaterThanOrEqual(6);
  });
});

describe("parseGlslLog", () => {
  const shift = (userLine: number) => userLine + PRELUDE_LINES;

  it("parses the ANGLE/Chrome format and shifts the prelude offset", () => {
    const log = `ERROR: 0:${shift(3)}: 'vec4' : syntax error\n`;
    const errors = parseGlslLog(log, 10);
    expect(errors).toEqual([
      { line: 3, message: "'vec4' : syntax error", severity: "error" },
    ]);
  });

  it("maps an error on the user's first line exactly (boundary)", () => {
    const log = `ERROR: 0:${shift(1)}: ';' : missing`;
    expect(parseGlslLog(log, 5)[0]?.line).toBe(1);
  });

  it("maps an error on the user's last line exactly", () => {
    const log = `ERROR: 0:${shift(5)}: unexpected EOF`;
    expect(parseGlslLog(log, 5)[0]?.line).toBe(5);
  });

  it("clamps prelude-internal errors to line 1 instead of going negative", () => {
    const errors = parseGlslLog("ERROR: 0:2: redefinition of 'uTime'", 5);
    expect(errors[0]?.line).toBe(1);
  });

  it("clamps beyond-the-end lines to the user's last line", () => {
    const log = `ERROR: 0:${shift(99)}: unexpected EOF`;
    expect(parseGlslLog(log, 5)[0]?.line).toBe(5);
  });

  it("collects multiple errors and warnings", () => {
    const log = [
      `WARNING: 0:${shift(1)}: implicit cast`,
      `ERROR: 0:${shift(2)}: 'foo' : undeclared identifier`,
      "",
    ].join("\n");
    const errors = parseGlslLog(log, 10);
    expect(errors).toHaveLength(2);
    expect(errors[0]?.severity).toBe("warning");
    expect(errors[1]?.severity).toBe("error");
  });

  it("falls back to the raw log when the format is unknown (§11.5: always show something)", () => {
    const errors = parseGlslLog("Compile failed: internal driver whimsy", 5);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("driver whimsy");
    expect(errors[0]?.line).toBe(1);
  });

  it("returns nothing for an empty log", () => {
    expect(parseGlslLog("", 5)).toEqual([]);
    expect(parseGlslLog("\n\n", 5)).toEqual([]);
  });
});

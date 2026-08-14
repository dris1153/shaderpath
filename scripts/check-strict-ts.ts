import fs from "node:fs";
import path from "node:path";

// §11.8 gate: zero @ts-ignore / @ts-expect-error / any-escapes in real
// source. tests/ is scanned too but only WARNS — pre-existing test-side
// mocks/casts aren't this guard's hard-fail contract.

const ROOT = process.cwd();
const FAIL_DIRS = ["app", "components", "lib", "scripts", "content"];
const WARN_DIRS = ["tests"];

interface Violation {
  file: string;
  line: number;
  kind: string;
  text: string;
}

// `//`-anchored: mentioning "@ts-ignore" in prose/string content (lesson
// copy explaining why NOT to use it) is inert text, not a suppression.
const IGNORE_RE = /\/\/\s*@ts-ignore\b/;
const EXPECT_ERROR_RE = /\/\/\s*@ts-expect-error\b/;
// `\b`-anchored around "any" so "many"/"company"/"bias anything" never match.
const COLON_ANY_RE = /:\s*any\b/;
const AS_ANY_RE = /\bas\s+any\b/;
const ANGLE_ANY_RE = /<any>/;

const CHECKS: { re: RegExp; kind: string }[] = [
  { re: IGNORE_RE, kind: "@ts-ignore" },
  { re: EXPECT_ERROR_RE, kind: "@ts-expect-error" },
  { re: COLON_ANY_RE, kind: ": any" },
  { re: AS_ANY_RE, kind: "as any" },
  { re: ANGLE_ANY_RE, kind: "<any>" },
];

// This file's own pattern literals (e.g. the string "as any") would
// otherwise flag themselves — they're detector data, not real `any` usage.
const SELF = path.resolve(__filename);

function walk(dir: string, onFile: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else if (
      entry.isFile() &&
      /\.tsx?$/.test(entry.name) &&
      path.resolve(full) !== SELF
    ) {
      onFile(full);
    }
  }
}

function scanFile(file: string): Violation[] {
  const violations: Violation[] = [];
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((lineText, i) => {
    for (const { re, kind } of CHECKS) {
      if (re.test(lineText)) {
        violations.push({ file, line: i + 1, kind, text: lineText.trim() });
      }
    }
  });
  return violations;
}

function report(list: Violation[]) {
  for (const v of list) {
    console.log(`  ${path.relative(ROOT, v.file)}:${v.line}  [${v.kind}]  ${v.text}`);
  }
}

const failures: Violation[] = [];
const warnings: Violation[] = [];

for (const dir of FAIL_DIRS) {
  walk(path.join(ROOT, dir), (file) => failures.push(...scanFile(file)));
}
for (const dir of WARN_DIRS) {
  walk(path.join(ROOT, dir), (file) => warnings.push(...scanFile(file)));
}

if (warnings.length > 0) {
  console.warn(`WARN check:ts-strict — ${warnings.length} occurrence(s) in tests/ (not blocking):`);
  report(warnings);
}

if (failures.length > 0) {
  console.error(
    `\nERROR check:ts-strict — ${failures.length} violation(s) in ${FAIL_DIRS.join(", ")}:`,
  );
  report(failures);
  process.exit(1);
}

console.log(
  `check:ts-strict: OK — 0 violations in ${FAIL_DIRS.join(", ")} (${warnings.length} warning(s) in tests/)`,
);

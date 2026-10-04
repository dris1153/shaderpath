import fs from "node:fs";
import path from "node:path";
import { validateStrings } from "../src/scene/timing";
import { lessonSource, parseArgs, ROOT } from "./remotion";
import type { Script } from "./script-parse";
import { hasOutro, loadScript, OUTRO_DIR } from "./script-load";
import { symbolWarnings } from "./video-lint-symbols";

// pnpm video:lint <slug>
// Every language shares the English picture: other scripts must keep English's
// scenes in the same order (their cues are ignored), and strings.en.json is the
// only strings file. The scene code's useString / useCue literals must exist in
// the English sources. Runs before any paid TTS call.
const [slug] = parseArgs("pnpm video:lint <slug>", 1) as [string];
const src = lessonSource(slug);
const errors: string[] = [];
const warnings: string[] = [];

const scripts = new Map<string, Script>();
for (const file of fs.readdirSync(src)) {
  const locale = /^script\.([a-zA-Z-]+)\.md$/.exec(file)?.[1];
  if (!locale) continue;
  try {
    scripts.set(locale, loadScript(src, locale));
  } catch (error) {
    errors.push(`${file}: ${(error as Error).message}`);
  }
}
const base = scripts.get("en");
if (!base && !errors.length) errors.push("no script.en.md");

for (const [locale, script] of scripts) {
  if (!base || script === base) continue;
  const ids = script.scenes.map((s) => s.id).join(", ");
  const baseIds = base.scenes.map((s) => s.id).join(", ");
  if (ids !== baseIds) errors.push(`script.${locale}.md scenes [${ids}] differ from English [${baseIds}]`);
}

const readCode = (dir: string) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { recursive: true, encoding: "utf8" })
        .filter((f) => /\.tsx?$/.test(f))
        .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
        .join("\n")
    : "";
// With the shared outro appended, its code and strings are checked with the lesson's.
const withOutro = base ? hasOutro(base) : false;
const code = readCode(path.join(ROOT, "src", "lessons", slug)) + (withOutro ? `\n${readCode(OUTRO_DIR)}` : "");
const literals = (fn: string) => new Set([...code.matchAll(new RegExp(`${fn}\\(\\s*"([^"]+)"`, "g"))].map((m) => m[1]!));

// Every key the code uses must exist; a key nothing uses is a warning.
const usedKeys = literals("useString");
try {
  const readStrings = (dir: string) => validateStrings(JSON.parse(fs.readFileSync(path.join(dir, "strings.en.json"), "utf8")));
  const lessonStrings = readStrings(src);
  const keys = [...Object.keys(lessonStrings), ...(withOutro ? Object.keys(readStrings(OUTRO_DIR)) : [])];
  warnings.push(...symbolWarnings(lessonStrings));
  for (const key of usedKeys) if (!keys.includes(key)) errors.push(`strings.en.json: missing "${key}" (used by the scene code)`);
  for (const key of keys) if (!usedKeys.has(key)) warnings.push(`strings.en.json: "${key}" is not used by the scene code`);
} catch (error) {
  errors.push(`strings.en.json: ${(error as Error).message}`);
}
for (const file of fs.readdirSync(src)) {
  if (/^strings\.(?!en\.)[a-zA-Z-]+\.json$/.test(file)) warnings.push(`${file} is unused: every language shows the English picture's strings`);
}

if (base) {
  const cues = new Set(base.scenes.flatMap((s) => s.words.flatMap((w) => w.cues)));
  for (const cue of literals("useCue")) {
    if (!cues.has(cue)) errors.push(`scene code uses cue "${cue}", which no scene in script.en.md defines`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`video:lint ${slug}: ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length) process.exitCode = 1;

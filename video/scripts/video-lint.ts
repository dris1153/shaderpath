import fs from "node:fs";
import path from "node:path";
import { validateStrings } from "../src/scene/timing";
import { lessonSource, parseArgs, ROOT } from "./remotion";
import { parseScript, type Script } from "./script-parse";

// pnpm video:lint <slug>
// Every locale must match English: the same scenes in the same order, the same
// cues per scene, the same strings keys. The scene code's useString / useCue
// literals must exist in the sources. Runs before any paid TTS call.
const [slug] = parseArgs("pnpm video:lint <slug>", 1) as [string];
const src = lessonSource(slug);
const errors: string[] = [];
const warnings: string[] = [];

const scripts = new Map<string, Script>();
for (const file of fs.readdirSync(src)) {
  const locale = /^script\.([a-zA-Z-]+)\.md$/.exec(file)?.[1];
  if (!locale) continue;
  try {
    scripts.set(locale, parseScript(fs.readFileSync(path.join(src, file), "utf8")));
  } catch (error) {
    errors.push(`${file}: ${(error as Error).message}`);
  }
}
const base = scripts.get("en");
if (!base && !errors.length) errors.push("no script.en.md");

const cuesOf = (script: Script) =>
  script.scenes.map((s) => `${s.id}: ${s.words.flatMap((w) => w.cues).sort().join(", ")}`);
for (const [locale, script] of scripts) {
  if (!base || script === base) continue;
  const ids = script.scenes.map((s) => s.id).join(", ");
  const baseIds = base.scenes.map((s) => s.id).join(", ");
  if (ids !== baseIds) errors.push(`script.${locale}.md scenes [${ids}] differ from English [${baseIds}]`);
  else {
    const [mine, theirs] = [cuesOf(script), cuesOf(base)];
    mine.forEach((line, i) => {
      if (line !== theirs[i]) errors.push(`script.${locale}.md cues "${line}" differ from English "${theirs[i]}"`);
    });
  }
}

const codeDir = path.join(ROOT, "src", "lessons", slug);
const code = fs.existsSync(codeDir)
  ? fs.readdirSync(codeDir, { recursive: true, encoding: "utf8" })
      .filter((f) => /\.tsx?$/.test(f))
      .map((f) => fs.readFileSync(path.join(codeDir, f), "utf8"))
      .join("\n")
  : "";
const literals = (fn: string) => new Set([...code.matchAll(new RegExp(`${fn}\\(\\s*"([^"]+)"`, "g"))].map((m) => m[1]!));

// Every key the code uses must exist in every locale; a key nothing uses is a warning.
const usedKeys = literals("useString");
for (const locale of scripts.keys()) {
  const file = `strings.${locale}.json`;
  let keys: string[];
  try {
    keys = Object.keys(validateStrings(JSON.parse(fs.readFileSync(path.join(src, file), "utf8"))));
  } catch (error) {
    errors.push(`${file}: ${(error as Error).message}`);
    continue;
  }
  for (const key of usedKeys) if (!keys.includes(key)) errors.push(`${file}: missing "${key}" (used by the scene code)`);
  for (const key of keys) if (!usedKeys.has(key)) warnings.push(`${file}: "${key}" is not used by the scene code`);
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

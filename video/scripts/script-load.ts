import fs from "node:fs";
import path from "node:path";
import { parseScript, type Script } from "./script-parse";

// The shared like/subscribe outro (src/outro/) rides on every lesson whose
// script front matter says `outro: true`. It is appended here, before voicing,
// so it gets timing, subtitles, the --fit dub and QC like any other scene, and
// its identical text is voiced once per language and then served from the cache.
export const OUTRO_ID = "outro";
export const OUTRO_DIR = path.resolve(import.meta.dirname, "..", "src", "outro");

export function hasOutro(script: Script): boolean {
  const flag = script.meta.outro;
  if (flag !== undefined && flag !== "true" && flag !== "false") throw new Error(`outro: ${flag} must be true or false`);
  return flag === "true";
}

export function loadScript(srcDir: string, locale: string, outroDir = OUTRO_DIR): Script {
  const name = `script.${locale}.md`;
  const script = parseScript(fs.readFileSync(path.join(srcDir, name), "utf8"));
  // Metadata and the site treat a scene "outro" as the shared one, flag or not.
  if (script.scenes.some((s) => s.id === OUTRO_ID)) {
    throw new Error(`${name}: the scene id "${OUTRO_ID}" is reserved; "outro: true" appends the shared outro`);
  }
  if (!hasOutro(script)) return script;
  const file = path.join(outroDir, name);
  if (!fs.existsSync(file)) throw new Error(`${name}: "outro: true" but there is no shared outro for "${locale}" (${file})`);
  const outro = parseScript(fs.readFileSync(file, "utf8"));
  if (outro.scenes.length !== 1 || outro.scenes[0]!.id !== OUTRO_ID) {
    throw new Error(`${file}: must hold exactly one scene "${OUTRO_ID}"`);
  }
  return { ...script, scenes: [...script.scenes, outro.scenes[0]!] };
}

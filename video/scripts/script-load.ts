import fs from "node:fs";
import path from "node:path";
import { parseScript, type Script } from "./script-parse";

// `outro: true` in the front matter means the shared clip in content/shared/outro is joined after the
// lesson when it is packaged (outro-join.ts); the script itself never carries the outro.
export function hasOutro(script: Script): boolean {
  const flag = script.meta.outro;
  if (flag !== undefined && flag !== "true" && flag !== "false") throw new Error(`outro: ${flag} must be true or false`);
  return flag === "true";
}

export function loadScript(srcDir: string, locale: string): Script {
  const script = parseScript(fs.readFileSync(path.join(srcDir, `script.${locale}.md`), "utf8"));
  hasOutro(script); // throws on a flag that is not true or false
  return script;
}

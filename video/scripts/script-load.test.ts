import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { hasOutro, loadScript } from "./script-load";

function dirWith(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "script-load-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

const lesson = (front: string) => `---\nslug: x\n${front}---\n\n## scene: hook\nHello there.\n`;

test("outro: true is a flag only: the script is exactly what it says", () => {
  const script = loadScript(dirWith({ "script.en.md": lesson("outro: true\n") }), "en");
  assert.deepEqual(script.scenes.map((s) => s.id), ["hook"]);
  assert.equal(hasOutro(script), true);
});

test("without the flag there is no outro", () => {
  assert.equal(hasOutro(loadScript(dirWith({ "script.en.md": lesson("") }), "en")), false);
  assert.equal(hasOutro(loadScript(dirWith({ "script.en.md": lesson("outro: false\n") }), "en")), false);
});

test("a misspelt flag is an error, not a silent skip", () => {
  const src = dirWith({ "script.en.md": lesson("outro: yes\n") });
  assert.throws(() => loadScript(src, "en"), /must be true or false/);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { loadScript, OUTRO_DIR } from "./script-load";

function dirWith(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "script-load-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

const lesson = (front: string, scenes = "## scene: hook\nHello there.\n") => `---\nslug: x\n${front}---\n\n${scenes}`;
const outro = dirWith({ "script.en.md": "## scene: outro\n{like}Like it.\n# hold 30\n" });

test("without the flag the script is exactly what it says", () => {
  const script = loadScript(dirWith({ "script.en.md": lesson("") }), "en", outro);
  assert.deepEqual(script.scenes.map((s) => s.id), ["hook"]);
});

test("outro: true appends the shared outro as the last scene", () => {
  const script = loadScript(dirWith({ "script.en.md": lesson("outro: true\n") }), "en", outro);
  assert.deepEqual(script.scenes.map((s) => s.id), ["hook", "outro"]);
  const last = script.scenes.at(-1)!;
  assert.equal(last.hold, 30);
  assert.deepEqual(last.words[0]!.cues, ["like"]);
});

test("the outro scene id is reserved, with or without the flag", () => {
  for (const front of ["outro: true\n", ""]) {
    const src = dirWith({ "script.en.md": lesson(front, "## scene: outro\nMine.\n") });
    assert.throws(() => loadScript(src, "en", outro), /scene id "outro" is reserved/);
  }
});

test("a misspelt flag is an error, not a silent skip", () => {
  const src = dirWith({ "script.en.md": lesson("outro: yes\n") });
  assert.throws(() => loadScript(src, "en", outro), /must be true or false/);
});

test("a language without a shared outro is an error, not a silent skip", () => {
  const src = dirWith({ "script.vi.md": lesson("outro: true\n") });
  assert.throws(() => loadScript(src, "vi", outro), /no shared outro for "vi"/);
});

test("the shared outro ships every language a lesson can use, with matching cues", () => {
  const en = loadScript(dirWith({ "script.en.md": lesson("outro: true\n") }), "en");
  const vi = loadScript(dirWith({ "script.vi.md": lesson("outro: true\n") }), "vi");
  assert.equal(en.scenes.at(-1)!.id, "outro");
  assert.equal(vi.scenes.at(-1)!.id, "outro");
  const cues = en.scenes.at(-1)!.words.flatMap((w) => w.cues);
  assert.deepEqual(cues, ["like", "sub", "next"]);
  assert.ok(fs.existsSync(path.join(OUTRO_DIR, "strings.en.json")));
});

// script.<locale>.md → scenes of words. Format:
//   ---                      front matter (slug, title)
//   ## scene: <id>           starts a scene
//   {cue}                    marks the next word; its start frame becomes <scene>.<cue>
//   |                        forced subtitle break before the next word
//   [display](spoken)        TTS reads `spoken`; subtitles and timing show `display`
//   # hold <frames>          extra frames after the scene's speech
export type ScriptWord = {
  display: string;
  spoken: string;
  cues: string[];
  breakBefore: boolean;
};

export type ScriptScene = { id: string; hold: number; words: ScriptWord[] };

export type Script = { meta: Record<string, string>; scenes: ScriptScene[] };

const SCENE_ID = /^[a-z0-9-]+$/;
const CUE = /^[a-zA-Z][a-zA-Z0-9-]*$/;
// A term (with any opening quote or paren), a cue, a break, a plain word; the last `\S` catches unmatched brackets.
const TOKEN = /([("'“‘]*)\[([^\]]*)\]\(([^)]*)\)([^\s|{]*)|\{([^}]*)\}|\||[^\s|{]+|\S/g;

export function spokenText(scene: ScriptScene): string {
  return scene.words.map((w) => w.spoken).join(" ");
}

export function parseScript(source: string): Script {
  // NFC: some Vietnamese keyboards type decomposed accents, which providers mark per code point.
  const lines = source.normalize("NFC").replace(/\r\n?/g, "\n").split("\n");
  const meta: Record<string, string> = {};
  let i = 0;
  if (lines[0]?.trim() === "---") {
    for (i = 1; i < lines.length && lines[i]!.trim() !== "---"; i++) {
      const m = /^(\w+):\s*(.*)$/.exec(lines[i]!);
      if (m) meta[m[1]!] = m[2]!.trim();
    }
    if (i === lines.length) throw new Error("script: front matter is not closed");
    i++;
  }

  const scenes: ScriptScene[] = [];
  let scene: ScriptScene | undefined;
  let pendingCues: string[] = [];
  let pendingBreak = false;
  const flush = () => {
    if (scene && pendingCues.length) {
      throw new Error(`script: cue {${pendingCues[0]}} in scene "${scene.id}" has no word after it`);
    }
  };

  for (; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const where = `script line ${i + 1}`;
    if (!line) continue;
    const head = /^##\s*scene:\s*(.*)$/.exec(line);
    if (head) {
      flush();
      const id = head[1]!.trim();
      if (!SCENE_ID.test(id)) throw new Error(`${where}: bad scene id "${id}"`);
      if (scenes.some((s) => s.id === id)) throw new Error(`${where}: duplicate scene "${id}"`);
      scene = { id, hold: 0, words: [] };
      scenes.push(scene);
      pendingBreak = false;
      continue;
    }
    if (!scene) throw new Error(`${where}: text before the first "## scene:"`);
    const hold = /^#\s*hold\s+(\S+)$/.exec(line);
    if (hold) {
      const frames = Number(hold[1]);
      if (!Number.isInteger(frames) || frames < 0) throw new Error(`${where}: hold must be a whole frame count`);
      scene.hold += frames;
      continue;
    }
    if (line.startsWith("#")) throw new Error(`${where}: unknown directive "${line}"`);

    for (const m of line.matchAll(TOKEN)) {
      const [token, head = "", display, spoken, tail = "", cue] = m;
      if (cue !== undefined) {
        if (!CUE.test(cue)) throw new Error(`${where}: bad cue name "{${cue}}"`);
        if (scene.words.some((w) => w.cues.includes(cue)) || pendingCues.includes(cue)) {
          throw new Error(`${where}: cue {${cue}} repeats in scene "${scene.id}"`);
        }
        pendingCues.push(cue);
      } else if (token === "|") {
        pendingBreak = true;
      } else {
        let pairs: [string, string][];
        if (display !== undefined) {
          const d = display.trim().split(/\s+/).filter(Boolean);
          const s = spoken!.trim().split(/\s+/).filter(Boolean);
          if (!d.length || !s.length) throw new Error(`${where}: empty half in "${token}"`);
          // Same word count maps one to one; otherwise the display term owns the whole spoken span.
          pairs = d.length === s.length ? d.map((w, k) => [w, s[k]!]) : [[d.join(" "), s.join(" ")]];
          pairs[0]![0] = head + pairs[0]![0];
          pairs[0]![1] = head + pairs[0]![1];
          pairs[pairs.length - 1]![0] += tail;
          pairs[pairs.length - 1]![1] += tail;
        } else {
          if (/[[\]{}]/.test(token)) throw new Error(`${where}: stray bracket in "${token}"`);
          const prev = scene.words.at(-1);
          // A lone dash or ellipsis has no sound of its own; it rides on the word
          // before, and any pending cue or break waits for the next real word.
          if (prev && !/[\p{L}\p{N}]/u.test(token)) {
            prev.display += ` ${token}`;
            prev.spoken += ` ${token}`;
            continue;
          }
          pairs = [[token, token]];
        }
        for (const [d, s] of pairs) {
          scene.words.push({ display: d, spoken: s, cues: pendingCues, breakBefore: pendingBreak });
          pendingCues = [];
          pendingBreak = false;
        }
      }
    }
  }
  flush();
  if (!scenes.length) throw new Error("script: no scenes");
  return { meta, scenes };
}

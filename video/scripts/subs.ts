// Timed words → WebVTT cues. Budgets: ≤ 42 chars per line, ≤ 2 lines, 1–6 s
// on screen (up to 1 s past the last word), and a warning above 17 chars/s. A cue always ends at `|`, at a
// scene change and at the end of a sentence (once it has run 1 s); an over-budget cue splits at its
// last comma-like pause (after at least two words), else before the word that overflowed.
export type SubWord = { text: string; from: number; to: number; scene: string; breakBefore: boolean };
export type SubCue = { start: number; end: number; lines: string[] };

export const LINE = 42;
export const MIN_SEC = 1;
export const MAX_SEC = 6;
export const MAX_CPS = 17;
const LINGER_SEC = 1;

const SENTENCE_END = /[.?!…]["')\]]*$/;
const PAUSE = /[,;:—–]["')\]]*$/;

// Best two-line split (most balanced, preferring a pause at the line end), or null if it cannot fit.
function wrap(texts: string[]): string[] | null {
  const one = texts.join(" ");
  if (one.length <= LINE) return [one];
  let best: { lines: string[]; score: number } | null = null;
  for (let k = 1; k < texts.length; k++) {
    const a = texts.slice(0, k).join(" ");
    const b = texts.slice(k).join(" ");
    if (a.length > LINE || b.length > LINE) continue;
    const score = Math.abs(a.length - b.length) - (PAUSE.test(a) ? 12 : 0);
    if (!best || score < best.score) best = { lines: [a, b], score };
  }
  return best?.lines ?? null;
}

export function buildCues(words: SubWord[], fps: number): { cues: SubCue[]; warnings: string[] } {
  const fits = (g: SubWord[]) => wrap(g.map((w) => w.text)) !== null && (g.at(-1)!.to - g[0]!.from) / fps <= MAX_SEC;
  const groups: SubWord[][] = [];
  let cur: SubWord[] = [];
  const close = (n = cur.length) => {
    groups.push(cur.slice(0, n));
    cur = cur.slice(n);
  };
  for (const word of words) {
    const last = cur.at(-1);
    // A sentence shorter than a second ("Hi!") keeps going into the next one instead of flashing.
    const sentenceDone = last && SENTENCE_END.test(last.text) && (last.to - cur[0]!.from) / fps >= MIN_SEC;
    if (last && (word.breakBefore || word.scene !== last.scene || sentenceDone)) close();
    if (cur.length && !fits([...cur, word])) {
      let k = cur.length - 1;
      while (k >= 2 && !PAUSE.test(cur[k - 1]!.text)) k--;
      close(k >= 2 ? k : cur.length);
      if (cur.length && !fits([...cur, word])) close();
    }
    cur.push(word);
  }
  if (cur.length) close();

  const cues = groups.map((g) => ({
    start: g[0]!.from / fps,
    end: g.at(-1)!.to / fps,
    lines: wrap(g.map((w) => w.text)) ?? [g.map((w) => w.text).join(" ")],
  }));
  const warnings: string[] = [];
  cues.forEach((cue, i) => {
    // Linger into the pause after the words (reading time), never over the next cue.
    const room = Math.min(cues[i + 1]?.start ?? Infinity, cue.start + MAX_SEC);
    cue.end = Math.max(cue.end, Math.min(cue.end + LINGER_SEC, room));
    const text = cue.lines.join(" ");
    const cps = text.length / (cue.end - cue.start);
    if (cps > MAX_CPS) warnings.push(`subs: ${stamp(cue.start)} reads at ${cps.toFixed(1)} chars/s: "${text}"`);
    if (cue.end - cue.start < MIN_SEC) warnings.push(`subs: ${stamp(cue.start)} shows for under ${MIN_SEC} s: "${text}"`);
  });
  return { cues, warnings };
}

function stamp(sec: number): string {
  const ms = Math.round(sec * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}.${pad(ms % 1000, 3)}`;
}

// Cue text is markup in VTT: "<canvas>" would vanish and "&" start an entity.
const escape = (line: string) => line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function toVtt(cues: SubCue[]): string {
  const body = cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.lines.map(escape).join("\n")}\n`);
  return `WEBVTT\n\n${body.join("\n")}`;
}

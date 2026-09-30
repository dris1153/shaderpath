import { LINE, MAX_CPS, MAX_SEC, MIN_SEC } from "./subs";

// Pure QC rules over a render's per-frame stats. Motion is the mean absolute
// difference between consecutive 160×90 gray frames (0–255). Calibrated on the
// style and dummy renders: a still frame ≈ 0.001, Inko's idle motion 0.2–1.0,
// his blink up to 1.19 (at scale 1.3), an element entering or leaving 2.5+.
export const STILL = 0.02; // below: nothing moves, not even Inko
export const CALM = 1.6; // below: only ambient motion, nothing entering or leaving; safe to Inko scale ≈ 1.5
export const MAX_STILL = 90; // frames (3 s)
export const TAIL = 30; // each scene must end with this many calm frames
const HOLD_MAX = 45; // a scene's last frames are its hold, so a still run there is fine
const BLACK_MEAN = 16;
const EMPTY_STD = 2; // bare paper measures ≈ 0.75
const MAX_EMPTY = 15;

export type Scene = { id: string; from: number; durationInFrames: number };
export type Range = [number, number]; // inclusive frames

function runs(flags: boolean[], minLength: number): Range[] {
  const found: Range[] = [];
  let start = -1;
  flags.forEach((on, i) => {
    if (on && start < 0) start = i;
    if ((!on || i === flags.length - 1) && start >= 0) {
      const end = on ? i : i - 1;
      if (end - start + 1 > minLength) found.push([start, end]);
      start = -1;
    }
  });
  return found;
}

// diff[i] compares frame i with frame i - 1 (diff[0] is 0).
export function stillRuns(diff: number[], scenes: Scene[]): Range[] {
  const hold = new Set(scenes.flatMap((s) => Array.from({ length: HOLD_MAX }, (_, k) => s.from + s.durationInFrames - 1 - k)));
  return runs(diff.map((d, i) => d < STILL && !hold.has(i)), MAX_STILL);
}

// The first frame that moves inside each scene's tail.
export function restlessTails(diff: number[], scenes: Scene[]): { id: string; frame: number }[] {
  return scenes.flatMap((s) => {
    const end = s.from + s.durationInFrames;
    // Skip the scene's first frame: its diff is the cut from the previous scene.
    const start = Math.max(s.from + 1, end - TAIL);
    const at = diff.slice(start, end).findIndex((d) => d >= CALM);
    return at < 0 ? [] : [{ id: s.id, frame: start + at }];
  });
}

export function blankRuns(mean: number[], std: number[]): { black: Range[]; empty: Range[] } {
  return {
    black: runs(mean.map((m) => m < BLACK_MEAN), 0),
    empty: runs(std.map((s) => s < EMPTY_STD), MAX_EMPTY),
  };
}

const unescape = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const seconds = (stamp: string) => stamp.split(":").reduce((sum, part) => sum * 60 + Number(part), 0);

// Re-checks the subtitle file as written, independent of the generator.
export function subtitleIssues(vtt: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const block of vtt.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n");
    const at = lines.findIndex((l) => l.includes("-->"));
    if (at < 0) continue;
    const [from, to] = lines[at]!.split("-->").map((s) => seconds(s.trim().split(" ")[0]!));
    const text = lines.slice(at + 1).filter(Boolean).map(unescape);
    const where = `${lines[at]!.trim()} "${text.join(" / ")}"`;
    // Whole milliseconds: the generator makes cues of exactly 6 s, and float subtraction overshoots.
    const ms = Math.round((to! - from!) * 1000);
    if (text.length > 2) errors.push(`${text.length} lines: ${where}`);
    for (const line of text) if (line.length > LINE) errors.push(`${line.length}-char line: ${where}`);
    if (ms > MAX_SEC * 1000) errors.push(`${ms / 1000} s on screen: ${where}`);
    if (ms < MIN_SEC * 1000) warnings.push(`${ms / 1000} s on screen: ${where}`);
    const cps = (text.join(" ").length * 1000) / ms;
    if (cps > MAX_CPS) warnings.push(`${cps.toFixed(1)} chars/s: ${where}`);
  }
  return { errors, warnings };
}

// ffmpeg's ebur128 summary: integrated loudness and true peak.
export function parseLoudness(log: string): { lufs: number; peak: number } | null {
  const lufs = /I:\s+(-?[\d.]+) LUFS/.exec(log.slice(log.lastIndexOf("Summary:")));
  const peak = /Peak:\s+(-?[\d.]+|-inf) dBFS/.exec(log.slice(log.lastIndexOf("Summary:")));
  if (!lufs || !peak) return null;
  return { lufs: Number(lufs[1]), peak: peak[1] === "-inf" ? -Infinity : Number(peak[1]) };
}

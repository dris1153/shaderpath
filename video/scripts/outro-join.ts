import fs from "node:fs";
import path from "node:path";
import { totalFrames, type Timing } from "../src/scene/timing";
import { CONTENT_SHARED } from "./lesson-assets";
import { OUTRO_SCENE, readOutroClip, type OutroClip } from "./outro-clip";
import { parseScript } from "./script-parse";
import { hasOutro } from "./script-load";
import { audioSeconds, ffmpeg, ffmpegInfo, lessonSource } from "./remotion";
import { VOICE_MP3, VOICE_NORMALIZE, VOICE_RATE } from "./voice-args";

// A lesson whose script says `outro: true` is packaged with the shared clip in content/shared/outro:
// the picture is stream-copied, the voice is joined losslessly and encoded once, the subtitles are shifted.
export const CLIP_DIR = path.join(CONTENT_SHARED, "outro");

export function lessonHasOutro(slug: string): boolean {
  return hasOutro(parseScript(fs.readFileSync(path.join(lessonSource(slug), "script.en.md"), "utf8")));
}

export function loadOutro(dir = CLIP_DIR): OutroClip {
  for (const file of ["outro.json", "outro.mp4"]) {
    if (!fs.existsSync(path.join(dir, file))) throw new Error(`no ${file} in ${dir}; run pnpm outro`);
  }
  return readOutroClip(dir);
}

// A lesson that still voices its own `outro` scene would get the clip twice; a clip of another fps cannot be joined.
export function assertJoinable(slug: string, timing: Timing, clip: OutroClip): void {
  if (timing.scenes.some((s) => s.id === OUTRO_SCENE)) {
    throw new Error(`${slug} still voices an "${OUTRO_SCENE}" scene of its own and would get the shared outro twice; re-voice it with pnpm tts ${slug}`);
  }
  if (clip.fps !== timing.fps) throw new Error(`the outro clip is ${clip.fps} fps but ${slug} is ${timing.fps} fps`);
}

export const joinedFrames = (timing: Timing, clip: OutroClip) => totalFrames(timing) + clip.frames;

const concatLine = (file: string) => `file '${file.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`;
export const concatList = (files: string[]) => `${files.map(concatLine).join("\n")}\n`;

// The video stream line of `ffmpeg -i` without its bitrate: codec, profile, pixel format, size, fps, time base.
export function videoSignature(info: string): string | null {
  const line = info.split("\n").find((l) => /Stream #.*: Video:/.test(l));
  return line ? line.slice(line.indexOf("Video:")).replace(/, \d+ kb\/s/, "").trim() : null;
}

// Cuts every part to its exact sample count, like tts.ts does per scene, so the join lands on a frame edge.
export function voiceMixArgs(parts: { file: string; frames: number }[], fps: number, output: string): string[] {
  const perFrame = VOICE_RATE / fps;
  if (!Number.isInteger(perFrame)) throw new Error(`${VOICE_RATE} Hz does not divide into whole samples per frame at ${fps} fps`);
  const filters = parts.map(
    (p, i) =>
      `[${i}:a]aresample=${VOICE_RATE},aformat=sample_fmts=fltp:channel_layouts=mono,apad,` +
      `atrim=end_sample=${p.frames * perFrame},asetpts=N/SR/TB[a${i}]`,
  );
  filters.push(`${parts.map((_, i) => `[a${i}]`).join("")}concat=n=${parts.length}:v=0:a=1[mix]`);
  return ["-y", "-loglevel", "error", ...parts.flatMap((p) => ["-i", p.file]), "-filter_complex", filters.join(";"), "-map", "[mix]", output];
}

const TIMING = /^(\d+):(\d{2}):(\d{2})\.(\d{3}) --> (\d+):(\d{2}):(\d{2})\.(\d{3})$/;
const ms = (h: string, m: string, s: string, f: string) => ((Number(h) * 60 + Number(m)) * 60 + Number(s)) * 1000 + Number(f);
const stamp = (t: number) => {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(t / 3600000))}:${p(Math.floor(t / 60000) % 60)}:${p(Math.floor(t / 1000) % 60)}.${p(t % 1000, 3)}`;
};

type Cue = { start: number; end: number; text: string };
function parseVtt(vtt: string): Cue[] {
  return vtt
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split("\n").filter((l) => l.trim());
      const at = lines.findIndex((l) => TIMING.test(l));
      if (at < 0) return [];
      const m = TIMING.exec(lines[at]!)!;
      return [{ start: ms(m[1]!, m[2]!, m[3]!, m[4]!), end: ms(m[5]!, m[6]!, m[7]!, m[8]!), text: lines.slice(at + 1).join("\n") }];
    });
}

const writeVtt = (cues: Cue[]) => {
  const body = cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`);
  return `WEBVTT\n\n${body.join("\n")}`;
};

// The outro's cues move by the lesson's length; a lesson cue never runs into them.
export function joinVtt(lesson: string, outro: string, lessonFrames: number, fps: number): string {
  const offset = Math.round((lessonFrames * 1000) / fps);
  return writeVtt([
    ...parseVtt(lesson).map((c) => ({ ...c, end: Math.min(c.end, offset) })),
    ...parseVtt(outro).map((c) => ({ ...c, start: c.start + offset, end: c.end + offset })),
  ]);
}

// The lesson's own cues out of a joined file (cues starting at or after the lesson's end belong to the outro).
export function lessonVtt(joined: string, lessonFrames: number, fps: number): string {
  const offset = Math.round((lessonFrames * 1000) / fps);
  return writeVtt(parseVtt(joined).filter((c) => c.start < offset));
}

// Stream copy only works between identical encodes, so any difference is an error, not a re-encode.
export function joinPicture(lesson: string, clipFile: string, output: string, frames: number, fps: number): void {
  const sig = [lesson, clipFile].map((f) => videoSignature(ffmpegInfo(f)));
  if (!sig[0] || sig[0] !== sig[1]) {
    throw new Error(`the lesson picture and the outro clip are encoded differently, so they cannot be joined:\n  ${sig[0]}\n  ${sig[1]}\nre-render the lesson and run pnpm outro`);
  }
  const list = `${output}.list.txt`;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(list, concatList([lesson, clipFile]));
  try {
    ffmpeg(["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", output]);
  } finally {
    fs.rmSync(list, { force: true });
  }
  if (Math.abs(audioSeconds(output) - frames / fps) > 0.05) throw new Error(`${output}: the joined picture is not ${frames} frames long`);
}

// Lossless join of the lesson voice and the clip's voice, then the one normalise-and-encode stage.
export function joinVoice(lessonVoice: string, lessonFrames: number, clipVoice: string, clip: OutroClip, output: string): void {
  const mix = `${output}.mix.wav`;
  try {
    ffmpeg(voiceMixArgs([{ file: lessonVoice, frames: lessonFrames }, { file: clipVoice, frames: clip.frames }], clip.fps, mix));
    ffmpeg(["-y", "-loglevel", "error", "-i", mix, "-af", VOICE_NORMALIZE, ...VOICE_MP3, output]);
  } finally {
    fs.rmSync(mix, { force: true });
  }
  if (Math.abs(audioSeconds(output) - (lessonFrames + clip.frames) / clip.fps) > 0.06) {
    throw new Error(`${output}: the joined voice does not match the joined picture length`);
  }
}

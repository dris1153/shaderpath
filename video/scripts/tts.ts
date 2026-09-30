import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { validateStrings, validateTiming, type Timing } from "../src/scene/timing";
import { ffmpeg, generatedDir, lessonSource, ROOT } from "./remotion";
import { parseScript, spokenText } from "./script-parse";
import { buildCues, toVtt } from "./subs";
import { elevenlabs } from "./tts/elevenlabs";
import { alignWords, type Mark, type TtsEngine } from "./tts/engine";
import { fish } from "./tts/fish";

// pnpm tts <slug> <locale> [--engine elevenlabs|fish] [--voice <id>] [--model <id>]
// script.<locale>.md → public/generated/<slug>/<locale>/{voice.mp3, timing.json, strings.json, subs.vtt}
const USAGE = "pnpm tts <slug> <locale> [--engine elevenlabs|fish] [--voice <id>] [--model <id>]";
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { engine: { type: "string", default: "elevenlabs" }, voice: { type: "string" }, model: { type: "string" } },
});
const [slug, locale] = positionals;
if (!slug || !locale) {
  console.error(`usage: ${USAGE}`);
  process.exit(1);
}

const FORMAT = { fps: 30, width: 1280, height: 720 };
const DEFAULT_HOLD = 36;
const RATE = 48000;
const SAMPLES_PER_FRAME = RATE / FORMAT.fps;

// Keys come from the repo's .env.local into process.env; nothing here reads or prints them.
const envFile = path.join(ROOT, "..", ".env.local");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const engines: Record<string, () => TtsEngine> = {
  elevenlabs: () => elevenlabs(values.voice, values.model),
  fish: () => fish(values.voice, values.model),
};
const makeEngine = engines[values.engine!];
if (!makeEngine) {
  console.error(`unknown engine "${values.engine}". usage: ${USAGE}`);
  process.exit(1);
}
const engine = makeEngine();

const src = lessonSource(slug);
const script = parseScript(fs.readFileSync(path.join(src, `script.${locale}.md`), "utf8"));
const strings = validateStrings(JSON.parse(fs.readFileSync(path.join(src, `strings.${locale}.json`), "utf8")));

// One entry per scene text and engine setup. Context (previous/next text) is
// left out on purpose, so editing one scene re-voices only that scene.
const cacheDir = path.join(ROOT, ".cache", "tts");
fs.mkdirSync(cacheDir, { recursive: true });
let sentChars = 0;

async function voice(i: number): Promise<{ file: string; marks: Mark[] } | null> {
  const scene = script.scenes[i]!;
  const text = spokenText(scene);
  if (!text) return null;
  const key = createHash("sha256").update(JSON.stringify({ ...engine.id, text })).digest("hex").slice(0, 32);
  // The raw response is cached, not its parse, so a parser fix never needs a paid re-call.
  const rawFile = path.join(cacheDir, `${key}.raw`);
  let raw: string;
  if (fs.existsSync(rawFile)) {
    raw = fs.readFileSync(rawFile, "utf8");
    console.log(`scene ${scene.id}: cached`);
  } else {
    const neighbour = (j: number) => (script.scenes[j] ? spokenText(script.scenes[j]) || undefined : undefined);
    raw = await engine.fetch({ text, previousText: neighbour(i - 1), nextText: neighbour(i + 1) });
    sentChars += text.length;
    fs.writeFileSync(`${rawFile}.tmp`, raw);
    fs.renameSync(`${rawFile}.tmp`, rawFile);
    console.log(`scene ${scene.id}: voiced (${text.length} chars)`);
  }
  const speech = engine.parse(raw);
  const file = path.join(cacheDir, `${key}.mp3`);
  fs.writeFileSync(file, speech.audio);
  return { file, marks: speech.marks };
}

const timing: Timing = { ...FORMAT, scenes: [], words: [], cues: {}, audio: "voice.mp3" };
const subWords: Parameters<typeof buildCues>[0] = [];
const clips: { file: string | null; frames: number }[] = [];
let from = 0;
let prevTo = 0;
for (const [i, scene] of script.scenes.entries()) {
  const voiced = await voice(i);
  const times = voiced ? alignWords(scene.words.map((w) => w.spoken), voiced.marks) : [];
  const speechEnd = voiced ? Math.max(0, ...voiced.marks.map((m) => m.end)) : 0;
  const frames = Math.ceil(speechEnd * FORMAT.fps) + DEFAULT_HOLD + scene.hold;
  timing.scenes.push({ id: scene.id, from, durationInFrames: frames });
  scene.words.forEach((word, k) => {
    // Rounding can make neighbours touch or a silent word vanish; keep every word ≥ 1 frame, in order.
    const start = Math.max(from + Math.round(times[k]!.start * FORMAT.fps), prevTo);
    const end = Math.max(from + Math.round(times[k]!.end * FORMAT.fps), start + 1);
    prevTo = end;
    timing.words.push({ text: word.display, from: start, to: end, scene: scene.id });
    subWords.push({ text: word.display, from: start, to: end, scene: scene.id, breakBefore: word.breakBefore });
    for (const cue of word.cues) timing.cues[`${scene.id}.${cue}`] = start;
  });
  clips.push({ file: voiced?.file ?? null, frames });
  from += frames;
}
validateTiming(timing);

// Each clip is resampled, padded with silence and cut to its scene's exact
// sample count, so scene boundaries in the voice track land on frame edges.
const out = generatedDir(slug, locale);
fs.mkdirSync(out, { recursive: true });
const inputs: string[] = [];
const filters: string[] = [];
clips.forEach((clip, i) => {
  const seconds = clip.frames / FORMAT.fps;
  if (clip.file) inputs.push("-i", clip.file);
  else inputs.push("-f", "lavfi", "-t", String(seconds), "-i", `anullsrc=r=${RATE}:cl=mono`);
  filters.push(
    `[${i}:a]aresample=${RATE},aformat=sample_fmts=fltp:channel_layouts=mono,apad,` +
      `atrim=end_sample=${clip.frames * SAMPLES_PER_FRAME},asetpts=N/SR/TB[a${i}]`,
  );
});
// Providers deliver around −21 LUFS; the QC target is −16 ±2 with peaks ≤ −1 dBFS.
filters.push(`${clips.map((_, i) => `[a${i}]`).join("")}concat=n=${clips.length}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11:dual_mono=true[voice]`);
ffmpeg([
  "-y", "-loglevel", "error", ...inputs,
  "-filter_complex", filters.join(";"),
  "-map", "[voice]", "-c:a", "libmp3lame", "-b:a", "128k", "-ar", String(RATE),
  path.join(out, "voice.mp3"),
]);

const { cues, warnings } = buildCues(subWords, FORMAT.fps);
fs.writeFileSync(path.join(out, "timing.json"), `${JSON.stringify(timing, null, 2)}\n`);
fs.writeFileSync(path.join(out, "strings.json"), `${JSON.stringify(strings, null, 2)}\n`);
fs.writeFileSync(path.join(out, "subs.vtt"), toVtt(cues));
for (const warning of warnings) console.warn(warning);
console.log(
  `done → ${path.relative(process.cwd(), out)} (${(from / FORMAT.fps).toFixed(1)} s, ` +
    `${cues.length} subtitle cues, ${sentChars} chars sent to ${engine.id.engine})`,
);

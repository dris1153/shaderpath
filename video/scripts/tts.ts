import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { validateStrings, validateTiming, type Timing } from "../src/scene/timing";
import { ffmpeg, generatedDir, lessonSource, ROOT } from "./remotion";
import { spokenText } from "./script-parse";
import { hasOutro, loadScript, OUTRO_DIR } from "./script-load";
import { buildCues, toVtt } from "./subs";
import { elevenlabs } from "./tts/elevenlabs";
import { alignWords, type Mark, type TtsEngine } from "./tts/engine";
import { fish } from "./tts/fish";

// pnpm tts <slug> en [--engine elevenlabs|fish] [--voice <id>] [--model <id>]
//   script.en.md → public/generated/<slug>/en/{voice.mp3, timing.json, strings.json, subs.vtt}
// pnpm tts <slug> <lang> --fit en [...]
//   Every language shares the English picture: each scene is voiced, then
//   sped up (≤ MAX_TEMPO) and padded to the English scene's exact length.
const USAGE = "pnpm tts <slug> <locale> [--fit en] [--engine elevenlabs|fish] [--voice <id>] [--model <id>] [--fresh]";
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    engine: { type: "string", default: "elevenlabs" },
    voice: { type: "string" },
    model: { type: "string" },
    fit: { type: "string" },
    // Re-voice every scene and overwrite its cache entry, e.g. to regain rights after a plan change.
    fresh: { type: "boolean", default: false },
  },
});
const [slug, locale] = positionals;
if (!slug || !locale) {
  console.error(`usage: ${USAGE}`);
  process.exit(1);
}
if ((locale !== "en") !== (values.fit === "en")) {
  console.error(`English is voiced plainly; every other language needs --fit en. usage: ${USAGE}`);
  process.exit(1);
}
// ElevenLabs' default model has no Vietnamese (and fewer languages than v4):
// a missing --model would pay for takes in the wrong language, and cache them.
if (locale !== "en" && values.engine === "elevenlabs" && !values.model) {
  console.error(`pass --model for "${locale}" (e.g. eleven_v4); the default model is English-first. usage: ${USAGE}`);
  process.exit(1);
}

const FORMAT = { fps: 30, width: 1280, height: 720 };
const DEFAULT_HOLD = 36;
const RATE = 48000;
const SAMPLES_PER_FRAME = RATE / FORMAT.fps;
// Fitted speech keeps half a second of calm before the cut and is never sped up past 1.2×.
const FIT_TAIL_SEC = 0.5;
const MAX_TEMPO = 1.2;
const MIN_FILL = 0.85;

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
const script = loadScript(src, locale);
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
const master = values.fit ? (readJson(path.join(generatedDir(slug, values.fit), "timing.json")) as Timing) : null;
if (master) {
  validateTiming(master);
  const ids = script.scenes.map((s) => s.id).join(", ");
  const masterIds = master.scenes.map((s) => s.id).join(", ");
  if (ids !== masterIds) throw new Error(`script.${locale}.md scenes [${ids}] differ from ${values.fit} [${masterIds}]`);
}
// A fitted language reuses the master's picture, so it also reuses its on-screen strings.
// The outro's strings join the lesson's (the lesson wins on a clash).
const readStrings = (file: string) => validateStrings(readJson(file));
const strings = master
  ? readStrings(path.join(generatedDir(slug, values.fit!), "strings.json"))
  : {
      ...(hasOutro(script) ? readStrings(path.join(OUTRO_DIR, "strings.en.json")) : {}),
      ...readStrings(path.join(src, `strings.${locale}.json`)),
    };
// A `# hold` is silent on purpose; in a fit, the master's holds shaped the picture.
const masterHolds = master ? loadScript(src, values.fit!).scenes.map((s) => s.hold) : [];

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
  if (!values.fresh && fs.existsSync(rawFile)) {
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

// A fitted timing keeps the master's scenes and cues; only the words (mouth, subtitles) are this language's.
const timing: Timing = { ...FORMAT, scenes: [], words: [], cues: master ? { ...master.cues } : {}, audio: "voice.mp3" };
const subWords: Parameters<typeof buildCues>[0] = [];
const clips: { file: string | null; frames: number; tempo: number }[] = [];
const tooLong: string[] = [];
let from = 0;
let prevTo = 0;
for (const [i, scene] of script.scenes.entries()) {
  const voiced = await voice(i);
  const speechEnd = voiced ? Math.max(0, ...voiced.marks.map((m) => m.end)) : 0;
  const frames = master
    ? master.scenes[i]!.durationInFrames
    : Math.ceil(speechEnd * FORMAT.fps) + DEFAULT_HOLD + scene.hold;
  const budget = frames / FORMAT.fps - FIT_TAIL_SEC;
  const tempo = master && speechEnd > budget ? speechEnd / budget : 1;
  if (tempo > MAX_TEMPO) {
    tooLong.push(`${scene.id}: needs ${tempo.toFixed(2)}× (max ${MAX_TEMPO}×); cut about ${Math.ceil((1 - (MAX_TEMPO * budget) / speechEnd) * 100)}% of its words`);
  }
  // Speech that ends early leaves the picture's later beats talking to silence.
  const spoken = budget - (masterHolds[i] ?? 0) / FORMAT.fps;
  if (master && voiced && speechEnd < MIN_FILL * spoken) {
    console.warn(`scene ${scene.id}: speech fills only ${Math.round((speechEnd / spoken) * 100)}% of the scene before its hold; its last visuals will run ahead of the voice`);
  }
  const times = voiced ? alignWords(scene.words.map((w) => w.spoken), voiced.marks) : [];
  timing.scenes.push({ id: scene.id, from, durationInFrames: frames });
  scene.words.forEach((word, k) => {
    // Rounding can make neighbours touch or a silent word vanish; keep every word ≥ 1 frame, in order.
    const start = Math.max(from + Math.round((times[k]!.start / tempo) * FORMAT.fps), prevTo);
    const end = Math.max(from + Math.round((times[k]!.end / tempo) * FORMAT.fps), start + 1);
    prevTo = end;
    timing.words.push({ text: word.display, from: start, to: end, scene: scene.id });
    subWords.push({ text: word.display, from: start, to: end, scene: scene.id, breakBefore: word.breakBefore });
    if (!master) for (const cue of word.cues) timing.cues[`${scene.id}.${cue}`] = start;
  });
  clips.push({ file: voiced?.file ?? null, frames, tempo });
  from += frames;
}
// Checked after every scene is voiced (and cached), so one run reports them all.
if (tooLong.length) throw new Error(`speech too long for the ${values.fit} picture:\n  ${tooLong.join("\n  ")}`);
validateTiming(timing);

// Each clip is resampled, sped up if fitted, padded with silence and cut to its
// scene's exact sample count, so scene boundaries land on frame edges.
const out = generatedDir(slug, locale);
fs.mkdirSync(out, { recursive: true });
const inputs: string[] = [];
const filters: string[] = [];
clips.forEach((clip, i) => {
  const seconds = clip.frames / FORMAT.fps;
  if (clip.file) inputs.push("-i", clip.file);
  else inputs.push("-f", "lavfi", "-t", String(seconds), "-i", `anullsrc=r=${RATE}:cl=mono`);
  filters.push(
    `[${i}:a]aresample=${RATE},aformat=sample_fmts=fltp:channel_layouts=mono,` +
      `${clip.tempo > 1 ? `atempo=${clip.tempo.toFixed(4)},` : ""}apad,` +
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
const fitted = script.scenes.flatMap((s, i) => (clips[i]!.tempo > 1 ? [`${s.id} ${clips[i]!.tempo.toFixed(2)}×`] : []));
console.log(
  `done → ${path.relative(process.cwd(), out)} (${(from / FORMAT.fps).toFixed(1)} s, ` +
    `${cues.length} subtitle cues, ${sentChars} chars sent to ${engine.id.engine}` +
    `${master ? `, fitted to ${values.fit}; sped up: ${fitted.length ? fitted.join(" ") : "none"}` : ""})`,
);

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { totalFrames, type Timing } from "../src/scene/timing";
import {
  blankRuns, CALM, MAX_STILL, parseLoudness, restlessTails, STILL, stillRuns, subtitleIssues, TAIL, type Range,
} from "./qc-rules";
import { outDir, parseArgs, ROOT } from "./remotion";
import { LINE, MAX_SEC } from "./subs";

// pnpm qc <slug> [locale]: checks out/<slug>/<locale>/final.mp4 and writes
// qc/report.md plus qc/sheet.png (one tile per 3 s, timecode + scene id, the
// subtitle band tinted). Needs a full ffmpeg on PATH: Remotion's bundled one
// has no tile, drawtext or ebur128.
const [slug, locale = "en"] = parseArgs("pnpm qc <slug> [locale]", 1) as [string, string?];
const out = outDir(slug, locale);
const video = path.join(out, "final.mp4");
if (!fs.existsSync(video)) throw new Error(`no render at ${video}; run pnpm render ${slug} ${locale}`);
const timing = JSON.parse(fs.readFileSync(path.join(out, "timing.json"), "utf8")) as Timing;
const qcDir = path.join(out, "qc");
fs.mkdirSync(qcDir, { recursive: true });

const W = 160;
const H = 90;
const EVERY = 90;
const COLS = 8;
const fps = timing.fps;
const total = totalFrames(timing);
const rows = Math.ceil(Math.ceil(total / EVERY) / COLS);
const FONT = "public/fonts/JetBrainsMono.ttf"; // relative: a drive colon would need filtergraph escaping
const label = (text: string, x: string, extra = "") =>
  `drawtext=fontfile=${FONT}:text='${text}':x=${x}:y=3:fontsize=13:fontcolor=white${extra}`;
const sheet = [
  `select='not(mod(n,${EVERY}))'`,
  "scale=256:144",
  "drawbox=x=0:y=ih*610/720:w=iw:h=ih*110/720:color=red@0.15:t=fill",
  // Labels get their own strip above the frame so they never cover a title.
  "pad=iw:ih+20:0:20:color=0x26213A",
  label("%{pts\\:hms}", "w-tw-5"),
  ...timing.scenes.map((s) =>
    label(s.id, "5", `:enable='between(t,${s.from / fps},${(s.from + s.durationInFrames - 0.5) / fps})'`),
  ),
  `tile=${COLS}x${rows}:padding=4:margin=4:color=0x26213A`,
].join(",");
const filter = [`[0:v]split[m][s]`, `[m]scale=${W}:${H},format=gray[g]`, `[s]${sheet}[sheet]`];
// Loudness is measured on the shipped voice track, not the preview mux, and as
// dual-mono: players send a mono track to both speakers at full level.
const voice = timing.audio ? path.join(out, timing.audio) : null;
if (voice && !fs.existsSync(voice)) throw new Error(`timing.json names ${timing.audio}, but ${voice} is missing`);
if (voice) filter.push("[1:a]ebur128=peak=true:dualmono=true:framelog=verbose[a]");

const started = Date.now();
const run = spawnSync(
  "ffmpeg",
  [
    "-hide_banner", "-nostdin", "-nostats", "-i", video, ...(voice ? ["-i", voice] : []),
    "-filter_complex", filter.join(";"),
    "-map", "[g]", "-f", "rawvideo", "pipe:1",
    "-map", "[sheet]", "-frames:v", "1", "-update", "1", "-y", path.join(qcDir, "sheet.png"),
    ...(voice ? ["-map", "[a]", "-f", "null", "-"] : []),
  ],
  { cwd: ROOT, maxBuffer: 2 ** 31 - 1 },
);
if (run.error) {
  const hint = (run.error as NodeJS.ErrnoException).code === "ENOENT" ? "qc needs a full ffmpeg on PATH" : "ffmpeg failed to run";
  throw new Error(`${hint} (${run.error.message})`);
}
if (run.status !== 0) throw new Error(`ffmpeg failed:\n${run.stderr.toString().slice(-1500)}`);

const frames = run.stdout.length / (W * H);
const diff: number[] = [];
const mean: number[] = [];
const std: number[] = [];
for (let f = 0; f < frames; f++) {
  const px = run.stdout.subarray(f * W * H, (f + 1) * W * H);
  const prev = f ? run.stdout.subarray((f - 1) * W * H, f * W * H) : px;
  let sum = 0;
  let sq = 0;
  let d = 0;
  for (let i = 0; i < px.length; i++) {
    sum += px[i]!;
    sq += px[i]! * px[i]!;
    d += Math.abs(px[i]! - prev[i]!);
  }
  const m = sum / px.length;
  mean.push(m);
  std.push(Math.sqrt(Math.max(0, sq / px.length - m * m)));
  diff.push(d / px.length);
}

const tc = (frame: number) => {
  const s = Math.floor(frame / fps);
  // m:ss:ff: the last field is frames, not hundredths.
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}:${String(frame % fps).padStart(2, "0")}`;
};
const ranges = (list: Range[]) => list.map(([a, b]) => `${tc(a)}–${tc(b)}`).join(", ");
const checks: { name: string; ok: boolean; detail: string }[] = [];
const check = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

check("render matches timing", frames === total, `${frames} frames, timing.json says ${total}`);
const still = stillRuns(diff, timing.scenes);
check(`nothing still > ${MAX_STILL / fps} s`, !still.length, still.length ? ranges(still) : `motion < ${STILL} never lasts past the limit`);
const restless = restlessTails(diff, timing.scenes);
check(`scenes end on a ${TAIL}-frame hold`, !restless.length, restless.length
  ? `still moving (≥ ${CALM}): ${restless.map((r) => `${r.id} at ${tc(r.frame)}`).join(", ")}`
  : "every scene settles");
const blank = blankRuns(mean, std);
check("no black or empty stretches", !blank.black.length && !blank.empty.length,
  [blank.black.length && `black ${ranges(blank.black)}`, blank.empty.length && `empty ${ranges(blank.empty)}`].filter(Boolean).join("; ") || "none");

const warnings: string[] = [];
const subsFile = path.join(out, "subs.vtt");
if (fs.existsSync(subsFile)) {
  const subs = subtitleIssues(fs.readFileSync(subsFile, "utf8"));
  check("subtitle budgets", !subs.errors.length, subs.errors.join("<br>") || `≤ ${LINE} chars × 2 lines, ≤ ${MAX_SEC} s`);
  warnings.push(...subs.warnings.map((w) => `subtitle ${w}`));
} else if (timing.words.length) {
  check("subtitle budgets", false, "the video has words but no subs.vtt");
}
if (voice) {
  const loud = parseLoudness(run.stderr.toString());
  check("loudness −16 ±2 LUFS, peak ≤ −1 dBFS",
    !!loud && Math.abs(loud.lufs + 16) <= 2 && loud.peak <= -1,
    loud ? `${loud.lufs} LUFS, true peak ${loud.peak} dBFS` : "no ebur128 summary");
}

const failed = checks.filter((c) => !c.ok);
const report = [
  `# QC: ${slug} / ${locale}`,
  "",
  `${failed.length ? `**FAIL** (${failed.length})` : "**PASS**"} · ${(total / fps).toFixed(1)} s · ${timing.scenes.length} scenes · checked in ${((Date.now() - started) / 1000).toFixed(1)} s`,
  "",
  "| Check | Result | Detail |",
  "|---|---|---|",
  ...checks.map((c) => `| ${c.name} | ${c.ok ? "pass" : "**fail**"} | ${c.detail.replace(/\|/g, "\\|")} |`),
  ...(warnings.length ? ["", "## Warnings", "", ...warnings.map((w) => `- ${w}`)] : []),
  "",
  "Contact sheet: `sheet.png` (one tile per 3 s; the tinted band is the subtitle area).",
  "",
].join("\n");
fs.writeFileSync(path.join(qcDir, "report.md"), report);
console.log(report);
if (failed.length) process.exitCode = 1;

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { renderStill } from "@remotion/renderer";
import { finalsDir } from "./lesson-assets";
import { CHROMIUM, lessonSource, outDir, ROOT, withComposition } from "./remotion";
import { readYoutubeSource, type YoutubeSource } from "./youtube-meta";

// pnpm thumbnail <slug> [--lines "A|B|C"] [--code <text>] [--bg <file under public/>] [--out <name>]
// Lines and code default to the lesson's video/youtube.json `thumbnail`. Without --bg it
// renders one thumbnail per generated background (pnpm thumbnail-bg):
// public/generated/<slug>/thumbnail-bg-<n>.png → out/<slug>/thumbnail-<n>.png,
// or out/<slug>/thumbnail.png over plain paper when there is none. 1280×720, under 2 MB.
const USAGE = 'pnpm thumbnail <slug> [--lines "A|B|C"] [--code <text>] [--bg <file under public/>] [--out <name>] [--pick <n>]';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    lines: { type: "string" },
    code: { type: "string" },
    bg: { type: "string" },
    out: { type: "string" },
    // Also keeps variant <n> as the lesson's chosen thumbnail (youtube/thumbnail.png).
    pick: { type: "string" },
  },
});
const [slug] = positionals;
if (!slug) {
  console.error(`usage: ${USAGE}`);
  process.exit(1);
}
const finals = finalsDir(slug);
if (values.pick !== undefined && (!/^\d+$/.test(values.pick) || !finals)) {
  console.error(`--pick needs a variant number and a lesson folder (content/lessons/*/${slug}/)\nusage: ${USAGE}`);
  process.exit(1);
}
const sourceFile = path.join(lessonSource(slug), "youtube.json");
const config = fs.existsSync(sourceFile)
  ? (readYoutubeSource(sourceFile) as Partial<YoutubeSource>).thumbnail
  : undefined;
const lines = values.lines?.split("|") ?? config?.lines;
if (!lines?.length) {
  console.error(`no title lines: pass --lines or set thumbnail.lines in ${sourceFile}\nusage: ${USAGE}`);
  process.exit(1);
}
const code = values.code ?? config?.code;

const generated = path.join(ROOT, "public", "generated", slug);
const found = fs.existsSync(generated)
  ? fs.readdirSync(generated).filter((f) => /^thumbnail-bg-\d+\.png$/.test(f)).sort()
  : [];
const jobs = values.bg
  ? [{ background: values.bg, name: values.out ?? "thumbnail" }]
  : found.length
    ? found.map((f) => ({ background: `generated/${slug}/${f}`, name: f.replace("-bg", "").replace(".png", "") }))
    : [{ background: undefined, name: values.out ?? "thumbnail" }];
if (values.out && !values.bg && found.length) console.warn("--out applies only with --bg; variants keep their own names");
// Fail before rendering: only a variant rendered in this run may become the chosen thumbnail.
if (values.pick !== undefined && !jobs.some((j) => j.name === `thumbnail-${values.pick}`)) {
  console.error(`--pick ${values.pick}: no such variant in this run (${jobs.map((j) => j.name).join(", ")}); run pnpm video:restore ${slug} for missing backgrounds`);
  process.exit(1);
}
for (const job of jobs) {
  if (job.background && !fs.existsSync(path.join(ROOT, "public", job.background))) {
    throw new Error(`no background at public/${job.background}`);
  }
}

await withComposition("thumbnail", "en", async ({ serveUrl, browser, composition, inputProps }) => {
  for (const job of jobs) {
    const output = path.join(outDir(slug, "en"), "..", `${job.name}.png`);
    // The component renders composition.props, so each variant overrides them.
    const props = { lines, code, background: job.background };
    await renderStill({
      serveUrl,
      composition: { ...composition, props },
      inputProps: { ...inputProps, ...props },
      frame: 0,
      output,
      puppeteerInstance: browser,
      chromiumOptions: CHROMIUM,
    });
    console.log(`${path.relative(process.cwd(), output)} (${Math.round(fs.statSync(output).size / 1024)} KB)`);
  }
});
if (values.pick !== undefined && finals) {
  const picked = path.join(outDir(slug, "en"), "..", `thumbnail-${values.pick}.png`);
  if (!fs.existsSync(picked)) throw new Error(`no variant ${values.pick}: ${path.relative(process.cwd(), picked)} was not rendered`);
  fs.mkdirSync(finals, { recursive: true });
  fs.copyFileSync(picked, path.join(finals, "thumbnail.png"));
  console.log(`picked → ${path.relative(process.cwd(), path.join(finals, "thumbnail.png"))}`);
}

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { finalsDir, mediaDir } from "./lesson-assets";
import { finalArgs, finalLanguages } from "./final-args";
import { generatedDir, outDir, parseArgs, ROOT } from "./remotion";

// pnpm final <slug> [lang ...]   (default: en and every voiced language in public/generated/<slug>/ that has a render)
// media/lessons/<track>/<slug>/youtube/final/video.<lang>.mp4: that language's render (its picture and
// voice) with its subtitles as a soft, toggleable track, for sharing outside YouTube. It needs the system
// ffmpeg: Remotion's bundled build has no mov_text encoder.
const args = parseArgs("pnpm final <slug> [lang ...]", 1);
const slug = args[0]!;
const finals = finalsDir(slug);
const kit = mediaDir(slug);
if (!finals || !kit) throw new Error(`"${slug}" has no lesson folder (content/lessons/*/${slug}/)`);

const generated = path.join(ROOT, "public", "generated", slug);
const found = fs.existsSync(generated)
  ? fs.readdirSync(generated).filter((l) => l !== "en" && fs.existsSync(path.join(generatedDir(slug, l), "voice.mp3")))
  : [];
const renderOf = (lang: string) => path.join(outDir(slug, lang), "final.mp4");
// The English render is the picture: another language's render older than it was made from an older picture.
const stale = (lang: string) =>
  lang !== "en" && fs.existsSync(renderOf(lang)) && fs.existsSync(renderOf("en")) && fs.statSync(renderOf(lang)).mtimeMs < fs.statSync(renderOf("en")).mtimeMs;
const chosen = args.length > 1
  ? { langs: args.slice(1), skipped: [] as string[] }
  : finalLanguages(found, (lang) => fs.existsSync(renderOf(lang)) && !stale(lang));
if (chosen.skipped.length) console.log(`skipped, no current render: ${chosen.skipped.join(", ")} (pnpm render ${slug} <lang>)`);
const langs = chosen.langs;
if (langs.length === 0) throw new Error(`no render for "${slug}"; run pnpm render ${slug}`);

try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  throw new Error("pnpm final needs a full ffmpeg on PATH (see Setup in video/README.md)");
}

// Everything is checked before anything is written.
const jobs = langs.map((lang) => {
  const render = path.join(outDir(slug, lang), "final.mp4");
  const committed = path.join(finals, "languages", lang);
  if (!fs.existsSync(render)) throw new Error(`no ${lang} render at ${render}; run pnpm render ${slug} ${lang}`);
  if (stale(lang)) throw new Error(`the ${lang} render is older than the English one; run pnpm render ${slug} ${lang}`);
  const subtitles = path.join(committed, "subtitles.vtt");
  if (!fs.existsSync(subtitles)) throw new Error(`no subtitles at ${subtitles}; run pnpm youtube ${slug}`);
  // The render must be the take whose voice and subtitles are committed.
  const renderTiming = path.join(outDir(slug, lang), "timing.json");
  if (!fs.readFileSync(renderTiming).equals(fs.readFileSync(path.join(committed, "timing.json")))) {
    throw new Error(`the ${lang} render is older than its voice; run pnpm render ${slug} ${lang}`);
  }
  return { lang, render, subtitles, output: path.join(kit, "final", `video.${lang}.mp4`) };
});

fs.mkdirSync(path.join(kit, "final"), { recursive: true });
for (const { lang, render, subtitles, output } of jobs) {
  execFileSync("ffmpeg", finalArgs(render, subtitles, output, lang), { stdio: "inherit" });
  console.log(`${lang}: ${path.relative(process.cwd(), output)} (${Math.round(fs.statSync(output).size / 1024 / 1024)} MB)`);
}

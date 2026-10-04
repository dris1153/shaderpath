import fs from "node:fs";
import path from "node:path";
import { finalsDir, restoreLanguage, restoreThumbnails, type SyncResult } from "./lesson-assets";
import { generatedDir, parseArgs, ROOT } from "./remotion";

// pnpm video:restore <slug> [--force]
// Rebuilds the working cache (public/generated/<slug>/) from the lesson's committed
// youtube/ folder: voice, subtitles, timing, strings and thumbnail backgrounds.
// A cache file that already differs is reported and kept unless --force.
const args = parseArgs("pnpm video:restore <slug> [--force]", 1);
const force = args.includes("--force");
const slug = args.find((a) => !a.startsWith("--"))!;
const finals = finalsDir(slug);
const languages = finals && path.join(finals, "languages");
if (!finals || !languages || !fs.existsSync(languages)) throw new Error(`nothing to restore: no ${finals ?? "youtube folder"}/languages for "${slug}"`);

const total: SyncResult = { copied: [], differs: [] };
const add = (r: SyncResult) => {
  total.copied.push(...r.copied);
  total.differs.push(...r.differs);
};
for (const lang of fs.readdirSync(languages)) add(restoreLanguage(path.join(languages, lang), generatedDir(slug, lang), force));
add(restoreThumbnails(path.join(finals, "thumbnail-src"), path.join(ROOT, "public", "generated", slug), force));

for (const file of total.differs) console.warn(`kept (differs from youtube/): ${path.relative(process.cwd(), file)}`);
console.log(`restored ${total.copied.length} files into public/generated/${slug}${total.differs.length ? `; ${total.differs.length} kept (use --force)` : ""}`);

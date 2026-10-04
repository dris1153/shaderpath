import fs from "node:fs";
import path from "node:path";

// The site plays a lesson's dub from /videos/<slug>/audio.<lang>.mp3 (public/).
// The committed source is content/lessons/<track>/<slug>/youtube/languages/<lang>/site.mp3;
// public/videos/ is generated from it and gitignored.
export function syncVideoDubs(lessonsDir: string, outDir: string): string[] {
  const copied: string[] = [];
  if (!fs.existsSync(lessonsDir)) return copied;
  for (const track of fs.readdirSync(lessonsDir)) {
    const trackDir = path.join(lessonsDir, track);
    if (!fs.statSync(trackDir).isDirectory()) continue;
    for (const slug of fs.readdirSync(trackDir)) {
      const languages = path.join(trackDir, slug, "youtube", "languages");
      if (!fs.existsSync(languages)) continue;
      for (const lang of fs.readdirSync(languages)) {
        const from = path.join(languages, lang, "site.mp3");
        if (!fs.existsSync(from)) continue;
        const to = path.join(outDir, slug, `audio.${lang}.mp3`);
        if (fs.existsSync(to) && fs.readFileSync(from).equals(fs.readFileSync(to))) continue;
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(from, to);
        copied.push(to);
      }
    }
  }
  return copied;
}

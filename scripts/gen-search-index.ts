import fs from "node:fs";
import path from "node:path";
import { LESSONS, TRACKS } from "../content/curriculum";

// Build-time search index for the command palette (spec §6.1.9): title, tags,
// summary from curriculum + a plaintext excerpt from authored theory MDX.
// No runtime MDX parsing, no server search — the palette matches locally.

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const OUT = path.join(
  process.cwd(),
  "content",
  "search-index.generated.json",
);
const EXCERPT_CHARS = 240;

interface SearchEntry {
  slug: string;
  locale: "vi" | "en";
  title: string;
  trackTitle: string;
  tags: string[];
  summary: string;
  excerpt: string;
}

function mdxToPlaintext(src: string): string {
  return src
    .replace(/^```[\s\S]*?^```/gm, " ") // fenced code
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display math
    .replace(/\$[^$\n]*\$/g, " ") // inline math
    .replace(/<[^>]+>/g, " ") // JSX/HTML tags
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findTheoryFile(slug: string, locale: string): string | null {
  if (!fs.existsSync(LESSONS_DIR)) return null;
  for (const trackDir of fs.readdirSync(LESSONS_DIR)) {
    const p = path.join(LESSONS_DIR, trackDir, slug, `theory.${locale}.mdx`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const trackTitle = new Map(TRACKS.map((t) => [t.id, t.title]));
const entries: SearchEntry[] = [];

for (const lesson of LESSONS) {
  for (const locale of ["vi", "en"] as const) {
    const theoryPath = findTheoryFile(lesson.slug, locale);
    const excerpt = theoryPath
      ? mdxToPlaintext(fs.readFileSync(theoryPath, "utf8")).slice(
          0,
          EXCERPT_CHARS,
        )
      : "";
    entries.push({
      slug: lesson.slug,
      locale,
      title: lesson.title[locale],
      trackTitle: trackTitle.get(lesson.trackId)?.[locale] ?? "",
      tags: lesson.tags,
      summary: lesson.summary[locale],
      excerpt,
    });
  }
}

fs.writeFileSync(OUT, JSON.stringify(entries), "utf8");
console.log(`search index: ${entries.length} entries → ${OUT}`);

import fs from "node:fs";
import path from "node:path";
import type { Locale } from "../content/types";
import {
  applyFigureText,
  extractFigureText,
  listFigures,
  readStrings,
  sourcePath,
  stringsPath,
  STRINGS_DIR,
  svgPath,
  TARGET_LOCALES,
  type Figure,
  type Strings,
} from "./figure-text";

// Writes public/figures/<track>/<name>/<locale>.svg from that figure's source
// SVG and content/figures-i18n/<track>/<name>.<locale>.json. The source locale's
// SVG is the only file anyone edits by hand; the rest are output, and
// `pnpm lint:figures` fails if they drift.
//
// Usage: pnpm gen:figures [--skeleton] [name...]
//   --skeleton  create/extend the JSON files; new keys land as null (undecided)
//   name...     limit to these figures (folder name), instead of all 83

function skeletonFor(
  figure: Figure,
  locale: Locale,
): { added: number; removed: string[] } {
  const texts = extractFigureText(fs.readFileSync(sourcePath(figure), "utf8"));
  const existing = readStrings(figure, locale);
  const out: Strings = {};
  let added = 0;
  // Document order, so a translator reads the file the way the figure reads.
  for (const text of texts) {
    if (Object.hasOwn(out, text)) continue;
    if (!Object.hasOwn(existing, text)) added += 1;
    // New keys land undecided. Writing the English back is how someone says
    // "I looked at this and it stays" — a state worth telling apart.
    out[text] = Object.hasOwn(existing, text) ? existing[text]! : null;
  }
  // A key the figure no longer has must go, or the stale-key gate fails
  // forever. Name the ones that carried a translation: editing a source label
  // would otherwise discard its translation without a word.
  const kept = new Set(texts);
  const removed = Object.keys(existing).filter(
    (k) => !kept.has(k) && existing[k] !== null && existing[k] !== k,
  );
  const file = stringsPath(figure, locale);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  return { added, removed };
}

function generate(figure: Figure, locale: Locale) {
  const source = fs.readFileSync(sourcePath(figure), "utf8");
  const strings = readStrings(figure, locale);
  const texts = new Set(extractFigureText(source));
  const next = applyFigureText(source, strings);
  const file = svgPath(figure, locale);
  const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (before !== next) fs.writeFileSync(file, next, "utf8");
  const translated = [...texts].filter(
    (t) => Object.hasOwn(strings, t) && strings[t] !== null && strings[t] !== t,
  ).length;
  return { translated, total: texts.size, wrote: before !== next };
}

const argv = process.argv.slice(2);
const skeleton = argv.includes("--skeleton");
const only = argv.filter((a) => !a.startsWith("--"));

const figures = listFigures().filter(
  (f) => only.length === 0 || only.includes(f.name),
);
if (only.length > 0 && figures.length !== only.length) {
  const known = new Set(figures.map((f) => f.name));
  console.error(`unknown figure(s): ${only.filter((n) => !known.has(n)).join(", ")}`);
  process.exit(1);
}

if (skeleton) {
  let added = 0;
  const dropped: string[] = [];
  for (const figure of figures) {
    for (const locale of TARGET_LOCALES) {
      const r = skeletonFor(figure, locale);
      added += r.added;
      for (const key of r.removed) {
        dropped.push(
          `${figure.track}/${figure.name} (${locale}): ${JSON.stringify(key.slice(0, 60))}`,
        );
      }
    }
  }
  console.log(
    `figure strings: ${figures.length * TARGET_LOCALES.length} file(s) under ${path.relative(process.cwd(), STRINGS_DIR)}, ${added} new key(s)`,
  );
  if (dropped.length > 0) {
    console.warn(`  dropped ${dropped.length} translated key(s) no longer in the source:`);
    for (const d of dropped) console.warn(`    ${d}`);
  }
}

for (const locale of TARGET_LOCALES) {
  const results = figures.map((f) => generate(f, locale));
  const wrote = results.filter((r) => r.wrote).length;
  const translated = results.reduce((a, r) => a + r.translated, 0);
  const total = results.reduce((a, r) => a + r.total, 0);
  console.log(
    `gen:figures [${locale}]: ${results.length} figure(s), ${wrote} written, ${translated}/${total} strings translated`,
  );
}

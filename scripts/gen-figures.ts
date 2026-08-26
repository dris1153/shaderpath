import fs from "node:fs";
import path from "node:path";
import {
  applyFigureText,
  extractFigureText,
  listFigures,
  readStrings,
  STRINGS_DIR,
  type Figure,
  type Strings,
} from "./figure-text";

// Writes public/figures/<track>/<name>/vi.svg from that figure's en.svg and
// content/figures-i18n/<track>/<name>.json. en.svg is the only file anyone
// edits by hand; vi.svg is output and `pnpm lint:figures` fails if it drifts.
//
// Usage: pnpm gen:figures [--skeleton] [name...]
//   --skeleton  create/extend the JSON files; new keys land as null (undecided)
//   name...     limit to these figures (folder name), instead of all 83

interface Result {
  figure: Figure;
  translated: number;
  total: number;
  wrote: boolean;
}

function skeletonFor(figure: Figure): { added: number; removed: string[] } {
  const texts = extractFigureText(fs.readFileSync(figure.enPath, "utf8"));
  const existing = readStrings(figure);
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
  // forever. Name the ones that carried a translation: editing an English
  // label would otherwise discard its Vietnamese without a word.
  const kept = new Set(texts);
  const removed = Object.keys(existing).filter(
    (k) => !kept.has(k) && existing[k] !== null && existing[k] !== k,
  );
  fs.mkdirSync(path.dirname(figure.stringsPath), { recursive: true });
  fs.writeFileSync(figure.stringsPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  return { added, removed };
}

function generate(figure: Figure): Result {
  const en = fs.readFileSync(figure.enPath, "utf8");
  const strings = readStrings(figure);
  const texts = new Set(extractFigureText(en));
  const vi = applyFigureText(en, strings);
  const before = fs.existsSync(figure.viPath)
    ? fs.readFileSync(figure.viPath, "utf8")
    : null;
  if (before !== vi) fs.writeFileSync(figure.viPath, vi, "utf8");
  const translated = [...texts].filter(
    (t) => Object.hasOwn(strings, t) && strings[t] !== null && strings[t] !== t,
  ).length;
  return { figure, translated, total: texts.size, wrote: before !== vi };
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
    const r = skeletonFor(figure);
    added += r.added;
    for (const key of r.removed) {
      dropped.push(`${figure.track}/${figure.name}: ${JSON.stringify(key.slice(0, 60))}`);
    }
  }
  console.log(
    `figure strings: ${figures.length} file(s) under ${path.relative(process.cwd(), STRINGS_DIR)}, ${added} new key(s)`,
  );
  if (dropped.length > 0) {
    console.warn(`  dropped ${dropped.length} translated key(s) no longer in en.svg:`);
    for (const d of dropped) console.warn(`    ${d}`);
  }
}

const results = figures.map(generate);
const wrote = results.filter((r) => r.wrote).length;
const translated = results.reduce((a, r) => a + r.translated, 0);
const total = results.reduce((a, r) => a + r.total, 0);
console.log(
  `gen:figures: ${results.length} figure(s), ${wrote} written, ${translated}/${total} strings translated`,
);

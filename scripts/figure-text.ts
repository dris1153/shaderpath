import fs from "node:fs";
import path from "node:path";
import { LOCALES, type Locale } from "../content/types";

// Shared by gen-figures.ts and lint-figures.ts so the generator and the gate
// can never disagree about what counts as translatable text in a figure.

export const FIGURES_DIR = path.join(process.cwd(), "public", "figures");
export const STRINGS_DIR = path.join(process.cwd(), "content", "figures-i18n");

/**
 * The language the figures are authored in. Its SVG is both the geometry source
 * and that locale's output — not the same thing as DEFAULT_LOCALE, which is the
 * language the site serves first.
 */
export const SOURCE_LOCALE: Locale = "en";
export const TARGET_LOCALES = LOCALES.filter((l) => l !== SOURCE_LOCALE);

// Text-bearing elements. They do not nest into themselves, so a non-greedy
// match to the closing tag is exact.
const CONTAINER = /<(text|title)\b([^>]*)>([\s\S]*?)<\/\1>/g;

const ENTITY = /&(?:#(\d+)|#x([0-9a-fA-F]+)|(amp|lt|gt|quot|apos));/g;

export function decodeEntities(raw: string): string {
  return raw.replace(ENTITY, (_m, dec, hex, named) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[named as string]!;
  });
}

/** Only the three characters that would otherwise re-open markup. */
function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * A run of raw characters between tags. Walking runs rather than elements is
 * what catches mixed content: 20 labels in this corpus read
 * `<text><tspan>(x, y, z, 1)</tspan> is a point …</text>`, where the styled
 * fragment stays English and the sentence after it has to move. An
 * element-level walker sees the tspan and silently drops the sentence.
 */
function* runs(inner: string): Generator<[number, number]> {
  // Own regex per call: a shared /g one carries lastIndex between generators.
  const tag = /<[^>]*>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(inner))) {
    if (m.index > last) yield [last, m.index];
    last = tag.lastIndex;
  }
  if (last < inner.length) yield [last, inner.length];
}

/** Separators between styled fragments (", ", " · ") are structure, not copy. */
const isContent = (text: string) => /[\p{L}\p{N}]/u.test(text);

/** Decoded, trimmed, in document order, duplicates preserved. */
export function extractFigureText(svg: string): string[] {
  const out: string[] = [];
  for (const m of svg.matchAll(CONTAINER)) {
    const inner = m[3] ?? "";
    for (const [a, b] of runs(inner)) {
      const text = decodeEntities(inner.slice(a, b)).trim();
      if (text && isContent(text)) out.push(text);
    }
  }
  return out;
}

/** null means nobody has decided yet; a value equal to the English means it was
 *  looked at and deliberately kept. Those are different states, and only the
 *  second one counts as translated. */
export type Strings = Record<string, string | null>;

/**
 * Rewrite text runs through the map. An undecided, missing, or deliberately
 * kept entry leaves the original bytes untouched — so an untranslated figure
 * stays byte-identical to its source instead of drifting through an entity
 * round trip.
 */
export function applyFigureText(svg: string, map: Strings): string {
  return svg.replace(CONTAINER, (whole, tag: string, attrs: string, inner: string) => {
    let out = "";
    let cursor = 0;
    for (const [a, b] of runs(inner)) {
      const raw = inner.slice(a, b);
      const key = decodeEntities(raw).trim();
      const value = Object.hasOwn(map, key) ? map[key] : undefined;
      if (!key || !isContent(key)) continue;
      if (value === undefined || value === null || value === key) continue;
      const [, lead = "", , trail = ""] = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw)!;
      out += inner.slice(cursor, a) + lead + escapeText(value) + trail;
      cursor = b;
    }
    return cursor === 0 ? whole : `<${tag}${attrs}>${out}${inner.slice(cursor)}</${tag}>`;
  });
}

export interface Figure {
  track: string;
  name: string;
  /** public/figures/<track>/<name> */
  dir: string;
}

/** public/figures/<track>/<name>/<locale>.svg */
export function svgPath(figure: Figure, locale: Locale): string {
  return path.join(figure.dir, `${locale}.svg`);
}

/** content/figures-i18n/<track>/<name>.<locale>.json */
export function stringsPath(figure: Figure, locale: Locale): string {
  return path.join(STRINGS_DIR, figure.track, `${figure.name}.${locale}.json`);
}

export const sourcePath = (figure: Figure) => svgPath(figure, SOURCE_LOCALE);

export function listFigures(): Figure[] {
  const out: Figure[] = [];
  for (const track of fs.readdirSync(FIGURES_DIR).sort()) {
    const trackDir = path.join(FIGURES_DIR, track);
    if (!fs.statSync(trackDir).isDirectory()) continue;
    for (const name of fs.readdirSync(trackDir).sort()) {
      const dir = path.join(trackDir, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      if (!fs.existsSync(path.join(dir, `${SOURCE_LOCALE}.svg`))) continue;
      out.push({ track, name, dir });
    }
  }
  return out;
}

export function readStrings(figure: Figure, locale: Locale): Strings {
  const file = stringsPath(figure, locale);
  if (!fs.existsSync(file)) return Object.create(null) as Strings;
  return Object.assign(
    Object.create(null) as Strings,
    JSON.parse(fs.readFileSync(file, "utf8")) as Strings,
  );
}

import fs from "node:fs";
import { chromium, type Page } from "@playwright/test";
import { LOCALES } from "../content/types";
import {
  applyFigureText,
  extractFigureText,
  listFigures,
  readStrings,
  sourcePath,
  stringsPath,
  svgPath,
  TARGET_LOCALES,
} from "./figure-text";

// Three gates over the bilingual figures. Usage: pnpm lint:figures [--no-render]
//
//   sync      vi.svg is what gen-figures would write — nobody hand-edits output
//   coverage  every text run in en.svg is a key, and no key is stale
//   overflow  no label escapes its viewBox or collides with another
//
// Overflow is the one that earns its keep: "shorten the Vietnamese to fit" is
// a promise until something measures it.

const errors: string[] = [];
const figures = listFigures();

// --- gate 1 + 2 -------------------------------------------------------
let nodes = 0;
const undecided = new Map<string, number>();
for (const figure of figures) {
  const at = `${figure.track}/${figure.name}`;
  const source = fs.readFileSync(sourcePath(figure), "utf8");
  const texts = extractFigureText(source);
  nodes += texts.length;

  // Two shapes the run walker cannot see correctly. Both are legal SVG and both
  // are absent from the corpus today, so this reports them rather than letting
  // a future figure translate itself into nonsense.
  const withoutComments = source.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of withoutComments.match(/<[^>]*>/g) ?? []) {
    // A `>` inside an attribute value ends the tag as far as the walker is
    // concerned, corrupting every key after it.
    if ((tag.match(/"/g) ?? []).length % 2 === 1) {
      errors.push(`${at}: source has a '>' inside an attribute — ${tag.slice(0, 50)}`);
      break;
    }
  }
  for (const comment of source.match(/<!--[\s\S]*?-->/g) ?? []) {
    // A commented-out label would still be extracted, translated and billed.
    if (/<(?:text|title)/.test(comment)) {
      errors.push(`${at}: source has a commented-out <text> — delete it instead`);
      break;
    }
  }

  const seen = new Set(texts);
  for (const locale of TARGET_LOCALES) {
    const where = `${at} (${locale})`;
    if (!fs.existsSync(stringsPath(figure, locale))) {
      errors.push(`${where}: no strings file — run pnpm gen:figures --skeleton`);
      continue;
    }
    const strings = readStrings(figure, locale);

    const expected = applyFigureText(source, strings);
    const file = svgPath(figure, locale);
    const actual = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (actual === null) {
      errors.push(`${where}: SVG is missing — run pnpm gen:figures`);
    } else if (actual !== expected) {
      errors.push(`${where}: SVG is not what gen:figures writes (hand-edited, or stale)`);
    }

    for (const text of seen) {
      if (!Object.hasOwn(strings, text)) {
        errors.push(`${where}: no entry for ${JSON.stringify(text.slice(0, 60))}`);
      } else if (strings[text] === null) {
        undecided.set(locale, (undecided.get(locale) ?? 0) + 1);
      } else if (strings[text]?.trim() === "") {
        // An empty value deletes the label and would pass every other check.
        errors.push(`${where}: empty translation for ${JSON.stringify(text.slice(0, 60))}`);
      }
    }
    for (const key of Object.keys(strings)) {
      if (!seen.has(key)) {
        errors.push(`${where}: stale entry ${JSON.stringify(key.slice(0, 60))} — no longer in the source`);
      }
    }
  }
}

// --- gate 3 -----------------------------------------------------------
interface Box {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
}

/**
 * Load through a data: URI rather than setContent. The site serves these files
 * to `<img>`, which parses them as strict XML; setContent goes through the HTML
 * parser, which forgives things — an undeclared entity or a stray control
 * character would pass the gate and then render as a blank image.
 */
async function measure(page: Page, file: string) {
  const source = fs.readFileSync(file);
  await page.goto(`data:image/svg+xml;base64,${source.toString("base64")}`, {
    waitUntil: "load",
  });
  return page.evaluate(() => {
    const svg = document.querySelector("svg");
    if (document.documentElement.tagName.toLowerCase() !== "svg" || !svg) {
      return { xmlError: true, vb: null, boxes: [] as Box[] };
    }
    const vb = svg.viewBox.baseVal;
    const root = svg.getScreenCTM();
    const boxes = [...svg.querySelectorAll("text")].map((el) => {
      const text = el as SVGTextElement;
      const b = text.getBBox();
      // getBBox is in the element's OWN user space; these figures lay their
      // panels out with <g transform>, so a box has to come back through the
      // CTM before it means anything against the root viewBox.
      const own = text.getScreenCTM();
      const m = root && own ? root.inverse().multiply(own) : null;
      const pts = [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ].map(([x, y]) =>
        m
          ? { x: m.a * x! + m.c * y! + m.e, y: m.b * x! + m.d * y! + m.f }
          : { x: x!, y: y! },
      );
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      return {
        label: (el.textContent ?? "").trim().slice(0, 48),
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
        // A rotated label's axis-aligned box is larger than its ink, so pair
        // overlaps against it are not evidence of a collision.
        rotated: !!m && (Math.abs(m.b) > 0.001 || Math.abs(m.c) > 0.001),
      };
    });
    return {
      xmlError: false,
      vb: { x: vb.x, y: vb.y, w: vb.width, h: vb.height },
      boxes,
    };
  });
}

// getBBox includes font ascent and descent the ink never reaches, and these
// figures are authored right up to their frame.
const SLACK = 1.5;
// Three user units on both axes is a couple of characters of ink. The relative
// share alone scales its own tolerance with label width, which is backwards:
// the longer the Vietnamese runs, the more overlap it would forgive.
const HARD_OVERLAP = 3;

async function overflow() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    for (const figure of figures) {
      // Every locale, source included: the one real content bug this gate has
      // found so far was in the source, and English is not frozen either.
      for (const locale of LOCALES) {
        const at = `${figure.track}/${figure.name} (${locale})`;
        const file = svgPath(figure, locale);
        if (!fs.existsSync(file)) continue;
        try {
          const { xmlError, vb, boxes } = await measure(page, file);
          if (xmlError || !vb) {
            errors.push(`${at}: not well-formed XML — an <img> would render nothing`);
            continue;
          }
          for (const b of boxes) {
            if (
              b.x < vb.x - SLACK ||
              b.y < vb.y - SLACK ||
              b.x + b.w > vb.x + vb.w + SLACK ||
              b.y + b.h > vb.y + vb.h + SLACK
            ) {
              errors.push(`${at}: "${b.label}" leaves the viewBox`);
            }
          }
          const upright = boxes.filter((b) => !b.rotated && b.w > 0 && b.h > 0);
          for (let i = 0; i < upright.length; i += 1) {
            for (let j = i + 1; j < upright.length; j += 1) {
              const a = upright[i]!;
              const c = upright[j]!;
              const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
              const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
              if (ox <= 0 || oy <= 0) continue;
              const share = (ox * oy) / Math.min(a.w * a.h, c.w * c.h);
              if (share > 0.25 || (ox > HARD_OVERLAP && oy > HARD_OVERLAP)) {
                errors.push(`${at}: "${a.label}" collides with "${c.label}"`);
              }
            }
          }
        } catch (err) {
          // One unreadable figure must not cost the diagnostics of the rest.
          errors.push(`${at}: could not be measured — ${(err as Error).message}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!process.argv.includes("--no-render")) await overflow();

  const perLocale = TARGET_LOCALES.map(
    (l) => `${l} ${undecided.get(l) ?? 0} undecided`,
  ).join(", ");
  console.log(
    `figures: ${figures.length} checked, ${nodes} text runs, ${perLocale}, ${errors.length} error(s)`,
  );
  for (const e of errors) console.error(`  ${e}`);
  if (errors.length > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

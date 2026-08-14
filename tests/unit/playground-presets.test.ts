import { describe, expect, it } from "vitest";
import {
  ALL_PRESETS,
  PRESET_COMMENTS,
  localizeSource,
  markersIn,
} from "@/content/playground-presets";
import type { Locale } from "@/content/types";

const LOCALES: Locale[] = ["vi", "en"];
const usedKeys = new Set(ALL_PRESETS.flatMap((p) => markersIn(p.source)));

describe("playground preset comments", () => {
  it("registers presets with unique slugs", () => {
    const slugs = ALL_PRESETS.map((p) => p.slug);
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(LOCALES)("translates every marker used in a preset (%s)", (loc) => {
    const dict = PRESET_COMMENTS[loc];
    const missing = [...usedKeys].filter((k) => !dict[k]);
    expect(missing, `untranslated markers in "${loc}"`).toEqual([]);
  });

  it("has no unused entries in the dictionary", () => {
    const unused = Object.keys(PRESET_COMMENTS.vi).filter(
      (k) => !usedKeys.has(k),
    );
    expect(unused, "dictionary keys no preset references").toEqual([]);
  });

  it("keeps comments single-line so substitution cannot break the code", () => {
    for (const loc of LOCALES) {
      for (const [key, text] of Object.entries(PRESET_COMMENTS[loc])) {
        expect(text, `${loc}.${key} must stay on one line`).not.toMatch(/[\r\n]/);
      }
    }
  });

  it("leaves no marker behind after localizing, and differs per locale", () => {
    for (const preset of ALL_PRESETS) {
      const vi = localizeSource(preset.source, "vi");
      const en = localizeSource(preset.source, "en");
      expect(vi, `${preset.slug} (vi)`).not.toMatch(/\/\/\s*@\w/);
      expect(en, `${preset.slug} (en)`).not.toMatch(/\/\/\s*@\w/);
      // Stripping every comment must leave byte-identical code: the whole
      // point of markers is that only prose can differ between locales.
      const code = (s: string) => s.replace(/\/\/[^\n]*/g, "").trim();
      expect(code(en), `${preset.slug} code must not drift`).toBe(code(vi));
    }
  });
});

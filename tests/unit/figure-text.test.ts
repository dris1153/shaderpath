import { describe, expect, it } from "vitest";
import {
  applyFigureText,
  decodeEntities,
  extractFigureText,
} from "@/scripts/figure-text";

const wrap = (body: string) => `<svg viewBox="0 0 10 10">${body}</svg>`;

describe("extractFigureText", () => {
  it("reads a plain label", () => {
    expect(extractFigureText(wrap("<text x='1'>World space</text>"))).toEqual([
      "World space",
    ]);
  });

  it("reads both sides of mixed content", () => {
    // The shape 20 labels in the corpus actually use: a styled fragment that
    // stays English, followed by a sentence that has to move.
    const svg = wrap(
      `<text class="note"><tspan class="key">(x, y, z, 1)</tspan> is a point</text>`,
    );
    expect(extractFigureText(svg)).toEqual(["(x, y, z, 1)", "is a point"]);
  });

  it("skips separators that carry no letters or digits", () => {
    const svg = wrap(
      `<text><tspan>column 1</tspan>, <tspan>column 2</tspan></text>`,
    );
    expect(extractFigureText(svg)).toEqual(["column 1", "column 2"]);
  });

  it("decodes entities into the key", () => {
    expect(extractFigureText(wrap("<text>rotate &#8722;90&#176;</text>"))).toEqual([
      "rotate −90°",
    ]);
  });

  it("reads <title>, which is what a screen reader announces", () => {
    expect(extractFigureText(wrap("<title>Axis conventions</title>"))).toEqual([
      "Axis conventions",
    ]);
  });

  it("does not confuse the CSS in a <style> block for content", () => {
    const svg = wrap(`<style>text { font-family: system-ui; }</style><text>A</text>`);
    expect(extractFigureText(svg)).toEqual(["A"]);
  });

  it("walks every container independently", () => {
    const svg = wrap("<text>one</text><text>two</text><text>three</text>");
    expect(extractFigureText(svg)).toEqual(["one", "two", "three"]);
  });
});

describe("decodeEntities", () => {
  it("handles decimal, hex and the five XML names", () => {
    expect(decodeEntities("&#952;&#x3c9;&amp;&lt;&gt;&quot;&apos;")).toBe(
      "θω&<>\"'",
    );
  });
});

describe("applyFigureText", () => {
  const svg = wrap(`<text class="a" x="4">World space</text>`);

  it("substitutes a translated value", () => {
    expect(applyFigureText(svg, { "World space": "Không gian thế giới" })).toBe(
      wrap(`<text class="a" x="4">Không gian thế giới</text>`),
    );
  });

  it.each([
    ["a missing key", {}],
    ["an undecided key", { "World space": null }],
    ["a deliberately kept key", { "World space": "World space" }],
  ])("leaves the bytes untouched for %s", (_label, map) => {
    expect(applyFigureText(svg, map)).toBe(svg);
  });

  it("escapes markup in the translation", () => {
    const out = applyFigureText(svg, { "World space": 'a & b <c> "d"' });
    expect(out).toContain(">a &amp; b &lt;c&gt; \"d\"<");
    // Round trip: what comes back out is what went in.
    expect(extractFigureText(out)).toEqual(['a & b <c> "d"']);
  });

  it("keeps the tspan and rewrites only the prose beside it", () => {
    const mixed = wrap(
      `<text><tspan class="key">(x, y, z, 1)</tspan> is a point</text>`,
    );
    expect(applyFigureText(mixed, { "is a point": "là một điểm" })).toBe(
      wrap(`<text><tspan class="key">(x, y, z, 1)</tspan> là một điểm</text>`),
    );
  });

  it("preserves the whitespace around a label", () => {
    const padded = wrap("<text>\n  Label\n</text>");
    expect(applyFigureText(padded, { Label: "Nhãn" })).toBe(
      wrap("<text>\n  Nhãn\n</text>"),
    );
  });

  it("substitutes several runs inside one container", () => {
    const two = wrap(`<text>alpha<tspan>beta</tspan>gamma</text>`);
    expect(applyFigureText(two, { alpha: "một", gamma: "ba" })).toBe(
      wrap(`<text>một<tspan>beta</tspan>ba</text>`),
    );
  });

  it("treats a label named after an Object member as data, not a method", () => {
    // A WebGL/JS corpus can legitimately label something "constructor"; plain
    // member access would find Object.prototype and throw.
    const proto = wrap("<text>constructor</text><text>toString</text>");
    expect(() => applyFigureText(proto, {})).not.toThrow();
    expect(applyFigureText(proto, {})).toBe(proto);
    expect(applyFigureText(proto, { constructor: "hàm dựng" })).toContain(
      ">hàm dựng<",
    );
  });

  it("is idempotent under its own output", () => {
    const map = { "World space": "Không gian thế giới" };
    const once = applyFigureText(svg, map);
    expect(applyFigureText(once, map)).toBe(once);
  });
});

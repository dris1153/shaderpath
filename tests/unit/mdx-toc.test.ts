import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/mdx-toc";

const toc = (heading: string) => extractToc(`## ${heading}`)[0]!;

describe("extractToc", () => {
  it.each([
    [
      "Biên độ, tần số, pha: đọc vị $A\\sin(\\omega t + \\phi)$",
      "Biên độ, tần số, pha: đọc vị A sin(ω t + φ)",
    ],
    [
      "Smoothstep: đa thức $3t^2 - 2t^3$ và đạo hàm",
      "Smoothstep: đa thức 3t² − 2t³ và đạo hàm",
    ],
    [
      "Vì sao cột thứ hai là $(-\\sin\\theta, \\cos\\theta)$",
      "Vì sao cột thứ hai là (−sinθ, cosθ)",
    ],
    [
      "Dùng như hộp đen: normalize, nhân để ghép, $q$ và $-q$",
      "Dùng như hộp đen: normalize, nhân để ghép, q và −q",
    ],
    ["lowp: dải chỉ $[-2, 2]$, hợp cho màu", "lowp: dải chỉ [−2, 2], hợp cho màu"],
  ])("renders math as text rather than source: %s", (raw, expected) => {
    expect(toc(raw).text).toBe(expected);
  });

  it("drops the backslash from a macro it has no glyph for", () => {
    expect(toc("Toán tử $a \\oplus b$").text).toBe("Toán tử a oplus b");
  });

  // rehype-slug runs before rehype-katex, so the rendered id comes from the
  // raw heading. Deriving it from the prettified text instead would break
  // every TOC anchor and every mind-map override lint-content checks.
  it("slugs the raw heading, not the prettified text", () => {
    expect(toc("Pha: đọc vị $A\\sin(\\omega t + \\phi)$").id).toBe(
      "pha-đọc-vị-asinomega-t--phi",
    );
  });

  it("leaves headings without math untouched", () => {
    const item = toc("Radian vs độ: vì sao code luôn dùng radian");
    expect(item.text).toBe("Radian vs độ: vì sao code luôn dùng radian");
    expect(item.id).toBe("radian-vs-độ-vì-sao-code-luôn-dùng-radian");
  });
});

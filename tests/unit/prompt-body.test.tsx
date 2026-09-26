import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PromptBody } from "@/components/exercise/prompt-body";

const html = (text: string) => renderToStaticMarkup(<PromptBody text={text} />);

describe("PromptBody emphasis", () => {
  it("renders bold and italic instead of printing asterisks", () => {
    const out = html("tâm **pixel** và *nhìn thấy được*");
    expect(out).toContain("<strong><span>pixel</span></strong>");
    expect(out).toContain("<em><span>nhìn thấy được</span></em>");
    expect(out).not.toContain("*");
  });

  it("renders math inside bold", () => {
    expect(html("**$u = 0.5$**")).toMatch(
      /<strong>.*class="katex".*<\/strong>/,
    );
  });

  it("leaves multiplication and API names alone", () => {
    expect(html("2 * 3 * 4")).toBe(
      '<div class="space-y-3 text-sm leading-6"><p><span>2 * 3 * 4</span></p></div>',
    );
    expect(html("gọi gl.uniform* rồi a*b*c")).not.toContain("<em>");
    // Real worked answer from the raymarching slab exercise.
    expect(html("(0-2)*∞ = -∞, t1s.x = (2-0)*(-1) = 8")).not.toContain("<em>");
  });

  it("does not italicise a * inside code or math", () => {
    const out = html("`a * b * c` và $x*y*z$");
    expect(out).not.toContain("<em>");
    expect(out).toContain("<code");
    expect(out).toContain("katex");
  });

  // Text the regex skipped must stay text even when it starts and ends with *.
  it.each(["`a`*b*", "$x$*y*", "** lưu ý **", "* ghi chú *"])(
    "leaves %s unemphasised",
    (text) => {
      const out = html(text);
      expect(out).not.toContain("<em>");
      expect(out).not.toContain("<strong>");
    },
  );
});

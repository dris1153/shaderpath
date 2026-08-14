import { describe, expect, it } from "vitest";
import { fold, rankLessons, type SearchEntry } from "@/components/command/search-match";

const entry = (over: Partial<SearchEntry>): SearchEntry => ({
  slug: "x",
  locale: "vi",
  title: "",
  trackTitle: "",
  tags: [],
  summary: "",
  excerpt: "",
  ...over,
});

describe("fold", () => {
  it("strips Vietnamese diacritics for matching", () => {
    expect(fold("Toạ độ Đề-các")).toBe("toa do de-cac");
  });
});

describe("rankLessons", () => {
  it("finds a lesson by a word that exists only in its body excerpt", () => {
    const entries = [
      entry({ slug: "a", title: "Vector cơ bản" }),
      entry({
        slug: "b",
        title: "Toạ độ & UV",
        excerpt: "màn hình Retina có mật độ điểm ảnh cao",
      }),
    ];
    const hits = rankLessons(entries, "retina");
    expect(hits.map((h) => h.slug)).toEqual(["b"]);
  });

  it("ranks title matches above excerpt matches", () => {
    const entries = [
      entry({ slug: "excerpt-hit", excerpt: "nói về vector rất nhiều" }),
      entry({ slug: "title-hit", title: "Vector cơ bản" }),
    ];
    expect(rankLessons(entries, "vector")[0]?.slug).toBe("title-hit");
  });

  it("requires every token to match somewhere", () => {
    const entries = [
      entry({ slug: "a", title: "Vector", excerpt: "chỉ vector thôi" }),
      entry({ slug: "b", title: "Vector", excerpt: "vector và ma trận" }),
    ];
    expect(rankLessons(entries, "vector ma trận").map((h) => h.slug)).toEqual([
      "b",
    ]);
  });

  it("matches diacritic-free queries against accented content", () => {
    const entries = [entry({ slug: "a", title: "Ma trận cơ bản" })];
    expect(rankLessons(entries, "ma tran")).toHaveLength(1);
  });
});

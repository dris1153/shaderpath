import { describe, expect, it } from "vitest";
import type { Localized, MindMapNode } from "@/content/types";
import { lintMindMapOverride } from "@/lib/mind-map-lint";

const headingIds = {
  vi: new Set(["muc-mot", "muc-hai"]),
  en: new Set(["section-one", "section-two"]),
};
const lessonSlugs = new Set(["matrix-basics", "quaternions"]);

const goodVi: MindMapNode[] = [
  {
    id: "core",
    kind: "section",
    label: "Ý chính",
    children: [
      { id: "muc-mot", kind: "section", label: "Mục một" },
      { id: "muc-hai", kind: "section", label: "Mục hai" },
    ],
  },
  {
    id: "links",
    kind: "link",
    label: "Kết nối",
    children: [{ id: "quaternions", kind: "link", label: "Quaternion" }],
  },
];
const goodEn: MindMapNode[] = [
  {
    id: "core",
    kind: "section",
    label: "Core ideas",
    children: [
      { id: "section-one", kind: "section", label: "Section one" },
      { id: "section-two", kind: "section", label: "Section two" },
    ],
  },
  {
    id: "links",
    kind: "link",
    label: "Connections",
    children: [{ id: "quaternions", kind: "link", label: "Quaternions" }],
  },
];

function lint(mindMap: unknown) {
  return lintMindMapOverride({ at: "t/x", mindMap, headingIds, lessonSlugs });
}

const withVi = (vi: MindMapNode[]): Localized<MindMapNode[]> => ({
  vi,
  en: goodEn,
});

describe("lintMindMapOverride", () => {
  it("accepts a well-formed bilingual override", () => {
    const r = lint({ vi: goodVi, en: goodEn });
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it("rule 1: flags a section node whose id matches no heading", () => {
    const vi = structuredClone(goodVi);
    vi[0]!.children![0]!.id = "muc-doi-ten";
    const r = lint(withVi(vi));
    expect(r.errors.join("\n")).toMatch(/section node "muc-doi-ten"/);
  });

  it("rule 2: flags structural vi/en divergence", () => {
    const vi = structuredClone(goodVi);
    vi[0]!.children!.pop();
    const r = lint(withVi(vi));
    expect(r.errors.join("\n")).toMatch(/differ structurally/);
  });

  it("rule 3: warns on sentence-length labels", () => {
    const vi = structuredClone(goodVi);
    vi[0]!.children![0]!.label =
      "Một cái nhãn quá dài đến mức thành cả một câu văn";
    const r = lint(withVi(vi));
    expect(r.errors).toEqual([]);
    expect(r.warnings.join("\n")).toMatch(/words/);
  });

  it("rule 4: flags a link node pointing at a non-lesson", () => {
    const vi = structuredClone(goodVi);
    const en = structuredClone(goodEn);
    vi[1]!.children![0]!.id = "khong-ton-tai";
    en[1]!.children![0]!.id = "khong-ton-tai";
    const r = lint({ vi, en });
    expect(r.errors.join("\n")).toMatch(/link node "khong-ton-tai"/);
  });

  it("rule 5: flags a missing or empty locale tree", () => {
    expect(lint({ vi: goodVi }).errors.join("\n")).toMatch(/en tree/);
    expect(lint({ vi: [], en: goodEn }).errors.join("\n")).toMatch(/vi tree/);
    expect(lint(null).errors.length).toBeGreaterThan(0);
  });

  it("flags malformed nodes and duplicate ids", () => {
    const bad = structuredClone(goodVi) as unknown as Array<
      Record<string, unknown>
    >;
    bad[0]!.kind = "banner";
    expect(lint(withVi(bad as unknown as MindMapNode[])).errors.join("\n")).toMatch(
      /malformed node/,
    );

    const dup = structuredClone(goodVi);
    dup[1]!.id = "core";
    const en = structuredClone(goodEn);
    en[1]!.id = "core";
    expect(lint({ vi: dup, en }).errors.join("\n")).toMatch(/duplicate node id/);
  });

  it("reports non-array children instead of crashing", () => {
    const vi = structuredClone(goodVi) as unknown as Array<
      Record<string, unknown>
    >;
    vi[0]!.children = {};
    const r = lint(withVi(vi as unknown as MindMapNode[]));
    expect(r.errors.join("\n")).toMatch(/malformed node/);
  });

  it("rejects the reserved id root", () => {
    const vi = structuredClone(goodVi);
    const en = structuredClone(goodEn);
    vi[0]!.id = "root";
    en[0]!.id = "root";
    expect(lint({ vi, en }).errors.join("\n")).toMatch(/"root" is reserved/);
  });

  it("flags link nodes that differ between locales", () => {
    const en = structuredClone(goodEn);
    en[1]!.children![0]!.id = "matrix-basics";
    const r = lint({ vi: goodVi, en });
    expect(r.errors.join("\n")).toMatch(/different lessons/);
  });
});
